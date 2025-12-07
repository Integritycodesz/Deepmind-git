import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AnalysisResult } from '../types';
import { chatWithRepo } from '../services/geminiService';
import { MessageSquareIcon } from '../constants';

interface ChatInterfaceProps {
  repoContext: AnalysisResult;
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ repoContext, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await chatWithRepo([...messages, userMsg], repoContext);
      
      const botMsg: ChatMessage = {
        role: 'model',
        content: aiResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'model',
        content: "Sorry, I had trouble connecting to the AI brain.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-surface rounded-xl shadow-2xl border border-slate-700 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 rounded-t-xl">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MessageSquareIcon className="w-4 h-4 text-primary" />
          Chat with Repo
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            <p>👋 Hi! Ask me about:</p>
            <ul className="text-sm mt-2 space-y-2">
              <li>"Why did we refactor the auth service?"</li>
              <li>"Who fixed the login bug?"</li>
              <li>"Explain the evolution of the API."</li>
            </ul>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-slate-700 text-slate-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-lg p-3 text-sm text-slate-400">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700 bg-slate-900 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-background border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg px-3 py-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
