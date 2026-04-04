// ============================================================
// INCIDENCIAS
// ============================================================

// --- ALUMNO VIEW ---
async function renderIncidencias() {
  setPage('Incidencias', 'Reporta problemas al equipo');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const { data: incidencias } = await sb.from('incidencias').select('*').eq('alumno_id', currentUser.id).order('fecha', { ascending: false });
  const ids = (incidencias || []).map(i => i.id);
  let respuestas = [];
  if (ids.length > 0) {
    const { data } = await sb.from('incidencia_respuestas').select('*').in('incidencia_id', ids).order('fecha');
    respuestas = data || [];
  }
  // Fetch responder names
  const autorIds = [...new Set(respuestas.map(r => r.autor_id))];
  let nameMap = {};
  if (autorIds.length > 0) {
    const { data: profiles } = await sb.from('profiles').select('id, name').in('id', autorIds);
    (profiles || []).forEach(p => nameMap[p.id] = p.name);
  }

  let html = `<button class="btn btn-primary mb-16" onclick="openNewIncidencia()">+ Nueva incidencia</button>`;
  if (!incidencias || incidencias.length === 0) {
    html += '<div class="empty-state"><p>Sin incidencias reportadas</p></div>';
  } else {
    html += incidencias.map(i => {
      const resps = respuestas.filter(r => r.incidencia_id === i.id);
      return `
        <div class="card incidencia-card ${i.estado === 'resuelta' ? 'resuelta' : ''}">
          <div class="flex-between mb-8">
            <h3>${escHtml(i.asunto)}</h3>
            <span class="badge ${i.estado === 'resuelta' ? 'badge-success' : 'badge-warning'}">${i.estado}</span>
          </div>
          <p class="text-sm mb-8">${escHtml(i.descripcion)}</p>
          <div class="mono text-xs text-muted">${formatDate(i.fecha)}</div>
          ${resps.length > 0 ? `
            <div class="incidencia-responses">
              ${resps.map(r => `<div class="incidencia-response">
                <div class="resp-author">${escHtml(nameMap[r.autor_id] || 'Profesor')} — ${formatDate(r.fecha)}</div>
                <p class="text-sm">${escHtml(r.texto)}</p>
              </div>`).join('')}
            </div>` : ''}
        </div>`;
    }).join('');
  }
  body.innerHTML = html;
}

function openNewIncidencia() {
  openModal('Nueva Incidencia', `
    <div class="form-group"><label>Asunto</label><input type="text" id="inc-asunto"></div>
    <div class="form-group"><label>Descripción</label><textarea id="inc-desc" rows="4"></textarea></div>
  `, `<button class="btn btn-primary" onclick="saveIncidencia()">Enviar</button>`);
}

async function saveIncidencia() {
  const asunto = document.getElementById('inc-asunto').value.trim();
  const descripcion = document.getElementById('inc-desc').value.trim();
  if (!asunto) { toast('Indica un asunto'); return; }
  const { error } = await sb.from('incidencias').insert({ alumno_id: currentUser.id, asunto, descripcion });
  if (error) { toast('Error: ' + error.message); return; }
  closeModal();
  toast('Incidencia enviada');
  renderIncidencias();
}

// --- PROFESOR / DIRECCIÓN VIEW ---
async function renderIncidenciasProf() {
  setPage('Incidencias', 'Gestiona las incidencias de los alumnos');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: incidencias }, { data: profiles }] = await Promise.all([
    sb.from('incidencias').select('*').order('fecha', { ascending: false }),
    sb.from('profiles').select('id, name').eq('role', 'alumno')
  ]);

  const nameMap = {};
  (profiles || []).forEach(p => nameMap[p.id] = p.name);

  const ids = (incidencias || []).map(i => i.id);
  let respuestas = [];
  if (ids.length > 0) {
    const { data } = await sb.from('incidencia_respuestas').select('*, profiles:autor_id(name)').in('incidencia_id', ids).order('fecha');
    respuestas = data || [];
  }

  if (!incidencias || incidencias.length === 0) {
    body.innerHTML = '<div class="empty-state"><p>Sin incidencias</p></div>';
    return;
  }

  body.innerHTML = incidencias.map(i => {
    const resps = respuestas.filter(r => r.incidencia_id === i.id);
    return `
      <div class="card incidencia-card ${i.estado === 'resuelta' ? 'resuelta' : ''}">
        <div class="flex-between mb-8">
          <h3>${escHtml(i.asunto)}</h3>
          <div class="flex gap-8">
            <span class="badge ${i.estado === 'resuelta' ? 'badge-success' : 'badge-warning'}">${i.estado}</span>
            ${i.estado !== 'resuelta' ? `<button class="btn btn-sm btn-secondary" onclick="resolveIncidencia('${i.id}')">Marcar resuelta</button>` : ''}
          </div>
        </div>
        <p class="mono text-xs text-muted mb-8">${escHtml(nameMap[i.alumno_id] || '')} — ${formatDate(i.fecha)}</p>
        <p class="text-sm mb-8">${escHtml(i.descripcion)}</p>
        ${resps.length > 0 ? `
          <div class="incidencia-responses">
            ${resps.map(r => `<div class="incidencia-response">
              <div class="resp-author">${escHtml(r.profiles ? r.profiles.name : 'Profesor')} — ${formatDate(r.fecha)}</div>
              <p class="text-sm">${escHtml(r.texto)}</p>
            </div>`).join('')}
          </div>` : ''}
        <div class="mt-8 flex gap-8">
          <input type="text" id="resp-${i.id}" style="flex:1;padding:8px;border:1px solid var(--border-light)" placeholder="Escribe una respuesta...">
          <button class="btn btn-primary btn-sm" onclick="responderIncidencia('${i.id}')">Responder</button>
        </div>
      </div>`;
  }).join('');
}

async function responderIncidencia(id) {
  const texto = document.getElementById('resp-' + id).value.trim();
  if (!texto) return;
  const { error } = await sb.from('incidencia_respuestas').insert({ incidencia_id: id, autor_id: currentUser.id, texto });
  if (error) { toast('Error: ' + error.message); return; }
  toast('Respuesta enviada');
  renderIncidenciasProf();
}

async function resolveIncidencia(id) {
  await sb.from('incidencias').update({ estado: 'resuelta' }).eq('id', id);
  toast('Incidencia resuelta');
  renderIncidenciasProf();
}
