// Admin groups JS (module)
import { qs, qsa } from '../../_utils/dom.js';

const lista = qs('#lista');
const editor = qs('#editor');
const gNome = qs('#gNome');
const gDesc = qs('#gDesc');
const editorTitulo = qs('#editorTitulo');
const btnSalvar = qs('#btnSalvar');
const btnCancelar = qs('#btnCancelar');
const btnNovo = qs('#btnNovo');
const membersTable = qs('#membersTable tbody');
const memberEmail = qs('#memberEmail');
const memberRole = qs('#memberRole');

// modal elements (novo grupo / edição)
const modal = qs('#modalGrupo');
const modalGNome = qs('#modalGNome');
const modalGDesc = qs('#modalGDesc');
const modalSave = qs('#modalSave');
const modalCancel = qs('#modalCancel');
const modalClose = qs('#modalClose');
const modalDelete = qs('#btnDeleteGroup');
const modalMemberEmail = qs('#modalMemberEmail');
const modalMemberRole = qs('#modalMemberRole');
const modalAddMember = qs('#modalAddMember');
const modalMembersTable = qs('#modalMembersTable tbody');

let editingId = null;

async function api(action, data, method='GET'){
  let url = `../../../../backend/controllers/AdminGrupoController.php?action=${action}`;
  if(method === 'GET' && data && typeof data === 'object'){
    // append query params for GET
    const params = new URLSearchParams(data).toString();
    if(params) url += '&' + params;
  }
  if(method==='GET'){
    const resp = await fetch(url, { credentials: 'include' });
    return resp.json();
  } else {
    const resp = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data), credentials: 'include' });
    return resp.json();
  }
}

async function load(){
  const r = await api('list_groups');
  if(!r.success){ lista.innerHTML = '<div>Erro ao carregar</div>'; return; }
  if(!r.groups || !r.groups.length){ lista.innerHTML = '<div class="section-note">Nenhum grupo cadastrado ainda.</div>'; return; }
  lista.innerHTML = r.groups.map(g=>`
    <div class="group-card" data-id="${g.id}">
      <h3>${escapeHtml(g.nome)}</h3>
      <p class="muted">${escapeHtml(g.descricao || '')}</p>
      <div class="card-meta"><small class="muted">${g.membros} membro${g.membros==1? '':'s'}</small></div>
      <div class="card-actions">
        <button class="btn btn-sm btn-primary edit" data-id="${g.id}">Editar</button>
        <button class="btn btn-sm btn-secondary view" data-id="${g.id}">Ver</button>
      </div>
    </div>
  `).join('');
  qsa('.edit').forEach(b=>b.addEventListener('click', e=>{ const id = e.target.dataset.id || e.target.closest('.group-card').dataset.id; openEditor(id); }));
  qsa('.view').forEach(b=>b.addEventListener('click', e=>{ const id = e.target.dataset.id || e.target.closest('.group-card').dataset.id; openEditor(id); }));
  // delete buttons on cards
  qsa('.card-actions .btn-danger').forEach(b=> b.addEventListener('click', async (e)=>{
    const id = e.target.dataset.id || e.target.closest('.group-card').dataset.id;
    if(!confirm('Confirmar exclusão do grupo?')) return;
    try{ const res = await api('delete', { grupo_id: id }, 'POST'); if(res.success){ showToast('Grupo excluído','success'); load(); } else showToast(res.message||'Erro','error'); } catch(err){ showToast('Erro ao excluir','error'); }
  }));
}

// small helper to avoid HTML injection from backend strings
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }

