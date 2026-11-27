"""From raw CAN frames to a correlated energy model, on a synthetic vehicle log.

Companion to chapter 15 of the vehicle-efficiency notes:
https://albertobraso7.github.io/notes/ev-efficiency/#c15

Steps
  1. Make a synthetic drive (the "truth") and add sensor errors.
  2. Encode the signals as CAN frames with a small DBC, the way a logger stores them.
  3. Decode the frames back to physical signals using the DBC.
  4. Put the signals on one time base, integrate energy and distance.
  5. Compare with a road-load model, find the time shift by cross-correlation,
     and run a standstill check.

Everything is synthetic and generic. Needs NumPy; --plot also needs matplotlib.

The numbers differ slightly from the web page, which skips the CAN encoding.
Energy hardly changes, but the transient error (RMSE) is higher here: the
speed signal's 0.01 km/h resolution becomes acceleration noise of up to
about 0.03 m/s^2 once it is differentiated at 20 Hz. Differentiating a
quantized signal amplifies its resolution step; filter before you differentiate.

Usage
  python can_log_demo.py                         defaults: 0.5 A offset, 0.6 s delay, 600 W missing load
  python can_log_demo.py --offset 0 --lag 1.5
  python can_log_demo.py --write-log drive.log   also save the raw frames (candump format)
  python can_log_demo.py --plot power.png
  python can_log_demo.py --check                 regression check, exits 1 on failure
"""
import argparse
import re
import sys

import numpy as np

# --------------------------------------------------------------------------
# 1. A small DBC: the dictionary that says where each signal sits in a frame.
#    start bit | length @ byte order (1 = little-endian / Intel) sign (- signed, + unsigned)
#    (factor, offset) [min|max] "unit"
# --------------------------------------------------------------------------
DBC = """
BO_ 416 BMS_Current: 8 BMS
 SG_ PackCurrent : 0|16@1- (0.05,0) [-1600|1600] "A" VCU
BO_ 417 BMS_Voltage: 8 BMS
 SG_ PackVoltage : 0|16@1+ (0.02,0) [0|1310.7] "V" VCU
BO_ 688 VCU_Speed: 8 VCU
 SG_ VehicleSpeed : 0|16@1+ (0.01,0) [0|655.35] "km/h" BMS
"""

BO = re.compile(r"^BO_ (\d+) (\w+): (\d+) (\w+)")
SG = re.compile(r'^\s*SG_ (\w+) : (\d+)\|(\d+)@([01])([+-]) \(([^,]+),([^)]+)\) \[([^|]+)\|([^\]]+)\] "([^"]*)"')


def parse_dbc(text):
    """Return {frame_id: {"name": ..., "signals": {name: spec}}}. Intel byte order only."""
    db, current = {}, None
    for line in text.splitlines():
        m = BO.match(line)
        if m:
            current = int(m.group(1))
            db[current] = {"name": m.group(2), "signals": {}}
            continue
        m = SG.match(line)
        if m and current is not None:
            if m.group(4) != "1":
                raise ValueError("this minimal parser handles little-endian (@1) signals only; use cantools for Motorola")
            db[current]["signals"][m.group(1)] = {
                "start": int(m.group(2)), "length": int(m.group(3)), "signed": m.group(5) == "-",
                "factor": float(m.group(6)), "offset": float(m.group(7)), "unit": m.group(10)}
    return db


def decode(spec, data):
    """Physical value of one signal from the frame's data bytes."""
    raw = (int.from_bytes(data, "little") >> spec["start"]) & ((1 << spec["length"]) - 1)
    if spec["signed"] and raw >= 1 << (spec["length"] - 1):
        raw -= 1 << spec["length"]          # two's complement
    return raw * spec["factor"] + spec["offset"]


def encode(spec, value, nbytes=8):
    """Inverse of decode: round to the signal's resolution and pack into bytes."""
    raw = int(round((value - spec["offset"]) / spec["factor"]))
    lo, hi = (-(1 << (spec["length"] - 1)), (1 << (spec["length"] - 1)) - 1) if spec["signed"] else (0, (1 << spec["length"]) - 1)
    raw = max(lo, min(hi, raw)) & ((1 << spec["length"]) - 1)
    return (raw << spec["start"]).to_bytes(nbytes, "little")


