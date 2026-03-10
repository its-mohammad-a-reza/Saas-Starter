// app/(widget)/chat/page.tsx
// Demo page showing the embedded chat widget
import ChatWidget from "@/components/chat/ChatWidget";

export default function WidgetPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#64748b", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8, color: "#1e293b" }}>Widget Preview</h1>
        <p>The chat widget appears in the bottom-right corner.</p>
      </div>
      <ChatWidget />
    </main>
  );
}
