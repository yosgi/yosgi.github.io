(() => {
 const article = document.querySelector('.article-body');
 const copyLabels = document.querySelector('[data-copy-labels]');
 if(article && copyLabels) {
  const labels = JSON.parse(copyLabels.dataset.copyLabels);
  article.querySelectorAll('pre').forEach(pre => {
   if(pre.querySelector('.language-mermaid')) return;
   const button = document.createElement('button'); button.type='button'; button.className='copy-code'; button.textContent=labels.copy;
   button.addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || pre.textContent); button.textContent=labels.copied; }
    catch(_){button.textContent=labels.failed;}
    setTimeout(()=>button.textContent=labels.copy,1800);
   });
   pre.append(button);
  });
 }
 const meter = document.getElementById('reading-progress');
 if(article && meter) {
  let pending=false;
  const update=()=>{pending=false;const rect=article.getBoundingClientRect();const height=Math.max(1,rect.height-innerHeight);document.querySelector('.back-to-top')?.classList.toggle('is-visible',scrollY>700);meter.style.width=`${Math.max(0,Math.min(1,-rect.top/height))*100}%`;};
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update,{passive:true}); update();
 }
 const comments = document.querySelector('[data-giscus]');
 function loadComments() {
  if(!comments || comments.dataset.loaded) return;
  comments.dataset.loaded='true';
  const script=document.createElement('script');script.src='https://giscus.app/client.js';script.async=true;script.crossOrigin='anonymous';
  for(const [key,value] of Object.entries(JSON.parse(comments.dataset.giscus))) script.setAttribute('data-'+key,String(value));
  script.setAttribute('data-theme',document.documentElement.getAttribute('data-color-mode')||'light');
  comments.replaceChildren(script);
 }
 if(comments){
  comments.querySelector('button')?.addEventListener('click',loadComments);
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadComments();observer.disconnect();}},{rootMargin:'160px'});observer.observe(comments);}
  new MutationObserver(()=>{document.querySelector('.giscus-frame')?.contentWindow.postMessage({giscus:{setConfig:{theme:document.documentElement.getAttribute('data-color-mode')}}},'https://giscus.app');}).observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});
 }
})();
