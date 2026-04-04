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
          <div class="entrega-file mb-8">${entregaFileLink(entrega, true)}</div>
          <details><summary class="btn btn-secondary btn-sm">Modificar entrega</summary>
            <div class="mt-8">
              <div class="form-group"><label>Nuevos archivos</label><input type="file" id="entrega-file-${t.id}" multiple style="padding:8px;border:1px solid var(--border-light);width:100%"></div>
              <div class="form-group"><label>Comentario</label><textarea id="entrega-comment-${t.id}" placeholder="Comentario actualizado...">${escHtml(entrega.comentario || '')}</textarea></div>
              <button class="btn btn-primary" onclick="resubmitEntrega('${t.id}','${entrega.id}')">Reenviar</button>
              <div id="entrega-progress-${t.id}" class="mono text-xs text-muted mt-8" style="display:none"></div>
            </div>
          </details>
        </div>` :
      estado === 'entregado' ? `
        <div style="border-top:1px solid var(--border-light);padding-top:12px;margin-top:8px">
          <div class="entrega-file mb-8">${entregaFileLink(entrega, true)}<span class="text-sm text-muted"> — pendiente de calificación</span></div>
          <details><summary class="btn btn-secondary btn-sm">Modificar entrega</summary>
            <div class="mt-8">
              <div class="form-group"><label>Nuevos archivos</label><input type="file" id="entrega-file-${t.id}" multiple style="padding:8px;border:1px solid var(--border-light);width:100%"></div>
              <div class="form-group"><label>Comentario</label><textarea id="entrega-comment-${t.id}" placeholder="Comentario actualizado...">${escHtml(entrega.comentario || '')}</textarea></div>
              <button class="btn btn-primary" onclick="resubmitEntrega('${t.id}','${entrega.id}')">Reenviar</button>
              <div id="entrega-progress-${t.id}" class="mono text-xs text-muted mt-8" style="display:none"></div>
            </div>
          </details>
        </div>` :
      `<div style="border-top:1px solid var(--border-light);padding-top:12px;margin-top:8px">
        <div class="form-group"><label>Archivos</label><input type="file" id="entrega-file-${t.id}" multiple style="padding:8px;border:1px solid var(--border-light);width:100%"></div>
        <div class="form-group"><label>Comentario</label><textarea id="entrega-comment-${t.id}" placeholder="Comentario sobre la entrega..."></textarea></div>
        <button class="btn btn-primary" onclick="submitEntrega('${t.id}')">Entregar trabajo</button>
        <div id="entrega-progress-${t.id}" class="mono text-xs text-muted mt-8" style="display:none">Subiendo archivo...</div>
      </div>`}
    </div>`;
  }).join('');
}

async function submitEntrega(trabajoId) {
  const fileInput = document.getElementById('entrega-file-' + trabajoId);
  const comentario = document.getElementById('entrega-comment-' + trabajoId).value.trim();
  if (!fileInput.files || fileInput.files.length === 0) { toast('Selecciona al menos un archivo'); return; }

  const files = Array.from(fileInput.files);
  const progress = document.getElementById('entrega-progress-' + trabajoId);
  progress.style.display = 'block';

  const fileNames = [];
  const fileUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progress.textContent = `Subiendo archivo ${i + 1} de ${files.length}...`;

    const path = `${currentUser.id}/${trabajoId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await sb.storage.from('entregas').upload(path, file);
    if (uploadError) { toast('Error subiendo ' + file.name + ': ' + uploadError.message); progress.style.display = 'none'; return; }

    const { data: urlData } = sb.storage.from('entregas').getPublicUrl(path);
    fileNames.push(file.name);
    fileUrls.push(urlData.publicUrl);
  }

  const { error } = await sb.from('entregas').insert({
    trabajo_id: trabajoId, alumno_id: currentUser.id,
    archivo: fileNames.join(', '),
    comentario,
    file_url: fileUrls.join('|||')
  });
  if (error) { toast('Error: ' + error.message); progress.style.display = 'none'; return; }
  toast(files.length === 1 ? 'Trabajo entregado' : `${files.length} archivos entregados`);
  await notifyProfesorEntrega(trabajoId);
  renderTrabajos();
}

async function resubmitEntrega(trabajoId, entregaId) {
  const fileInput = document.getElementById('entrega-file-' + trabajoId);
  const comentario = document.getElementById('entrega-comment-' + trabajoId).value.trim();
  const progress = document.getElementById('entrega-progress-' + trabajoId);

  if (!fileInput.files || fileInput.files.length === 0) {
    // Solo actualizar comentario si no hay archivos nuevos
    const { error } = await sb.from('entregas').update({ comentario }).eq('id', entregaId);
    if (error) { toast('Error: ' + error.message); return; }
    toast('Comentario actualizado');
    renderTrabajos();
    return;
  }

  const files = Array.from(fileInput.files);
  progress.style.display = 'block';

  const fileNames = [];
  const fileUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    progress.textContent = `Subiendo archivo ${i + 1} de ${files.length}...`;
    const path = `${currentUser.id}/${trabajoId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await sb.storage.from('entregas').upload(path, file);
    if (uploadError) { toast('Error subiendo ' + file.name + ': ' + uploadError.message); progress.style.display = 'none'; return; }
    const { data: urlData } = sb.storage.from('entregas').getPublicUrl(path);
    fileNames.push(file.name);
    fileUrls.push(urlData.publicUrl);
  }

  const { error } = await sb.from('entregas').update({
    archivo: fileNames.join(', '),
    comentario,
    file_url: fileUrls.join('|||'),
    nota: null,
    feedback: ''
  }).eq('id', entregaId);
  if (error) { toast('Error: ' + error.message); progress.style.display = 'none'; return; }
  toast('Entrega actualizada');
  await notifyProfesorEntrega(trabajoId);
  renderTrabajos();
}

