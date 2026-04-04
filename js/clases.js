// ============================================================
// CLASES (alumno view) + MÓDULOS (profesor/dirección CRUD)
// ============================================================

// --- ALUMNO: list classes by module ---
async function renderClases() {
  setPage('Clases', 'Visualiza las clases de cada módulo');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: modulos }, { data: clases }] = await Promise.all([
    sb.from('modulos').select('*').order('created_at'),
    sb.from('clases').select('*').order('orden')
  ]);

  body.innerHTML = (modulos || []).map(m => {
    const mc = (clases || []).filter(c => c.modulo_id === m.id);
    return `<div class="card">
      <h3>${escHtml(m.title)}</h3>
      <p class="mb-8">${escHtml(m.description)}</p>
      ${mc.length === 0 ? '<p class="text-muted text-sm mono">Sin clases aún</p>' :
      `<table><thead><tr><th>#</th><th>Clase</th><th>Duración</th><th>Fecha</th><th></th></tr></thead><tbody>
      ${mc.map(c => `<tr>
        <td class="mono">${c.orden}</td>
        <td>${escHtml(c.title)}</td>
        <td class="mono text-sm">${c.duracion || '—'}</td>
        <td class="mono text-sm">${formatDate(c.fecha)}</td>
        <td><button class="btn btn-primary btn-sm" onclick="openPlayer('${c.id}','${c.modulo_id}')">Ver</button></td>
      </tr>`).join('')}
      </tbody></table>`}
    </div>`;
  }).join('');
}

// --- VIDEO PLAYER with notes ---
async function openPlayer(claseId, moduloId) {
  const { data: c } = await sb.from('clases').select('*').eq('id', claseId).single();
  if (!c) return;
  const modTitle = await getModuloTitle(moduloId);
  setPage(c.title, modTitle);

  // Load existing notes
  const { data: apunte } = await sb.from('apuntes')
    .select('contenido')
    .eq('alumno_id', currentUser.id)
    .eq('clase_id', claseId)
    .maybeSingle();

  const saved = apunte ? apunte.contenido : '';
  const body = document.getElementById('page-body');
  body.innerHTML = `
    <div style="margin-bottom:8px"><button class="btn btn-secondary btn-sm" onclick="renderClases()">← Volver a clases</button></div>
    <div class="player-layout">
      <div class="player-video">
        <iframe src="${embedUrl(c.video_url)}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
      </div>
      <div class="player-notes">
        <div class="player-notes-header">
          <span>Apuntes</span>
          <button class="btn btn-primary btn-sm" onclick="saveNotes('${claseId}')">Guardar</button>
        </div>
        <textarea id="notes-area" placeholder="Escribe tus apuntes aquí...">${escHtml(saved)}</textarea>
        <div class="player-notes-footer">Los apuntes se guardan en tu cuenta</div>
      </div>
    </div>`;
}

