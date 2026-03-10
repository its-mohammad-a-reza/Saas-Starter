import { useState } from "react";

const FONT = "'Sora', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const COLORS = {
  bg: "#0d0f14",
  surface: "#13161d",
  border: "#1e2330",
  accent: "#00e5a0",
  accentDim: "rgba(0,229,160,0.12)",
  accentGlow: "rgba(0,229,160,0.25)",
  warn: "#f59e0b",
  danger: "#ef4444",
  muted: "#4a5568",
  text: "#e2e8f0",
  textDim: "#718096",
};

const MOCK_CONVERSATIONS = [
  { id: "c1", visitor: "Sarah K.", email: "sarah@example.com", preview: "I still haven't received my order from last week...", status: "ESCALATED", time: "2m ago", messages: 6, unread: true },
  { id: "c2", visitor: "James R.", email: "james@corp.io", preview: "Can I get a refund for the annual plan?", status: "OPEN", time: "8m ago", messages: 3, unread: true },
  { id: "c3", visitor: "Priya M.", email: "priya@mail.com", preview: "How do I update my billing info?", status: "OPEN", time: "14m ago", messages: 2, unread: false },
  { id: "c4", visitor: "Tom W.", email: "tom@example.com", preview: "Thanks, that solved it!", status: "RESOLVED", time: "1h ago", messages: 8, unread: false },
  { id: "c5", visitor: "Liu Y.", email: "liu@startup.io", preview: "The API keeps returning 429 errors...", status: "ESCALATED", time: "2h ago", messages: 11, unread: false },
  { id: "c6", visitor: "Emma B.", email: "emma@biz.com", preview: "Is there a way to export my data?", status: "OPEN", time: "3h ago", messages: 1, unread: false },
];

const MOCK_MESSAGES = {
  c1: [
    { role: "user", content: "Hi, I placed an order 8 days ago and it still hasn't arrived.", time: "10:02 AM" },
    { role: "assistant", content: "Hi Sarah! I'm sorry to hear that. Let me look into your order right away. Could you share your order number?", time: "10:02 AM" },
    { role: "user", content: "It's #ACM-88421", time: "10:03 AM" },
    { role: "assistant", content: "Thanks! I can see order #ACM-88421 was dispatched on the 3rd via Standard Shipping. It looks like there may be a delay at the regional hub. I'll connect you with a human agent who can expedite this.", time: "10:03 AM" },
    { role: "user", content: "Please hurry, I need it for an event this weekend.", time: "10:05 AM" },
    { role: "agent", content: "Hi Sarah, this is Alex from the support team. I've flagged your order for priority handling — you'll receive an update within 2 hours.", time: "10:08 AM", agent: "Alex" },
  ],
  c2: [
    { role: "user", content: "I'd like a refund on my annual subscription. I signed up by mistake.", time: "9:44 AM" },
    { role: "assistant", content: "Hi James! I understand. Our refund policy allows full refunds within 14 days of purchase. When did you sign up?", time: "9:44 AM" },
    { role: "user", content: "Yesterday. So I should qualify right?", time: "9:46 AM" },
  ],
  c3: [
    { role: "user", content: "Where do I update my credit card?", time: "8:30 AM" },
    { role: "assistant", content: "You can update your billing info under Settings → Billing → Payment Method. Would you like a direct link?", time: "8:30 AM" },
  ],
};

const STATS = [
  { label: "Open", value: 12, color: COLORS.accent },
  { label: "Escalated", value: 3, color: COLORS.warn },
  { label: "Resolved today", value: 47, color: COLORS.textDim },
  { label: "Avg. response", value: "1m 12s", color: COLORS.textDim },
];

const STATUS_COLORS = {
  OPEN: { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  ESCALATED: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  RESOLVED: { bg: "rgba(0,229,160,0.1)", text: "#00e5a0" },
  PENDING: { bg: "rgba(113,128,150,0.15)", text: "#718096" },
};

const Badge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
      padding: "3px 8px", borderRadius: 20, textTransform: "uppercase",
      fontFamily: MONO,
    }}>{status}</span>
  );
};

