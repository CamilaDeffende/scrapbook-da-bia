const $=s=>document.querySelector(s),key='bia-scrapbook-v1';let entries=[],active,range=null;const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};entries=window.biaCloud.entries;if(!entries.length)entries=[{id:crypto.randomUUID(),title:'As pequenas coisas bonitas',date:today(),html:'',theme:'cream'}];active=entries[0].id;const current=()=>entries.find(e=>e.id===active);function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3000)}function persist(){window.biaCloud.save(entries)}function formatted(d){return new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}function list(){const box=$('#pages'),select=$('#mobilePages');box.replaceChildren();select.replaceChildren();entries.forEach((e,i)=>{const b=document.createElement('button');b.className='page-link'+(e.id===active?' active':'');const small=document.createElement('small');small.textContent='✿  '+formatted(e.date);const title=document.createElement('b');title.textContent=e.title||'Uma nova memória';const n=document.createElement('small');n.textContent='Folha '+String(i+1).padStart(2,'0');b.append(small,title,n);b.onclick=()=>open(e.id);box.append(b);const opt=new Option(e.title||'Uma nova memória',e.id);select.add(opt)});select.value=active;$('#count').textContent=entries.length;$('#pageNumber').textContent='Folha '+String(entries.findIndex(e=>e.id===active)+1).padStart(2,'0')+' de '+entries.length;const pageIndex=entries.findIndex(e=>e.id===active);$('#previousPage').disabled=pageIndex<=0;$('#nextPage').disabled=pageIndex>=entries.length-1}let pageAnimation,turnLeaf;
function open(id){
  if(!entries.some(e=>e.id===id))return;
  const previousIndex=entries.findIndex(e=>e.id===active);
  const nextIndex=entries.findIndex(e=>e.id===id);
  const changed=id!==active;
  pageAnimation?.cancel();turnLeaf?.remove();
  const sheet=$('#sheet');
  let leaf;
  if(changed&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&sheet.animate){
    leaf=sheet.cloneNode(true);
    leaf.removeAttribute('id');leaf.classList.add('turn-leaf');
    leaf.setAttribute('aria-hidden','true');leaf.inert=true;
    leaf.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    leaf.querySelectorAll('input').forEach((input,index)=>{input.value=sheet.querySelectorAll('input')[index].value});
    Object.assign(leaf.style,{left:sheet.offsetLeft+'px',top:sheet.offsetTop+'px',width:sheet.offsetWidth+'px',height:sheet.offsetHeight+'px',transformOrigin:nextIndex>=previousIndex?'0% 50%':'100% 50%'});
    sheet.parentElement.append(leaf);turnLeaf=leaf;
  }
  active=id;range=null;const e=current();
  $('#title').value=e.title;$('#date').value=e.date;
  $('#writing').innerHTML=window.biaCloud.clean(e.html);theme(e.theme,false);list();
  if(leaf){
    const direction=nextIndex>=previousIndex?-1:1;
    pageAnimation=leaf.animate([
      {transform:'rotate(-.45deg) rotateY(0deg)',opacity:1,boxShadow:'0 7px 25px #7857600e'},
      {transform:'rotate(-.45deg) rotateY('+(direction*22)+'deg)',opacity:1,boxShadow:(direction*-12)+'px 10px 24px #634c5328',offset:.3},
      {transform:'rotate(-.45deg) rotateY('+(direction*62)+'deg)',opacity:1,boxShadow:(direction*-22)+'px 12px 35px #634c5338',offset:.72},
      {transform:'rotate(-.45deg) rotateY('+(direction*100)+'deg)',opacity:0,boxShadow:'0 4px 12px #634c5300'}
    ],{duration:1150,easing:'cubic-bezier(.32,0,.2,1)',fill:'forwards'});
    const animation=pageAnimation;
    animation.finished.then(()=>{leaf.remove();animation.cancel();if(turnLeaf===leaf)turnLeaf=null}).catch(()=>leaf.remove());
  }
}
function theme(t,save=true){$('#sheet').className='sheet '+t;document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===t));if(save){current().theme=t;persist()}}function add(){entries.unshift({id:crypto.randomUUID(),title:'',date:today(),html:'',theme:'cream'});open(entries[0].id);persist();$('#title').focus();toast('Uma nova folha para uma nova memória ♡')}function saveContent(){current().html=window.biaPrepareContent?window.biaPrepareContent():$('#writing').innerHTML;persist()}document.addEventListener('selectionchange',()=>{let s=getSelection();if(s.rangeCount&&$('#writing').contains(s.anchorNode))range=s.getRangeAt(0).cloneRange()});function cmd(c,v){$('#writing').focus();if(range&&$('#writing').contains(range.commonAncestorContainer)){let s=getSelection();s.removeAllRanges();s.addRange(range)}document.execCommand(c,false,v);saveContent()}document.querySelectorAll('[data-cmd]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>cmd(b.dataset.cmd)});document.querySelectorAll('[data-color]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>cmd('foreColor',b.dataset.color)});$('#font').onchange=e=>cmd('fontName',e.target.value);$('#size').onchange=e=>cmd('fontSize',e.target.value);$('#customColor').oninput=e=>cmd('foreColor',e.target.value);$('#writing').oninput=saveContent;$('#writing').addEventListener('paste',e=>{e.preventDefault();cmd('insertText',e.clipboardData.getData('text/plain'))});$('#title').oninput=e=>{current().title=e.target.value;persist();list()};$('#date').onchange=e=>{if(!e.target.value){e.target.value=current().date;return}current().date=e.target.value;persist();list()};$('#newPage').onclick=add;$('#morePage').onclick=add;$('#mobilePages').onchange=e=>open(e.target.value);$('#allPages').onclick=()=>$('#pages').scrollIntoView({behavior:'smooth'});document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>theme(b.dataset.theme));['🎀','🌷','♡','✨','🦋','🌸','🍓','💌','🌼','☁️','🧸','🍒'].forEach(s=>{const b=document.createElement('button');b.className='sticker';b.textContent=s;b.setAttribute('aria-label','Adicionar adesivo '+s);b.onmousedown=e=>e.preventDefault();b.onclick=()=>cmd('insertText',s+' ');$('#stickers').append(b)});$('#photo').onclick=()=>$('#file').click();$('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/'))return toast('Escolha um arquivo de imagem.');const target=active;try{const bitmap=await createImageBitmap(f);const canvas=document.createElement('canvas');const scale=Math.min(1,1000/bitmap.width);canvas.width=bitmap.width*scale;canvas.height=bitmap.height*scale;canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const data=canvas.toDataURL('image/jpeg',.8);if(active!==target)return toast('Volte à folha original para adicionar a foto.');cmd('insertHTML','<img class="photo-frame-'+(document.querySelector('#photoFrame')?.value||'polaroid')+'" src="'+data+'" alt="Uma memória especial da Bia"><p><br></p>')}catch{toast('Não foi possível abrir essa foto. Tente JPG ou PNG.')}e.target.value=''};open(active);

document.querySelector('#importLocal').onclick=()=>{
  try {
    const old=JSON.parse(localStorage.getItem(key)||'[]');
    if(!Array.isArray(old)||!old.length)return toast('Não há folhas antigas neste navegador.');
    const existing=new Set(entries.map(e=>e.id));let count=0;
    for(const e of old){
      if(!e||typeof e.id!=='string'||existing.has(e.id)||!/^\d{4}-\d{2}-\d{2}$/.test(e.date))continue;
      entries.push({id:e.id,title:String(e.title||''),date:e.date,html:window.biaCloud.clean(String(e.html||'')),theme:['cream','lilac','peach','dots'].includes(e.theme)?e.theme:'cream'});
      existing.add(e.id);count++;
    }
    list();persist();toast(count+' folhas importadas. Aguarde a confirmação de salvamento.');
  } catch {toast('Não foi possível importar as folhas antigas.');}
};
function turnPage(step){const index=entries.findIndex(e=>e.id===active);const target=entries[index+step];if(target)open(target.id)}
$('#previousPage').onclick=()=>turnPage(-1);
$('#nextPage').onclick=()=>turnPage(1);