async function openEditor(id){
  const r = await api('get_group', { grupo_id: id }, 'GET');
  if(!r.success){ alert(r.message||'Erro'); return; }
  editingId = id;
  // preencher modal com dados do grupo e abrir
  // preencher editor em página com dados do grupo e abrir
  editorTitulo.textContent = `Editar: ${r.group.nome}`;
  gNome.value = r.group.nome || '';
  gDesc.value = r.group.descricao || '';
  // render members (page table)
  // fill modal members table and show modal for editing
  modalMembersTable.innerHTML = r.members.map(m=>`<tr data-id="${m.id}"><td>${escapeHtml(m.nome)}</td><td>${escapeHtml(m.email)}</td><td>${m.grupo_id==editingId? 'Membro':'Membro'}</td><td><button class="btn btn-sm btn-danger removeMember" data-id="${m.id}">Remover</button></td></tr>`).join('');
  qsa('.removeMember').forEach(b=> b.addEventListener('click', async (e)=>{
    const uid = e.target.dataset.id || e.target.closest('tr').dataset.id;
    if(!confirm('Remover este membro?')) return;
    const res = await api('remove_user', { grupo_id: editingId, usuario_id: uid }, 'POST');
    if(res.success){ showToast('Membro removido','success'); openEditor(editingId); } else showToast(res.message||'Erro','error');
  }));
  // modal add member
  modalAddMember.onclick = async ()=>{
    const email = modalMemberEmail.value.trim(); const role = modalMemberRole.value;
    if(!email) return showToast('Digite email','error');
    const res = await api('add_user', { grupo_id: editingId, email, role }, 'POST');
    if(res.success){ modalMemberEmail.value=''; showToast('Membro adicionado','success'); openEditor(editingId); } else showToast(res.message||'Erro','error');
  };
  // show modal prefilled for edit
  qs('#modalTitulo').textContent = `Editar: ${r.group.nome}`;
  modalGNome.value = r.group.nome || '';
  modalGDesc.value = r.group.descricao || '';
  qs('#modalSave').textContent = 'Salvar alterações';
  modalDelete && (modalDelete.style.display = 'inline-block');
  modal.style.display = 'block'; document.body.style.overflow='hidden';
}

btnNovo.addEventListener('click', ()=>{
  // abrir modal para criação de novo grupo
  editingId = null;
  if(modal){ qs('#modalTitulo').textContent = 'Novo Grupo'; modalGNome.value=''; modalGDesc.value=''; qs('#modalSave').textContent = 'Criar Grupo'; modal.style.display='block'; document.body.style.overflow='hidden'; modalGNome.focus(); }
  else { editorTitulo.textContent = 'Novo Grupo'; gNome.value=''; gDesc.value=''; editor.style.display='block'; }
});

btnCancelar.addEventListener('click', ()=>{ editor.style.display='none'; });

btnSalvar.addEventListener('click', async ()=>{
  // keep for backward compatibility (if editor used)
  const payload = { grupo_id: editingId, nome: gNome.value, descricao: gDesc.value };
  const action = editingId ? 'edit' : 'create';
  const res = await api(action, payload, 'POST');
  if(res.success){ editor.style.display='none'; showToast('Salvo','success'); load(); } else showToast(res.message||'Erro','error');
});

// modal event handlers
if(modal){
  modalClose.addEventListener('click', ()=>{ modal.style.display='none'; document.body.style.overflow='auto'; });
  modalCancel.addEventListener('click', ()=>{ modal.style.display='none'; document.body.style.overflow='auto'; });
  // submit -> create when modal used for creation; when editing modalSave becomes 'Salvar alterações' and editingId set -> use edit
  qs('#formNovoGrupo').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nome = modalGNome.value.trim(); const descricao = modalGDesc.value.trim();
    if(!nome) return showToast('Informe o nome do grupo','error');
    const action = editingId ? 'edit' : 'create';
    const payload = editingId ? { grupo_id: editingId, nome, descricao } : { nome, descricao };
    const res = await api(action, payload, 'POST');
    if(res.success){ modal.style.display='none'; document.body.style.overflow='auto'; editingId=null; showToast('Salvo com sucesso','success'); load(); } else showToast(res.message||'Erro ao salvar','error');
  });
  // fechar ao clicar fora
  window.addEventListener('click', (e)=>{ if(e.target===modal){ modal.style.display='none'; document.body.style.overflow='auto'; } });
}

// initial
load();

/* Toaster implementation */
const toastContainer = document.createElement('div'); toastContainer.className='toast-container'; document.body.appendChild(toastContainer);
function showToast(msg, type='info', timeout=3000){ const t = document.createElement('div'); t.className = `toast ${type}`; t.textContent = msg; toastContainer.appendChild(t); setTimeout(()=> t.classList.add('show'),10); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(),220); }, timeout); }

// modal delete handler
if(modalDelete){ modalDelete.addEventListener('click', async ()=>{
  if(!editingId) return showToast('Nenhum grupo selecionado','error');
  if(!confirm('Confirmar exclusão do grupo?')) return;
  const res = await api('delete', { grupo_id: editingId }, 'POST');
  if(res.success){ modal.style.display='none'; document.body.style.overflow='auto'; showToast('Grupo excluído','success'); load(); } else showToast(res.message||'Erro ao excluir','error');
}); }
