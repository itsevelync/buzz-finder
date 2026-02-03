"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import styles from "./chatbot.module.css";

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
};

type BeeConfig = {
  id: number;
  topVh: number;
  durationMs: number;
  direction: "ltr" | "rtl";
};

const NAVY = "#003057";
const GOLD = "#B3A369";

/** dotted background (what you have now) */
const pageBeePattern: CSSProperties = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "radial-gradient(circle at 0 0, rgba(179,163,105,0.35) 2px, transparent 2px)," +
    "radial-gradient(circle at 18px 18px, rgba(179,163,105,0.20) 2px, transparent 2px)",
  backgroundSize: "36px 36px"
};

function makeRandomBee(direction: "ltr" | "rtl"): BeeConfig {
  const topVh = 10 + Math.random() * 60; // 10–70% viewport height
  const durationMs = 10000 + Math.random() * 7000; // 10–17s

  return {
    id: Date.now(),
    topVh,
    durationMs,
    direction
  };
}



export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text:
        "Hi, I'm BuzzBot 🐝. Ask me about reporting or finding items on BuzzFinder!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [bee, setBee] = useState<BeeConfig | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

// first bee: only on client, start LEFT -> RIGHT
useEffect(() => {
  setBee(makeRandomBee("ltr"));
}, []);

// after each flight, alternate direction
useEffect(() => {
  if (!bee) return;

  const timeout = setTimeout(() => {
    const nextDirection: "ltr" | "rtl" =
      bee.direction === "ltr" ? "rtl" : "ltr";
    setBee(makeRandomBee(nextDirection));
  }, bee.durationMs + 800);

  return () => clearTimeout(timeout);
}, [bee]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "bot",
        text: data.reply ?? "Sorry, something went wrong."
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "bot",
          text:
            "Oops, I had trouble answering that. Please try again in a moment."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center py-10 px-4 relative overflow-hidden"
      style={pageBeePattern}
    >
      {/* 🐝 animated bee (page-only) */}
      {bee && (
  <div
    key={bee.id}
    className={`${styles.bee} ${
      bee.direction === "ltr" ? styles.beeLtr : styles.beeRtl
    }`}
    style={{
      top: `${bee.topVh}vh`,
      animationDuration: `${bee.durationMs}ms`
    }}
  >
    🐝
  </div>
)}


      {/* main content */}
      <div className="w-full max-w-3xl relative z-10">
        <h1
          className="text-3xl font-semibold mb-6 text-center"
          style={{ color: NAVY }}
        >
          BuzzFinder Chatbot
        </h1>

        <div
          className="bg-white border rounded-3xl shadow-md flex flex-col h-[70vh] p-5"
          style={{ borderColor: "rgba(0, 48, 87, 0.25)" }}
        >
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed"
                  style={
                    m.role === "user"
                      ? { backgroundColor: NAVY, color: "#ffffff" }
                      : {
                          backgroundColor: "rgba(255,255,255,0.95)",
                          color: NAVY,
                          border: "1px solid rgba(179,163,105,0.4)"
                        }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-xs mt-1" style={{ color: GOLD }}>
                BuzzBot is thinking…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "rgba(0, 48, 87, 0.25)" }}
              placeholder="Ask about reporting or finding items on BuzzFinder..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: NAVY }}
              disabled={isLoading}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