# --------------------------------------------------------------------------
# 2. The synthetic drive and the vehicle model (same values as the web page)
# --------------------------------------------------------------------------
VEH = dict(m=2200.0, cda=0.62, crr=0.008, rho=1.2, eta=0.9, aux=400.0, V0=760.0, R=0.08, g=9.81)
WP_T = np.array([0, 5, 25, 60, 75, 90, 115, 200, 230, 260, 285, 300], float)
WP_V = np.array([0, 0, 50, 50, 0, 0, 90, 110, 60, 60, 0, 0], float) / 3.6     # m/s


def speed(t):
    return np.interp(t, WP_T, WP_V, left=0.0, right=WP_V[-1])


def accel(t):
    """Slope of the segment that contains t (segments closed on the left)."""
    t = np.asarray(t, float)
    i = np.searchsorted(WP_T, t, side="right")
    a = np.zeros_like(t)
    ok = (t >= 0) & (i < len(WP_T))
    a[ok] = (WP_V[i[ok]] - WP_V[i[ok] - 1]) / (WP_T[i[ok]] - WP_T[i[ok] - 1])
    return a


def battery_power(v, a):
    """Road-load power at the battery, drivetrain 90 % in both directions, plus modelled auxiliaries."""
    Pw = (0.5 * VEH["rho"] * VEH["cda"] * v ** 2 + VEH["crr"] * VEH["m"] * VEH["g"] + VEH["m"] * a) * v
    return np.where(Pw >= 0, Pw / VEH["eta"], Pw * VEH["eta"]) + VEH["aux"]


def make_signals(offset, gain, lag, extra):
    """Truth and logged signals before CAN encoding. Returns dict of arrays."""
    tI = np.arange(30001) / 100.0           # current, 100 Hz
    tV = np.arange(3001) / 10.0             # voltage, 10 Hz
    tS = np.arange(6001) / 20.0             # speed, 20 Hz
    P = battery_power(speed(tI), accel(tI)) + extra
    I = (VEH["V0"] - np.sqrt(VEH["V0"] ** 2 - 4 * VEH["R"] * P)) / (2 * VEH["R"])
    V = VEH["V0"] - VEH["R"] * I
    noise = 0.6 * np.sin(2 * np.pi * 7.3 * tI) + 0.3 * np.sin(2 * np.pi * 13.7 * tI + 1)
    return {
        "tI": tI, "I_log": I * (1 + gain / 100) + offset + noise,
        "tV": tV, "V_log": V[::10] + 0.3 * np.sin(2 * np.pi * 0.9 * tV),
        "tS": tS, "v_log_kmh": speed(tS - lag) * 3.6,
        "P_true": V * I}


def to_frames(sig, db):
    """Encode the logged signals as (time, id, data) frames, sorted by time."""
    ids = {db[k]["name"]: k for k in db}
    sI = db[ids["BMS_Current"]]["signals"]["PackCurrent"]
    sV = db[ids["BMS_Voltage"]]["signals"]["PackVoltage"]
    sS = db[ids["VCU_Speed"]]["signals"]["VehicleSpeed"]
    frames = [(t, ids["BMS_Current"], encode(sI, x)) for t, x in zip(sig["tI"], sig["I_log"])]
    frames += [(t, ids["BMS_Voltage"], encode(sV, x)) for t, x in zip(sig["tV"], sig["V_log"])]
    frames += [(t, ids["VCU_Speed"], encode(sS, x)) for t, x in zip(sig["tS"], sig["v_log_kmh"])]
    frames.sort(key=lambda f: f[0])
    return frames


def candump_lines(frames):
    return ["(%.6f) can0 %03X#%s" % (t, i, d.hex().upper()) for t, i, d in frames]


def read_candump(lines, db):
    """Decode candump-style lines into {signal: (time array, value array)}."""
    out = {}
    pat = re.compile(r"\((\d+\.\d+)\) \w+ ([0-9A-F]+)#([0-9A-F]*)")
    for line in lines:
        m = pat.match(line)
        if not m or int(m.group(2), 16) not in db:
            continue
        t, fid, data = float(m.group(1)), int(m.group(2), 16), bytes.fromhex(m.group(3))
        for name, spec in db[fid]["signals"].items():
            out.setdefault(name, ([], []))
            out[name][0].append(t)
            out[name][1].append(decode(spec, data))
    return {k: (np.array(v[0]), np.array(v[1])) for k, v in out.items()}


