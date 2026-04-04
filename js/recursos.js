// ============================================================
// RECURSOS
// ============================================================

// --- ALUMNO VIEW ---
async function renderRecursos() {
  setPage('Recursos', 'Material complementario de cada módulo');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: modulos }, { data: recursos }] = await Promise.all([
    sb.from('modulos').select('*').order('created_at'),
    sb.from('recursos').select('*').order('fecha')
  ]);

  body.innerHTML = (modulos || []).map(m => {
    const mr = (recursos || []).filter(r => r.modulo_id === m.id);
    return `<div class="card">
      <h3 class="mb-8">${escHtml(m.title)}</h3>
      ${mr.length === 0 ? '<p class="text-muted text-sm mono">Sin recursos</p>' :
      mr.map(r => `<div class="flex mb-8" style="align-items:center">
        <div class="resource-icon">${tipoIcon(r.tipo)}</div>
        <div style="flex:1">
          <div class="fw-700">${escHtml(r.title)}</div>
          <div class="text-sm text-muted">${escHtml(r.descripcion)}</div>
        </div>
        <span class="tag">${r.tipo}</span>
      </div>`).join('')}
    </div>`;
  }).join('');
}

// --- PROFESOR / DIRECCIÓN VIEW ---
async function renderRecursosProf() {
  setPage('Recursos', 'Gestiona material complementario');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: modulos }, { data: recursos }] = await Promise.all([
    sb.from('modulos').select('*').order('created_at'),
    sb.from('recursos').select('*, modulos(title)').order('fecha')
  ]);

  const tipos = ['pdf', 'video', 'link', 'imagen', 'archivo'];
  let html = `<button class="btn btn-primary mb-16" onclick="openAddRecurso()">+ Nuevo recurso</button>`;
  html += `<div class="tabs mb-16" id="rec-tabs">
    <div class="tab active" onclick="filterRecursos(this, 'todos')">Todos</div>
    ${tipos.map(t => `<div class="tab" onclick="filterRecursos(this, '${t}')">${t.toUpperCase()}</div>`).join('')}
  </div>`;
  html += `<div id="rec-list">`;
  html += (recursos || []).map(r => `
    <div class="card flex" data-tipo="${r.tipo}" style="align-items:center">
      <div class="resource-icon">${tipoIcon(r.tipo)}</div>
      <div style="flex:1">
        <div class="fw-700">${escHtml(r.title)}</div>
        <div class="text-sm text-muted">${escHtml(r.descripcion)} — <span class="mono text-xs">${r.modulos ? escHtml(r.modulos.title) : ''}</span></div>
      </div>
      <span class="tag">${r.tipo}</span>
      <button class="btn btn-danger btn-sm" style="margin-left:8px" onclick="deleteRecurso('${r.id}')">×</button>
    </div>
  `).join('');
  html += `</div>`;
  body.innerHTML = html;

  // Store modulos for the add modal
  window._modulosCache = modulos || [];
}

function filterRecursos(el, tipo) {
  document.querySelectorAll('#rec-tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#rec-list .card').forEach(c => {
    c.style.display = (tipo === 'todos' || c.dataset.tipo === tipo) ? '' : 'none';
  });
}

function openAddRecurso() {
  const modulos = window._modulosCache || [];
  openModal('Nuevo Recurso', `
    <div class="form-group"><label>Título</label><input type="text" id="res-title"></div>
    <div class="form-group"><label>Módulo</label>
      <select id="res-modulo">${modulos.map(m => `<option value="${m.id}">${escHtml(m.title)}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Tipo</label>
      <select id="res-tipo"><option value="pdf">PDF</option><option value="video">Vídeo</option><option value="link">Link</option><option value="imagen">Imagen</option><option value="archivo">Archivo diseño</option></select>
    </div>
    <div class="form-group"><label>URL</label><input type="text" id="res-url" placeholder="https://..."></div>
    <div class="form-group"><label>Descripción</label><textarea id="res-desc"></textarea></div>
  `, `<button class="btn btn-primary" onclick="saveRecurso()">Crear</button>`);
}

async function saveRecurso() {
  const title = document.getElementById('res-title').value.trim();
  const modulo_id = document.getElementById('res-modulo').value;
  const tipo = document.getElementById('res-tipo').value;
  const url = document.getElementById('res-url').value.trim();
  const descripcion = document.getElementById('res-desc').value.trim();
  if (!title) { toast('Indica un título'); return; }
  const { error } = await sb.from('recursos').insert({ modulo_id, title, tipo, url, descripcion });
  if (error) { toast('Error: ' + error.message); return; }
  closeModal();
  toast('Recurso creado');
  renderRecursosProf();
}

async function deleteRecurso(id) {
  await sb.from('recursos').delete().eq('id', id);
  toast('Recurso eliminado');
  renderRecursosProf();
}
