import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { db, initDb } from './db.js';
import { chunkText } from './services/ai.js';

type QType = 'multiple_choice' | 'true_false' | 'short_answer';

interface SeedQuestion {
  question: string;
  type: QType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

interface SeedLesson {
  title: string;
  description: string;
  content: string;
  questions: SeedQuestion[];
}

interface SeedModule {
  title: string;
  lessons: SeedLesson[];
}

interface SeedCourse {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  modules: SeedModule[];
}

const courses: SeedCourse[] = [
  {
    title: 'Physics Basics',
    description: 'Baro aasaaska fiisigiska: dhaqdhaqaaqa, xoogga, tamarta, iyo mawjado.',
    category: 'Physics',
    difficulty: 'Beginner',
    modules: [
      {
        title: 'Module 1 — Introduction to Physics',
        lessons: [
          {
            title: 'What is Physics?',
            description: 'Hordhac ku saabsan fiisigiska',
            content: `# What is Physics?

**Physics** waa cilmiga daraaseeya dabeecadda, maadada, tamarta, iyo sida waxyaabuhu u dhaqmaan.

## Maxay Physics u muhiim tahay?

Physics waxay naga caawisaa inaan fahanno:
- Sidee u dhaqaaqaan shayada
- Maxay yihiin xoogagga (forces)
- Sidee tamar (energy) u isbeddeshaa
- Sidee iftiinka iyo dhawaaqa u shaqeeyaan

## Tusaale maalinle ah

Markaad kubbad tuurto, gravity ayaa soo dejisa. Taasi waa physics!

> **Xusuus:** Physics waa luuqadda dabeecadda — waxay sharaxdaa "maxaa dhacaya" iyo "maxaa keenay".

## Ereyada muhiimka ah
| English | Somali |
|---------|--------|
| Force | Xoog |
| Motion | Dhaqdhaqaaq |
| Energy | Tamar |
| Mass | Cuf |`,
            questions: [
              {
                question: 'Physics waxay ugu horrayn daraaseysaa:',
                type: 'multiple_choice',
                options: ['Cuntada', 'Dabeecadda iyo dhaqdhaqaaqa', 'Luqadaha', 'Taariikhda'],
                correctAnswer: 'Dabeecadda iyo dhaqdhaqaaqa',
                explanation: 'Physics waa cilmiga dabeecadda, maadada, iyo tamarta.',
                hint: 'Ka fikir waxa ku saabsan xoogga iyo dhaqdhaqaaqa.',
              },
              {
                question: 'Gravity waa tusaale physics ah.',
                type: 'true_false',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'Haa — gravity waa xoog muhiim ah oo physics daraaseyso.',
                hint: 'Markaad shay tuurto, maxaa soo dejiya?',
              },
            ],
          },
          {
            title: 'Motion and Speed',
            description: 'Faham dhaqdhaqaaqa iyo xawaaraha',
            content: `# Motion and Speed

**Motion** waa marka shay meel uu ka beddelo.

## Speed (Xawaare)

Speed = Distance ÷ Time

Tusaale:
Haddii baabuur uu socdo 100 km 2 saacadood:
Speed = 100 ÷ 2 = **50 km/h**

## Velocity vs Speed

- **Speed**: xawaare oo keliya (magnitude)
- **Velocity**: xawaare + jihada (direction)

## Acceleration

Acceleration waa isbeddelka xawaaraha waqti gudihiisa.

> **Muhiim:** Haddii xawaaruhu isbeddelo, acceleration ayaa jirta.`,
            questions: [
              {
                question: 'Formula-ga speed waa:',
                type: 'multiple_choice',
                options: ['Distance × Time', 'Distance ÷ Time', 'Mass × Velocity', 'Force ÷ Area'],
                correctAnswer: 'Distance ÷ Time',
                explanation: 'Speed = Distance ÷ Time.',
                hint: 'Distance iyo time — sidee ayaad u qaybisaa?',
              },
            ],
          },
          {
            title: 'Forces and Newton',
            description: 'Xoogagga iyo xeerarka Newton',
            content: `# Forces and Newton

**Force** waa riix ama jiid oo beddeli kara dhaqdhaqaaqa shay.

## Newton’s First Law

Shay wuu istaagi doonaa ama sii socon doonaa ilaa xoog uu beddelo.

## Newton’s Second Law

**F = m × a**
Force = mass × acceleration

## Newton’s Third Law

Wixii aad riixdo, isna wuu kuu riixayaa (action–reaction).

### Tusaale
Markaad dhulka riixdo (jump), dhulku wuu kuu riixayaa kor.`,
            questions: [
              {
                question: 'F = m × a waxay ka dhigan tahay:',
                type: 'multiple_choice',
                options: ['Force = mass × acceleration', 'Force = mass ÷ acceleration', 'Speed = force × time', 'Energy = mass × light'],
                correctAnswer: 'Force = mass × acceleration',
                explanation: 'Newton’s second law: F = m × a.',
                hint: 'F, m, iyo a — maxay u taagan yihiin?',
              },
            ],
          },
        ],
      },
      {
        title: 'Module 2 — Energy',
        lessons: [
          {
            title: 'Types of Energy',
            description: 'Noocyada tamarta',
            content: `# Types of Energy

**Energy** waa awoodda shaqada (work) la qabto.

## Noocyada ugu muhiimsan
1. **Kinetic energy** — tamar dhaqdhaqaaq
2. **Potential energy** — tamar kaydsan (position)
3. **Thermal energy** — kulayl
4. **Chemical energy** — tamar ku jirta walxaha

## Conservation of Energy

Tamarta lama abuuro ama baabbi’in — waxay isbeddeshaa nooc kale.

> Tusaale: Ball oo buur ka soo dhacaya — potential → kinetic.`,
            questions: [
              {
                question: 'Kinetic energy waa:',
                type: 'multiple_choice',
                options: ['Tamar kaydsan', 'Tamar dhaqdhaqaaq', 'Iftiin kaliya', 'Culeys'],
                correctAnswer: 'Tamar dhaqdhaqaaq',
                explanation: 'Kinetic energy waa tamar la xiriirta dhaqdhaqaaqa.',
                hint: 'Kinetic waxay la xiriirtaa motion.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Biology Basics',
    description: 'Baro unugyada, jirka, ecosystems, iyo aasaaska nolosha.',
    category: 'Biology',
    difficulty: 'Beginner',
    modules: [
      {
        title: 'Module 1 — Cells',
        lessons: [
          {
            title: 'What is a Cell?',
            description: 'Unugga nolosha',
            content: `# What is a Cell?

**Cell** waa unugga ugu yar ee nolosha. Dhammaan nooluhu waxay ka samaysan yihiin cells.

## Qaybaha ugu muhiimsan
- **Cell membrane** — gidaarka ilaaliya
- **Cytoplasm** — dareeraha gudaha
- **Nucleus** — xakameeya cell-ka (DNA)

## Noocyada
1. **Prokaryotic** — nucleus ma laha (bacteria)
2. **Eukaryotic** — nucleus leh (xayawaanka iyo dhirta)

> **Xusuus:** Cell waa “brick-ga” nolosha.`,
            questions: [
              {
                question: 'Unugga ugu yar ee nolosha waa:',
                type: 'multiple_choice',
                options: ['Organ', 'Cell', 'Tissue', 'Atom'],
                correctAnswer: 'Cell',
                explanation: 'Cell waa basic unit of life.',
                hint: 'Brick-ga nolosha maxaa la yiraahdaa?',
              },
              {
                question: 'Nucleus-ku wuxuu hayaa DNA.',
                type: 'true_false',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'Nucleus waa xarunta xakamaynta oo DNA ku jiro.',
                hint: 'Xarunta control-ka cell-ka?',
              },
            ],
          },
          {
            title: 'Plant vs Animal Cells',
            description: 'Kala duwanaanshaha unugyada',
            content: `# Plant vs Animal Cells

## Wadaagaan
- Nucleus
- Cytoplasm
- Cell membrane
- Mitochondria

## Plant cells oo keliya
- **Cell wall**
- **Chloroplasts** (photosynthesis)
- Vacuole weyn

## Animal cells oo keliya
- Ma laha cell wall
- Ma laha chloroplasts
- Vacuole yar ama ma jiro

> Plants waxay sameeyaan cuntadooda iftiin isticmaalaya (photosynthesis).`,
            questions: [
              {
                question: 'Chloroplasts waxaa laga helaa:',
                type: 'multiple_choice',
                options: ['Animal cells', 'Plant cells', 'Virus only', 'Rocks'],
                correctAnswer: 'Plant cells',
                explanation: 'Chloroplasts waxay ku jiraan plant cells oo photosynthesis sameeya.',
                hint: 'Yaa sameeya cunto iftiin ku?',
              },
            ],
          },
        ],
      },
      {
        title: 'Module 2 — Human Body',
        lessons: [
          {
            title: 'Digestive System',
            description: 'Nidaamka dheef-shiidka',
            content: `# Digestive System

Nidaamka dheef-shiidku wuxuu jajabiyaa cuntada si jirku u qaato nafaqooyinka.

## Tallaabooyinka
1. **Mouth** — calaalid
2. **Esophagus** — u gudbinta caloosha
3. **Stomach** — digestiin xooggan
4. **Small intestine** — nuugista nafaqada
5. **Large intestine** — biyo iyo qashin

> **Enzymes** waxay caawiyaan jajabinta cuntada.`,
            questions: [
              {
                question: 'Nafaqada intooda badan waxaa lagu nuugaa:',
                type: 'multiple_choice',
                options: ['Mouth', 'Stomach', 'Small intestine', 'Large intestine'],
                correctAnswer: 'Small intestine',
                explanation: 'Small intestine waa meesha ugu badan ee nutrients la nuugo.',
                hint: 'Ka dib caloosha, xiidmaha yaryar...',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'English Basics',
    description: 'Baro grammar, vocabulary, reading, iyo qorista aasaasiga ah.',
    category: 'English',
    difficulty: 'Beginner',
    modules: [
      {
        title: 'Module 1 — Grammar Foundations',
        lessons: [
          {
            title: 'Nouns and Pronouns',
            description: 'Magacyada iyo pronouns',
            content: `# Nouns and Pronouns

## Noun
Noun waa magac qof, meel, shay, ama fikrad.
Tusaale: **student**, **Mogadishu**, **book**, **happiness**

## Pronoun
Pronoun wuxuu beddelaa noun si aan dib u soo celin.
Tusaale: **I, you, he, she, it, we, they**

### Tusaale
- Amina is a student. → **She** is a student.
- The books are new. → **They** are new.

> **Tip:** Pronouns waxay sameeyaan jumlado gaaban oo cad.`,
            questions: [
              {
                question: 'Which word is a pronoun?',
                type: 'multiple_choice',
                options: ['school', 'they', 'happy', 'quickly'],
                correctAnswer: 'they',
                explanation: '"They" waa pronoun oo beddeli kara nouns.',
                hint: 'Which word can replace "the students"?',
              },
              {
                question: '"Mogadishu" is a noun.',
                type: 'true_false',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'Mogadishu waa magac meel — noun.',
                hint: 'Is it a place name?',
              },
            ],
          },
          {
            title: 'Simple Present Tense',
            description: 'Present simple',
            content: `# Simple Present Tense

Waxaa loo isticmaalaa:
- caadooyin (habits)
- xaqiiqooyin (facts)
- jadwal

## Structure
- I / You / We / They + verb
- He / She / It + verb + **s**

### Tusaale
- I **study** every day.
- She **studies** English.
- Water **boils** at 100°C.

> Negative: do not / does not + verb
> Question: Do / Does + subject + verb?`,
            questions: [
              {
                question: 'Choose the correct sentence:',
                type: 'multiple_choice',
                options: ['She study English.', 'She studies English.', 'She studying English.', 'She studieds English.'],
                correctAnswer: 'She studies English.',
                explanation: 'He/She/It waxay qaataan verb + s present simple.',
                hint: 'Look at the subject "She".',
              },
            ],
          },
          {
            title: 'Basic Vocabulary — School',
            description: 'Ereyada dugsiga',
            content: `# Basic Vocabulary — School

| English | Somali | Example |
|---------|--------|---------|
| Lesson | Cashar | I have a lesson now. |
| Exercise | Layli | Complete the exercise. |
| Teacher | Macallin | My teacher is kind. |
| Student | Arday | She is a student. |
| Homework | Shaqo guriga | I finished my homework. |
| Classroom | Fasalka | We are in the classroom. |

### Practice sentences
1. The **student** asks a **question**.
2. Please **submit** your **answer**.
3. Let’s **continue** to the next **lesson**.`,
            questions: [
              {
                question: 'What is the Somali word for "Exercise"?',
                type: 'short_answer',
                correctAnswer: 'Layli',
                explanation: 'Exercise = Layli.',
                hint: 'Ka eeg jadwalka vocabulary.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Chemistry Basics',
    description: 'Baro atoms, elements, compounds, iyo falcelinta kiimikada.',
    category: 'Chemistry',
    difficulty: 'Beginner',
    modules: [
      {
        title: 'Module 1 — Atoms and Elements',
        lessons: [
          {
            title: 'What is an Atom?',
            description: 'Aasaaska maadada',
            content: `# What is an Atom?

**Atom** waa unugga ugu yar ee element.

## Qaybaha atom-ka
- **Proton** (+) — nucleus
- **Neutron** (0) — nucleus
- **Electron** (−) — wareega nucleus

## Element
Element waa walax ka samaysan nooc atom ah oo keliya.
Tusaale: **H** (Hydrogen), **O** (Oxygen), **C** (Carbon), **Fe** (Iron)

> Periodic table waa jadwalka elements.`,
            questions: [
              {
                question: 'Electron-ku wuxuu leeyahay charge:',
                type: 'multiple_choice',
                options: ['Positive', 'Negative', 'Zero', 'None'],
                correctAnswer: 'Negative',
                explanation: 'Electrons waxay leeyihiin negative charge.',
                hint: 'Proton +, neutron 0, electron...?',
              },
              {
                question: 'Atom waa unugga ugu yar ee element.',
                type: 'true_false',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'Haa — atom waa basic unit of an element.',
                hint: 'Ka fikir qeexitaanka atom.',
              },
            ],
          },
          {
            title: 'Elements and Compounds',
            description: 'Elements vs compounds',
            content: `# Elements and Compounds

## Element
Nooc atom ah oo keliya. Tusaale: O₂ weli waa oxygen element (molecule of oxygen).

## Compound
Labo ama in ka badan oo elements ah oo chemically bonded.
Tusaale: **H₂O** (water) = Hydrogen + Oxygen

## Mixture vs Compound
- **Mixture**: isku darka jireed (salt + water) — si fudud ayaa loo kala saari karaa
- **Compound**: bond kiimiko — sifooyin cusub

> Water ma aha hydrogen kaliya ama oxygen kaliya — waa compound.`,
            questions: [
              {
                question: 'H₂O waa:',
                type: 'multiple_choice',
                options: ['Element', 'Compound', 'Proton', 'Electron'],
                correctAnswer: 'Compound',
                explanation: 'Water waa compound ka samaysan H iyo O.',
                hint: 'Ma ka kooban tahay in ka badan oo element ah?',
              },
            ],
          },
        ],
      },
      {
        title: 'Module 2 — Reactions',
        lessons: [
          {
            title: 'Chemical Reactions Intro',
            description: 'Hordhac falcelinta',
            content: `# Chemical Reactions Intro

**Chemical reaction** waa marka walxuhu isbeddelaan oo compounds cusub sameeyaan.

## Calaamadaha reaction
- Kulayl ama iftiin
- Midab beddel
- Gaas soo baxa
- Solid (precipitate) sameysma

## Equation fudud
Reactants → Products

Tusaale:
2H₂ + O₂ → 2H₂O

> Atoms lama baabbi’iyo — waxay dib u abaabulaan (conservation of mass).`,
            questions: [
              {
                question: 'In a reaction, reactants waxay noqdaan:',
                type: 'multiple_choice',
                options: ['Products', 'Protons only', 'Mixtures only', 'Temperature'],
                correctAnswer: 'Products',
                explanation: 'Reactants → Products.',
                hint: 'Eeg jihada arrow-ga equation-ka.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Mathematics Basics',
    description: 'Baro algebra, geometry, iyo statistics aasaasiga ah.',
    category: 'Mathematics',
    difficulty: 'Beginner',
    modules: [
      {
        title: 'Module 1 — Algebra',
        lessons: [
          {
            title: 'Variables and Expressions',
            description: 'Variables iyo expressions',
            content: `# Variables and Expressions

**Variable** waa xaraf matala tiro aan la aqoon (sida **x**, **y**).

## Expression
Isku darka tirooyin, variables, iyo operations.
Tusaale: **3x + 5**

## Evaluating
Haddii x = 2:
3(2) + 5 = 6 + 5 = **11**

## Like terms
2x + 3x = 5x

> Algebra waxay kaa caawisaa inaad xallisato problems adag si nidaamsan.`,
            questions: [
              {
                question: 'Haddii x = 4, qiimaha 2x + 1 waa:',
                type: 'multiple_choice',
                options: ['7', '8', '9', '5'],
                correctAnswer: '9',
                explanation: '2(4)+1 = 8+1 = 9.',
                hint: 'Beddel x = 4 marka hore.',
              },
              {
                question: 'Variable waa xaraf matala tiro.',
                type: 'true_false',
                options: ['True', 'False'],
                correctAnswer: 'True',
                explanation: 'Variable (x, y, …) wuxuu matalaa qiime.',
                hint: 'Ka fikir erayga "variable".',
              },
            ],
          },
          {
            title: 'Solving Simple Equations',
            description: 'Xallinta isleegyada fudud',
            content: `# Solving Simple Equations

Ujeedadu waa inaad hesho qiimaha variable-ka.

## Tusaale
x + 5 = 12

Ka jar 5 labada dhinac:
x = 12 − 5 = **7**

## Tusaale 2
2x = 10
x = 10 ÷ 2 = **5**

## Golden rule
Wixii aad ku sameyso dhinac, ku samee dhinaca kale.

> Hubi jawaabta: geli qiimaha equation-ka.`,
            questions: [
              {
                question: 'Xalli: x − 3 = 10. x = ?',
                type: 'short_answer',
                correctAnswer: '13',
                explanation: 'x = 10 + 3 = 13.',
                hint: 'Ku dar 3 labada dhinac.',
              },
            ],
          },
        ],
      },
      {
        title: 'Module 2 — Geometry',
        lessons: [
          {
            title: 'Angles and Shapes',
            description: 'Xaglaha iyo qaababka',
            content: `# Angles and Shapes

## Angles
- **Acute**: < 90°
- **Right**: = 90°
- **Obtuse**: > 90° and < 180°
- **Straight**: = 180°

## Shapes
- Triangle: 3 sides
- Quadrilateral: 4 sides
- Circle: round

### Triangle angle sum
Sum of angles in a triangle = **180°**

> Tusaale: 60° + 60° + 60° = 180° (equilateral).`,
            questions: [
              {
                question: 'Right angle waa:',
                type: 'multiple_choice',
                options: ['45°', '90°', '180°', '360°'],
                correctAnswer: '90°',
                explanation: 'Right angle = 90 degrees.',
                hint: 'Koonaha geeska buuxa ee buugga...',
              },
            ],
          },
        ],
      },
      {
        title: 'Module 3 — Basic Statistics',
        lessons: [
          {
            title: 'Mean, Median, Mode',
            description: 'Celcelis iyo cabbirro',
            content: `# Mean, Median, Mode

Data: 2, 3, 3, 5, 7

## Mean (celcelis)
(2+3+3+5+7) ÷ 5 = 20 ÷ 5 = **4**

## Median (dhexe)
Liiska la kala saaray, qiimaha dhexe = **3**

## Mode (intabadan soo noqda)
**3** (marar badan ayuu soo muuqday)

> Statistics waxay naga caawisaa inaan fahanno xogta si degdeg ah.`,
            questions: [
              {
                question: 'Mode-ka data 2, 3, 3, 5, 7 waa:',
                type: 'multiple_choice',
                options: ['2', '3', '5', '7'],
                correctAnswer: '3',
                explanation: '3 ayaa ugu badan soo noqda.',
                hint: 'Kee ayaa marar badan ku jira?',
              },
            ],
          },
        ],
      },
    ],
  },
];

export function seedIfEmpty() {
  initDb();
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (userCount.c > 0) return;

  const adminId = uuid();
  const studentId = uuid();
  const student2Id = uuid();
  const hash = bcrypt.hashSync('password123', 10);

  db.prepare(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`
  ).run(adminId, 'Admin Tutor', 'admin@somalilearn.so', hash, 'ADMIN');
  db.prepare(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`
  ).run(studentId, 'Ahmed Hassan', 'ahmed@student.so', hash, 'STUDENT');
  db.prepare(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`
  ).run(student2Id, 'Amina Ali', 'amina@student.so', hash, 'STUDENT');

  const insertCourse = db.prepare(
    `INSERT INTO courses (id, title, description, category, difficulty, sequential) VALUES (?, ?, ?, ?, ?, 0)`
  );
  const insertModule = db.prepare(
    `INSERT INTO modules (id, course_id, title, sort_order) VALUES (?, ?, ?, ?)`
  );
  const insertLesson = db.prepare(
    `INSERT INTO lessons (id, module_id, title, description, content, sort_order, status, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, 'published', ?)`
  );
  const insertChunk = db.prepare(
    `INSERT INTO lesson_chunks (id, lesson_id, content, chunk_index) VALUES (?, ?, ?, ?)`
  );
  const insertExercise = db.prepare(
    `INSERT INTO exercises (id, lesson_id, title, description) VALUES (?, ?, ?, ?)`
  );
  const insertQuestion = db.prepare(
    `INSERT INTO questions (id, exercise_id, question, type, options, correct_answer, explanation, hint, points, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, ?)`
  );
  const insertEnrollment = db.prepare(
    `INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)`
  );

  const seedTx = db.transaction(() => {
    for (const course of courses) {
      const courseId = uuid();
      insertCourse.run(courseId, course.title, course.description, course.category, course.difficulty);
      insertEnrollment.run(uuid(), studentId, courseId);

      course.modules.forEach((mod, mi) => {
        const moduleId = uuid();
        insertModule.run(moduleId, courseId, mod.title, mi);

        mod.lessons.forEach((les, li) => {
          const lessonId = uuid();
          insertLesson.run(lessonId, moduleId, les.title, les.description, les.content, li, adminId);

          for (const ch of chunkText(les.content)) {
            insertChunk.run(ch.id, lessonId, ch.content, ch.chunk_index);
          }

          if (les.questions.length) {
            const exerciseId = uuid();
            insertExercise.run(exerciseId, lessonId, `Layli: ${les.title}`, `Practice questions for ${les.title}`);
            les.questions.forEach((q, qi) => {
              insertQuestion.run(
                uuid(),
                exerciseId,
                q.question,
                q.type,
                q.options ? JSON.stringify(q.options) : null,
                q.correctAnswer,
                q.explanation,
                q.hint,
                qi
              );
            });
          }
        });
      });
    }

    // Partial progress for demo student on first physics lesson
    const firstLesson = db
      .prepare(
        `SELECT l.id as lesson_id, c.id as course_id FROM lessons l
         JOIN modules m ON m.id = l.module_id
         JOIN courses c ON c.id = m.course_id
         WHERE c.category = 'Physics'
         ORDER BY m.sort_order, l.sort_order LIMIT 1`
      )
      .get() as { lesson_id: string; course_id: string } | undefined;

    if (firstLesson) {
      db.prepare(
        `INSERT INTO lesson_progress (id, student_id, lesson_id, course_id, completed, completed_at)
         VALUES (?, ?, ?, ?, 1, datetime('now'))`
      ).run(uuid(), studentId, firstLesson.lesson_id, firstLesson.course_id);

      db.prepare(
        `INSERT INTO activity_log (id, student_id, action, detail) VALUES (?, ?, ?, ?)`
      ).run(uuid(), studentId, 'lesson_completed', 'What is Physics? — La dhammeeyay');
    }
  });

  seedTx();
  console.log('Database seeded with Physics, Biology, English, Chemistry, Mathematics.');
  console.log('Demo accounts:');
  console.log('  Admin:   admin@somalilearn.so / password123');
  console.log('  Student: ahmed@student.so / password123');
}
