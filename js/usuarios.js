// ============================================================
// USUARIOS — Equipo, Fichas, Gestión, Cuenta
// ============================================================

// --- EQUIPO DOCENTE (alumno) ---
async function renderEquipo() {
  setPage('Equipo Docente', 'Conoce a tus profesores');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const { data: profes } = await sb.from('profiles').select('*').eq('role', 'profesor');
  if (!profes || profes.length === 0) {
    body.innerHTML = '<div class="empty-state"><p>Sin profesores registrados</p></div>';
    return;
  }
  body.innerHTML = '<div class="grid-2">' + profes.map(p => `
    <div class="card">
      <div class="flex gap-16" style="align-items:center;margin-bottom:12px">
        ${avatarHtml(p, 'avatar-xl')}
        <div>
          <h3>${escHtml(p.name)}</h3>
          <p class="mono text-xs text-muted">${escHtml(p.email)}</p>
        </div>
      </div>
      ${p.bio ? `<p class="text-sm mb-8">${escHtml(p.bio)}</p>` : ''}
      ${p.asignaturas && p.asignaturas.length > 0 ? `<div>${p.asignaturas.map(a => `<span class="tag">${escHtml(a)}</span>`).join('')}</div>` : ''}
    </div>
  `).join('') + '</div>';
}

// --- MI CUENTA ---
function renderCuenta() {
  setPage('Mi Cuenta', 'Gestiona tus datos personales');
  const body = document.getElementById('page-body');
  body.innerHTML = `
    <div style="max-width:480px">
      <div class="form-group"><label>Foto de perfil</label>
        ${photoUploadHtml('acc-photo', 'acc-photo-preview', currentUser.photo_url, 'avatar-xl')}
      </div>
      <div class="form-group"><label>Nombre</label><input type="text" id="acc-name" value="${escHtml(currentUser.name)}"></div>
      <div class="form-group"><label>Email</label><input type="text" id="acc-email" value="${escHtml(currentUser.email)}" disabled></div>
      ${currentUser.role === 'profesor' || currentUser.role === 'direccion' ? `
        <div class="form-group"><label>Email de notificaciones</label><input type="text" id="acc-notif-email" value="${escHtml(currentUser.notification_email || '')}" placeholder="Donde recibirás avisos de entregas"></div>
      ` : ''}
      <div class="form-group"><label>Nueva contraseña</label><input type="password" id="acc-pass" placeholder="Dejar vacío para no cambiar"></div>
      <button class="btn btn-primary" onclick="saveCuenta()">Guardar cambios</button>
    </div>
  `;
}

async function saveCuenta() {
  const name = document.getElementById('acc-name').value.trim();
  const pass = document.getElementById('acc-pass').value.trim();
  if (!name) { toast('Nombre es obligatorio'); return; }

  // Upload photo if selected
  const photoUrl = await uploadAvatar('acc-photo', currentUser.id);

  const updates = { name };
  if (photoUrl) updates.photo_url = photoUrl;
  const notifInput = document.getElementById('acc-notif-email');
  if (notifInput) updates.notification_email = notifInput.value.trim();

  const { error } = await sb.from('profiles').update(updates).eq('id', currentUser.id);
  if (error) { toast('Error: ' + error.message); return; }

  // Update password if provided
  if (pass) {
    const { error: passErr } = await sb.auth.updateUser({ password: pass });
    if (passErr) { toast('Error cambiando contraseña: ' + passErr.message); return; }
  }

  currentUser.name = name;
  if (photoUrl) currentUser.photo_url = photoUrl;
  document.getElementById('footer-user').textContent = name;
  updateSidebarAvatar();
  toast('Datos actualizados');
}

