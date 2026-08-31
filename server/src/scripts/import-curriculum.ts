import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { connectDb, disconnectDb } from '../db.js';
import { Course, Enrollment, Lesson, LessonChunk, Module, User } from '../models/index.js';
import { chunkText } from '../services/ai.js';
import { analyzePdf, buildLessonsFromPdf, copyPdfToUploads } from '../services/pdfImport.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, '..', '..', 'content', 'curriculum', 'manifest.json');
const pdfDir = path.join(__dirname, '..', '..', 'content', 'pdfs');
const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');

type ManifestEntry = {
  sourceFile: string;
  windowsPath?: string;
  title: string;
  category: string;
  form: string;
  pagesPerLesson: number;
};

function resolvePdfPath(entry: ManifestEntry, extraPaths: string[]) {
  const candidates = [
    ...extraPaths.map((p) => path.resolve(p)),
    path.join(pdfDir, entry.sourceFile),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function importBook(entry: ManifestEntry, pdfPath: string) {
  console.log(`\n📘 Importing: ${entry.title}`);
  console.log(`   PDF: ${pdfPath}`);

  const { text, numPages } = await analyzePdf(pdfPath);
  const { lessons, hasText } = buildLessonsFromPdf(entry.title, text, numPages, entry.pagesPerLesson);
  const pdfUrl = copyPdfToUploads(pdfPath, uploadDir);

  console.log(`   Pages: ${numPages} | Lessons: ${lessons.length} | Text extracted: ${hasText ? 'yes' : 'page-based'}`);

  let course = await Course.findOne({ title: entry.title }).lean();
  let courseId = course?._id;

  if (!courseId) {
    courseId = uuid();
    await Course.create({
      _id: courseId,
      title: entry.title,
      description: `${entry.form} Manhajka — ${entry.category}`,
      category: entry.category,
      difficulty: entry.form,
      sequential: true,
    });
  } else {
    await Course.updateOne(
      { _id: courseId },
      { description: `${entry.form} Manhajka — ${entry.category}`, difficulty: entry.form }
    );
  }

  const moduleTitle = `${entry.form} — Manhajka Buugga`;
  let mod = await Module.findOne({ course_id: courseId, title: moduleTitle }).lean();
  let moduleId = mod?._id;

  if (!moduleId) {
    moduleId = uuid();
    await Module.create({
      _id: moduleId,
      course_id: courseId,
      title: moduleTitle,
      sort_order: 0,
    });
  }

  const existingLessons = await Lesson.find({ module_id: moduleId }).select('_id').lean();
  if (existingLessons.length) {
    const ids = existingLessons.map((l) => l._id);
    await LessonChunk.deleteMany({ lesson_id: { $in: ids } });
    await Lesson.deleteMany({ module_id: moduleId });
  }

  for (let i = 0; i < lessons.length; i++) {
    const les = lessons[i];
    const lessonId = uuid();

    let startPage = les.pdf_start_page;
    let endPage = les.pdf_end_page;
    if (!hasText) {
      startPage = les.pdf_start_page;
      endPage = les.pdf_end_page;
    } else {
      const perLesson = Math.max(1, Math.ceil(numPages / lessons.length));
      startPage = i * perLesson + 1;
      endPage = Math.min(numPages, (i + 1) * perLesson);
    }

    await Lesson.create({
      _id: lessonId,
      module_id: moduleId,
      title: les.title,
      description: les.description,
      content: les.content,
      pdf_url: pdfUrl,
      pdf_start_page: startPage,
      pdf_end_page: endPage,
      content_extracted: true,
      sort_order: i,
      status: 'published',
    });

    await LessonChunk.insertMany(
      chunkText(les.content).map((ch) => ({
        lesson_id: lessonId,
        content: ch.content,
        chunk_index: ch.chunk_index,
      }))
    );
  }

  const students = await User.find({ role: 'STUDENT' }).select('_id').lean();
  for (const s of students) {
    await Enrollment.findOneAndUpdate(
      { student_id: s._id, course_id: courseId },
      { student_id: s._id, course_id: courseId },
      { upsert: true }
    );
  }

  console.log(`   ✅ Created ${lessons.length} lessons in course "${entry.title}"`);
}

async function main() {
  const extraPaths = process.argv.slice(2).filter((a) => a.endsWith('.pdf'));
  const manifest: ManifestEntry[] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  await connectDb();
  fs.mkdirSync(pdfDir, { recursive: true });

  let imported = 0;
  const missing: string[] = [];

  for (const entry of manifest) {
    const pdfPath = resolvePdfPath(entry, extraPaths.filter((p) => p.includes(entry.sourceFile)));
    if (!pdfPath) {
      missing.push(entry.sourceFile);
      console.warn(`⚠️  Missing PDF: ${entry.sourceFile}`);
      console.warn(`   Copy to: server/content/pdfs/${entry.sourceFile}`);
      if (entry.windowsPath) console.warn(`   From: ${entry.windowsPath}`);
      continue;
    }
    await importBook(entry, pdfPath);
    imported += 1;
  }

  console.log(`\nDone. Imported ${imported}/${manifest.length} books.`);
  if (missing.length) {
    console.log('\nTo import on Windows, copy your PDFs then run:');
    console.log('  npm run import:curriculum');
    console.log('\nMissing files:');
    for (const f of missing) console.log(`  - ${f}`);
  }

  await disconnectDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
