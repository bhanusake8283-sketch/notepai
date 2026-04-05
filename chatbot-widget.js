// ═══════════════════════════════════════════════
//  NotePai — AI Chat Widget
//  Drop this script tag in ANY html page:
//
//  <link rel="stylesheet" href="chatbot-widget.css">
//  <script src="chatbot-widget.js"></script>
//
//  Configure below before deploying.
// ═══════════════════════════════════════════════

(function () {

  // ── CONFIG — change these per client ──────────
  const CONFIG = {
    botName:    'NotePai',
    tagline:    'AI Support',
    apiBase:    'http://localhost:3001/api',  // your backend URL
    clientId:   null,                          // set per client e.g. 'dental_clinic_01'
    accentGold: '#c9972a',
    suggested: [
      'What is NotePai?',
      'How does pricing work?',
      'What AI features do you have?',
    ],
  };

  // ── Inject styles ──────────────────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

    #np-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }

    #np-widget {
      position: fixed; bottom: 28px; right: 28px;
      display: flex; flex-direction: column; align-items: flex-end;
      gap: 14px; z-index: 99999;
    }

    /* ── Bubble button ── */
    #np-bubble {
      width: 58px; height: 58px; border-radius: 50%;
      background: ${CONFIG.accentGold};
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 28px rgba(201,151,42,0.45);
      transition: transform .2s, box-shadow .2s;
      position: relative; flex-shrink: 0;
    }
    #np-bubble:hover { transform: scale(1.08); box-shadow: 0 12px 36px rgba(201,151,42,0.6); }
    #np-bubble:active { transform: scale(0.95); }

    #np-notif {
      position: absolute; top: -3px; right: -3px;
      width: 17px; height: 17px; border-radius: 50%;
      background: #e74c3c; border: 2px solid #0e0d0b;
      font-size: 9px; font-weight: 600; color: #fff;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Chat window ── */
    #np-window {
      width: 370px;
      background: #1c1a16;
      border: 1px solid rgba(245,240,232,0.1);
      border-radius: 18px; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 28px 70px rgba(0,0,0,0.7);
      transform-origin: bottom right;
      transform: scale(0.85) translateY(16px);
      opacity: 0; pointer-events: none;
      transition: transform .3s cubic-bezier(0.34,1.56,0.64,1), opacity .25s ease;
      max-height: 540px;
    }
    #np-window.np-open {
      transform: scale(1) translateY(0);
      opacity: 1; pointer-events: all;
    }

    /* ── Header ── */
    #np-header {
      padding: 15px 18px;
      background: linear-gradient(135deg, rgba(201,151,42,0.18) 0%, transparent 100%);
      border-bottom: 1px solid rgba(245,240,232,0.08);
      display: flex; align-items: center; gap: 11px; flex-shrink: 0;
    }
    #np-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: ${CONFIG.accentGold};
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 16px; font-weight: 600; color: #0e0d0b; flex-shrink: 0;
      box-shadow: 0 0 0 3px rgba(201,151,42,0.25);
    }
    .np-hname {
      font-family: 'Playfair Display', serif;
      font-size: 15px; font-weight: 600; color: #f5f0e8;
    }
    .np-hstatus {
      font-size: 11px; color: rgba(245,240,232,0.4);
      display: flex; align-items: center; gap: 5px; margin-top: 1px;
    }
    .np-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #2ecc71; box-shadow: 0 0 5px rgba(46,204,113,0.7);
      display: inline-block;
    }
    #np-clear {
      margin-left: auto; background: none;
      border: 1px solid rgba(245,240,232,0.12);
      color: rgba(245,240,232,0.35); border-radius: 7px;
      padding: 4px 10px; font-size: 11px; cursor: pointer;
      transition: all .2s; white-space: nowrap;
    }
    #np-clear:hover { border-color: rgba(245,240,232,0.3); color: rgba(245,240,232,0.7); }

    /* ── Messages ── */
    #np-msgs {
      flex: 1; overflow-y: auto; padding: 16px 14px;
      display: flex; flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: rgba(245,240,232,0.07) transparent;
      min-height: 280px;
    }
    #np-msgs::-webkit-scrollbar { width: 3px; }
    #np-msgs::-webkit-scrollbar-thumb { background: rgba(245,240,232,0.07); border-radius: 2px; }

    .np-row { display: flex; align-items: flex-end; gap: 7px; }
    .np-row.np-user { flex-direction: row-reverse; }

    .np-mav {
      width: 26px; height: 26px; border-radius: 50%;
      background: ${CONFIG.accentGold};
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 10px; font-weight: 600; color: #0e0d0b; flex-shrink: 0;
    }

    .np-bubble {
      max-width: 78%; padding: 9px 13px;
      font-size: 13px; line-height: 1.6; word-wrap: break-word;
      animation: npIn .22s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes npIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .np-bubble.np-bot {
      background: #231f17; color: rgba(245,240,232,0.88);
      border-radius: 16px 16px 16px 3px;
      border: 1px solid rgba(245,240,232,0.07);
    }
    .np-bubble.np-user {
      background: ${CONFIG.accentGold}; color: #0e0d0b;
      border-radius: 16px 16px 3px 16px;
      font-weight: 500;
    }

    .np-time {
      font-size: 10px; color: rgba(245,240,232,0.2);
      margin-top: 3px; padding: 0 3px;
    }
    .np-row.np-user .np-time { text-align: right; }

    /* ── Typing ── */
    .np-typing { display: flex; align-items: center; gap: 4px; padding: 10px 12px; }
    .np-td {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${CONFIG.accentGold}; opacity: 0.4;
      animation: npPulse 1.2s ease-in-out infinite;
    }
    .np-td:nth-child(2) { animation-delay: .2s; }
    .np-td:nth-child(3) { animation-delay: .4s; }
    @keyframes npPulse {
      0%, 60%, 100% { transform: translateY(0); opacity: .4; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* ── Suggested chips ── */
    #np-sugg {
      padding: 0 14px 10px; display: flex; flex-wrap: wrap; gap: 6px;
    }
    .np-chip {
      background: rgba(201,151,42,0.08);
      border: 1px solid rgba(201,151,42,0.25);
      color: rgba(245,240,232,0.55); border-radius: 20px;
      padding: 5px 11px; font-size: 11.5px; cursor: pointer;
      transition: all .2s; white-space: nowrap;
    }
    .np-chip:hover { background: rgba(201,151,42,0.18); color: #f0c96a; border-color: rgba(201,151,42,0.5); }

    /* ── Input area ── */
    #np-input-area {
      padding: 10px 14px; flex-shrink: 0;
      border-top: 1px solid rgba(245,240,232,0.07);
      display: flex; align-items: flex-end; gap: 8px;
      background: #1c1a16;
    }
    #np-input {
      flex: 1; background: #231f17;
      border: 1px solid rgba(245,240,232,0.1);
      border-radius: 12px; padding: 9px 13px;
      color: rgba(245,240,232,0.88); font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      resize: none; outline: none;
      min-height: 40px; max-height: 88px; line-height: 1.5;
      transition: border-color .2s;
    }
    #np-input::placeholder { color: rgba(245,240,232,0.22); }
    #np-input:focus { border-color: rgba(201,151,42,0.5); }

    #np-send {
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      background: ${CONFIG.accentGold}; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .15s, opacity .2s, background .2s;
    }
    #np-send:hover:not(:disabled) { background: #f0c96a; transform: scale(1.05); }
    #np-send:active:not(:disabled) { transform: scale(0.95); }
    #np-send:disabled { opacity: .3; cursor: not-allowed; }

    #np-footer {
      text-align: center; padding: 5px 0 6px; flex-shrink: 0;
      font-size: 10px; color: rgba(245,240,232,0.15);
    }
    #np-footer span { color: rgba(201,151,42,0.6); }

    @media (max-width: 430px) {
      #np-widget { bottom: 0; right: 0; padding: 14px; }
      #np-window { width: calc(100vw - 28px); }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  // ── Build HTML ─────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'np-widget';
  widget.innerHTML = `
    <div id="np-window">
      <div id="np-header">
        <div id="np-avatar">${CONFIG.botName[0]}</div>
        <div>
          <div class="np-hname">${CONFIG.botName}</div>
          <div class="np-hstatus"><span class="np-dot"></span>${CONFIG.tagline}</div>
        </div>
        <button id="np-clear">New chat</button>
      </div>

      <div id="np-msgs"></div>

      <div id="np-sugg">
        ${CONFIG.suggested.map(s => `<button class="np-chip">${s}</button>`).join('')}
      </div>

      <div id="np-input-area">
        <textarea id="np-input" placeholder="Ask me anything…" rows="1"></textarea>
        <button id="np-send" disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="#0e0d0b" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div id="np-footer">powered by <span>NotePai AI</span></div>
    </div>

    <button id="np-bubble">
      <div id="np-notif">1</div>
      <svg id="np-chat-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          stroke="#0e0d0b" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg id="np-close-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:none">
        <path d="M18 6L6 18M6 6l12 12" stroke="#0e0d0b" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  document.body.appendChild(widget);

  // ── State ──────────────────────────────────────
  let isOpen    = false;
  let isLoading = false;
  let history   = [];
  let showSugg  = true;

  const win        = document.getElementById('np-window');
  const bubble     = document.getElementById('np-bubble');
  const msgs       = document.getElementById('np-msgs');
  const sugg       = document.getElementById('np-sugg');
  const inputEl    = document.getElementById('np-input');
  const sendBtn    = document.getElementById('np-send');
  const clearBtn   = document.getElementById('np-clear');
  const notifDot   = document.getElementById('np-notif');
  const chatIcon   = document.getElementById('np-chat-icon');
  const closeIcon  = document.getElementById('np-close-icon');

  // ── Helpers ────────────────────────────────────
  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  function addMessage(role, content) {
    const isBot = role === 'assistant';
    const row = document.createElement('div');
    row.className = 'np-row' + (isBot ? '' : ' np-user');
    row.innerHTML = `
      ${isBot ? `<div class="np-mav">${CONFIG.botName[0]}</div>` : ''}
      <div>
        <div class="np-bubble ${isBot ? 'np-bot' : 'np-user'}">${escHtml(content)}</div>
        <div class="np-time">${timeNow()}</div>
      </div>
    `;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return row;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'np-row'; el.id = 'np-typing';
    el.innerHTML = `
      <div class="np-mav">${CONFIG.botName[0]}</div>
      <div class="np-bubble np-bot" style="padding:8px 10px">
        <div class="np-typing">
          <div class="np-td"></div><div class="np-td"></div><div class="np-td"></div>
        </div>
      </div>
    `;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('np-typing');
    if (el) el.remove();
  }

  // ── Send message ───────────────────────────────
  async function sendMessage(text) {
    const msg = (text || inputEl.value).trim();
    if (!msg || isLoading) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    sugg.style.display = 'none';
    showSugg = false;

    history.push({ role: 'user', content: msg });
    addMessage('user', msg);

    isLoading = true;
    showTyping();

    try {
      const res = await fetch(`${CONFIG.apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          clientId: CONFIG.clientId
        })
      });

      const data = await res.json();
      removeTyping();

      if (!res.ok) throw new Error(data.error || 'Error');

      history.push({ role: 'assistant', content: data.reply });
      addMessage('assistant', data.reply);

    } catch (err) {
      removeTyping();
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    }

    isLoading = false;
  }

  // ── Toggle open/close ──────────────────────────
  function toggle() {
    isOpen = !isOpen;
    win.classList.toggle('np-open', isOpen);
    chatIcon.style.display  = isOpen ? 'none'  : 'block';
    closeIcon.style.display = isOpen ? 'block' : 'none';
    notifDot.style.display  = 'none';
    if (isOpen) setTimeout(() => inputEl.focus(), 300);
  }

  // ── Reset ──────────────────────────────────────
  function resetChat() {
    history = [];
    msgs.innerHTML = '';
    sugg.style.display = 'flex';
    showSugg = true;
    addMessage('assistant', `Hi! I'm ${CONFIG.botName}. How can I help you today?`);
  }

  // ── Event listeners ────────────────────────────
  bubble.addEventListener('click', toggle);
  clearBtn.addEventListener('click', resetChat);

  sendBtn.addEventListener('click', () => sendMessage());

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 88) + 'px';
    sendBtn.disabled = !inputEl.value.trim();
  });

  document.querySelectorAll('.np-chip').forEach(chip => {
    chip.addEventListener('click', () => sendMessage(chip.textContent));
  });

  // ── Init ───────────────────────────────────────
  addMessage('assistant', `Hi! I'm ${CONFIG.botName}. How can I help you today?`);

})();
