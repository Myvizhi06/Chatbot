
import { useState } from 'react'
import './App.css'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

export default function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState('Waiting for a message')

  
async function sendMessage() {
  const prompt = input.trim()
  if (!prompt) return

  setMessages((previous) => [
    ...previous,
    { role: 'user', text: prompt },
  ])

  setInput('')
  setStatus('Analyzing prompt...')

  try {
    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt }),
    })

    if (!response.ok) {
      throw new Error('Backend request failed')
    }

    const data = await response.json()

    setMessages((previous) => [
      ...previous,
      { role: 'assistant', text: data.reply },
    ])

    setStatus(`Security: ${data.security_status}`)
  } catch {
    setStatus('Backend connection failed')
    setMessages((previous) => [
      ...previous,
      {
        role: 'assistant',
        text: 'Cannot connect to the backend. Please check whether the FastAPI server is running.',
      },
    ])
  }
}


  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>ShieldChat</h1>
            <p>AI Chat · Prompt Protection</p>
          </div>
        </div>
        <span className="prototype-badge">PROTOTYPE</span>
      </header>

      <div className="workspace">
        <section className="chat-card">
          <div className="chat-heading">
            <div>
              <h2>AI Assistant</h2>
              <p>Ask a question to start a conversation.</p>
            </div>
            <span className="online-dot">● Ready</span>
          </div>

          <div className="messages">
            {messages.length === 0 && (
              <div className="welcome">
                <div className="welcome-icon">✦</div>
                <h2>Welcome to ShieldChat</h2>
                <p>
                  Your AI conversation with a security layer
                  designed to detect prompt injection.
                </p>
                <div className="suggestion">
                  Try: Explain machine learning simply.
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                <span className="message-label">
                  {message.role === 'user' ? 'You' : 'ShieldChat'}
                </span>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              aria-label="Your message"
            />
            <button type="submit" disabled={!input.trim()}>
              Send ↑
            </button>
          </form>
          <p className="composer-note">
            Prototype only · AI responses are not connected yet
          </p>
        </section>

        <aside className="security-card">
          <div className="security-title">
            <div className="shield-icon">⬡</div>
            <div>
              <h2>Security Center</h2>
              <p>Prompt analysis status</p>
            </div>
          </div>

          <div className="status-box">
            <span className="status-indicator" />
            <div>
              <strong>Model not connected</strong>
              <p>{status}</p>
            </div>
          </div>

          <h3>Security pipeline</h3>
          <div className="pipeline">
            <div className="pipeline-item">
              <span>1</span>
              <div>
                <strong>Prompt received</strong>
                <p>Awaiting backend integration</p>
              </div>
            </div>
            <div className="pipeline-item">
              <span>2</span>
              <div>
                <strong>Risk analysis</strong>
                <p>Detection model pending</p>
              </div>
            </div>
            <div className="pipeline-item">
              <span>3</span>
              <div>
                <strong>Allow or block</strong>
                <p>Policy not active yet</p>
              </div>
            </div>
          </div>

          <div className="notice">
            <strong>Development mode</strong>
            <p>
              Prompt protection is not active. Messages are
              not yet analyzed or sent to an AI model.
            </p>
          </div>

          <div className="footer-label">
            SHIELDCHAT · SECURITY PROTOTYPE
          </div>
        </aside>
      </div>
    </main>
  )
}
