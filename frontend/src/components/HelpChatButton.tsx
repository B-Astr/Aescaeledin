import { useState } from "react";
import { useI18nContext } from "../i18n";
import asciBotIcon from "../assets/asci-bot.png";
import "./HelpChatButton.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MAX_MESSAGE_LENGTH = 800;
const MAX_HISTORY_MESSAGES = 8;

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type HelpChatResponse = {
  reply?: string;
  error?: string;
};

export default function HelpChatButton() {
  const { LL } = useI18nContext();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedMessage = message.trim();
  const canSend = trimmedMessage.length > 0 && !loading;

  function appendMessages(nextMessages: ChatMessage[]) {
    setMessages((currentMessages) =>
      [...currentMessages, ...nextMessages].slice(-MAX_HISTORY_MESSAGES)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedMessage || loading) {
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      setError(LL.helpChat.loginRequired());
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmedMessage,
    };

    appendMessages([userMessage]);
    setMessage("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/help-chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | HelpChatResponse
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Help chat request failed");
      }

      if (!data?.reply) {
        throw new Error("Invalid help chat response");
      }

      appendMessages([
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch {
      setError(LL.helpChat.error());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`help-chat ${open ? "open" : ""}`}>
      {open && (
        <section className="help-chat-panel" aria-label={LL.helpChat.title()}>
          <div className="help-chat-header">
            <div>
              <span>{LL.helpChat.help()}</span>
              <h2>{LL.helpChat.title()}</h2>
            </div>
            <button
              type="button"
              className="help-chat-close"
              onClick={() => setOpen(false)}
              aria-label={LL.helpChat.close()}
            >
              x
            </button>
          </div>

          <div className="help-chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="help-chat-message assistant">
                {LL.helpChat.welcome()}
              </div>
            )}

            {messages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={`help-chat-message ${chatMessage.role}`}
              >
                {chatMessage.text}
              </div>
            ))}

            {loading && (
              <div className="help-chat-message assistant loading">
                {LL.helpChat.typing()}
              </div>
            )}
          </div>

          {error && <div className="help-chat-error">{error}</div>}

          <form className="help-chat-form" onSubmit={handleSubmit}>
            <input
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError(null);
              }}
              placeholder={LL.helpChat.placeholder()}
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={loading}
            />
            <button type="submit" disabled={!canSend}>
              {loading ? LL.helpChat.typing() : LL.helpChat.send()}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="help-chat-toggle"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-expanded={open}
        aria-label={LL.helpChat.title()}
      >
        <img src={asciBotIcon} alt="ASCI" />
      </button>
    </div>
  );
}
