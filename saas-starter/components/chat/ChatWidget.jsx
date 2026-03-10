"use client";

import { useState, useRef, useEffect } from "react";

const BOT_NAME = "Aria";
const COMPANY = "Acme Support";

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", padding: "4px 0" }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, color: "white", fontWeight: 700, flexShrink: 0
    }}>A</div>
    <div style={{
      background: "#f1f0ff", borderRadius: "18px 18px 18px 4px",
      padding: "12px 16px", display: "flex", gap: 5, alignItems: "center"
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#a5b4fc",
          display: "inline-block",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  </div>
);

const Message = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end",
      gap: 10,
      padding: "3px 0",
      animation: "fadeSlideIn 0.25s ease forwards",
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "white", fontWeight: 700, flexShrink: 0
        }}>A</div>
      )}
      <div style={{
        maxWidth: "72%",
        background: isUser
          ? "linear-gradient(135deg, #6366f1, #7c3aed)"
          : "#f1f0ff",
        color: isUser ? "white" : "#1e1b4b",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "11px 15px",
        fontSize: 14,
        lineHeight: 1.55,
        boxShadow: isUser
          ? "0 2px 12px rgba(99,102,241,0.3)"
          : "0 1px 4px rgba(0,0,0,0.07)",
      }}>
        {msg.content}
      </div>
    </div>
  );
};

const QUICK_REPLIES = [
  "Track my order",
  "Request a refund",
  "Talk to a human",
  "Account settings",
];

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi there! 👋 I'm ${BOT_NAME}, your ${COMPANY} assistant. How can I help you today?`,
      id: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content) return;
    setInput("");

    const userMsg = { role: "user", content, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate Claude response (replace with real /api/chat call)
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        "I'd be happy to help with that! Let me pull up your account details. Can you share your order number?",
        "Got it! I'm looking into this right now. This usually takes just a moment.",
        "Thanks for reaching out. I can definitely assist you with that request.",
        "I understand your concern. Let me connect you with the right information.",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { role: "assistant", content: reply, id: Date.now() }]);
    }, 1500);

    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1000 }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes widgetIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .send-btn:hover { background: linear-gradient(135deg, #4f46e5, #6d28d9) !important; transform: scale(1.05); }
        .quick-reply:hover { background: #ede9fe !important; border-color: #a5b4fc !important; }
        .close-btn:hover { background: rgba(255,255,255,0.2) !important; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #a5b4fc; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e0e7ff; border-radius: 4px; }
      `}</style>

      <div style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 1000,
        width: 380, height: 580,
        background: "white",
        borderRadius: 24,
        boxShadow: "0 24px 60px rgba(99,102,241,0.18), 0 4px 20px rgba(0,0,0,0.08)",
        display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
        animation: "widgetIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
          padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "white",
            border: "2px solid rgba(255,255,255,0.3)",
          }}>A</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>{BOT_NAME}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
              Online · Typically replies instantly
            </div>
          </div>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer",
              width: 32, height: 32, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "16px 16px 8px",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && !isTyping && (
          <div style={{ padding: "4px 16px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_REPLIES.map(q => (
              <button
                key={q}
                className="quick-reply"
                onClick={() => sendMessage(q)}
                style={{
                  background: "white", border: "1.5px solid #e0e7ff",
                  borderRadius: 20, padding: "6px 12px",
                  fontSize: 12, color: "#6366f1", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid #f0eeff",
          display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            rows={1}
            style={{
              flex: 1,
              background: "#f5f3ff",
              border: "1.5px solid #e0e7ff",
              borderRadius: 16,
              padding: "10px 14px",
              fontSize: 14,
              fontFamily: "inherit",
              color: "#1e1b4b",
              resize: "none",
              lineHeight: 1.5,
              maxHeight: 100,
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#a5b4fc"}
            onBlur={e => e.target.style.borderColor = "#e0e7ff"}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() && !isTyping}
            style={{
              width: 42, height: 42,
              borderRadius: "50%",
              background: input.trim()
                ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                : "#e0e7ff",
              border: "none", cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
              boxShadow: input.trim() ? "0 2px 12px rgba(99,102,241,0.35)" : "none",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke={input.trim() ? "white" : "#a5b4fc"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", paddingBottom: 10,
          fontSize: 11, color: "#c4b5fd", fontWeight: 500,
          letterSpacing: "0.02em",
        }}>
          Powered by Claude · {COMPANY}
        </div>
      </div>
    </>
  );
}
