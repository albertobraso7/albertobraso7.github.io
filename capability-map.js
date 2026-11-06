(() => {
const root=document.getElementById('capability-map'); if(!root)return;
// Application areas (columns); `pub` links the area's public case study when one exists.
const areas=[
 {k:'emot',t:'Electric motors',img:'electric-motor-cooling/assets/emachine-poster.jpg',pub:{href:'electric-motor-cooling/',label:'Case study'}},
 {k:'veh',t:'Vehicle airflow',img:'vehicle-aerodynamics/assets/aerosuv-geometry.png',pub:{href:'vehicle-aerodynamics/',label:'In development',dev:1}},
 {k:'eng',t:'Engines & fuel injection',img:'throttle-body/assets/compressible-flow.png',pub:{href:'throttle-body/',label:'Case study'}},
 {k:'h2',t:'Hydrogen & fuel cells',img:'hydrogen-dilution/assets/hydrogen-dilution-preview.webp',pub:{href:'hydrogen-dilution/',label:'Case study'}},
 {k:'hp',t:'Heat pumps & refrigerants'},
 {k:'pump',t:'Pumps',img:'pump/assets/smm_flow_field_frame.jpg',pub:{href:'pump/',label:'Case study'}},
 {k:'valve',t:'Valves & manifolds'},
 {k:'cool',t:'Coolant modules',img:'debubbler/assets/debubbler-poster.jpg',pub:{href:'debubbler/',label:'Case study'}},
 {k:'tool',t:'Simulation tools'},
 {k:'bio',t:'Biomedical (PhD)',img:'aneurysm/assets/fsi-poster.jpg',pub:{href:'aneurysm/',label:'Case study'}},
 {k:'proc',t:'Materials reactor (MSc)',img:'reactor/assets/streamlines-centered-preview.webp',pub:{href:'reactor/',label:'Case study'}},
 {k:'bld',t:'Buildings',img:'ventilation/assets/streamlines.jpg',pub:{href:'ventilation/',label:'Case study'}}
];
const groups={
 PHYSICS:{multi:'Multiphase flow',spray:'Sprays & particle tracking',pc:'Phase change',heat:'Heat transfer & CHT',
  rot:'Rotating machinery',comp:'Compressible & real-gas flow',spec:'Species transport & mixing',por:'Porous media',
  int:'Internal flow & pressure loss',ext:'External & building airflow',buoy:'Buoyancy-driven flow',
  fsi:'FSI & non-Newtonian flow',ac:'Pressure pulsation & acoustics'},
 METHODS:{red:'Reduced-order & 1D models',auto:'Automation & parametric studies',val:'Test or benchmark comparison'}
};
// Generic descriptions from the author's NDA-free project log; no customer, data or results.
const studies=[
 ['veh','Underhood airflow for a fuel-cell van','ext por heat val','Industrial'],
 ['emot','Multiphysics oil-cooling methodology','multi spray rot heat','Industrial'],
 ['emot','Oil-cooling method applied to a commercial-vehicle motor','multi spray rot heat','Industrial'],
 ['emot','Evaluation of accelerated oil-cooling methods','multi heat','Industrial'],
 ['emot','Rotor-integrated oil-cooling design study','multi rot heat auto','Industrial'],
 ['emot','Stator-integrated oil-cooling analysis','multi heat','Industrial'],
 ['h2','Hydrogen dilution: baffle design','spec','Industrial'],
 ['h2','Hydrogen ventilation system check','spec','Industrial'],
 ['h2','Water injection for fuel-cell cathode air cooling','spray pc por','Industrial'],
 ['eng','Throttle-body virtual characterization','comp val','Industrial'],
 ['h2','Two-phase flow in an electrolyzer porous layer','multi por red auto','Industrial'],
 ['eng','Hydrogen engine mixture formation','comp spec','Industrial'],
 ['eng','Alternative-fuel injector sensitivity','comp por','Industrial'],
 ['eng','In-cylinder charge motion and injector position','comp spec auto','Industrial'],
 ['pump','Pumping-system losses and energy cost','int','Industrial'],
 ['eng','Spray targeting for a large-displacement engine','spray pc auto','Industrial'],
 ['eng','Port-injection manufacturing-tolerance study','spray pc auto','Industrial'],
 ['eng','Spray targeting for an aviation engine','spray pc','Industrial'],
 ['cool','Moisture and condensation in a thermal unit','heat spec pc val','Industrial'],
 ['valve','Self-locking valve hydraulics','int val','Industrial'],
 ['pump','Pump-outlet packaging: Fluent vs OpenFOAM','int','Industrial'],
 ['pump','Suction manifold for embedded pumps','rot','Industrial'],
 ['pump','Pump hydroacoustics and signal-processing tool','rot ac auto','Industrial'],
 ['valve','Multi-port coolant valve optimization (A)','int','Industrial'],
 ['valve','Multi-port coolant valve optimization (B)','int val','Industrial'],
 ['hp','Refrigerant stream mixing in a manifold','heat int','Industrial'],
 ['valve','Thermal isolation of multi-stream manifolds','heat int','Industrial'],
 ['cool','Integrated degassing in a thermal unit','multi buoy int','Industrial'],
 ['tool','FlowPilot: OpenFOAM hydraulic interface','int auto','Industrial'],
 ['valve','CFD-to-1D valve calibration','int red auto','Industrial'],
 ['tool','Fluent campaign automation and convergence checks','auto','Industrial'],
 ['hp','Plate-fin evaporator: multi-scale method','heat por red','Industrial'],
 ['hp','Suction-manifold mixing sensitivity','heat int auto','Industrial'],
 ['eng','Gaseous port-injection mixing','spec','Industrial'],
 ['hp','Heat-pump unit pressure losses, two refrigerants','multi comp int auto','Industrial'],
 ['hp','Hot-gas bypass: real-gas expansion','comp pc red','Industrial'],
 ['hp','Filter and throttle flashing','comp pc por','Industrial'],
 ['bio','Arterial FSI, rheology and particle transport','fsi spray val','Doctoral research'],
 ['proc','CVD reactor explained through thermal physics','heat buoy por val','Master’s research'],
 ['bld','Residential airflow and solar exposure','ext heat','Consulting']
].map(([a,t,c,ctx])=>({a,t,c:c.split(' '),ctx}));

const label=Object.assign({},...Object.values(groups));
const hits=(a,c)=>studies.filter(s=>s.a===a&&s.c.includes(c));
const plural=n=>n===1?'study':'studies';
const max=Math.max(...areas.flatMap(a=>Object.keys(label).map(c=>hits(a.k,c).length)));
const nInd=studies.filter(s=>s.ctx==='Industrial').length;

root.querySelector('.capx-summary').innerHTML=[
 [studies.length,`STUDIES (${nInd} INDUSTRIAL)`],[areas.length,'APPLICATION AREAS'],
 [Object.keys(label).length,'PHYSICS & METHODS'],[areas.filter(a=>a.pub&&!a.pub.dev).length,'PUBLIC CASE STUDIES']
].map(([v,l])=>`<div><strong>${v}</strong><span>${l}</span></div>`).join('');

let h='<caption class="capx-sr">Number of studies by physics or method and application area</caption><thead><tr><th class="capx-rh" scope="col"><span class="capx-sr">Physics or method</span></th>';
areas.forEach((a,i)=>{const n=studies.filter(s=>s.a===a.k).length;
 h+=`<th scope="col" data-c="${i}"><div class="capx-col">${a.img?`<img class="capx-thumb" src="${a.img}" alt="" loading="lazy" decoding="async">`:'<span class="capx-thumb none"></span>'}<span class="capx-area">${a.t}</span><span class="capx-count">${n} ${plural(n)}</span>${a.pub?`<a class="capx-case${a.pub.dev?' dev':''}" href="${a.pub.href}">${a.pub.label} ↗</a>`:'<span class="capx-case"></span>'}</div></th>`;});
h+='<th class="capx-total" scope="col">Total</th></tr></thead><tbody>';
for(const [g,caps] of Object.entries(groups)){
 h+=`<tr class="capx-grp"><th colspan="${areas.length+2}" scope="colgroup">${g}</th></tr>`;
 for(const [c,l] of Object.entries(caps)){
  h+=`<tr><th class="capx-rh" scope="row">${l}</th>`;
  areas.forEach((a,i)=>{const n=hits(a.k,c).length;
   h+=`<td class="capx-c" data-c="${i}">${n?`<button type="button" data-a="${a.k}" data-cap="${c}" aria-pressed="false" aria-label="${l} in ${a.t}: ${n} ${plural(n)}" class="${n/max<.45?'lo':''}" style="--a:${(.18+.82*n/max).toFixed(2)}">${n}</button>`:''}</td>`;});
  h+=`<td class="capx-total">${studies.filter(s=>s.c.includes(c)).length}</td></tr>`;
 }
}
const table=root.querySelector('.capx-table'); table.innerHTML=h+'</tbody>';

const panel=root.querySelector('.capx-panel');
function show(a,c){
 const area=areas.find(x=>x.k===a), list=hits(a,c);
 panel.innerHTML=`<h3>${label[c]} · ${area.t}</h3><p class="capx-sub">${list.length} ${plural(list.length).toUpperCase()}</p><ul>${list.map(s=>`<li>${s.t}<span>${s.ctx.toUpperCase()}</span></li>`).join('')}</ul>${area.pub?`<a href="${area.pub.href}">${area.pub.dev?'Public study in development':'Open the related case study'} ↗</a>`:''}`;
 table.querySelectorAll('.capx-c button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.a===a&&b.dataset.cap===c)));
}
table.addEventListener('click',e=>{const b=e.target.closest('.capx-c button');if(b)show(b.dataset.a,b.dataset.cap);});
const clear=()=>table.querySelectorAll('.hl').forEach(x=>x.classList.remove('hl'));
table.addEventListener('mouseover',e=>{clear();
 const cell=e.target.closest('td.capx-c,thead th[data-c]'),row=e.target.closest('tbody tr:not(.capx-grp)');
 if(row)row.querySelectorAll('th.capx-rh,td').forEach(x=>x.classList.add('hl'));
 if(cell)table.querySelectorAll(`[data-c="${cell.dataset.c}"]`).forEach(x=>x.classList.add('hl'));
});
table.addEventListener('mouseleave',clear);
show('emot','heat');
})();
