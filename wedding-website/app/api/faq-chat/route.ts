import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const KNOWLEDGE_DIR = path.join(process.cwd(), 'src', 'content', 'faq-knowledge');

interface Chunk {
  content: string;
  score: number;
}

function splitByHeadings(content: string): string[] {
  const lines = content.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const line of lines) {
    if (line.startsWith('#')) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = line;
    } else {
      currentChunk += '\n' + line;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

function scoreChunk(chunk: string, question: string): number {
  const questionWords = question.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const chunkLower = chunk.toLowerCase();
  let score = 0;
  for (const word of questionWords) {
    if (chunkLower.includes(word)) {
      score++;
    }
  }
  return score;
}

async function retrieveRelevantChunks(question: string): Promise<string[]> {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(file => file.endsWith('.md'));
  const allChunks: Chunk[] = [];

  for (const file of files) {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = splitByHeadings(content);
    for (const chunk of chunks) {
      const score = scoreChunk(chunk, question);
      allChunks.push({ content: chunk, score });
    }
  }

  allChunks.sort((a, b) => b.score - a.score);
  return allChunks.slice(0, 3).map(chunk => chunk.content);
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ ok: false, error: 'Invalid message' }, { status: 400 });
    }

    const relevantChunks = await retrieveRelevantChunks(message);
    const context = relevantChunks.join('\n\n');

    const systemPrompt = `You are the guest assistant for Julia and Zach's wedding website.

Answer warmly, briefly, and clearly. Use only the provided wedding information. Do not invent details. If the provided context does not contain enough information to answer the question, say that the details are still being finalized and suggest checking back closer to the wedding date.

Keep answers under 4 sentences unless the guest asks for a list or step-by-step instructions.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${message}` },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const answer = response.choices[0]?.message?.content?.trim() || 'I apologize, but I couldn\'t generate a response.';

    return NextResponse.json({ ok: true, answer });
  } catch (error) {
    console.error('FAQ Chat API Error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}