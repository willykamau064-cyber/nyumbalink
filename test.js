
/* ── Supabase config ── works on Vercel & localhost without Node backend */
const SUPA_URL  = 'https://laqcnqhyhvtawzvmxlkw.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcWNucWh5aHZ0YXd6dm14bGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDc5NDEsImV4cCI6MjA4OTY4Mzk0MX0.U7puhb9aL8Lt2d8-Pe3rFKi5RIx0LlAhsxPsCBgdQp4';

/* ── View switching ── */
function switchTab(tab) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + tab).classList.add('active');
  clearMsgs();
}

function clearMsgs() {
  ['msg-login','msg-reg','msg-forgot'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = 'msg'; }
  });
}

function showMsg(id, text, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg show';
  el.style.color = ok ? '#34d399' : '#f87171';
  el.style.background = ok ? 'rgba(52,211,153,.08)' : 'rgba(248,113,113,.08)';
}

function setBtnLoading(id, loading, html) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spin"></span> Please wait...' : html;
}

/* ── Show/hide password ── */
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  btn.title = show ? 'Hide password' : 'Show password';
}

/* ── Password strength ── */
function checkStrength(val) {
  const bar = document.getElementById('pw-bar');
  if (!bar) return;
  const strong = val.length >= 12 && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val);
  const medium = val.length >= 8 && (/[A-Z]/.test(val) || /[0-9]/.test(val));
  bar.style.width = val.length === 0 ? '0' : strong ? '100%' : medium ? '60%' : '25%';
  bar.style.background = val.length === 0 ? 'transparent' : strong ? '#34d399' : medium ? '#fbbf24' : '#f87171';
}

/* ── Direct Supabase REST helpers ── */
async function supaLogin(email, password) {
  const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPA_ANON },
    body: JSON.stringify({ email, password })
  });
  return r.json();
}

async function supaRegister(email, password, name, phone) {
  const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPA_ANON },
    body: JSON.stringify({ email, password, data: { name: name, full_name: name, phone: phone } })
  });
  return r.json();
}