// --- FICHAS ALUMNOS (profesor / dirección) ---
async function renderFichasAlumnos() {
  setPage('Fichas de Alumnos', 'Información y notas privadas sobre cada alumno');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [{ data: alumnos }, { data: entregas }, { data: trabajos }, { data: notasProf }] = await Promise.all([
    sb.from('profiles').select('*').eq('role', 'alumno'),
    sb.from('entregas').select('*'),
    sb.from('trabajos').select('id, title'),
    sb.from('notas_profesor').select('*').eq('profesor_id', currentUser.id)
  ]);

  const tMap = {};
  (trabajos || []).forEach(t => tMap[t.id] = t.title);

  if (!alumnos || alumnos.length === 0) {
    body.innerHTML = '<div class="empty-state"><p>Sin alumnos registrados</p></div>';
    return;
  }

  body.innerHTML = alumnos.map(a => {
    const ae = (entregas || []).filter(e => e.alumno_id === a.id);
    const calificadas = ae.filter(e => e.nota !== null);
    const media = calificadas.length ? (calificadas.reduce((s, e) => s + parseFloat(e.nota), 0) / calificadas.length).toFixed(1) : '—';
    const notaProf = (notasProf || []).find(n => n.alumno_id === a.id);
    return `<div class="card">
      <div class="flex-between mb-8">
        <div class="flex gap-16" style="align-items:center">
          ${avatarHtml(a, 'avatar-lg')}
          <div>
            <h3>${escHtml(a.name)}</h3>
            <p class="mono text-xs text-muted">${escHtml(a.email)}</p>
          </div>
        </div>
        <div class="flex gap-16" style="align-items:center">
          <div style="text-align:center"><div class="mono fw-700" style="font-size:20px;color:var(--accent)">${media}</div><div class="mono text-xs text-muted">MEDIA</div></div>
          <div style="text-align:center"><div class="mono fw-700" style="font-size:20px">${ae.length}</div><div class="mono text-xs text-muted">ENTREGAS</div></div>
        </div>
      </div>
      ${ae.length > 0 ? `
        <div class="mb-8">
          <div class="mono text-xs text-muted mb-8" style="text-transform:uppercase;letter-spacing:1px">Repositorio de entregas</div>
          <div class="table-responsive"><table><thead><tr><th>Trabajo</th><th>Archivo</th><th>Nota</th></tr></thead><tbody>
          ${ae.map(e => `<tr><td>${escHtml(tMap[e.trabajo_id] || '—')}</td><td>${entregaFileLink(e, true)}</td><td>${e.nota !== null ? e.nota : '—'}</td></tr>`).join('')}
          </tbody></table></div>
        </div>` : ''}
      <div style="border-top:1px solid var(--border-light);padding-top:12px">
        <div class="mono text-xs text-muted mb-8" style="text-transform:uppercase;letter-spacing:1px">Notas privadas del profesor</div>
        <textarea id="nota-prof-${a.id}" style="width:100%;min-height:60px;padding:8px;border:1px solid var(--border-light);font-size:13px" placeholder="Escribe notas privadas sobre este alumno...">${escHtml(notaProf ? notaProf.texto : '')}</textarea>
        <button class="btn btn-secondary btn-sm mt-8" onclick="saveNotaProf('${a.id}')">Guardar nota</button>
      </div>
    </div>`;
  }).join('');
}

async function saveNotaProf(alumnoId) {
  const texto = document.getElementById('nota-prof-' + alumnoId).value.trim();
  // Upsert
  const { error } = await sb.from('notas_profesor').upsert(
    { alumno_id: alumnoId, profesor_id: currentUser.id, texto },
    { onConflict: 'alumno_id,profesor_id' }
  );
  if (error) { toast('Error: ' + error.message); return; }
  toast('Nota guardada');
}

// --- GESTIÓN PROFESORES (dirección) ---
async function renderGestionProfes() {
  setPage('Gestión de Profesores', 'Alta, edición y baja de profesores');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const { data: profes } = await sb.from('profiles').select('*').eq('role', 'profesor');

  let html = `<button class="btn btn-primary mb-16" onclick="openAddProfe()">+ Nuevo profesor</button>`;
  if (!profes || profes.length === 0) {
    html += '<div class="empty-state"><p>Sin profesores</p></div>';
  } else {
    html += `<div class="table-responsive"><table>
      <thead><tr><th></th><th>Nombre</th><th>Email</th><th>Asignaturas</th><th>Bio</th><th></th></tr></thead>
      <tbody>
      ${profes.map(p => `<tr>
        <td>${avatarHtml(p, 'avatar-sm')}</td>
        <td class="fw-700">${escHtml(p.name)}</td>
        <td class="mono text-sm">${escHtml(p.email)}</td>
        <td>${(p.asignaturas || []).map(a => `<span class="tag">${escHtml(a)}</span>`).join('')}</td>
        <td class="text-sm" style="max-width:200px">${escHtml(p.bio || '—')}</td>
        <td>
          <div class="flex gap-8">
            <button class="btn btn-secondary btn-sm" onclick="openEditProfe('${p.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProfe('${p.id}')">Eliminar</button>
          </div>
        </td>
      </tr>`).join('')}
      </tbody>
    </table></div>`;
  }
  body.innerHTML = html;
}

