const clean = html => { const safe=DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p','br','div','span','b','strong','i','em','u','s','font','img','ul','ol','li','details','summary','button'],
  ALLOWED_ATTR: ['style','face','size','color','src','alt','class','contenteditable','type'],
  ALLOW_DATA_ATTR: false
});const template=document.createElement('template');template.innerHTML=safe;
  template.content.querySelectorAll('img').forEach(img=>{if(!/^data:image\/(jpeg|png|webp);base64,/i.test(img.getAttribute('src')||''))img.remove();});
  template.content.querySelectorAll('[style]').forEach(node=>{
    const original=node.style;const allowed={};
    for(const key of ['color','font-family','font-size','font-weight','font-style','text-decoration','text-align'])if(original.getPropertyValue(key))allowed[key]=original.getPropertyValue(key);
    node.removeAttribute('style');for(const [key,value] of Object.entries(allowed))node.style.setProperty(key,value);
  });template.content.querySelectorAll('[class]').forEach(node=>{
    const allowedClasses=node.tagName==='IMG'?['photo-frame-none','photo-frame-polaroid','photo-frame-rose','photo-frame-vintage','photo-frame-lace']:node.tagName==='DETAILS'?['memory-letter']:node.tagName==='DIV'?['letter-body']:node.tagName==='BUTTON'?['edit-letter']:[];
    node.className=Array.from(node.classList).filter(c=>allowedClasses.includes(c)).join(' ');
  });
  template.content.querySelectorAll('[contenteditable]').forEach(node=>{if(node.matches('details.memory-letter'))node.setAttribute('contenteditable','false');else node.removeAttribute('contenteditable');});
  template.content.querySelectorAll('button').forEach(node=>{node.type='button';});
  return template.innerHTML;
};

window.biaCloud={entries:[{id:'preview-memory',title:'Um dia para florescer',date:'2026-10-15',theme:'cream',html:'<p>Hoje eu guardei um pedacinho de felicidade. 🌷</p><details class="memory-letter" contenteditable="false"><summary>Uma carta para o futuro 💌</summary><div class="letter-body">Que nunca faltem pequenos motivos para sorrir. Esta carta é só um exemplo da prévia: você pode abrir, editar ou escrever a sua.</div><button type="button" class="edit-letter">Editar carta</button></details>'}],clean,save(){document.querySelector('#saved').textContent='Prévia: alterações apenas nesta aba';}};document.querySelector('#privateApp').hidden=false;document.querySelector('#loginPage').hidden=true;document.querySelector('#signOut').disabled=true;document.querySelector('#importLocal').disabled=true;document.querySelector('#retrySave').disabled=true;