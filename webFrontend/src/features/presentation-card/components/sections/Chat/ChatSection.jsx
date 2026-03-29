import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { usePresentationChat } from '../../../hooks/usePresentationChat';
import { PRESENTATION_SECTION_IDS } from '../../../constants/sections';

const SUGGESTED_PROMPTS = [
  'What tech stack and cloud tools do you use?',
  'Describe a project you shipped end to end.',
  'What kind of role are you looking for next?',
];

export function ChatSection() {
  const { messages, pending, sendMessage } = usePresentationChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t || pending) return;
    void sendMessage(t);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section
      id={PRESENTATION_SECTION_IDS.chat}
      className="presentation-card__chat"
      aria-label="Recruiter assistant"
    >
      <div className="presentation-card__section-inner presentation-card__chat-wrap">
        <div className="presentation-card__chat-intro">
          <div className="presentation-card__chat-intro-icon" aria-hidden>
            <Sparkles size={22} strokeWidth={2} />
          </div>
          <div>
            <h2 className="presentation-card__chat-title">Ask about my background</h2>
            <p className="presentation-card__chat-lead">
              Ask about experience, stack, projects, and more. Answers will use a
              RAG pipeline to find relevant information from my knowledge base.
            </p>
          </div>
        </div>

        <div className="presentation-card__chat-panel">
          <div className="presentation-card__chat-panel-inner">
            <div className="presentation-card__chat-toolbar">
              <span className="presentation-card__chat-toolbar-badge">
                <Bot size={16} aria-hidden />
                RAG-powered Assistant
              </span>
              <span className="presentation-card__chat-toolbar-hint">Preview mode</span>
            </div>

            <div
              ref={listRef}
              className="presentation-card__chat-messages"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.length === 0 && !pending && (
                <div className="presentation-card__chat-empty">
                  <p className="presentation-card__chat-empty-title">Start a conversation</p>
                  <p className="presentation-card__chat-empty-text">
                    Try one of the suggestions below or type your own question.
                  </p>
                  <div className="presentation-card__chat-chips">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="presentation-card__chat-chip"
                        onClick={() => void sendMessage(prompt)}
                        disabled={pending}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <ul className="presentation-card__chat-thread">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`presentation-card__chat-row presentation-card__chat-row--${m.role}`}
                  >
                    <span className="presentation-card__chat-avatar" aria-hidden>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </span>
                    <div
                      className={`presentation-card__chat-bubble presentation-card__chat-bubble--${m.role}`}
                    >
                      <span className="presentation-card__chat-bubble-label">
                        {m.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      {m.role === 'assistant' ? (
                        <div className="presentation-card__chat-bubble-text presentation-card__chat-bubble-text--md">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="presentation-card__chat-bubble-text">{m.text}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {pending && (
                <div className="presentation-card__chat-row presentation-card__chat-row--assistant">
                  <span className="presentation-card__chat-avatar" aria-hidden>
                    <Bot size={16} />
                  </span>
                  <div className="presentation-card__chat-bubble presentation-card__chat-bubble--assistant presentation-card__chat-bubble--typing">
                    <span className="presentation-card__chat-typing" aria-label="Assistant is typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <form className="presentation-card__chat-composer" onSubmit={handleSubmit}>
              <label htmlFor="presentation-chat-input" className="presentation-card__chat-sr-only">
                Message
              </label>
              <textarea
                id="presentation-chat-input"
                className="presentation-card__chat-input"
                rows={2}
                placeholder="Ask a question…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={pending}
                autoComplete="off"
              />
              <button
                type="submit"
                className="presentation-card__chat-send"
                disabled={!draft.trim() || pending}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