async function saveNotes(claseId) {
  const contenido = document.getElementById('notes-area').value;
  const { data: existing } = await sb.from('apuntes')
    .select('id')
    .eq('alumno_id', currentUser.id)
    .eq('clase_id', claseId)
    .maybeSingle();

  if (existing) {
    await sb.from('apuntes').update({ contenido, updated_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    await sb.from('apuntes').insert({ alumno_id: currentUser.id, clase_id: claseId, contenido });
  }
  toast('Apuntes guardados');
}

// --- PROFESOR/DIRECCIÓN: manage modules & classes ---
async function renderModulos() {
  setPage('Módulos & Clases', 'Gestiona contenido formativo');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: modulos }, { data: clases }] = await Promise.all([
    sb.from('modulos').select('*').order('created_at'),
    sb.from('clases').select('*').order('orden')
  ]);

  let html = `<button class="btn btn-primary mb-16" onclick="openAddModulo()">+ Nuevo módulo</button>`;
  html += (modulos || []).map(m => {
    const mc = (clases || []).filter(c => c.modulo_id === m.id);
    return `<div class="card">
      <div class="flex-between mb-8">
        <h3>${escHtml(m.title)}</h3>
        <div class="flex gap-8">
          <button class="btn btn-secondary btn-sm" onclick="openAddClase('${m.id}')">+ Clase</button>
          <button class="btn btn-danger btn-sm" onclick="deleteModulo('${m.id}')">Eliminar</button>
        </div>
      </div>
      <p class="text-sm text-muted mb-8">${escHtml(m.description)}</p>
      ${mc.length === 0 ? '<p class="mono text-xs text-muted">Sin clases</p>' :
      `<table><thead><tr><th>#</th><th>Clase</th><th>Duración</th><th>URL</th><th></th></tr></thead><tbody>
      ${mc.map(c => `<tr>
        <td class="mono">${c.orden}</td>
        <td>${escHtml(c.title)}</td>
        <td class="mono text-sm">${c.duracion || '—'}</td>
        <td class="mono text-xs" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${escHtml(c.video_url)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteClase('${c.id}')">×</button></td>
      </tr>`).join('')}
      </tbody></table>`}
    </div>`;
  }).join('');
  body.innerHTML = html;
}

function openAddModulo() {
  openModal('Nuevo Módulo', `
    <div class="form-group"><label>Título</label><input type="text" id="mod-title"></div>
    <div class="form-group"><label>Descripción</label><textarea id="mod-desc"></textarea></div>
  `, `<button class="btn btn-primary" onclick="saveModulo()">Crear</button>`);
}

async function saveModulo() {
  const title = document.getElementById('mod-title').value.trim();
  const description = document.getElementById('mod-desc').value.trim();
  if (!title) { toast('Indica un título'); return; }
  const { error } = await sb.from('modulos').insert({ title, description, profesor_id: currentUser.id });
  if (error) { toast('Error: ' + error.message); return; }
  closeModal();
  toast('Módulo creado');
  renderModulos();
}

async function deleteModulo(id) {
  const { error } = await sb.from('modulos').delete().eq('id', id);
  if (error) { toast('Error: ' + error.message); return; }
  toast('Módulo eliminado');
  renderModulos();
}

function openAddClase(moduloId) {
  openModal('Nueva Clase', `
    <div class="form-group"><label>Título</label><input type="text" id="cl-title"></div>
    <div class="form-group"><label>URL del vídeo (YouTube o Vimeo)</label><input type="text" id="cl-url" placeholder="https://youtube.com/watch?v=..."></div>
    <div class="form-group"><label>Duración</label><input type="text" id="cl-dur" placeholder="45 min"></div>
    <div class="form-group"><label>Orden</label><input type="number" id="cl-orden" value="1" min="1"></div>
    <input type="hidden" id="cl-modulo" value="${moduloId}">
  `, `<button class="btn btn-primary" onclick="saveClase()">Crear</button>`);
}

async function saveClase() {
  const title = document.getElementById('cl-title').value.trim();
  const rawUrl = document.getElementById('cl-url').value.trim();
  const duracion = document.getElementById('cl-dur').value.trim();
  const orden = parseInt(document.getElementById('cl-orden').value) || 1;
  const modulo_id = document.getElementById('cl-modulo').value;
  if (!title || !rawUrl) { toast('Título y URL son obligatorios'); return; }

  const video_url = embedUrl(rawUrl);
  const fecha = new Date().toISOString().split('T')[0];

  const { error } = await sb.from('clases').insert({ modulo_id, title, video_url, orden, duracion, fecha });
  if (error) { toast('Error: ' + error.message); return; }
  // Add to calendar
  await sb.from('calendario').insert({ title: 'Clase: ' + title, fecha, tipo: 'clase', modulo_id });
  closeModal();
  toast('Clase creada');
  renderModulos();
}

async function deleteClase(id) {
  const { error } = await sb.from('clases').delete().eq('id', id);
  if (error) { toast('Error: ' + error.message); return; }
  toast('Clase eliminada');
  renderModulos();
}