async function supaForgot(email) {
  const r = await fetch(`${SUPA_URL}/auth/v1/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPA_ANON },
    body: JSON.stringify({ email })
  });
  return r.json();
}

/* ── Also try the local Node server as fallback ── */
async function localLogin(email, password) {
  try {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) throw new Error('Server error');
    return r.json();
  } catch { return null; }
}

/* ── LOGIN ── */
async function handleLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  if (!email || !pass) return showMsg('msg-login', '⚠️ Please enter your email and password.', false);

  setBtnLoading('login-btn', true, '<i class="fas fa-sign-in-alt"></i> Sign In');
  clearMsgs();

  // Try local Node backend first (works on localhost:5000)
  const local = await localLogin(email, pass);
  if (local && local.success) {
    localStorage.setItem('token', local.token || 'lp-session');
    if (local.user) {
      const fallbackName = (local.user.name || local.user.email || '').split('@')[0];
      const capName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
      localStorage.setItem('user_name', capName);
      localStorage.setItem('user_email', local.user.email);
      localStorage.setItem('LinkPointUser', JSON.stringify({ ...local.user, name: capName }));
    }
    showMsg('msg-login', '✅ Login successful! Redirecting...', true);
    setTimeout(() => window.location.href = 'user-dashboard.html', 900);
    return;
  }

  // Fall back to Supabase direct
  try {
    const data = await supaLogin(email, pass);
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      const user = data.user || {};
      const fallbackName = (user.user_metadata?.name || user.user_metadata?.full_name || email.split('@')[0]);
      const capName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
      localStorage.setItem('user_name', capName);
      localStorage.setItem('user_email', user.email || email);
      localStorage.setItem('LinkPointUser', JSON.stringify({ name: capName, email: user.email || email, id: user.id }));
      showMsg('msg-login', '✅ Login successful! Redirecting...', true);
      setTimeout(() => window.location.href = 'user-dashboard.html', 900);
    } else {
      let errMsg = data.error_description || data.msg || 'Invalid email or password.';
      const errLower = errMsg.toLowerCase();
      if (errLower.includes('invalid login credentials') || errLower.includes('invalid_credentials')) {
        errMsg = '❌ Wrong email or password. If you just registered, please check your inbox and confirm your email first, then try again.';
      } else if (errLower.includes('email not confirmed') || errLower.includes('not confirmed')) {
        errMsg = '📧 Please check your email inbox and click the confirmation link we sent you, then try logging in again.';
      } else if (errLower.includes('too many requests')) {
        errMsg = '⏳ Too many attempts. Please wait a minute and try again.';
      }
      showMsg('msg-login', errMsg, false);
      // Show a resend confirmation button
      const msgEl = document.getElementById('msg-login');
      if (errLower.includes('invalid login credentials') || errLower.includes('email not confirmed')) {
        const emailVal = document.getElementById('l-email').value.trim();
        if (emailVal) {
          const resendBtn = document.createElement('div');
          resendBtn.style = 'margin-top:.6rem;text-align:center';
          resendBtn.innerHTML = `<a href="javascript:void(0)" onclick="resendConfirmation('${emailVal}')" style="color:var(--primary);font-size:.82rem;font-weight:700;text-decoration:underline;">📩 Resend confirmation email</a>`;
          msgEl.appendChild(resendBtn);
        }
      }
      setBtnLoading('login-btn', false, '<i class="fas fa-sign-in-alt"></i> Sign In');
    }
  } catch (err) {
    showMsg('msg-login', '⚠️ Cannot connect. Check your internet and try again.', false);
    setBtnLoading('login-btn', false, '<i class="fas fa-sign-in-alt"></i> Sign In');
  }
}

/* ── REGISTER ── */
async function handleReg() {
  const name  = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const pass  = document.getElementById('r-pass').value;

  if (!name || !email || !phone || !pass) return showMsg('msg-reg', '⚠️ Please fill in all fields.', false);
  if (pass.length < 8) return showMsg('msg-reg', '⚠️ Password must be at least 8 characters.', false);

  setBtnLoading('reg-btn', true, '<i class="fas fa-user-plus"></i> Create Account');
  clearMsgs();

  try {
    // Try local Node server first
    let success = false;
    try {
      const r = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: pass })
      });
      const d = await r.json();
      if (d.success) { success = true; }
    } catch {}

    if (!success) {
      // Try Supabase direct
      const data = await supaRegister(email, pass, name, phone);
      if (data.id || data.user?.id) { success = true; }
      else {
        const errMsg = data.msg || data.message || data.error_description || (typeof data.error === 'string' ? data.error : '') || 'Registration failed. This email may already be in use.';
        showMsg('msg-reg', '❌ ' + errMsg, false);
        setBtnLoading('reg-btn', false, '<i class="fas fa-user-plus"></i> Create Account');
        return;
      }
    }

    if (success) {
      // Try to immediately auto-login (works if email confirmation is disabled in Supabase)
      const autoLogin = await supaLogin(email, pass);
      if (autoLogin.access_token) {
        localStorage.setItem('token', autoLogin.access_token);
        const u = autoLogin.user || {};
        const rawName = u.user_metadata?.name || name || email.split('@')[0];
        const capName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        localStorage.setItem('user_name', capName);
        localStorage.setItem('user_email', u.email || email);
        localStorage.setItem('LinkPointUser', JSON.stringify({ name: capName, email: u.email || email, id: u.id }));
        showMsg('msg-reg', '✅ Account created & logged in! Redirecting...', true);
        setTimeout(() => window.location.href = 'user-dashboard.html', 1200);
      } else {
        showMsg('msg-reg', '✅ Account created! Please check your email inbox to confirm your account, then sign in.', true);
        setTimeout(() => switchTab('login'), 3000);
      }
    }
  } catch (err) {
    showMsg('msg-reg', '⚠️ Cannot connect to server. Try again.', false);
  }
  setBtnLoading('reg-btn', false, '<i class="fas fa-user-plus"></i> Create Account');
}

/* ── RESEND CONFIRMATION EMAIL ── */
async function resendConfirmation(email) {
  try {
    await fetch(`${SUPA_URL}/auth/v1/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPA_ANON },
      body: JSON.stringify({ type: 'signup', email })
    });
  } catch {}
  showMsg('msg-login', '📩 Confirmation email resent! Check your inbox (and spam folder), then try logging in.', true);
}

/* ── FORGOT PASSWORD ── */
async function handleForgot() {
  const email = document.getElementById('f-email').value.trim();
  if (!email) return showMsg('msg-forgot', '⚠️ Please enter your email address.', false);

  try {
    await supaForgot(email);
  } catch {}
  showMsg('msg-forgot', '✅ If this email is registered, a reset link has been sent.', true);
}

/* ── Enter key ── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const active = document.querySelector('.view.active');
  if (!active) return;
  if (active.id === 'view-login') handleLogin();
  else if (active.id === 'view-register') handleReg();
  else if (active.id === 'view-forgot') handleForgot();
});

/* ── PWA Install ── */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
});