function openAddProfe() {
  openModal('Nuevo Profesor', `
    <div class="form-group"><label>Foto</label>${photoUploadHtml('pf-photo', 'pf-photo-preview', null, 'avatar-lg')}</div>
    <div class="form-group"><label>Nombre completo</label><input type="text" id="pf-name"></div>
    <div class="form-group"><label>Email</label><input type="text" id="pf-email" placeholder="profesor@centropixels.com"></div>
    <div class="form-group"><label>Contraseña</label><input type="text" id="pf-pass"></div>
    <div class="form-group"><label>Bio</label><textarea id="pf-bio"></textarea></div>
    <div class="form-group"><label>Asignaturas (separadas por coma)</label><input type="text" id="pf-asig" placeholder="Diseño Gráfico, Ilustración"></div>
  `, `<button class="btn btn-primary" onclick="saveProfe()">Crear</button>`);
}

async function saveProfe() {
  const name = document.getElementById('pf-name').value.trim();
  const email = document.getElementById('pf-email').value.trim();
  const password = document.getElementById('pf-pass').value.trim();
  const bio = document.getElementById('pf-bio').value.trim();
  const asignaturas = document.getElementById('pf-asig').value.split(',').map(s => s.trim()).filter(Boolean);
  if (!name || !email || !password) { toast('Nombre, email y contraseña obligatorios'); return; }

  showLoading();
  const username = email.split('@')[0];
  const { data, error } = await createAuthUser(email, password, { name, username, role: 'profesor' });
  hideLoading();

  if (error) { toast('Error creando usuario: ' + error.message); return; }

  // Update profile with extra fields (trigger created basic profile)
  if (data && data.user) {
    // Upload photo
    const photoUrl = await uploadAvatar('pf-photo', data.user.id);
    const updates = { bio, asignaturas };
    if (photoUrl) updates.photo_url = photoUrl;
    await sb.from('profiles').update(updates).eq('id', data.user.id);
  }
  closeModal();
  toast('Profesor creado');
  renderGestionProfes();
}

async function openEditProfe(id) {
  const { data: p } = await sb.from('profiles').select('*').eq('id', id).single();
  if (!p) return;
  openModal('Editar Profesor', `
    <div class="form-group"><label>Foto</label>${photoUploadHtml('pf-photo', 'pf-photo-preview', p.photo_url, 'avatar-lg')}</div>
    <div class="form-group"><label>Nombre completo</label><input type="text" id="pf-name" value="${escHtml(p.name)}"></div>
    <div class="form-group"><label>Bio</label><textarea id="pf-bio">${escHtml(p.bio || '')}</textarea></div>
    <div class="form-group"><label>Asignaturas (separadas por coma)</label><input type="text" id="pf-asig" value="${escHtml((p.asignaturas || []).join(', '))}"></div>
    <input type="hidden" id="pf-edit-id" value="${p.id}">
  `, `<button class="btn btn-primary" onclick="updateProfe()">Guardar</button>`);
}

async function updateProfe() {
  const id = document.getElementById('pf-edit-id').value;
  const name = document.getElementById('pf-name').value.trim();
  const bio = document.getElementById('pf-bio').value.trim();
  const asignaturas = document.getElementById('pf-asig').value.split(',').map(s => s.trim()).filter(Boolean);
  const photoUrl = await uploadAvatar('pf-photo', id);
  const updates = { name, bio, asignaturas };
  if (photoUrl) updates.photo_url = photoUrl;
  const { error } = await sb.from('profiles').update(updates).eq('id', id);
  if (error) { toast('Error: ' + error.message); return; }
  closeModal();
  toast('Profesor actualizado');
  renderGestionProfes();
}

async function deleteProfe(id) {
  // Note: In production, deleting auth users requires admin/service role.
  // Here we only delete the profile; the auth record remains but can't access anything.
  const { error } = await sb.from('profiles').delete().eq('id', id);
  if (error) { toast('Error: ' + error.message); return; }
  toast('Profesor eliminado');
  renderGestionProfes();
}

