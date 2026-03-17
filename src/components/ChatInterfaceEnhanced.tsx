import { useState, useRef, useEffect } from 'react'
import { Search, Sun, Moon, MapPin, Home, TrendingUp } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

interface ChatInterfaceEnhancedProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isTyping?: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  placeholder?: string
}

export function ChatInterfaceEnhanced({
  messages,
  onSendMessage,
  isTyping = false,
  theme,
  onToggleTheme,
  placeholder = "Search for properties in Trinidad & Tobago..."
}: ChatInterfaceEnhancedProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
    }
  }
  
  const quickPrompts = [
    { icon: MapPin, text: "Properties in Port of Spain" },
    { icon: Home, text: "2 bedroom apartments under 1M" },
    { icon: TrendingUp, text: "Luxury homes in Tobago" }
  ]
  
  return (
    <div className="flex flex-col h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b bg-[var(--bg)]/90 border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] flex items-center justify-center">
              <span className="font-bold text-black text-lg">P</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Placesi</h1>
              <p className="text-xs text-[var(--text-muted)]">AI-Powered Real Estate</p>
            </div>
          </div>
          
          <button
            onClick={onToggleTheme}
            className="icon-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-[var(--text-muted)]" />
            ) : (
              <Moon className="w-5 h-5 text-[var(--text-muted)]" />
            )}
          </button>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] flex items-center justify-center">
                <Home className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Find Your Dream Property
              </h2>
              <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
                Ask me anything about real estate in Trinidad & Tobago. I can help you find properties, compare prices, and more.
              </p>
              
              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt.text)
                      inputRef.current?.focus()
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-input)] group-hover:bg-[var(--color-accent-500)] transition-colors flex items-center justify-center flex-shrink-0">
                      <prompt.icon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-black transition-colors" />
                    </div>
                    <span className="text-sm text-[var(--text)] line-clamp-2">
                      {prompt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${
                message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'
              }`}
            >
              <div
                className={`chat-bubble ${
                  message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                }`}
              >
                {message.content}
              </div>
              {message.timestamp && (
                <div className="text-xs text-[var(--text-muted)] mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-bubble chat-bubble-assistant">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--bg)] p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="search-input"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="search-button"
              aria-label="Send message"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