const Avatar = ({ name, size = 32, color = COLORS.accent }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}22, ${color}44)`,
    border: `1.5px solid ${color}55`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.35, fontWeight: 700, color,
    flexShrink: 0, fontFamily: FONT,
  }}>
    {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
  </div>
);

export default function AgentDashboard() {
  const [selected, setSelected] = useState("c1");
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [localMessages, setLocalMessages] = useState(MOCK_MESSAGES);

  const conv = MOCK_CONVERSATIONS.find(c => c.id === selected);
  const msgs = localMessages[selected] || [];

  const filtered = filter === "ALL"
    ? MOCK_CONVERSATIONS
    : MOCK_CONVERSATIONS.filter(c => c.status === filter);

  const sendReply = () => {
    if (!reply.trim()) return;
    setLocalMessages(prev => ({
      ...prev,
      [selected]: [...(prev[selected] || []), {
        role: "agent", content: reply.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: "You",
      }],
    }));
    setReply("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .conv-row:hover { background: #181c26 !important; }
        .conv-row.active { background: #181c26 !important; border-left: 2px solid ${COLORS.accent} !important; }
        .filter-btn:hover { color: ${COLORS.text} !important; }
        .send-btn:hover:not(:disabled) { background: #00c98a !important; }
        .action-btn:hover { background: ${COLORS.border} !important; }
        textarea:focus { outline: none; border-color: ${COLORS.accent} !important; }
        textarea { resize: none; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", background: COLORS.bg, fontFamily: FONT, color: COLORS.text, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 260, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Logo */}
          <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.accent}, #0ea5e9)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em" }}>Acme Support</div>
                <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: MONO }}>Agent Dashboard</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: MONO, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ padding: "12px 16px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "OPEN", "ESCALATED", "RESOLVED"].map(f => (
              <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{
                background: filter === f ? COLORS.accentDim : "transparent",
                border: `1px solid ${filter === f ? COLORS.accent : COLORS.border}`,
                color: filter === f ? COLORS.accent : COLORS.textDim,
                borderRadius: 20, padding: "4px 10px",
                fontSize: 10, fontFamily: MONO, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}>{f}</button>
            ))}
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map(c => (
              <div
                key={c.id}
                className={`conv-row${selected === c.id ? " active" : ""}`}
                onClick={() => setSelected(c.id)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderLeft: "2px solid transparent",
                  transition: "all 0.15s",
                  animation: "slideIn 0.2s ease forwards",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                  <Avatar name={c.visitor} size={28} color={c.status === "ESCALATED" ? COLORS.warn : COLORS.accent} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{c.visitor}</span>
                      {c.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, display: "inline-block", animation: "pulse 2s infinite" }} />}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.textDim }}>{c.time}</div>
                  </div>
                  <Badge status={c.status} />
                </div>
                <div style={{ fontSize: 12, color: COLORS.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingLeft: 38 }}>
                  {c.preview}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main thread ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Thread header */}
          <div style={{
            padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
          }}>
            <Avatar name={conv?.visitor || "?"} size={38} color={conv?.status === "ESCALATED" ? COLORS.warn : COLORS.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{conv?.visitor}</div>
              <div style={{ fontSize: 12, color: COLORS.textDim }}>{conv?.email} · {conv?.messages} messages</div>
            </div>
            <Badge status={conv?.status || "OPEN"} />
            <div style={{ display: "flex", gap: 8 }}>
              {["Escalate", "Resolve"].map(label => (
                <button key={label} className="action-btn" style={{
                  background: "transparent", border: `1px solid ${COLORS.border}`,
                  color: label === "Escalate" ? COLORS.warn : COLORS.accent,
                  borderRadius: 8, padding: "6px 14px", fontSize: 12,
                  fontFamily: FONT, fontWeight: 600, cursor: "pointer",
                  transition: "background 0.15s",
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {msgs.map((m, i) => {
              const isUser = m.role === "user";
              const isAgent = m.role === "agent";
              return (
                <div key={i} style={{
                  display: "flex", gap: 12,
                  flexDirection: isUser ? "row" : "row-reverse",
                  animation: "fadeUp 0.2s ease forwards",
                }}>
                  <div style={{ flexShrink: 0 }}>
                    {isUser
                      ? <Avatar name={conv?.visitor || "U"} size={30} color="#818cf8" />
                      : isAgent
                        ? <Avatar name={m.agent || "A"} size={30} color={COLORS.warn} />
                        : <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${COLORS.accent}33, ${COLORS.accent}55)`,
                            border: `1.5px solid ${COLORS.accent}55`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: COLORS.accent,
                          }}>AI</div>
                    }
                  </div>
                  <div style={{ maxWidth: "65%" }}>
                    <div style={{
                      background: isUser ? "#1a1d2e" : isAgent ? "rgba(245,158,11,0.08)" : COLORS.surface,
                      border: `1px solid ${isUser ? "#2d3250" : isAgent ? "rgba(245,158,11,0.2)" : COLORS.border}`,
                      borderRadius: isUser ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                      padding: "11px 15px",
                      fontSize: 13.5, lineHeight: 1.6, color: COLORS.text,
                    }}>
                      {isAgent && <div style={{ fontSize: 10, color: COLORS.warn, fontFamily: MONO, fontWeight: 600, marginBottom: 5 }}>AGENT · {m.agent}</div>}
                      {m.content}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4, textAlign: isUser ? "left" : "right", fontFamily: MONO }}>{m.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply box */}
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            <div style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 14, overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                placeholder="Reply as agent… (Enter to send)"
                rows={3}
                style={{
                  width: "100%", background: "transparent",
                  border: "none", padding: "14px 16px",
                  fontSize: 13.5, color: COLORS.text,
                  fontFamily: FONT, lineHeight: 1.6,
                }}
                onFocus={e => e.target.parentElement.style.borderColor = COLORS.accent}
                onBlur={e => e.target.parentElement.style.borderColor = COLORS.border}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderTop: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: MONO }}>Shift+Enter for new line</span>
                <button
                  className="send-btn"
                  onClick={sendReply}
                  disabled={!reply.trim()}
                  style={{
                    background: reply.trim() ? COLORS.accent : COLORS.border,
                    border: "none", borderRadius: 8,
                    padding: "7px 18px", fontSize: 12,
                    fontFamily: FONT, fontWeight: 600,
                    color: reply.trim() ? "#0d0f14" : COLORS.muted,
                    cursor: reply.trim() ? "pointer" : "default",
                    transition: "all 0.15s",
                  }}
                >Send Reply</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: visitor info ── */}
        <div style={{ width: 240, borderLeft: `1px solid ${COLORS.border}`, padding: "20px 16px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: MONO, letterSpacing: "0.08em", marginBottom: 16 }}>VISITOR INFO</div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
            <Avatar name={conv?.visitor || "?"} size={52} color={COLORS.accent} />
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600 }}>{conv?.visitor}</div>
            <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>{conv?.email}</div>
          </div>

          {[
            { label: "Status", value: conv?.status },
            { label: "Channel", value: "Widget" },
            { label: "Messages", value: conv?.messages },
            { label: "First contact", value: conv?.time },
            { label: "Plan", value: "Pro" },
            { label: "Location", value: "San Francisco" },
          ].map(({ label, value }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: MONO, letterSpacing: "0.06em", marginBottom: 3 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: COLORS.text }}>{value}</div>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: MONO, letterSpacing: "0.06em", marginBottom: 10 }}>QUICK ACTIONS</div>
            {["View full history", "Block visitor", "Copy email"].map(action => (
              <button key={action} className="action-btn" style={{
                width: "100%", background: "transparent",
                border: `1px solid ${COLORS.border}`, borderRadius: 8,
                padding: "8px 12px", marginBottom: 6,
                fontSize: 12, color: COLORS.textDim, fontFamily: FONT,
                cursor: "pointer", textAlign: "left",
                transition: "background 0.15s",
              }}>{action}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
