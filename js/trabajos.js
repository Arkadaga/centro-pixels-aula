// ============================================================
// TRABAJOS & ENTREGAS
// ============================================================

// --- ALUMNO: view assignments, submit work ---
async function renderTrabajos() {
  setPage('Trabajos', 'Tareas asignadas y entregas');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: trabajos }, { data: entregas }, { data: modulos }] = await Promise.all([
    sb.from('trabajos').select('*').order('fecha_limite'),
    sb.from('entregas').select('*').eq('alumno_id', currentUser.id),
    sb.from('modulos').select('id, title')
  ]);

  const moduloMap = {};
  (modulos || []).forEach(m => moduloMap[m.id] = m.title);

  body.innerHTML = (trabajos || []).map(t => {
    const entrega = (entregas || []).find(e => e.trabajo_id === t.id);
    const estado = entrega ? (entrega.nota !== null ? 'calificado' : 'entregado') : 'pendiente';
    const estadoBadge = estado === 'calificado' ? '<span class="badge badge-success">Calificado</span>' :
                        estado === 'entregado' ? '<span class="badge badge-info">Entregado</span>' :
                        '<span class="badge badge-warning">Pendiente</span>';
    return `<div class="card">
      <div class="flex-between mb-8">
        <h3>${escHtml(t.title)}</h3>
        ${estadoBadge}
      </div>
      <p class="mb-8">${escHtml(t.descripcion)}</p>
      <div class="flex-between text-sm text-muted mono mb-8">
        <span>Módulo: ${escHtml(moduloMap[t.modulo_id] || '')}</span>
        <span>Fecha límite: ${formatDate(t.fecha_limite)}</span>
      </div>
      ${estado === 'calificado' ? `
        <div style="border-top:1px solid var(--border-light);padding-top:12px;margin-top:8px">
          <div class="flex gap-16" style="align-items:center">
            <div class="nota-display ${entrega.nota >= 5 ? 'aprobado' : 'suspendido'}">${entrega.nota}</div>
            <div style="flex:1">
              <div class="text-xs mono text-muted mb-8">FEEDBACK DEL PROFESOR</div>
              <p class="text-sm">${escHtml(entrega.feedback || '')}</p>
            </div>
          </div>
          <div class="entrega-file"><span class="mono text-xs">📎 ${escHtml(entrega.archivo)}</span></div>
        </div>` :
      estado === 'entregado' ? `
        <div style="border-top:1px solid var(--border-light);padding-top:12px;margin-top:8px">
          <div class="entrega-file"><span class="mono text-xs">📎 ${escHtml(entrega.archivo)}</span><span class="text-sm text-muted"> — pendiente de calificación</span></div>
        </div>` :
      `<div style="border-top:1px solid var(--border-light);padding-top:12px;margin-top:8px">
        <div class="form-group"><label>Nombre del archivo</label><input type="text" id="entrega-file-${t.id}" placeholder="mi_trabajo.pdf"></div>
        <div class="form-group"><label>Comentario</label><textarea id="entrega-comment-${t.id}" placeholder="Comentario sobre la entrega..."></textarea></div>
        <button class="btn btn-primary" onclick="submitEntrega('${t.id}')">Entregar trabajo</button>
      </div>`}
    </div>`;
  }).join('');
}

async function submitEntrega(trabajoId) {
  const archivo = document.getElementById('entrega-file-' + trabajoId).value.trim();
  const comentario = document.getElementById('entrega-comment-' + trabajoId).value.trim();
  if (!archivo) { toast('Indica el nombre del archivo'); return; }
  const { error } = await sb.from('entregas').insert({
    trabajo_id: trabajoId, alumno_id: currentUser.id, archivo, comentario
  });
  if (error) { toast('Error: ' + error.message); return; }
  toast('Trabajo entregado');
  renderTrabajos();
}

// --- PROFESOR / DIRECCIÓN: manage assignments ---
async function renderTrabajosProf() {
  setPage('Trabajos', 'Crea y gestiona tareas');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: trabajos }, { data: entregas }, { data: alumnos }, { data: modulos }] = await Promise.all([
    sb.from('trabajos').select('*, modulos(title)').order('fecha_limite'),
    sb.from('entregas').select('*'),
    sb.from('profiles').select('*').eq('role', 'alumno'),
    sb.from('modulos').select('id, title')
  ]);

  window._modulosCache = modulos || [];

  let html = `<button class="btn btn-primary mb-16" onclick="openAddTrabajo()">+ Nuevo trabajo</button>`;
  html += (trabajos || []).map(t => {
    const te = (entregas || []).filter(e => e.trabajo_id === t.id);
    return `<div class="card">
      <div class="flex-between mb-8">
        <h3>${escHtml(t.title)}</h3>
        <div class="flex gap-8">
          <span class="badge badge-info">${te.length}/${(alumnos || []).length} entregas</span>
          <span class="badge badge-warning">${formatDate(t.fecha_limite)}</span>
          <button class="btn btn-danger btn-sm" onclick="deleteTrabajo('${t.id}')">×</button>
        </div>
      </div>
      <p class="text-sm">${escHtml(t.descripcion)}</p>
      <div class="mono text-xs text-muted mt-8">Módulo: ${t.modulos ? escHtml(t.modulos.title) : '—'}</div>
    </div>`;
  }).join('');
  body.innerHTML = html;
}

