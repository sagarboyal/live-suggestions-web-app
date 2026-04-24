import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import './ChatPanel.css';

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onSend: (question: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ chatHistory, isLoading, onSend }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="panel-header">
        <h2>3. CHAT (DETAILED ANSWERS)</h2>
        <div className="header-status">SESSION-ONLY</div>
      </div>
      
      <div className="info-card">
        Clicking a suggestion adds it to this chat and streams a detailed answer (separate prompt, more context). 
        User can also type questions directly. One continuous chat per session — no login, no persistence.
      </div>
      
      <div className="chat-messages">
        {chatHistory.length === 0 ? (
          <div className="empty-state">Click a suggestion or type a question below.</div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">{msg.content}</div>
              <div className="message-time">{msg.timestamp}</div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="message-bubble">
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button 
          className="btn-send"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