// --- GESTIÓN ALUMNOS (dirección) ---
async function renderGestionAlumnos() {
  setPage('Gestión de Alumnos', 'Alta y gestión de alumnos');
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const { data: alumnos } = await sb.from('profiles').select('*').eq('role', 'alumno');

  let html = `<button class="btn btn-primary mb-16" onclick="openAddAlumno()">+ Nuevo alumno</button>`;
  if (!alumnos || alumnos.length === 0) {
    html += '<div class="empty-state"><p>Sin alumnos</p></div>';
  } else {
    html += `<div class="table-responsive"><table>
      <thead><tr><th></th><th>Nombre</th><th>Email</th><th>Usuario</th><th></th></tr></thead>
      <tbody>
      ${alumnos.map(a => `<tr>
        <td>${avatarHtml(a, 'avatar-sm')}</td>
        <td class="fw-700">${escHtml(a.name)}</td>
        <td class="mono text-sm">${escHtml(a.email)}</td>
        <td class="mono text-sm">${escHtml(a.username)}</td>
        <td>
          <div class="flex gap-8">
            <button class="btn btn-secondary btn-sm" onclick="openEditAlumno('${a.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteAlumno('${a.id}')">Eliminar</button>
          </div>
        </td>
      </tr>`).join('')}
      </tbody>
    </table></div>`;
  }
  body.innerHTML = html;
}

function openAddAlumno() {
  openModal('Nuevo Alumno', `
    <div class="form-group"><label>Foto</label>${photoUploadHtml('al-photo', 'al-photo-preview', null, 'avatar-lg')}</div>
    <div class="form-group"><label>Nombre completo</label><input type="text" id="al-name"></div>
    <div class="form-group"><label>Email</label><input type="text" id="al-email" placeholder="alumno@email.com"></div>
    <div class="form-group"><label>Contraseña</label><input type="text" id="al-pass"></div>
  `, `<button class="btn btn-primary" onclick="saveAlumno()">Crear</button>`);
}

async function saveAlumno() {
  const name = document.getElementById('al-name').value.trim();
  const email = document.getElementById('al-email').value.trim();
  const password = document.getElementById('al-pass').value.trim();
  if (!name || !email || !password) { toast('Nombre, email y contraseña obligatorios'); return; }

  showLoading();
  const username = email.split('@')[0];
  const { data, error } = await createAuthUser(email, password, { name, username, role: 'alumno' });
  hideLoading();

  if (error) { toast('Error creando usuario: ' + error.message); return; }

  if (data && data.user) {
    const photoUrl = await uploadAvatar('al-photo', data.user.id);
    if (photoUrl) await sb.from('profiles').update({ photo_url: photoUrl }).eq('id', data.user.id);
  }
  closeModal();
  toast('Alumno creado');
  renderGestionAlumnos();
}

async function openEditAlumno(id) {
  const { data: a } = await sb.from('profiles').select('*').eq('id', id).single();
  if (!a) return;
  openModal('Editar Alumno', `
    <div class="form-group"><label>Foto</label>${photoUploadHtml('al-photo', 'al-photo-preview', a.photo_url, 'avatar-lg')}</div>
    <div class="form-group"><label>Nombre completo</label><input type="text" id="al-name" value="${escHtml(a.name)}"></div>
    <input type="hidden" id="al-edit-id" value="${a.id}">
  `, `<button class="btn btn-primary" onclick="updateAlumno()">Guardar</button>`);
}

async function updateAlumno() {
  const id = document.getElementById('al-edit-id').value;
  const name = document.getElementById('al-name').value.trim();
  const photoUrl = await uploadAvatar('al-photo', id);
  const updates = { name };
  if (photoUrl) updates.photo_url = photoUrl;
  const { error } = await sb.from('profiles').update(updates).eq('id', id);
  if (error) { toast('Error: ' + error.message); return; }
  closeModal();
  toast('Alumno actualizado');
  renderGestionAlumnos();
}

async function deleteAlumno(id) {
  const { error } = await sb.from('profiles').delete().eq('id', id);
  if (error) { toast('Error: ' + error.message); return; }
  toast('Alumno eliminado');
  renderGestionAlumnos();
}