# --------------------------------------------------------------------------
# 3. Analysis on one time base
# --------------------------------------------------------------------------
def trapz(y, x):
    return float(np.sum((y[1:] + y[:-1]) / 2 * np.diff(x)))


def analyse(tI, I_log, tV, V_log, tS, v_kmh, P_true=None):
    V_on_I = np.interp(tI, tV, V_log)                 # voltage onto the 100 Hz current samples
    P_log = V_on_I * I_log                            # multiply first, then average
    vs = v_kmh / 3.6
    acc = np.gradient(vs, tS)                         # central differences inside, one-sided at the ends

    def model(n):                                     # model fed with the speed shifted by n samples
        idx = np.clip(np.arange(len(vs)) + n, 0, len(vs) - 1)
        return battery_power(np.interp(tI, tS, vs[idx]), np.interp(tI, tS, acc[idx]))

    def stats(M):
        d = P_log - M
        return {"bias": float(d.mean()), "rmse": float(np.sqrt((d ** 2).mean())), "r": float(np.corrcoef(P_log, M)[0, 1])}

    dt = float(np.median(np.diff(tS)))
    shifts = range(-int(round(2 / dt)), int(round(2 / dt)) + 1)
    corr = [stats(model(n))["r"] for n in shifts]
    n_best = list(shifts)[int(np.argmax(corr))]
    M0, Mb = model(0), model(n_best)
    parked = (tI >= 78) & (tI <= 88)
    res = {
        "distance_km": trapz(vs, tS) / 1000,
        "E_log_Wh": trapz(P_log, tI) / 3600,
        "raw": stats(M0), "aligned": stats(Mb), "lag_s": n_best * dt,
        "standstill_W": float(P_log[parked].mean() - M0[parked].mean()),
        "V_parked": float(V_on_I[parked].mean()),
        "P_log": P_log, "M0": M0, "Mb": Mb, "t": tI}
    if P_true is not None:
        res["E_true_Wh"] = trapz(P_true, tI) / 3600
    return res


def run(offset=0.5, gain=0.0, lag=0.6, extra=600.0, write_log=None, via_can=True):
    """via_can=False skips the CAN encoding, as the web page does (no quantization)."""
    db = parse_dbc(DBC)
    sig = make_signals(offset, gain, lag, extra)
    if not via_can:
        return analyse(sig["tI"], sig["I_log"], sig["tV"], sig["V_log"], sig["tS"], sig["v_log_kmh"], sig["P_true"])
    lines = candump_lines(to_frames(sig, db))
    if write_log:
        with open(write_log, "w") as fh:
            fh.write("\n".join(lines) + "\n")
    dec = read_candump(lines, db)
    tI, I_log = dec["PackCurrent"]
    tV, V_log = dec["PackVoltage"]
    tS, v_kmh = dec["VehicleSpeed"]
    res = analyse(tI, I_log, tV, V_log, tS, v_kmh, sig["P_true"])
    res["frames"] = len(lines)
    res["first_lines"] = lines[:4]
    return res


def report(r, a):
    print("Synthetic log: %d frames (current 100 Hz, voltage 10 Hz, speed 20 Hz)" % r["frames"])
    for line in r["first_lines"]:
        print("   " + line)
    print("Errors added: offset %.2f A, gain %.1f %%, speed delay %.2f s, missing load %.0f W" % (a.offset, a.gain, a.lag, a.extra))
    print()
    print("Distance                         %8.2f km" % r["distance_km"])
    print("Battery energy, truth            %8.1f Wh   %6.1f Wh/km" % (r["E_true_Wh"], r["E_true_Wh"] / r["distance_km"]))
    print("Battery energy from the log      %8.1f Wh   %6.1f Wh/km   (%+.1f %%)" % (
        r["E_log_Wh"], r["E_log_Wh"] / r["distance_km"], 100 * (r["E_log_Wh"] / r["E_true_Wh"] - 1)))
    print("Model vs log, as logged          mean gap %+7.0f W   RMSE %5.2f kW" % (r["raw"]["bias"], r["raw"]["rmse"] / 1000))
    print("Time shift by cross-correlation  %8.2f s" % r["lag_s"])
    print("Model vs log, aligned            mean gap %+7.0f W   RMSE %5.2f kW" % (r["aligned"]["bias"], r["aligned"]["rmse"] / 1000))
    print("Standstill check, 78-88 s        %+8.0f W   (offset x voltage = %.0f W)" % (r["standstill_W"], a.offset * r["V_parked"]))


