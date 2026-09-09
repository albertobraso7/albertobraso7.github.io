/* Full-resolution figure inspection. Original links remain the no-JS fallback. */
(() => {
 const links=[...document.querySelectorAll('figure a[href]')].filter(a=>/\.(png|jpe?g|webp|svg)$/i.test(a.getAttribute('href')));
 if(!links.length || typeof HTMLDialogElement==='undefined') return;
 const dialog=document.createElement('dialog');
 dialog.className='figure-dialog';
 dialog.setAttribute('aria-label','Full-resolution engineering figure');
 dialog.innerHTML='<div class="dialog-toolbar"><button type="button" class="dialog-zoom" aria-pressed="false">Actual size</button><a class="dialog-original" target="_blank" rel="noopener">Open original ↗</a><button type="button" class="dialog-close" aria-label="Close figure">Close ×</button></div><div class="dialog-image"><img alt=""></div><p></p>';
 document.body.append(dialog);
 const img=dialog.querySelector('img'),caption=dialog.querySelector('p'),zoom=dialog.querySelector('.dialog-zoom');
 let opener;
 const reset=()=>{dialog.classList.remove('is-zoomed');zoom.textContent='Actual size';zoom.setAttribute('aria-pressed','false');};
 links.forEach(a=>a.addEventListener('click',e=>{
  if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();opener=a;reset();
  const fig=a.closest('figure');img.src=a.href;img.alt=fig.querySelector('img')?.alt||'Engineering figure';
  caption.textContent=fig.querySelector('figcaption')?.textContent.replace(/(Full-size figure|Enlarge figure|Explore the flow field)\s*↗/g,'').trim()||'';
  dialog.querySelector('.dialog-original').href=a.href;dialog.showModal();
 }));
 zoom.addEventListener('click',()=>{const enlarged=dialog.classList.toggle('is-zoomed');zoom.textContent=enlarged?'Fit to screen':'Actual size';zoom.setAttribute('aria-pressed',String(enlarged));});
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{reset();opener?.focus({preventScroll:true});});
})();
