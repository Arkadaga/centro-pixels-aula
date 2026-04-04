// ============================================================
// AUTHENTICATION
// ============================================================

let currentUser = null; // { id, username, name, email, role, bio, asignaturas, photo_url }

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (!email || !pass) return;

  showLoading();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  hideLoading();

  if (error) {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-error').textContent = 'Credenciales incorrectas';
    return;
  }
  await loadProfile(data.user.id);
  showApp();
}

function quickLogin(email, pass) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-pass').value = pass;
  doLogin();
}

async function loadProfile(userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) { toast('Error cargando perfil'); return; }
  currentUser = data;
}

async function logout() {
  await sb.auth.signOut();
  currentUser = null;
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').style.display = 'none';
}

async function checkSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (session && session.user) {
    await loadProfile(session.user.id);
    showApp();
  }
}

// Create user via Supabase Auth (for direccion creating profes/alumnos)
async function createAuthUser(email, password, metadata) {
  // Use the admin-like approach: sign up as the user, then we'll handle profile via trigger
  // Note: In production, use a Supabase Edge Function for this.
  // For this app, we use a workaround: call signUp, which triggers profile creation.
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // { username, name, role, ... }
      emailRedirectTo: window.location.origin
    }
  });
  if (error) return { error };
  return { data };
}
