import { GoogleGenAI } from '@google/genai';

export class GeminiServiceError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = 'GeminiServiceError';
    this.statusCode = statusCode;
  }
}

let client: GoogleGenAI | null = null;

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL?.trim(),
  'gemini-3.6-flash',
  'gemini-3.5-flash',
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

export function getGeminiModel(): string {
  return MODEL_CANDIDATES[0] || 'gemini-3.5-flash';
}

export function getGeminiStatus() {
  return {
    provider: 'google-ai-studio',
    sdk: '@google/genai',
    configured: Boolean(getGeminiApiKey()),
    model: getGeminiModel(),
  };
}

function getClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiServiceError(
      'GEMINI_API_KEY is not configured. Add it to server/.env (never in the frontend).',
      503
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export async function generateGeminiReply(params: {
  systemInstruction: string;
  question: string;
}): Promise<string> {
  const ai = getClient();
  let lastError: unknown;

  for (const model of MODEL_CANDIDATES.length ? MODEL_CANDIDATES : ['gemini-3.5-flash']) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.question,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: 0.6,
          maxOutputTokens: 1024,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new GeminiServiceError('Gemini returned an empty response.', 502);
      }
      return text;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable = /503|429|high demand|UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(message);
      if (!isRetryable) break;
      console.warn(`Gemini model ${model} unavailable, trying next model...`);
    }
  }

  if (lastError instanceof GeminiServiceError) throw lastError;

  const message = lastError instanceof Error ? lastError.message : 'Unknown Gemini API error';
  console.error('Gemini API error:', message);
  throw new GeminiServiceError(`Gemini request failed: ${message}`, 502);
}
