'use client';

import { useState, useRef, useEffect } from 'react';
import { chatContent } from '@/app/content/site';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FAQChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/faq-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setError(chatContent.errorResponse);
      }
    } catch {
      setError(chatContent.errorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-3xl font-serif text-[#35452C]">{chatContent.title}</h2>
        <p className="text-base leading-7 text-[#2D2923]/85">
          {chatContent.intro}
        </p>
      </div>

      <div className="rounded-lg border border-[#E6D8C6] bg-[#F8F4EA] p-5 shadow-sm sm:p-6">
        <div className="mb-5 space-y-3 border-b border-[#E6D8C6] pb-5">
          <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">{chatContent.suggestedLabel}</p>
          <div className="flex flex-wrap gap-2">
            {chatContent.suggestedQuestions.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setInput(prompt);
                  setError(null);
                }}
                className="rounded-md border border-[#A8B58A] bg-white px-3 py-2 text-sm text-[#35452C] transition-colors hover:bg-[#A8B58A]/10"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-[28rem] overflow-y-auto rounded-lg border border-[#E6D8C6] bg-white p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-center text-center">
                <p className="text-xs uppercase tracking-[0.32em] text-[#6F7A4B]">
                  {chatContent.emptyEyebrow}
                </p>
                <p className="mx-auto mt-4 max-w-xl text-2xl font-serif leading-tight text-[#35452C]">
                  {chatContent.emptyTitle}
                </p>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#2D2923]/70">
                  {chatContent.emptyBody}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'ml-auto bg-[#35452C] text-white'
                        : 'mr-auto bg-[#EFE7D8] text-[#2D2923]'
                    }`}
                  >
                    <p className="text-sm leading-6">{message.content}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-auto max-w-[85%] rounded-lg bg-[#EFE7D8] p-3">
                    <p className="text-sm text-[#2D2923]/60">{chatContent.loadingMessage}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chatContent.placeholder}
              className="flex-1 rounded-md border border-[#E6D8C6] bg-white px-3 py-2 text-sm text-[#2D2923] placeholder-[#2D2923]/50 focus:border-[#6F7A4B] focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-md bg-[#6F7A4B] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#35452C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
