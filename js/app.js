// ============================================================
// MAIN APP — Navigation & Layout
// ============================================================

let currentSection = '';

const NAV = {
  alumno: [
    { section: 'dashboard', label: 'Dashboard', icon: '◈' },
    { section: 'clases', label: 'Clases', icon: '▶' },
    { section: 'recursos', label: 'Recursos', icon: '◻' },
    { section: 'trabajos', label: 'Trabajos', icon: '✎' },
    { section: 'calendario', label: 'Calendario', icon: '▦' },
    { section: 'incidencias', label: 'Incidencias', icon: '!' },
    { section: 'equipo', label: 'Equipo Docente', icon: '◉' },
    { section: 'cuenta', label: 'Mi Cuenta', icon: '⚙' }
  ],
  profesor: [
    { section: 'dashboard', label: 'Dashboard', icon: '◈' },
    { section: 'modulos', label: 'Módulos & Clases', icon: '▶' },
    { section: 'recursos-prof', label: 'Recursos', icon: '◻' },
    { section: 'trabajos-prof', label: 'Trabajos', icon: '✎' },
    { section: 'entregas', label: 'Entregas', icon: '↓' },
    { section: 'calendario', label: 'Calendario', icon: '▦' },
    { section: 'incidencias-prof', label: 'Incidencias', icon: '!' },
    { section: 'fichas-alumnos', label: 'Fichas Alumnos', icon: '◉' },
    { section: 'cuenta', label: 'Mi Cuenta', icon: '⚙' }
  ],
  direccion: [
    { section: 'dashboard', label: 'Dashboard', icon: '◈' },
    { section: 'modulos', label: 'Módulos & Clases', icon: '▶' },
    { section: 'recursos-prof', label: 'Recursos', icon: '◻' },
    { section: 'trabajos-prof', label: 'Trabajos', icon: '✎' },
    { section: 'entregas', label: 'Entregas', icon: '↓' },
    { section: 'calendario', label: 'Calendario', icon: '▦' },
    { section: 'incidencias-prof', label: 'Incidencias', icon: '!' },
    { section: 'fichas-alumnos', label: 'Fichas Alumnos', icon: '◉' },
    { section: 'gestion-profes', label: 'Profesores', icon: '★' },
    { section: 'gestion-alumnos', label: 'Alumnos', icon: '+' },
    { section: 'cuenta', label: 'Mi Cuenta', icon: '⚙' }
  ]
};

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.add('active');
  const roleLabels = { direccion: 'Dirección', profesor: 'Profesor/a', alumno: 'Alumno/a' };
  document.getElementById('sidebar-role').textContent = roleLabels[currentUser.role];
  document.getElementById('footer-user').textContent = currentUser.name;
  document.getElementById('footer-role').textContent = roleLabels[currentUser.role];
  updateSidebarAvatar();
  buildNav();
  navigate('dashboard');
}

function updateSidebarAvatar() {
  const el = document.getElementById('footer-avatar');
  if (el) el.outerHTML = avatarHtml(currentUser, 'avatar-sidebar');
}

function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  const items = NAV[currentUser.role];
  nav.innerHTML = '<div class="nav-section">Navegación</div>' + items.map(item =>
    `<div class="nav-item" data-section="${item.section}" onclick="navigate('${item.section}')">
      <span class="icon">${item.icon}</span>${item.label}
    </div>`
  ).join('');
}

function navigate(section) {
  currentSection = section;
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.section === section)
  );
  const renderers = {
    dashboard: renderDashboard,
    clases: renderClases,
    recursos: renderRecursos,
    trabajos: renderTrabajos,
    calendario: renderCalendario,
    incidencias: renderIncidencias,
    equipo: renderEquipo,
    cuenta: renderCuenta,
    modulos: renderModulos,
    'recursos-prof': renderRecursosProf,
    'trabajos-prof': renderTrabajosProf,
    entregas: renderEntregas,
    'incidencias-prof': renderIncidenciasProf,
    'fichas-alumnos': renderFichasAlumnos,
    'gestion-profes': renderGestionProfes,
    'gestion-alumnos': renderGestionAlumnos
  };
  if (renderers[section]) renderers[section]();
}

// Helper to get profile name by id (cached)
const profileCache = {};
async function getProfileName(id) {
  if (profileCache[id]) return profileCache[id];
  const { data } = await sb.from('profiles').select('name').eq('id', id).single();
  const name = data ? data.name : 'Desconocido';
  profileCache[id] = name;
  return name;
}

async function getModuloTitle(id) {
  const { data } = await sb.from('modulos').select('title').eq('id', id).single();
  return data ? data.title : '';
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    doLogin();
  });
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  checkSession();
});
