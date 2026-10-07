import React, { useState, useEffect } from 'react';
import { Send, Bot, User, BookOpen, FileCheck, Database, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';

interface ChatPanelProps {
  shopperId: string;
  receiptId: string | null;
  externalResponse?: {
    question: string;
    answer: string;
    sources?: any[];
    timestamp?: string;
  } | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ shopperId, receiptId, externalResponse }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your Purchase Protection Assistant. I can answer policy questions, check item return deadlines, or verify order status from the database. How can I help?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync responses triggered from hero composer into chat history
  useEffect(() => {
    if (externalResponse && externalResponse.question && externalResponse.answer) {
      setMessages((prev) => {
        // Prevent duplicate append
        if (prev.some((m) => m.text === externalResponse.answer)) return prev;
        const nowTime = externalResponse.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return [
          ...prev,
          {
            id: `ext-user-${Date.now()}`,
            sender: 'user',
            text: externalResponse.question,
            timestamp: nowTime,
          },
          {
            id: `ext-bot-${Date.now() + 1}`,
            sender: 'assistant',
            text: externalResponse.answer,
            sources: externalResponse.sources,
            timestamp: nowTime,
          },
        ];
      });
    }
  }, [externalResponse]);

  const suggestedQuestions = [
    'When can I return this?',
    'What did I buy?',
    'What is the invoice number?',
    'Check order 405-0187084-9011564',
    'Check order ORD-999999',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuestion.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await sendChatMessage(shopperId, receiptId, q);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving grounded information. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[560px] overflow-hidden">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Rupertrace Assistant</h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Grounded in your receipt &amp; store policy</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2 ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-2xs'
                : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-2xs'
            }`}>
              <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

              {/* Source Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Verified Sources:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200/80 text-[10px] text-indigo-700 font-medium shadow-2xs"
                      >
                        {src.source_type === 'order_database' ? (
                          <Database className="w-3 h-3 text-cyan-600" />
                        ) : src.source_type === 'policy' ? (
                          <BookOpen className="w-3 h-3 text-amber-600" />
                        ) : (
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                        )}
                        <span>{src.reference}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[10px] text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Retrieving grounded policy &amp; receipt context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0">Ask:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full text-[11px] bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 whitespace-nowrap transition-colors flex-shrink-0 shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask about returns, policies, warranties, or order numbers..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
