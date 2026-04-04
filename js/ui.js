// ============================================================
// UI UTILITIES — modal, toast, helpers
// ============================================================

function uid() { return crypto.randomUUID ? crypto.randomUUID() : 'id_' + Math.random().toString(36).substr(2, 9); }

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escHtml(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function embedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/watch')) {
    const vid = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${vid}`;
  }
  if (url.includes('youtu.be/')) {
    return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
  }
  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const vid = url.split('vimeo.com/')[1].split('?')[0];
    return `https://player.vimeo.com/video/${vid}`;
  }
  return url;
}

function tipoIcon(tipo) {
  const icons = { pdf: 'PDF', video: 'VID', link: 'URL', imagen: 'IMG', archivo: 'ZIP' };
  return icons[tipo] || '···';
}

function getUserInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarHtml(user, sizeClass) {
  const cls = 'avatar' + (sizeClass ? ' ' + sizeClass : '');
  if (user && user.photo_url) {
    return `<div class="${cls}"><img src="${user.photo_url}" alt=""></div>`;
  }
  const initials = user ? getUserInitials(user.name) : '?';
  return `<div class="${cls}">${initials}</div>`;
}

function photoUploadHtml(inputId, previewId, currentPhoto, sizeClass) {
  const cls = sizeClass || 'avatar-lg';
  const preview = currentPhoto
    ? `<div class="avatar ${cls}" id="${previewId}"><img src="${currentPhoto}" alt=""></div>`
    : `<div class="avatar ${cls}" id="${previewId}">?</div>`;
  return `<div class="photo-upload">
    ${preview}
    <div>
      <label class="photo-upload-btn" for="${inputId}">Elegir foto</label>
      <input type="file" id="${inputId}" accept="image/*" onchange="previewPhotoLocal('${inputId}','${previewId}')">
      <div class="mono text-xs text-muted mt-8">JPG, PNG — máx. 2MB</div>
    </div>
  </div>`;
}

function previewPhotoLocal(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 2 * 1024 * 1024) { toast('La imagen no puede superar 2MB'); input.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function (e) {
    preview.innerHTML = `<img src="${e.target.result}" alt="">`;
  };
  reader.readAsDataURL(file);
}

async function uploadAvatar(inputId, userId) {
  const input = document.getElementById(inputId);
  if (!input || !input.files || !input.files[0]) return null;
  const file = input.files[0];
  const ext = file.name.split('.').pop();
  const path = `${userId}.${ext}`;
  const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) { toast('Error subiendo foto: ' + error.message); return null; }
  const { data } = sb.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl + '?t=' + Date.now();
}

// Toast
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Modal
function openModal(title, bodyHtml, footerHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-footer').innerHTML = footerHtml || '';
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// Page header
function setPage(title, subtitle) {
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle || '';
}

// Loading overlay
function showLoading() {
  document.getElementById('loading-overlay').style.display = 'flex';
}
function hideLoading() {
  document.getElementById('loading-overlay').style.display = 'none';
}
