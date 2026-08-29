import { v4 as uuid } from 'uuid';

/** Simple keyword overlap retrieval over lesson chunks (no external embedding API required). */
export function retrieveRelevantChunks(
  chunks: { id: string; content: string }[],
  question: string,
  limit = 4
): string[] {
  const qTokens = tokenize(question);
  if (!qTokens.length || !chunks.length) {
    return chunks.slice(0, limit).map((c) => c.content);
  }

  const scored = chunks.map((chunk) => {
    const cTokens = tokenize(chunk.content);
    const overlap = qTokens.filter((t) => cTokens.includes(t)).length;
    const density = overlap / Math.max(qTokens.length, 1);
    return { content: chunk.content, score: density + overlap * 0.1 };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.content);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function chunkText(text: string, size = 600): { id: string; content: string; chunk_index: number }[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const parts: { id: string; content: string; chunk_index: number }[] = [];
  for (let i = 0, idx = 0; i < cleaned.length; i += size, idx++) {
    parts.push({
      id: uuid(),
      content: cleaned.slice(i, i + size),
      chunk_index: idx,
    });
  }
  return parts;
}

function getGoogleAiApiKey(): string | undefined {
  return (
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    undefined
  );
}

function getGoogleAiModel(): string {
  return process.env.GOOGLE_AI_MODEL?.trim() || 'gemini-2.0-flash';
}

export function getAiProviderStatus() {
  const key = getGoogleAiApiKey();
  return {
    provider: 'google-ai-studio',
    configured: Boolean(key),
    model: getGoogleAiModel(),
  };
}

export async function generateTutorReply(params: {
  question: string;
  lessonTitle?: string;
  courseTitle?: string;
  lessonContent?: string;
  contextChunks?: string[];
  exerciseHint?: boolean;
}): Promise<string> {
  const apiKey = getGoogleAiApiKey();
  const system = buildSystemPrompt(params);

  if (apiKey) {
    try {
      const reply = await callGoogleAiStudio({
        apiKey,
        system,
        question: params.question,
      });
      if (reply) return reply;
    } catch (err) {
      console.error('Google AI Studio request failed:', err);
    }
  }

  return localSomaliTutor(params);
}

async function callGoogleAiStudio(opts: {
  apiKey: string;
  system: string;
  question: string;
}): Promise<string | null> {
  const model = getGoogleAiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': opts.apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: opts.system }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: opts.question }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };

  if (!res.ok) {
    console.error('Google AI Studio error:', data.error?.message || res.status);
    return null;
  }

  const text = data.candidates
    ?.flatMap((c) => c.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
    .trim();

  return text || null;
}

function buildSystemPrompt(params: {
  lessonTitle?: string;
  courseTitle?: string;
  lessonContent?: string;
  contextChunks?: string[];
  exerciseHint?: boolean;
}): string {
  const context = [
    ...(params.contextChunks || []),
    params.lessonContent?.slice(0, 2000) || '',
  ]
    .filter(Boolean)
    .join('\n---\n');

  return `You are Macallinka AI (Somali AI Tutor) for Somali students.
Rules:
1. Explain clearly in simple Somali when appropriate; keep technical terms (force, cell, atom, etc.) in English when useful.
2. Teach step-by-step. Do not overwhelm beginners.
3. For exercises, give hints before full answers. If asked for the answer immediately, first encourage understanding.
4. Explain why wrong answers are wrong.
5. Encourage students with positive feedback.
6. Stay relevant to the current lesson.
7. Keep answers concise unless the student asks for more detail.

Current course: ${params.courseTitle || 'N/A'}
Current lesson: ${params.lessonTitle || 'N/A'}
${params.exerciseHint ? 'Context: student is working on an exercise — prefer hints.' : ''}

Lesson context:
${context || 'No extra context.'}`;
}

function localSomaliTutor(params: {
  question: string;
  lessonTitle?: string;
  courseTitle?: string;
  lessonContent?: string;
  contextChunks?: string[];
  exerciseHint?: boolean;
}): string {
  const q = params.question.toLowerCase();
  const lesson = params.lessonTitle || 'casharkan';
  const course = params.courseTitle || 'koorsadan';
  const context = (params.contextChunks || []).join(' ').slice(0, 400)
    || (params.lessonContent || '').slice(0, 400);

  const wantsAnswer =
    q.includes('give me the answer') ||
    q.includes('ii sheeg jawaabta') ||
    q.includes('jawaabta sii') ||
    q.includes('what is the answer');

  if (wantsAnswer || params.exerciseHint) {
    return `Aan tallaabo tallaabo u fahamno. 💡

Marka hore, isku day inaad xasuusato fikradda ugu muhiimsan ee **${lesson}**.

${context ? `Xusuuso casharka:\n"${context.slice(0, 220)}..."\n\n` : ''}Hint: U fiirso ereyada muhiimka ah ee casharka, ka dibna isku day inaad jawaabta samayso. Haddii aad wali xumaato, weydii hint kale. Si fiican ayaad u baranaysaa! 👏

(Google AI Studio API key lama helin — geli GOOGLE_AI_API_KEY server/.env.)`;
  }

  if (q.includes('hint') || q.includes('tilmaan')) {
    return `Hint-kaagu: 🔍

Ku noqo casharka **${lesson}** ee **${course}**.

${context ? `Qaybta muhiimka ah:\n${context.slice(0, 280)}\n\n` : ''}Isku day inaad su'aasha dib u akhrido, ka dibna dooro jawaabta ku salaysan tusaalaha. Sii wad!`;
  }

  if (q.includes('tusaale') || q.includes('example')) {
    return `Halkan waa tusaale fudud oo ku saabsan **${lesson}**:

${context ? context.slice(0, 300) : 'Akhri casharka oo eeg tusaalaha ku jira.'}

Haddii aad rabto, weydii: "Ii sharax tusaalahan."`;
  }

  if (q.includes('sharax') || q.includes('explain') || q.includes('ma fahmin') || q.includes('maxay')) {
    return `Salaan! 👋 Aan kuu sharaxo **${lesson}** si fudud.

${context
      ? `Casharka wuxuu sheegayaa:\n\n${context.slice(0, 350)}\n\n`
      : `Casharkan wuxuu ka mid yahay **${course}**. Akhri qaybta ugu horreysa, ka dibna eeg tusaalaha.\n\n`}Tallaabooyin:
1. Akhri qeexitaanka ugu weyn.
2. Eeg tusaalaha.
3. Isku day inaad ereyadaada ku sheegto.

Haddii qayb gaar ah aad ka jahwareerto, ii sheeg! Si fiican ayaad u fahamaysaa. 👏`;
  }

  return `Salaan! 👋 Waxaan kaa caawinayaa casharka **${lesson}** (${course}).

${context ? `Macluumaadka casharka ee la xiriira:\n${context.slice(0, 280)}\n\n` : ''}Weydii si cad — tusaale: "Ii sharax casharkan", "I sii hint", ama "Tusaale kale ma i siin kartaa?"

Waxaan kuu jawaabi doonaa si fudud oo Somali ah. Sii wad barashada! 🌟`;
}
