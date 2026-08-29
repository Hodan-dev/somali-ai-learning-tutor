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

export async function generateTutorReply(params: {
  question: string;
  lessonTitle?: string;
  courseTitle?: string;
  lessonContent?: string;
  contextChunks?: string[];
  exerciseHint?: boolean;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const system = buildSystemPrompt(params);

  if (apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.6,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: params.question },
          ],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // fall through to local tutor
    }
  }

  return localSomaliTutor(params);
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
1. Explain clearly in simple Somali when appropriate; keep technical terms (HTML, force, cell, etc.) in English when useful.
2. Teach step-by-step. Do not overwhelm beginners.
3. For exercises, give hints before full answers. If asked for the answer immediately, first encourage understanding.
4. Explain why wrong answers are wrong.
5. Encourage students with positive feedback.
6. Stay relevant to the current lesson.

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

${context ? `Xusuuso casharka:\n"${context.slice(0, 220)}..."\n\n` : ''}Hint: U fiirso ereyada muhiimka ah ee casharka, ka dibna isku day inaad jawaabta samayso. Haddii aad wali xumaato, weydii hint kale. Si fiican ayaad u baranaysaa! 👏`;
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
