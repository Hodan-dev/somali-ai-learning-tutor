import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export type ImportedLesson = {
  title: string;
  description: string;
  content: string;
  pdf_start_page: number;
  pdf_end_page: number;
};

export type BookImportResult = {
  numPages: number;
  lessons: ImportedLesson[];
  hasText: boolean;
};

function cleanPdfText(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/\f/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function titleCase(line: string) {
  const t = line.trim().replace(/\s+/g, ' ');
  if (t.length < 4 || t.length > 120) return '';
  if (!/[A-Za-z]/.test(t)) return '';
  if (/^page\s+\d+/i.test(t)) return '';
  return t;
}

function splitByHeadings(text: string, bookTitle: string, pagesPerLesson: number): ImportedLesson[] {
  const lines = text.split('\n');
  const sections: Array<{ title: string; body: string[] }> = [];
  let currentTitle = `${bookTitle} — Introduction`;
  let currentBody: string[] = [];

    const headingRe = /^(CHAPTER|UNIT|LESSON|TOPIC|Section|PART)\s*[\d.:)\-]+/i;

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeading =
      headingRe.test(trimmed) ||
      (/^\d+(\.\d+)*\s+[A-Z]/.test(trimmed) && trimmed.length < 100);

    if (isHeading && currentBody.length > 80) {
      sections.push({ title: currentTitle, body: currentBody });
      currentTitle = titleCase(trimmed) || currentTitle;
      currentBody = [];
      continue;
    }
    if (isHeading && currentBody.length <= 80) {
      const next = titleCase(trimmed);
      if (next) currentTitle = next;
      continue;
    }
    if (trimmed) currentBody.push(trimmed);
  }
  if (currentBody.length) sections.push({ title: currentTitle, body: currentBody });

  if (sections.length >= 2) {
    return sections
      .filter((s) => s.body.join(' ').length > 120)
      .map((s, i) => {
        const body = s.body.join('\n\n');
        const excerpt = body.slice(0, 160).replace(/\s+/g, ' ').trim();
        return {
          title: s.title,
          description: excerpt,
          content: formatLessonMarkdown(s.title, body, i + 1, sections.length),
          pdf_start_page: 1,
          pdf_end_page: 1,
        };
      });
  }

  return splitByPageChunks(text, bookTitle, pagesPerLesson, text.length);
}

function splitByPageChunks(
  _text: string,
  bookTitle: string,
  pagesPerLesson: number,
  numPages: number
): ImportedLesson[] {
  const lessons: ImportedLesson[] = [];
  const totalParts = Math.max(1, Math.ceil(numPages / pagesPerLesson));

  for (let i = 0; i < totalParts; i++) {
    const start = i * pagesPerLesson + 1;
    const end = Math.min(numPages, (i + 1) * pagesPerLesson);
    const part = i + 1;
    const title = `${bookTitle} — Qaybta ${part}`;
    lessons.push({
      title,
      description: `Akhri bogagga ${start}–${end} ee buugga manhajka.`,
      content: formatPageLessonMarkdown(bookTitle, part, totalParts, start, end),
      pdf_start_page: start,
      pdf_end_page: end,
    });
  }
  return lessons;
}

function formatLessonMarkdown(title: string, body: string, part: number, total: number) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/\n/g, ' '));

  const formatted = paragraphs.map((p) => (p.length > 20 ? `${p}\n` : '')).join('\n');

  return `# ${title}

**Qaybta ${part} ee ${total}** — Manhajka rasmiga ah

## Akhriska casharka

${formatted}

---

## Kadib akhriska

- Dib u eeg qodobbada muhiimka ah
- Qor kooban oo aad fahantay
- Calaamadee casharka markaad dhammeyso
- Gudbi layliga haddii uu jiro

> **Talo:** Haddii qoraalku aanu cadayn, isticmaal PDF-ka hoose si aad u aragto bogagga asalka ah.`;
}

function formatPageLessonMarkdown(
  bookTitle: string,
  part: number,
  total: number,
  start: number,
  end: number
) {
  return `# ${bookTitle}

**Qaybta ${part} ee ${total}** · Bogag **${start}–${end}**

## Ujeeddooyinka casharka

Casharkan wuxuu ka mid yahay **Manhajka** rasmiga ah ee **${bookTitle}**. Waxaad akhrin doontaa bogagga **${start} ilaa ${end}** ee buugga PDF-ka.

## Hagitaan akhris

1. **Diyaar garow** — Hel buug qoraal, qalin, iyo waqti nabdoon.
2. **Akhri si taxaddar leh** — Bog kasta u akhri ilaa aad fahanto mawduuca.
3. **Qor qoraallo** — Qor erayada cusub, qaababka, iyo tusaalooyinka muhiimka ah.
4. **Isweydii** — Isweydii su'aalo ku saabsan waxaad akhrisay.
5. **Dib u eeg** — Dib u akhri qaybaha aadan si fiican u fahmin.

## Waxa aad ka filan karto bogagan

Bogaggan waxay dabooli karaan mawduucyo cusub, tusaalooyin, sawirro, iyo layliyo ku jira manhajka dugsiga. Akhri PDF-ka hoose si aad u aragto qoraalka iyo sawirrada asalka ah.

## Layli kadib akhriska

Markaad dhammeyso bogagga **${start}–${end}**:

- Isku day inaad koobid waxaad baratay hal weedh
- Weydii macallinka AI haddii aad xaglo ku xayirantahay
- Calaamadee casharka **Mark as Completed**

---

> **Manhajka:** ${bookTitle} — Bogag ${start}–${end}`;
}

export async function analyzePdf(filePath: string): Promise<{ text: string; numPages: number }> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  return { text: cleanPdfText(data.text || ''), numPages: data.numpages || 1 };
}

export function buildLessonsFromPdf(
  bookTitle: string,
  text: string,
  numPages: number,
  pagesPerLesson: number
): BookImportResult {
  const minCharsPerPage = 40;
  const hasText = text.length >= numPages * minCharsPerPage;

  if (hasText) {
    const byHeading = splitByHeadings(text, bookTitle, pagesPerLesson);
    if (byHeading.length >= 2) {
      return { numPages, lessons: byHeading, hasText: true };
    }
    const chunkSize = 4500;
    const lessons: ImportedLesson[] = [];
    let offset = 0;
    let part = 1;
    while (offset < text.length) {
      let end = Math.min(text.length, offset + chunkSize);
      if (end < text.length) {
        const breakAt = text.lastIndexOf('\n\n', end);
        if (breakAt > offset + 1500) end = breakAt;
      }
      const slice = text.slice(offset, end).trim();
      const title = `${bookTitle} — Cutubka ${part}`;
      lessons.push({
        title,
        description: slice.slice(0, 160).replace(/\s+/g, ' '),
        content: formatLessonMarkdown(title, slice, part, Math.ceil(text.length / chunkSize)),
        pdf_start_page: 1,
        pdf_end_page: numPages,
      });
      offset = end;
      part += 1;
    }
    return { numPages, lessons, hasText: true };
  }

  return {
    numPages,
    lessons: splitByPageChunks(text, bookTitle, pagesPerLesson, numPages),
    hasText: false,
  };
}

export function copyPdfToUploads(sourcePath: string, uploadDir: string) {
  fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `${path.basename(sourcePath, path.extname(sourcePath)).replace(/[^a-zA-Z0-9._-]+/g, '_')}-${Date.now()}.pdf`;
  const dest = path.join(uploadDir, filename);
  fs.copyFileSync(sourcePath, dest);
  return `/uploads/${filename}`;
}
