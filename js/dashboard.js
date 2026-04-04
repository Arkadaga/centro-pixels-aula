// ============================================================
// DASHBOARD
// ============================================================

async function renderDashboard() {
  setPage('Dashboard', `Bienvenido/a, ${currentUser.name}`);
  const body = document.getElementById('page-body');
  body.innerHTML = '<p class="text-muted mono text-sm">Cargando...</p>';

  const [
    { count: modulosCount },
    { count: clasesCount },
    { count: alumnosCount },
    { count: profCount },
    { data: trabajos },
    { data: entregas },
    { data: incidencias }
  ] = await Promise.all([
    sb.from('modulos').select('*', { count: 'exact', head: true }),
    sb.from('clases').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'alumno'),
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'profesor'),
    sb.from('trabajos').select('*'),
    sb.from('entregas').select('*'),
    sb.from('incidencias').select('*')
  ]);

  if (currentUser.role === 'alumno') {
    const misEntregas = (entregas || []).filter(e => e.alumno_id === currentUser.id);
    const pendientes = (trabajos || []).filter(t => !misEntregas.find(e => e.trabajo_id === t.id));
    const calificadas = misEntregas.filter(e => e.nota !== null);
    const media = calificadas.length
      ? (calificadas.reduce((s, e) => s + parseFloat(e.nota), 0) / calificadas.length).toFixed(1)
      : '—';

    body.innerHTML = `
      <div class="grid-3 mb-16">
        <div class="stat-card"><div class="stat-num">${modulosCount || 0}</div><div class="stat-label">Módulos</div></div>
        <div class="stat-card"><div class="stat-num">${pendientes.length}</div><div class="stat-label">Tareas pendientes</div></div>
        <div class="stat-card"><div class="stat-num">${media}</div><div class="stat-label">Nota media</div></div>
      </div>
      <h3 class="mb-8" style="text-transform:uppercase;letter-spacing:1px">Próximas tareas</h3>
      ${pendientes.length === 0
        ? '<p class="text-muted mono text-sm">Todo entregado</p>'
        : pendientes.map(t => `<div class="card"><div class="flex-between"><h3>${escHtml(t.title)}</h3><span class="badge badge-warning">${formatDate(t.fecha_limite)}</span></div><p>${escHtml(t.descripcion)}</p></div>`).join('')}
    `;
  } else {
    const pendInc = (incidencias || []).filter(i => i.estado === 'pendiente').length;
    const entregasSinNota = (entregas || []).filter(e => e.nota === null).length;
    body.innerHTML = `
      <div class="grid-3 mb-16">
        <div class="stat-card"><div class="stat-num">${modulosCount || 0}</div><div class="stat-label">Módulos</div></div>
        <div class="stat-card"><div class="stat-num">${alumnosCount || 0}</div><div class="stat-label">Alumnos</div></div>
        <div class="stat-card"><div class="stat-num">${clasesCount || 0}</div><div class="stat-label">Clases</div></div>
      </div>
      <div class="grid-2">
        <div class="card"><h3>Entregas pendientes de calificar</h3><p class="mono" style="font-size:24px;color:var(--accent)">${entregasSinNota}</p></div>
        <div class="card"><h3>Incidencias abiertas</h3><p class="mono" style="font-size:24px;color:var(--accent)">${pendInc}</p></div>
      </div>
      ${currentUser.role === 'direccion' ? `
        <div class="grid-2 mt-16">
          <div class="card"><h3>Profesores</h3><p class="mono" style="font-size:24px;color:var(--accent)">${profCount || 0}</p></div>
          <div class="card"><h3>Total trabajos</h3><p class="mono" style="font-size:24px;color:var(--accent)">${(trabajos || []).length}</p></div>
        </div>` : ''}
    `;
  }
}
