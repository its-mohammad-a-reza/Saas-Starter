// public/widget.js
// Drop-in embed script for customer websites
// Usage: <script src="https://yourdomain.com/widget.js" data-key="YOUR_ORG_API_KEY"></script>

(function () {
  "use strict";

  const script = document.currentScript;
  const API_KEY = script?.getAttribute("data-key");
  const APP_URL = script?.getAttribute("data-url") || "https://yourdomain.com";
  const BOT_NAME = script?.getAttribute("data-bot-name") || "Support";
  const PRIMARY = script?.getAttribute("data-color") || "#6366f1";

  if (!API_KEY) {
    console.warn("[AcmeSupport] Missing data-key attribute.");
    return;
  }

  // ── Prevent double-init ───────────────────────────────────────
  if (window.__acmeSupport) return;
  window.__acmeSupport = true;

  // ── State ─────────────────────────────────────────────────────
  let isOpen = false;
  let conversationId = null;
  let messages = [];
  let isTyping = false;

  // ── Helpers ───────────────────────────────────────────────────
  const visitorId = (() => {
    const key = "acme_vid";
    let id = localStorage.getItem(key);
    if (!id) { id = "v_" + Math.random().toString(36).slice(2); localStorage.setItem(key, id); }
    return id;
  })();

  const hex2rgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };

  const primaryRGB = hex2rgb(PRIMARY);

  // ── Styles ────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    #acme-widget-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
    #acme-widget-root { position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; }

    #acme-launcher {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc);
      border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(${primaryRGB}, 0.45);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #acme-launcher:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(${primaryRGB}, 0.55); }

    #acme-window {
      position: absolute; bottom: 72px; right: 0;
      width: 360px; height: 540px;
      background: #fff; border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
      display: flex; flex-direction: column; overflow: hidden;
      transform-origin: bottom right;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
    }
    #acme-window.closed { transform: scale(0.85); opacity: 0; pointer-events: none; }
    #acme-window.open   { transform: scale(1);    opacity: 1; }

    #acme-header {
      background: linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}dd);
      padding: 16px 18px; display: flex; align-items: center; gap: 12; flex-shrink: 0;
    }
    #acme-header .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; color: white;
    }
    #acme-header .info { flex: 1; }
    #acme-header .name { color: white; font-weight: 600; font-size: 14px; }
    #acme-header .status { color: rgba(255,255,255,0.75); font-size: 11px; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    #acme-header .dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; }
    #acme-close {
      background: rgba(255,255,255,0.15); border: none; cursor: pointer;
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; transition: background 0.15s;
    }
    #acme-close:hover { background: rgba(255,255,255,0.25); }

    #acme-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px 8px;
      display: flex; flex-direction: column; gap: 10;
      scroll-behavior: smooth;
    }
    #acme-messages::-webkit-scrollbar { width: 3px; }
    #acme-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

    .acme-msg { display: flex; align-items: flex-end; gap: 8; }
    .acme-msg.user { flex-direction: row-reverse; }
    .acme-msg .bubble {
      max-width: 75%; padding: 10px 13px; font-size: 13.5px; line-height: 1.55;
      animation: acmeFadeUp 0.2s ease forwards;
    }
    .acme-msg.bot  .bubble { background: #f4f3ff; color: #1e1b4b; border-radius: 16px 16px 16px 4px; }
    .acme-msg.user .bubble {
      background: linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc);
      color: white; border-radius: 16px 16px 4px 16px;
      box-shadow: 0 2px 10px rgba(${primaryRGB}, 0.3);
    }
    .acme-msg .bot-avatar {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, ${PRIMARY}33, ${PRIMARY}66);
      border: 1.5px solid ${PRIMARY}44;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: ${PRIMARY};
    }

    #acme-typing { display: flex; align-items: flex-end; gap: 8; }
    #acme-typing .bubble {
      background: #f4f3ff; border-radius: 16px 16px 16px 4px;
      padding: 10px 14px; display: flex; gap: 4; align-items: center;
    }
    #acme-typing .dot {
      width: 7px; height: 7px; border-radius: 50%; background: #a5b4fc;
      animation: acmeBounce 1.2s infinite;
    }
    #acme-typing .dot:nth-child(2) { animation-delay: 0.2s; }
    #acme-typing .dot:nth-child(3) { animation-delay: 0.4s; }

    #acme-input-area {
      padding: 10px 12px 14px; border-top: 1px solid #f0eeff; flex-shrink: 0;
      display: flex; gap: 8; align-items: flex-end;
    }
    #acme-input {
      flex: 1; background: #f8f7ff; border: 1.5px solid #e9e7ff;
      border-radius: 14px; padding: 9px 13px; font-size: 13.5px;
      color: #1e1b4b; font-family: 'DM Sans', sans-serif;
      resize: none; max-height: 80px; line-height: 1.5;
      transition: border-color 0.15s;
    }
    #acme-input:focus { outline: none; border-color: ${PRIMARY}99; }
    #acme-input::placeholder { color: #c4b5fd; }
    #acme-send {
      width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: all 0.15s;
    }
    #acme-send.active {
      background: linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}cc);
      box-shadow: 0 2px 10px rgba(${primaryRGB}, 0.35);
    }
    #acme-send.inactive { background: #e9e7ff; cursor: default; }

    #acme-footer { text-align: center; padding-bottom: 10px; font-size: 10px; color: #c4b5fd; letter-spacing: 0.02em; }

    @keyframes acmeFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes acmeBounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
  `;
  document.head.appendChild(style);

  // ── DOM ───────────────────────────────────────────────────────
  const root = document.createElement("div");
  root.id = "acme-widget-root";
  root.innerHTML = `
    <div id="acme-window" class="closed">
      <div id="acme-header">
        <div class="avatar">${BOT_NAME[0]}</div>
        <div class="info">
          <div class="name">${BOT_NAME}</div>
          <div class="status"><span class="dot"></span> Online · replies instantly</div>
        </div>
        <button id="acme-close" aria-label="Close">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div id="acme-messages"></div>
      <div id="acme-input-area">
        <textarea id="acme-input" rows="1" placeholder="Type a message…"></textarea>
        <button id="acme-send" class="inactive" aria-label="Send">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#c4b5fd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div id="acme-footer">Powered by Claude</div>
    </div>
    <button id="acme-launcher" aria-label="Open support chat">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  document.body.appendChild(root);

  // ── Refs ──────────────────────────────────────────────────────
  const win      = root.querySelector("#acme-window");
  const launcher = root.querySelector("#acme-launcher");
  const closeBtn = root.querySelector("#acme-close");
  const msgList  = root.querySelector("#acme-messages");
  const input    = root.querySelector("#acme-input");
  const sendBtn  = root.querySelector("#acme-send");

  // ── Render helpers ────────────────────────────────────────────
  function renderMessage(role, content) {
    const div = document.createElement("div");
    div.className = `acme-msg ${role}`;
    if (role === "bot") {
      div.innerHTML = `
        <div class="bot-avatar">${BOT_NAME[0]}</div>
        <div class="bubble">${content}</div>`;
    } else {
      div.innerHTML = `<div class="bubble">${content}</div>`;
    }
    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.id = "acme-typing";
    div.innerHTML = `
      <div class="bot-avatar">${BOT_NAME[0]}</div>
      <div class="bubble">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>`;
    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById("acme-typing");
    if (t) t.remove();
  }

  function updateSendBtn(active) {
    sendBtn.className = active ? "active" : "inactive";
    sendBtn.querySelector("path").setAttribute("stroke", active ? "white" : "#c4b5fd");
  }

  // ── Greeting ──────────────────────────────────────────────────
  function showGreeting() {
    renderMessage("bot", `Hi there! 👋 I'm <strong>${BOT_NAME}</strong>. How can I help you today?`);
  }

  // ── Toggle open/close ─────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    win.className = `${isOpen ? "open" : "closed"}`;
    if (isOpen && messages.length === 0) showGreeting();
    if (isOpen) setTimeout(() => input.focus(), 300);
  }

  launcher.addEventListener("click", toggle);
  closeBtn.addEventListener("click", toggle);

  // ── Input handling ────────────────────────────────────────────
  input.addEventListener("input", () => {
    updateSendBtn(input.value.trim().length > 0);
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 80) + "px";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });

  sendBtn.addEventListener("click", send);

  // ── Send & stream ─────────────────────────────────────────────
  async function send() {
    const content = input.value.trim();
    if (!content || isTyping) return;

    input.value = "";
    input.style.height = "auto";
    updateSendBtn(false);
    isTyping = true;

    const userMsg = { role: "user", content };
    messages.push(userMsg);
    renderMessage("user", content);
    showTyping();

    try {
      const res = await fetch(`${APP_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, orgApiKey: API_KEY, conversationId, visitorId }),
      });

      if (!res.ok) throw new Error("API error");

      // Grab conversation ID from first response
      const newId = res.headers.get("X-Conversation-Id");
      if (newId && !conversationId) conversationId = newId;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      hideTyping();
      const botDiv = renderMessage("bot", "");
      const bubble = botDiv.querySelector(".bubble");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        bubble.textContent = fullText;
        msgList.scrollTop = msgList.scrollHeight;
      }

      messages.push({ role: "assistant", content: fullText });
    } catch (err) {
      hideTyping();
      renderMessage("bot", "Sorry, something went wrong. Please try again.");
      console.error("[AcmeSupport]", err);
    }

    isTyping = false;
  }
})();
