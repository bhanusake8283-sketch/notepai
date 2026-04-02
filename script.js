// ═══════════════════════════════════════════════
//  NotePai — Frontend JS
//  Connects to backend at http://localhost:3001
// ═══════════════════════════════════════════════

const API = 'http://localhost:3001/api';


// ── Token helpers ────────────────────────────────
const getToken  = () => localStorage.getItem('notepaiai_token');
const setToken  = (t) => localStorage.setItem('notepaiai_token', t);
const clearToken = () => localStorage.removeItem('notepaiai_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});


// ── Check if user is logged in on page load ───────
async function checkAuth() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/auth/me`, { headers: authHeaders() });
    if (!res.ok) { clearToken(); return null; }
    const { user } = await res.json();
    return user;
  } catch {
    return null;
  }
}


// ── SIGNUP ────────────────────────────────────────
async function signup(name, email, password) {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  setToken(data.token);
  return data.user;
}


// ── LOGIN ─────────────────────────────────────────
async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setToken(data.token);
  return data.user;
}


// ── LOGOUT ────────────────────────────────────────
function logout() {
  clearToken();
  window.location.href = 'index.html';
}


// ── FETCH ALL NOTES ───────────────────────────────
async function getNotes() {
  const res = await fetch(`${API}/notes`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.notes;
}


// ── CREATE NOTE ───────────────────────────────────
async function createNote(title = '', body = '', folder = 'general') {
  const res = await fetch(`${API}/notes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, body, folder })
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.upgrade) showUpgradePopup(data.message);
    throw new Error(data.error);
  }
  return data.note;
}


// ── UPDATE NOTE ───────────────────────────────────
async function updateNote(id, title, body, folder, tags) {
  const res = await fetch(`${API}/notes/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ title, body, folder, tags })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.note;
}


// ── DELETE NOTE ───────────────────────────────────
async function deleteNote(id) {
  const res = await fetch(`${API}/notes/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete note');
}


// ── RUN AI ACTION ─────────────────────────────────
async function runAI(action, text) {
  const res = await fetch(`${API}/ai`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ action, text })
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.upgrade) showUpgradePopup(data.message);
    throw new Error(data.error);
  }
  return data;
}


// ── GET USAGE STATS ───────────────────────────────
async function getUsage() {
  const res = await fetch(`${API}/usage`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}


// ── UPGRADE POPUP ─────────────────────────────────
function showUpgradePopup(message) {
  const existing = document.getElementById('upgrade-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'upgrade-popup';
  popup.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.7);
    display:flex; align-items:center; justify-content:center;
    z-index:9999; padding:20px;
  `;
  popup.innerHTML = `
    <div style="background:#1c1a16; border:1px solid rgba(201,151,42,0.4);
      border-radius:16px; padding:32px; max-width:420px; width:100%; text-align:center;">
      <div style="font-size:32px; margin-bottom:12px;">✦</div>
      <h3 style="font-family:'Playfair Display',serif; font-size:22px;
        color:#f5f0e8; margin-bottom:12px;">Upgrade to Pro</h3>
      <p style="color:#8a8070; font-size:14px; line-height:1.7; margin-bottom:24px;">
        ${message || 'You\'ve reached your free plan limit.'}
      </p>
      <a href="#pricing" onclick="document.getElementById('upgrade-popup').remove()"
        style="display:block; background:#c9972a; color:#0e0d0b;
        padding:13px 24px; border-radius:8px; font-weight:500;
        text-decoration:none; margin-bottom:12px;">
        Upgrade to Pro — $9/month
      </a>
      <button onclick="document.getElementById('upgrade-popup').remove()"
        style="background:none; border:none; color:#8a8070;
        font-size:13px; cursor:pointer;">
        Maybe later
      </button>
    </div>
  `;
  document.body.appendChild(popup);
}


// ════════════════════════════════════════════════
//  LANDING PAGE INTERACTIONS (existing code)
// ════════════════════════════════════════════════

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));


// FAQ accordion
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}


// Mockup AI button highlight
const mockBtns = document.querySelectorAll('.mock-btn');
mockBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    mockBtns.forEach((b) => b.classList.remove('lit'));
    btn.classList.add('lit');
  });
});


// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// Nav shadow on scroll
const nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 20
      ? 'rgba(245,240,232,0.15)'
      : 'rgba(245,240,232,0.1)';
  });
}


// ── Update nav based on login state ───────────────
(async () => {
  const user = await checkAuth();
  const navLinks = document.querySelector('.nav-links');

  if (user && navLinks) {
    // Replace "Start free" with user name + dashboard link
    const ctaBtn = navLinks.querySelector('.nav-cta');
    if (ctaBtn) {
      ctaBtn.textContent = 'Go to app →';
      ctaBtn.href = 'app.html';
    }
    // Add logout link
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = `Hi, ${user.name.split(' ')[0]}`;
    logoutLink.style.color = '#c9972a';
    logoutLink.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    navLinks.insertBefore(logoutLink, ctaBtn);
  }
})();