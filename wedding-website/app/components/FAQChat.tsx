'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { chatContent } from '@/app/content/site';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function ConciergeAvatar() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#35452C] font-serif text-sm text-[#F8F4EA]">
      J&amp;Z
    </div>
  );
}

function LoadingText() {
  const [dotCount, setDotCount] = useState(3);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDotCount((current) => (current === 3 ? 1 : current + 1));
    }, 520);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <span>
      {chatContent.loadingMessage}
      {".".repeat(dotCount)}
    </span>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayedText(text);
      return;
    }

    const segments = text.match(/\S+\s*/g) ?? [text];
    let index = 0;
    setDisplayedText('');

    const interval = window.setInterval(() => {
      index += 1;
      setDisplayedText(segments.slice(0, index).join(''));

      if (index >= segments.length) {
        window.clearInterval(interval);
      }
    }, 28);

    return () => window.clearInterval(interval);
  }, [text]);

  return <>{displayedText}</>;
}

function FallbackEvidenceCard() {
  return (
    <figure className="mt-4 max-w-[18rem] rounded-sm border border-[#A8B58A]/35 bg-[#F8F4EA]/72 p-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[0.15rem] bg-[#EFE7D8]">
        <Image
          src={chatContent.fallbackImage.src}
          alt={chatContent.fallbackImage.alt}
          fill
          sizes="(min-width: 640px) 18rem, 72vw"
          className="object-cover"
        />
      </div>
      <figcaption className="px-1 pt-2 text-[0.68rem] uppercase tracking-[0.18em] text-[#6F7A4B]">
        Evidence from the investigation
      </figcaption>
    </figure>
  );
}

export default function FAQChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
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
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
      <aside className="rounded-md border border-[#A8B58A]/40 bg-[#EFE7D8]/45 p-6 sm:p-7">
        <p className="font-serif text-3xl leading-tight text-[#35452C]">
          {chatContent.commonQuestionsTitle}
        </p>
        <p className="mt-3 text-sm leading-7 text-[#2D2923]/76">
          {chatContent.commonQuestionsIntro}
        </p>

        <div className="mt-6 grid gap-3">
          {chatContent.suggestedQuestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isLoading}
              onClick={() => void sendMessage(prompt)}
              className="rounded-sm border border-[#A8B58A]/55 bg-[#F8F4EA]/55 px-4 py-3 text-left text-sm leading-6 text-[#35452C] transition-colors hover:border-[#35452C]/45 hover:bg-[#F8F4EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6F7A4B]/35 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {prompt}
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8] p-5 sm:p-6">
        <div className="mb-5 border-b border-[#A8B58A]/35 pb-5">
          <div className="flex items-start gap-4">
            <ConciergeAvatar />
            <div>
              <h2 className="font-serif text-3xl leading-tight text-[#35452C]">
                {chatContent.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#2D2923]/76">
                {chatContent.intro}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div
            aria-live="polite"
            className="h-[28rem] overflow-y-auto rounded-md border border-[#A8B58A]/35 bg-[#F8F4EA] p-4 sm:p-5"
          >
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[18rem] flex-col justify-center">
                <div className="mx-auto max-w-sm text-center">
                  <div className="mx-auto flex justify-center">
                    <ConciergeAvatar />
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.24em] text-[#6F7A4B]">
                    {chatContent.emptyEyebrow}
                  </p>
                  <p className="mt-3 font-serif text-2xl leading-tight text-[#35452C]">
                    {chatContent.emptyTitle}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#2D2923]/68">
                    {chatContent.emptyBody}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message, index) => (
                  message.role === 'assistant' ? (
                    <div key={index} className="flex items-start gap-3">
                      <ConciergeAvatar />
                      <div className="max-w-[88%]">
                        <p className="mb-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#6F7A4B]">
                          Guest Concierge
                        </p>
                        <div className="rounded-md border border-[#A8B58A]/35 bg-[#EFE7D8]/72 px-4 py-3 text-[#2D2923]">
                          <p className="text-sm leading-7">
                            <TypewriterText text={message.content} />
                          </p>
                          {message.content === chatContent.fallbackResponse ? (
                            <FallbackEvidenceCard />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="ml-auto max-w-[85%] rounded-md bg-[#35452C] px-4 py-3 text-[#F8F4EA]">
                      <p className="text-sm leading-7">{message.content}</p>
                    </div>
                  )
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <ConciergeAvatar />
                    <div className="max-w-[88%] rounded-md border border-[#A8B58A]/35 bg-[#EFE7D8]/72 px-4 py-3">
                      <p className="text-sm leading-7 text-[#2D2923]/70">
                        <LoadingText />
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-[#D8B8A6]/55 bg-[#D8B8A6]/18 p-3">
              <p className="text-sm leading-6 text-[#2D2923]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <label htmlFor="faq-question" className="sr-only">
              Ask the guest concierge
            </label>
            <input
              id="faq-question"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chatContent.placeholder}
              className="rounded-sm border border-[#A8B58A]/45 bg-[#F8F4EA] px-4 py-3 text-sm text-[#2D2923] placeholder-[#2D2923]/50 focus:border-[#6F7A4B] focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-sm border border-[#35452C] bg-[#35452C] px-5 py-3 text-sm font-medium text-[#F8F4EA] transition-colors hover:bg-[#2D2923] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
