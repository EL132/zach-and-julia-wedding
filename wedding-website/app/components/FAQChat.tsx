'use client';

import { useState, useRef, useEffect } from 'react';

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
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "When should I plan to be in Stockholm?",
    "Where will travel details be posted?",
    "How do I RSVP?",
    "Will there be things to do in Stockholm?",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-serif text-[#35452C]">Ask a Question</h2>
        <p className="text-base leading-7 text-[#2D2923]/85">
          Have a question about the wedding weekend, travel, RSVP, registry, or Stockholm details? Ask our guest assistant below.
        </p>
      </div>

      <div className="rounded-[1rem] border border-[#E6D8C6] bg-[#F8F4EA] p-6">
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-[#6F7A4B]">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="rounded-md border border-[#A8B58A] bg-white px-3 py-1 text-sm text-[#6F7A4B] hover:bg-[#A8B58A]/10 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-80 overflow-y-auto rounded-md border border-[#E6D8C6] bg-white p-4">
            {messages.length === 0 ? (
              <p className="text-[#2D2923]/60">Start a conversation by asking a question above or typing your own.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-[#6F7A4B] text-white ml-8'
                        : 'bg-[#EFE7D8] text-[#2D2923] mr-8'
                    }`}
                  >
                    <p className="text-sm leading-6">{message.content}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-[#EFE7D8] rounded-lg p-3 mr-8">
                    <p className="text-sm text-[#2D2923]/60">Thinking...</p>
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

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 rounded-md border border-[#E6D8C6] bg-white px-3 py-2 text-sm text-[#2D2923] placeholder-[#2D2923]/50 focus:border-[#6F7A4B] focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-md bg-[#6F7A4B] px-4 py-2 text-sm font-medium text-white hover:bg-[#35452C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}