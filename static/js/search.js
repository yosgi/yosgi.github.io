(() => {
 const form = document.getElementById('search-form');
 if (!form) return;
 const input = form.elements.q;
 const panel = document.getElementById('site-search');
 const toggle = document.getElementById('search-toggle');
 const results = document.getElementById('search-result');
 const main = document.querySelector('.application-main');
 const labels = JSON.parse(form.dataset.labels);
 let enginePromise, request = 0, timer, composing = false;
 const node = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text != null) el.textContent = text;
  if (className) el.className = className;
  return el;
 };
 function open() { panel.hidden = false; toggle.setAttribute('aria-expanded','true'); input.focus(); }
 function restore() {
  ++request; clearTimeout(timer); results.hidden = true; results.removeAttribute('aria-busy'); main.hidden = false;
  const url = new URL(location.href); url.searchParams.delete('q'); history.replaceState(null,'',url);
 }
 function close() { restore(); panel.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.focus(); }
 function load() {
  if (!enginePromise) {
   enginePromise = Promise.all([
    fetch(form.dataset.index).then(r => { if(!r.ok) throw new Error('Index unavailable'); return r.json(); }),
    new Promise((resolve,reject) => {
     if (window.Fuse) return resolve();
     const script = document.createElement('script');
     script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.min.js';
     script.onload = resolve; script.onerror = () => { script.remove(); reject(new Error('Search unavailable')); };
     document.head.append(script);
    })
   ]).then(([data]) => new Fuse(data,{keys:[{name:'title',weight:0.55},{name:'summary',weight:0.3},{name:'content',weight:0.15}],includeMatches:true,threshold:0.3,ignoreLocation:true,minMatchCharLength:2})).catch(error => { enginePromise = null; throw error; });
  }
  return enginePromise;
 }
 function message(text) {
  results.replaceChildren(); results.hidden = false; main.hidden = true;
  const status = node('p',text,'search-status'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); results.append(status);
  const back = node('button',labels.back,'text-button'); back.type = 'button'; back.onclick = close; results.append(back);
 }
 function highlight(parent, text, indices = []) {
  let position = 0;
  for (const [start,end] of indices) {
   if (start < position || start >= text.length) continue;
   parent.append(document.createTextNode(text.slice(position,start)),node('mark',text.slice(start,end+1)));
   position = end+1;
  }
  parent.append(document.createTextNode(text.slice(position)));
 }
 async function search() {
  const query = input.value.trim().slice(0,200); const id = ++request;
  if (query.length < 2) { if(query) message(labels.hint); else restore(); return; }
  message(labels.loading); results.setAttribute('aria-busy','true');
  try {
   const engine = await load(); if (id !== request) return;
   const matches = engine.search(query);
   message(labels.count.replace('{count}',matches.length).replace('{query}',query));
   const list = node('ul',null,'search-list');
   for (const result of matches.slice(0,20)) {
    const item = result.item;
    const url = new URL(item.relpermalink || item.permalink,location.origin);
    if (url.origin !== location.origin || !['http:','https:'].includes(url.protocol)) continue;
    const li = node('li'); const heading = node('h2'); const link = node('a'); link.href = url.pathname;
    highlight(link,item.title,result.matches.find(m=>m.key==='title')?.indices); heading.append(link);
    const contentMatch = result.matches.find(m=>m.key==='content');
    const text = contentMatch ? item.content : (item.summary || item.content || '');
    const chinese = document.documentElement.lang.startsWith('zh');
    let start = contentMatch ? Math.max(0,contentMatch.indices[0][0]-(chinese?20:50)) : 0;
    while(start>0 && /[A-Za-z0-9]/.test(text[start-1]) && /[A-Za-z0-9]/.test(text[start])) start--;
    const end = Math.min(text.length,start+(chinese?100:190));
    const excerpt = node('p');
    const indices = contentMatch ? contentMatch.indices.filter(([a,b])=>b>=start&&a<end).map(([a,b])=>[Math.max(0,a-start),Math.min(end-start-1,b-start)]) : [];
    if(start) excerpt.append(document.createTextNode('…'));
    highlight(excerpt,text.slice(start,end),indices);
    if(end<text.length) excerpt.append(document.createTextNode('…'));
    li.append(heading,excerpt); list.append(li);
   }
   results.insertBefore(list,results.lastChild);
   if(!matches.length) results.insertBefore(node('p',labels.empty),results.lastChild);
   if(matches.length>20) results.insertBefore(node('p',labels.more,'muted'),results.lastChild);
   const url = new URL(location.href); url.searchParams.set('q',query); history.replaceState(null,'',url);
  } catch (_) { if(id===request) message(labels.error); }
  finally { if(id===request) results.removeAttribute('aria-busy'); }
 }
 toggle.addEventListener('click',()=>panel.hidden ? open() : close());
 document.getElementById('search-close').addEventListener('click',close);
 document.getElementById('search-clear').addEventListener('click',()=>{ input.value=''; restore(); input.focus(); });
 input.addEventListener('focus',()=>{load().catch(()=>{});},{once:true});
 input.addEventListener('compositionstart',()=>{composing=true;clearTimeout(timer);});
 input.addEventListener('compositionend',()=>{composing=false;clearTimeout(timer);timer=setTimeout(search,250);});
 input.addEventListener('input',()=>{if(composing)return;clearTimeout(timer);timer=setTimeout(search,250);});
 form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);search();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});
 const query = new URL(location.href).searchParams.get('q');
 if(query){open();input.value=query;search();}
})();
