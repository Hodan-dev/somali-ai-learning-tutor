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

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || process.env.GOOGLE_AI_MODEL?.trim() || 'gemini-2.0-flash';
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
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
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
    if (err instanceof GeminiServiceError) throw err;

    const message = err instanceof Error ? err.message : 'Unknown Gemini API error';
    console.error('Gemini API error:', message);
    throw new GeminiServiceError(`Gemini request failed: ${message}`, 502);
  }
}