def check():
    """Regression check: decoding examples from the page, physics of the errors, and the page's numbers."""
    db = parse_dbc(DBC)
    spec = db[416]["signals"]["PackCurrent"]
    fails = []

    def expect(name, got, want, tol):
        ok = abs(got - want) <= tol
        print("%-4s %-44s got %12.4f  want %12.4f  tol %g" % ("ok" if ok else "FAIL", name, got, want, tol))
        if not ok:
            fails.append(name)

    expect("decode 40 1F -> A", decode(spec, bytes.fromhex("401F000000000000")), 400.0, 1e-9)
    expect("decode 30 F8 -> A", decode(spec, bytes.fromhex("30F8000000000000")), -100.0, 1e-9)
    expect("encode/decode round trip, -123.45 A", decode(spec, encode(spec, -123.45)), -123.45, 0.025)

    # Page values (chapter 15 defaults): the browser model skips the CAN encoding.
    w = run(via_can=False)
    expect("page: energy from the log [Wh]", w["E_log_Wh"], 728.1785, 0.001)
    expect("page: energy, truth [Wh]", w["E_true_Wh"], 696.5375, 0.001)
    expect("page: distance [km]", w["distance_km"], 4.819444, 1e-5)
    expect("page: time shift found [s]", w["lag_s"], 0.6, 1e-9)
    expect("page: RMSE as logged [kW]", w["raw"]["rmse"] / 1000, 3.74831, 1e-4)
    expect("page: RMSE aligned [kW]", w["aligned"]["rmse"] / 1000, 1.12903, 1e-4)
    expect("page: standstill gap [W]", w["standstill_W"], 979.988, 0.01)
    # Through CAN frames: quantization barely moves the energy; differentiated speed gets noisier.
    r = run()
    expect("CAN: energy from the log [Wh]", r["E_log_Wh"], w["E_log_Wh"], 0.05)
    expect("CAN: time shift found [s]", r["lag_s"], 0.6, 1e-9)
    expect("CAN: standstill gap [W]", r["standstill_W"], w["standstill_W"], 2.0)
    # Physics: the standstill gap is the missing load plus offset x voltage.
    expect("standstill gap - (600 W + offset x V)", r["standstill_W"] - (600 + 0.5 * r["V_parked"]), 0.0, 5.0)
    clean = run(offset=0, gain=0, lag=0, extra=0)
    expect("no errors: log energy / truth - 1 [%]", 100 * (clean["E_log_Wh"] / clean["E_true_Wh"] - 1), 0.0, 0.05)
    expect("no errors: time shift found [s]", clean["lag_s"], 0.0, 1e-9)
    print("\n%s" % ("all checks passed" if not fails else "%d check(s) failed" % len(fails)))
    return not fails


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--offset", type=float, default=0.5, help="current-sensor offset [A]")
    p.add_argument("--gain", type=float, default=0.0, help="current-sensor gain error [%%]")
    p.add_argument("--lag", type=float, default=0.6, help="delay of the speed signal [s]")
    p.add_argument("--extra", type=float, default=600.0, help="auxiliary load missing from the model [W]")
    p.add_argument("--write-log", metavar="FILE", help="save the raw frames in candump format")
    p.add_argument("--plot", metavar="PNG", help="save a plot of logged and modelled power")
    p.add_argument("--check", action="store_true", help="run the regression check and exit")
    a = p.parse_args(argv)
    if a.check:
        return 0 if check() else 1
    r = run(a.offset, a.gain, a.lag, a.extra, a.write_log)
    report(r, a)
    if a.plot:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.plot(r["t"], r["P_log"] / 1000, lw=0.6, color="0.5", label="log, V x I")
        ax.plot(r["t"], r["M0"] / 1000, lw=1.2, label="model, as logged")
        ax.plot(r["t"], r["Mb"] / 1000, lw=1.2, label="model, aligned by %.2f s" % r["lag_s"])
        ax.set_xlabel("time [s]")
        ax.set_ylabel("battery power [kW]")
        ax.legend()
        fig.tight_layout()
        fig.savefig(a.plot, dpi=150)
        print("plot saved to", a.plot)
    return 0


if __name__ == "__main__":
    sys.exit(main())
