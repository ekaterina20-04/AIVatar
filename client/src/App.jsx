import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'ai-gate-history';

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export default function App() {
  const [messages, setMessages] = useState(readCache);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    fetch('/api/history')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Не удалось загрузить историю');
        setMessages(data.messages);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function submit(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || loading) return;

    setMessage('');
    setError('');
    setLoading(true);
    const optimistic = { id: `local-${Date.now()}`, role: 'user', content: text };
    setMessages((current) => [...current, optimistic]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка AI-сервиса');
      setMessages((current) => [...current.filter((item) => item.id !== optimistic.id), ...data.messages]);
    } catch (requestError) {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      setMessage(text);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header>
        <span className="status" />
        <div>
          <h1>Anonymous AI</h1>
          <p>Сессия хранится в cookie, история — в PostgreSQL и localStorage.</p>
        </div>
      </header>

      <section className="messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="empty">
            <strong>Задайте первый вопрос</strong>
            <span>Регистрация не требуется.</span>
          </div>
        )}
        {messages.map((item) => (
          <article key={item.id} className={item.role}>
            <small>{item.role === 'user' ? 'Вы' : 'AI'}</small>
            <div>{item.content}</div>
          </article>
        ))}
        {loading && <article className="assistant pending">AI печатает…</article>}
        <div ref={endRef} />
      </section>

      {error && <div className="error">{error}</div>}

      <form onSubmit={submit}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form.requestSubmit();
            }
          }}
          placeholder="Введите запрос…"
          rows="2"
          maxLength="4000"
          disabled={loading}
        />
        <button disabled={loading || !message.trim()}>{loading ? 'Ждём…' : 'Отправить'}</button>
      </form>
    </main>
  );
}

