import React, { useContext, useRef, useState } from 'react';
import { RestaurantContext } from '../context/RestaurantContext';
import { askBot } from '../api';

export default function FloatingChatbot() {
  const { analysis } = useContext(RestaurantContext);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! Ask me about your forecast — prep, shopping, busiest day, or savings.' },
  ]);
  const bodyRef = useRef(null);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    });
  };

  const send = async () => {
    const q = input.trim();
    if (!q || sending) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text: q }]);
    scrollDown();

    if (!analysis) {
      setMessages((m) => [
        ...m,
        { from: 'ai', text: 'Upload your past sales on the Dashboard first, then I can answer about the forecast.' },
      ]);
      scrollDown();
      return;
    }

    setSending(true);
    try {
      const answer = await askBot(q, analysis);
      setMessages((m) => [...m, { from: 'ai', text: answer }]);
    } catch (err) {
      setMessages((m) => [...m, { from: 'ai', text: `Sorry — couldn’t reach the assistant (${err.message}).` }]);
    } finally {
      setSending(false);
      scrollDown();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>🤖 AI Chatbot</h4>
            <button onClick={() => setIsOpen(false)} className="close-chat">X</button>
          </div>
          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${m.from === 'ai' ? 'ai' : 'user'}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {m.text}
              </div>
            ))}
            {sending && <div className="chat-bubble ai">…</div>}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button onClick={send} disabled={sending}>send</button>
          </div>
        </div>
      ) : (
        <button className="chatbot-fab" onClick={() => setIsOpen(true)}>
          💬 AI Chatbot
        </button>
      )}
    </div>
  );
}
