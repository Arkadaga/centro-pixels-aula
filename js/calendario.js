// ============================================================
// CALENDARIO
// ============================================================

let calYear, calMonth;

async function renderCalendario() {
  const now = new Date();
  calYear = calYear || now.getFullYear();
  calMonth = calMonth !== undefined ? calMonth : now.getMonth();
  setPage('Calendario', 'Planificación de clases, eventos y entregas');
  const body = document.getElementById('page-body');

  const isReadonly = currentUser.role === 'alumno';
  const { data: eventos } = await sb.from('calendario').select('*');

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  let firstDay = new Date(calYear, calMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevDays = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();

  let html = `<div class="flex-between mb-16">
    <div class="calendar-nav">
      <button class="btn btn-secondary btn-sm" onclick="calPrev()">◀</button>
      <h3>${meses[calMonth]} ${calYear}</h3>
      <button class="btn btn-secondary btn-sm" onclick="calNext()">▶</button>
    </div>
    <div class="flex gap-8">
      ${!isReadonly ? '<button class="btn btn-primary btn-sm" onclick="openAddEvento()">+ Evento</button>' : ''}
      ${currentUser.role === 'direccion' ? '<button class="btn btn-secondary btn-sm" onclick="openAddEscolar()">+ Calendario escolar</button>' : ''}
    </div>
  </div>`;

  html += '<div class="calendar-grid">';
  dias.forEach(d => { html += `<div class="calendar-header-cell">${d}</div>`; });

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-cell other-month"><div class="day-num">${prevDays - firstDay + 1 + i}</div></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
    const dayEvents = (eventos || []).filter(e => e.fecha === dateStr);
    const hasVacaciones = dayEvents.some(e => e.tipo === 'escolar');
    const uniqueEvents = dayEvents.filter((e, i, arr) => e.tipo !== 'escolar' || arr.findIndex(x => x.title === e.title && x.tipo === 'escolar') === i);
    html += `<div class="calendar-cell${isToday ? ' today' : ''}${hasVacaciones ? ' vacaciones' : ''}">
      <div class="day-num">${d}</div>
      ${uniqueEvents.map(e => `<div class="calendar-event tipo-${e.tipo}" title="${escHtml(e.title)}" onclick="viewEvento('${e.id}')">${escHtml(e.title)}</div>`).join('')}
    </div>`;
  }
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="calendar-cell other-month"><div class="day-num">${i}</div></div>`;
  }
  html += '</div>';
  body.innerHTML = html;
}

function calPrev() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendario(); }
function calNext() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendario(); }

async function viewEvento(id) {
  const { data: e } = await sb.from('calendario').select('*').eq('id', id).single();
  if (!e) return;
  const canDelete = currentUser.role !== 'alumno';
  const colorMap = { clase: 'var(--accent)', tarea: 'var(--warning)', cita: 'var(--success)', escolar: '#9b59b6', evento: 'var(--info)' };
  openModal(e.title, `
    <div class="form-group"><label>Tipo</label><span class="badge" style="background:${colorMap[e.tipo] || 'var(--info)'};color:#fff">${e.tipo}</span></div>
    <div class="form-group"><label>Fecha</label><p>${formatDate(e.fecha)}</p></div>
    ${e.fecha_fin ? `<div class="form-group"><label>Fecha fin</label><p>${formatDate(e.fecha_fin)}</p></div>` : ''}
    ${e.categoria ? `<div class="form-group"><label>Categoría</label><p>${escHtml(e.categoria)}</p></div>` : ''}
  `, canDelete ? `<button class="btn btn-danger btn-sm" onclick="deleteEvento('${e.id}')">Eliminar</button>` : '');
}

async function deleteEvento(id) {
  await sb.from('calendario').delete().eq('id', id);
  closeModal();
  toast('Evento eliminado');
  renderCalendario();
}

function openAddEvento() {
  openModal('Nuevo Evento', `
    <div class="form-group"><label>Título</label><input type="text" id="ev-title"></div>
    <div class="form-group"><label>Fecha</label><input type="date" id="ev-fecha"></div>
    <div class="form-group"><label>Tipo</label>
      <select id="ev-tipo"><option value="clase">Clase</option><option value="evento">Evento</option><option value="tarea">Tarea</option><option value="cita">Cita</option></select>
    </div>
  `, `<button class="btn btn-primary" onclick="saveEvento()">Guardar</button>`);
}

async function saveEvento() {
  const title = document.getElementById('ev-title').value.trim();
  const fecha = document.getElementById('ev-fecha').value;
  const tipo = document.getElementById('ev-tipo').value;
  if (!title || !fecha) { toast('Rellena todos los campos'); return; }
  await sb.from('calendario').insert({ title, fecha, tipo });
  closeModal();
  toast('Evento creado');
  renderCalendario();
}

function openAddEscolar() {
  openModal('Calendario Escolar', `
    <div class="form-group"><label>Título</label><input type="text" id="esc-title" placeholder="Ej: Vacaciones de Semana Santa"></div>
    <div class="form-group"><label>Fecha inicio</label><input type="date" id="esc-fecha"></div>
    <div class="form-group"><label>Fecha fin (opcional, para periodos)</label><input type="date" id="esc-fecha-fin"></div>
    <div class="form-group"><label>Categoría</label>
      <select id="esc-cat">
        <option value="vacaciones">Vacaciones</option>
        <option value="festivo">Día festivo</option>
        <option value="inicio">Inicio de curso / trimestre</option>
        <option value="fin">Fin de curso / trimestre</option>
        <option value="evaluacion">Período de evaluación</option>
        <option value="otro">Otro</option>
      </select>
    </div>
  `, `<button class="btn btn-primary" onclick="saveEscolar()">Guardar</button>`);
}

async function saveEscolar() {
  const title = document.getElementById('esc-title').value.trim();
  const fecha = document.getElementById('esc-fecha').value;
  const fechaFin = document.getElementById('esc-fecha-fin').value;
  const categoria = document.getElementById('esc-cat').value;
  if (!title || !fecha) { toast('Título y fecha son obligatorios'); return; }

  const rows = [];
  if (fechaFin && fechaFin > fecha) {
    const start = new Date(fecha);
    const end = new Date(fechaFin);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      rows.push({ title, fecha: d.toISOString().split('T')[0], fecha_fin: fechaFin, tipo: 'escolar', categoria });
    }
  } else {
    rows.push({ title, fecha, tipo: 'escolar', categoria });
  }

  const { error } = await sb.from('calendario').insert(rows);
  if (error) { toast('Error: ' + error.message); return; }
  closeModal();
  toast('Calendario escolar actualizado');
  renderCalendario();
}
