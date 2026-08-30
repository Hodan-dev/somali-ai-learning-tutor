import { db } from '../db.js';
import { chunkText } from './ai.js';

export async function extractPdfText(filePath: string): Promise<string> {
  try {
    const mod = await import('pdf-parse');
    const pdfParse = (mod as { default?: (b: Buffer) => Promise<{ text: string }> }).default
      || (mod as unknown as (b: Buffer) => Promise<{ text: string }>);
    const fs = await import('fs');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return (data.text || '').trim();
  } catch {
    return '';
  }
}

export function placeholderPdfContent(title: string) {
  return `# ${title}\n\nCasharkan waxaa laga soo raray PDF. Akhri faylka PDF-ka si aad u barato.\n\n(Text extraction for AI tutor is processing in the background.)`;
}

/** Save lesson immediately; extract PDF text + chunks without blocking the upload response. */
export function queuePdfProcessing(lessonId: string, filePath: string, title: string) {
  setImmediate(() => {
    void processPdfLesson(lessonId, filePath, title);
  });
}

async function processPdfLesson(lessonId: string, filePath: string, title: string) {
  try {
    const extracted = await extractPdfText(filePath);
    const content = extracted || placeholderPdfContent(title);

    const updateLesson = db.prepare(`UPDATE lessons SET content = ? WHERE id = ?`);
    const deleteChunks = db.prepare(`DELETE FROM lesson_chunks WHERE lesson_id = ?`);
    const insertChunk = db.prepare(
      `INSERT INTO lesson_chunks (id, lesson_id, content, chunk_index) VALUES (?, ?, ?, ?)`
    );

    const chunks = chunkText(content);
    const apply = db.transaction(() => {
      updateLesson.run(content, lessonId);
      deleteChunks.run(lessonId);
      for (const ch of chunks) {
        insertChunk.run(ch.id, lessonId, ch.content, ch.chunk_index);
      }
    });
    apply();
  } catch (err) {
    console.error('Background PDF processing failed for lesson', lessonId, err);
  }
}
