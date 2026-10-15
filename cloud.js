const config = window.SCRAPBOOK_CONFIG;
const message = document.querySelector('#loginMessage');
const form = document.querySelector('#loginForm');
let client, user, revision = 0, pending = null, running = false, conflict = false, appLoaded = false, saveTimer;
const clean = html => { const safe=DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p','br','div','span','b','strong','i','em','u','s','font','img','ul','ol','li'],
  ALLOWED_ATTR: ['style','face','size','color','src','alt'],
  ALLOW_DATA_ATTR: false
});const template=document.createElement('template');template.innerHTML=safe;
  template.content.querySelectorAll('img').forEach(img=>{if(!/^data:image\/(jpeg|png|webp);base64,/i.test(img.getAttribute('src')||''))img.remove();});
  template.content.querySelectorAll('[style]').forEach(node=>{
    const original=node.style;const allowed={};
    for(const key of ['color','font-family','font-size','font-weight','font-style','text-decoration','text-align'])if(original.getPropertyValue(key))allowed[key]=original.getPropertyValue(key);
    node.removeAttribute('style');for(const [key,value] of Object.entries(allowed))node.style.setProperty(key,value);
  });return template.innerHTML;
};
function validate(entries) {
  if (!Array.isArray(entries)) throw Error('Memórias inválidas.');
  return entries.map(e => {
    if (!e || typeof e.id !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) throw Error('Folha inválida.');
    return { id:e.id, title:String(e.title || ''), date:e.date, html:clean(String(e.html || '')),
      theme:['cream','lilac','peach','dots'].includes(e.theme) ? e.theme : 'cream' };
  });
}
function lock() {
  document.querySelector('#privateApp').hidden = true;
  document.querySelector('#loginPage').hidden = false;
  document.querySelector('#writing').replaceChildren();
}
function state(text) { document.querySelector('#saved').textContent = text; }
async function flush() {
  if (running || conflict || !pending) return;
  running = true;
  try {
    while (pending) {
      const snapshot = pending; pending = null;
      const { data, error } = await client.rpc('save_scrapbook', { p_entries:snapshot, p_revision:revision });
      if (error) { pending = pending || snapshot; throw error; }
      revision = data;
    }
    state('✓ Memórias salvas no Supabase');
  } catch (error) {
    conflict = String(error.message).includes('REVISION_CONFLICT');
    state(conflict ? 'Outra sessão alterou suas folhas. Copie suas alterações e recarregue.' : 'Não foi salvo. Verifique a conexão e clique em Tentar salvar.');
  } finally { running = false; }
}
async function enter() {
  const { data:{user:verified}, error } = await client.auth.getUser();
  if (error || !verified) {message.textContent='Não foi possível validar sua sessão. Verifique a conexão ou entre novamente.';return;}
  const allowed = await client.from('scrapbook_owner').select('user_id').eq('user_id', verified.id).maybeSingle();
  if (allowed.error || !allowed.data) {
    await client.auth.signOut();
    message.textContent = 'Este scrapbook é exclusivo da Bia. Sua conta não está autorizada.';
    return;
  }
  const result = await client.from('scrapbook_journal').select('entries,revision').eq('user_id', verified.id).maybeSingle();
  if (result.error) { message.textContent = 'Não foi possível carregar as memórias. Tente entrar novamente.'; return; }
  user = verified; revision = result.data?.revision || 0;
  const entries = validate(result.data?.entries || []);
  window.biaCloud = { entries, clean, save(value) { pending = validate(structuredClone(value)); state('Salvando suas memórias…'); clearTimeout(saveTimer);saveTimer=setTimeout(flush,600); } };
  if (!appLoaded) {
    await new Promise((resolve,reject) => { const script=document.createElement('script');script.src='app.js';script.onload=resolve;script.onerror=reject;document.body.append(script); });
    appLoaded=true;
  }
  document.querySelector('#loginPage').hidden=true;
  document.querySelector('#privateApp').hidden=false;
  state('✓ Memórias carregadas do Supabase');
  message.textContent='';
}
form.addEventListener('submit',async event => {
  event.preventDefault(); if (!client) return;
  const button=form.querySelector('button');button.disabled=true;message.textContent='Entrando…';
  try {
    const {error}=await client.auth.signInWithPassword({email:form.email.value.trim(),password:form.password.value});
    form.password.value='';
    if(error) {message.textContent='Não foi possível entrar. Confira seu e-mail e senha.';return;}
    await enter();
  } catch {message.textContent='Não foi possível conectar. Tente novamente.';}
  finally {button.disabled=false;}
});
document.querySelector('#retrySave').onclick=flush;
document.querySelector('#signOut').onclick=async()=>{
  if (pending || running) {await flush();if(pending || running){state('Aguarde o salvamento antes de sair.');return;}}
  const {error}=await client.auth.signOut();
  if(error){state('Não foi possível sair. Tente novamente.');return;}
  location.reload();
};
window.addEventListener('online',flush);
window.addEventListener('beforeunload',e=>{if(pending||running){e.preventDefault();e.returnValue='';}});
if (!config?.url || !config?.publishableKey || !window.supabase || !window.DOMPurify) {
  message.textContent='O scrapbook está sendo preparado. A conexão segura ainda não foi configurada.';
  form.querySelector('button').disabled=true;
} else {
  client=supabase.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){const wasOpen=appLoaded;lock();clearTimeout(saveTimer);pending=null;user=null;if(wasOpen)location.reload();}});
  // A sessão lembrada só abre as folhas após validar o usuário e a autorização no banco.
  async function restoreLogin() {
    const button=form.querySelector('button');
    button.disabled=true;message.textContent='Abrindo seu cantinho…';
    try {
      const {data,error}=await client.auth.getSession();
      if(error) {message.textContent='Sua sessão terminou. Entre novamente para continuar.';return;}
      if(data.session) await enter();
      else message.textContent='';
    } catch {message.textContent='Não foi possível recuperar o acesso. Verifique a conexão ou entre novamente.';}
    finally {button.disabled=false;}
  }
  restoreLogin();
}