function openAddTrabajo() {
  const modulos = window._modulosCache || [];
  openModal('Nuevo Trabajo', `
    <div class="form-group"><label>Título</label><input type="text" id="tr-title"></div>
    <div class="form-group"><label>Módulo</label>
      <select id="tr-modulo">${modulos.map(m => `<option value="${m.id}">${escHtml(m.title)}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Descripción</label><textarea id="tr-desc"></textarea></div>
    <div class="form-group"><label>Fecha límite</label><input type="date" id="tr-fecha"></div>
  `, `<button class="btn btn-primary" onclick="saveTrabajo()">Crear</button>`);
}

async function saveTrabajo() {
  const title = document.getElementById('tr-title').value.trim();
  const modulo_id = document.getElementById('tr-modulo').value;
  const descripcion = document.getElementById('tr-desc').value.trim();
  const fecha_limite = document.getElementById('tr-fecha').value;
  if (!title || !fecha_limite) { toast('Título y fecha son obligatorios'); return; }
  const { error } = await sb.from('trabajos').insert({ modulo_id, title, descripcion, fecha_limite, profesor_id: currentUser.id });
  if (error) { toast('Error: ' + error.message); return; }
  await sb.from('calendario').insert({ title: 'Entrega: ' + title, fecha: fecha_limite, tipo: 'tarea' });
  closeModal();
  toast('Trabajo creado');
  renderTrabajosProf();
}

async function deleteTrabajo(id) {
  await sb.from('trabajos').delete().eq('id', id);
  toast('Trabajo eliminado');
  renderTrabajosProf();
}

// --- ENTREGAS: grade submissions ---
async function renderEntregas() {
  setPage('Entregas', 'Revisa y califica trabajos entregados');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: entregas }, { data: trabajos }, { data: profiles }] = await Promise.all([
    sb.from('entregas').select('*').order('fecha', { ascending: false }),
    sb.from('trabajos').select('id, title'),
    sb.from('profiles').select('id, name').eq('role', 'alumno')
  ]);

  const nameMap = {};
  (profiles || []).forEach(p => nameMap[p.id] = p.name);
  const tMap = {};
  (trabajos || []).forEach(t => tMap[t.id] = t.title);

  if (!entregas || entregas.length === 0) {
    body.innerHTML = '<div class="empty-state"><p>Sin entregas aún</p></div>';
    return;
  }

  body.innerHTML = `<table>
    <thead><tr><th>Alumno</th><th>Trabajo</th><th>Archivo</th><th>Fecha</th><th>Nota</th><th></th></tr></thead>
    <tbody>
    ${entregas.map(e => {
      const hasNota = e.nota !== null;
      return `<tr>
        <td>${escHtml(nameMap[e.alumno_id] || 'Desconocido')}</td>
        <td>${escHtml(tMap[e.trabajo_id] || '—')}</td>
        <td class="mono text-sm">${escHtml(e.archivo)}</td>
        <td class="mono text-sm">${formatDate(e.fecha)}</td>
        <td>${hasNota ? `<span class="nota-display ${e.nota >= 5 ? 'aprobado' : 'suspendido'}" style="font-size:16px">${e.nota}</span>` : '<span class="badge badge-warning">Pendiente</span>'}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="openCalificar('${e.id}')">${hasNota ? 'Editar' : 'Calificar'}</button></td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;
}

async function openCalificar(entregaId) {
  const { data: e } = await sb.from('entregas').select('*').eq('id', entregaId).single();
  if (!e) return;
  const alumnoName = await getProfileName(e.alumno_id);
  openModal('Calificar Entrega', `
    <div class="form-group"><label>Alumno</label><p>${escHtml(alumnoName)}</p></div>
    <div class="form-group"><label>Archivo</label><p class="mono text-sm">${escHtml(e.archivo)}</p></div>
    <div class="form-group"><label>Comentario del alumno</label><p class="text-sm">${escHtml(e.comentario || '—')}</p></div>
    <div class="form-group"><label>Nota (0-10)</label><input type="number" id="cal-nota" min="0" max="10" step="0.1" value="${e.nota !== null ? e.nota : ''}"></div>
    <div class="form-group"><label>Feedback</label><textarea id="cal-feedback">${escHtml(e.feedback || '')}</textarea></div>
    <input type="hidden" id="cal-id" value="${entregaId}">
  `, `<button class="btn btn-primary" onclick="saveCalificacion()">Guardar</button>`);
}

async function saveCalificacion() {
  const id = document.getElementById('cal-id').value;
  const nota = parseFloat(document.getElementById('cal-nota').value);
  const feedback = document.getElementById('cal-feedback').value.trim();
  if (isNaN(nota) || nota < 0 || nota > 10) { toast('Nota debe ser entre 0 y 10'); return; }
  const { error } = await sb.from('entregas').update({ nota, feedback }).eq('id', id);
  if (error) { toast('Error: ' + error.message); return; }
  closeModal();
  toast('Calificación guardada');
  renderEntregas();
}
