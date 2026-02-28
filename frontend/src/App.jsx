import { useState, useRef, useEffect, useCallback } from 'react';

const EXAMPLE_PROMPTS = [
  "My kitchen faucet won't stop dripping",
  "There's a crack in my drywall near the ceiling",
  "My toilet keeps running after flushing",
];

/** Parse structured AI response into formatted JSX */
function FormatResponse({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null; // 'ol' or 'ul'

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`list-${elements.length}`} className="response-list">
            {listItems.map((item, i) => <li key={i}>{item}</li>)}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${elements.length}`} className="response-list">
            {listItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Numbered list item: "1. ...", "2) ..."
    const numberedMatch = trimmed.match(/^\d+[\.\)]\s+(.+)/);
    if (numberedMatch) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(numberedMatch[1]);
      continue;
    }

    // Bullet list item: "- ...", "* ...", "  - ..."
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1]);
      continue;
    }

    flushList();

    // Bold label line: "Issue:", "Severity:", "DIY Steps:" etc.
    const labelMatch = trimmed.match(/^([A-Z][A-Za-z\s\/]+):\s*(.*)/);
    if (labelMatch) {
      elements.push(
        <div key={`label-${i}`} className="response-label-line">
          <strong className="response-label">{labelMatch[1]}:</strong>{' '}
          {labelMatch[2] && <span>{labelMatch[2]}</span>}
        </div>
      );
      continue;
    }

    // Heading-like lines (all caps or short bold-looking lines ending with ":")
    if (trimmed.endsWith(':') && trimmed.length < 60) {
      elements.push(
        <div key={`heading-${i}`} className="response-section-heading">
          {trimmed}
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(<p key={`p-${i}`} className="response-paragraph">{trimmed}</p>);
  }

  flushList();

  return <div className="formatted-response">{elements}</div>;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    handleImageFile(e.target.files[0]);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    removeImage();
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const sendMessage = async (overrideText) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed && !image) return;

    const userMessage = {
      role: 'user',
      content: trimmed,
      image: imagePreview,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          image: image || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: data.response, timestamp: Date.now() },
      ]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: `Error: ${err.message}`, timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="header-top">
          <h1>FixIt Bot</h1>
          <div className="header-actions">
            {messages.length > 0 && (
              <button className="clear-btn" onClick={clearChat} title="Clear chat">
                Clear
              </button>
            )}
            <button
              className="theme-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
        <p>Describe your home repair issue or snap a photo</p>
      </header>

      <div
        className={`messages ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragOver && (
          <div className="drop-overlay">
            Drop image here
          </div>
        )}

        {messages.length === 0 && !dragOver && (
          <div className="empty-state">
            <div className="empty-icon">🔧</div>
            <h2>How can I help?</h2>
            <p>Ask me about any home repair issue, or upload a photo for diagnosis.</p>
            <div className="example-prompts">
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="example-prompt"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-bubble">
              {msg.image && (
                <img src={msg.image} alt="Uploaded" className="message-image" />
              )}
              {msg.role === 'assistant' ? (
                <FormatResponse text={msg.content} />
              ) : (
                <p className="message-text">{msg.content}</p>
              )}
              <div className="message-meta">
                <span className="message-time">{formatTime(msg.timestamp)}</span>
                {msg.role === 'assistant' && (
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(msg.content)}
                    title="Copy response"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-bubble">
              <div className="loading-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button onClick={removeImage} className="remove-image">x</button>
          </div>
        )}
        <div className="input-row">
          <button
            className="photo-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo"
          >
            +
          </button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageChange}
            hidden
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your repair issue..."
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || (!input.trim() && !image)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