async function notifyProfesorEntrega(trabajoId) {
  // Get the trabajo to find the profesor
  const { data: trabajo } = await sb.from('trabajos').select('title, profesor_id').eq('id', trabajoId).single();
  if (!trabajo || !trabajo.profesor_id) return;

  // Get profesor's notification email
  const { data: profe } = await sb.from('profiles').select('name, email, notification_email').eq('id', trabajo.profesor_id).single();
  if (!profe) return;

  const toEmail = profe.notification_email || profe.email;
  if (!toEmail) return;

  // Send email via Supabase Edge Function
  try {
    await sb.functions.invoke('send-notification', {
      body: {
        to: toEmail,
        subject: `Nueva entrega: ${trabajo.title}`,
        body: `${currentUser.name} ha entregado/actualizado el trabajo "${trabajo.title}".\n\nAccede al aula virtual para revisarlo.`
      }
    });
  } catch (e) {
    // Silent fail — notification is not critical
    console.log('Notificación no enviada:', e.message);
  }
}

function entregaFileLink(entrega, canDelete) {
  if (entrega.file_url) {
    const urls = entrega.file_url.split('|||').filter(u => u);
    const names = entrega.archivo.split(', ');
    let html = '<div style="display:flex;flex-wrap:wrap;gap:4px">';
    html += urls.map((url, i) =>
      `<span style="display:inline-flex;align-items:center;border:1px solid var(--border-light);padding:4px 8px;gap:6px">` +
      `<a href="${url}" download="${escHtml(names[i] || 'archivo')}" class="mono text-xs" style="text-decoration:none;color:var(--text-dark)">📎 ${escHtml(names[i] || 'archivo')} ↓</a>` +
      (canDelete ? `<span style="cursor:pointer;color:var(--danger);font-weight:700;font-size:14px" onclick="deleteEntregaFile('${entrega.id}',${i})" title="Eliminar archivo">×</span>` : '') +
      `</span>`
    ).join('');
    html += '</div>';
    if (urls.length > 1) {
      html += `<button class="btn btn-secondary btn-sm mt-8" onclick="downloadAll(${JSON.stringify(urls).replace(/"/g, '&quot;')}, ${JSON.stringify(names).replace(/"/g, '&quot;')})">Descargar todos (${urls.length})</button>`;
    }
    return html;
  }
  return `<span class="mono text-xs">📎 ${escHtml(entrega.archivo)}</span>`;
}

async function deleteEntregaFile(entregaId, fileIndex) {
  const { data: entrega } = await sb.from('entregas').select('*').eq('id', entregaId).single();
  if (!entrega) return;

  const urls = entrega.file_url.split('|||').filter(u => u);
  const names = entrega.archivo.split(', ');

  // Remove file from Storage
  try {
    const url = urls[fileIndex];
    const path = url.split('/storage/v1/object/public/entregas/')[1];
    if (path) await sb.storage.from('entregas').remove([decodeURIComponent(path)]);
  } catch (e) { console.log('Error borrando de storage:', e); }

  // Remove from arrays
  urls.splice(fileIndex, 1);
  names.splice(fileIndex, 1);

  if (urls.length === 0) {
    // No files left — delete the whole entrega
    await sb.from('entregas').delete().eq('id', entregaId);
    toast('Entrega eliminada');
  } else {
    await sb.from('entregas').update({
      archivo: names.join(', '),
      file_url: urls.join('|||')
    }).eq('id', entregaId);
    toast('Archivo eliminado');
  }

  // Refresh current view
  if (currentSection === 'trabajos') renderTrabajos();
  else if (currentSection === 'entregas') renderEntregas();
  else if (currentSection === 'fichas-alumnos') renderFichasAlumnos();
}

function downloadAll(urls, names) {
  urls.forEach((url, i) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = names[i] || 'archivo';
    a.target = '_blank';
    document.body.appendChild(a);
    setTimeout(() => { a.click(); document.body.removeChild(a); }, i * 300);
  });
  toast(`Descargando ${urls.length} archivos...`);
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

  body.innerHTML = `<div class="table-responsive"><table>
    <thead><tr><th>Alumno</th><th>Trabajo</th><th>Archivo</th><th>Fecha</th><th>Nota</th><th></th></tr></thead>
    <tbody>
    ${entregas.map(e => {
      const hasNota = e.nota !== null;
      return `<tr>
        <td>${escHtml(nameMap[e.alumno_id] || 'Desconocido')}</td>
        <td>${escHtml(tMap[e.trabajo_id] || '—')}</td>
        <td>${entregaFileLink(e, true)}</td>
        <td class="mono text-sm">${formatDate(e.fecha)}</td>
        <td>${hasNota ? `<span class="nota-display ${e.nota >= 5 ? 'aprobado' : 'suspendido'}" style="font-size:16px">${e.nota}</span>` : '<span class="badge badge-warning">Pendiente</span>'}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="openCalificar('${e.id}')">${hasNota ? 'Editar' : 'Calificar'}</button></td>
      </tr>`;
    }).join('')}
    </tbody>
  </table></div>`;
}

async function openCalificar(entregaId) {
  const { data: e } = await sb.from('entregas').select('*').eq('id', entregaId).single();
  if (!e) return;
  const alumnoName = await getProfileName(e.alumno_id);
  openModal('Calificar Entrega', `
    <div class="form-group"><label>Alumno</label><p>${escHtml(alumnoName)}</p></div>
    <div class="form-group"><label>Archivo</label><p>${entregaFileLink(e, true)}</p></div>
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
