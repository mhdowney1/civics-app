// Answer-first guide pages for search engines and AI answer engines.
// Each guide opens with a short, direct answer, then supporting detail and FAQs.
// Keep facts in line with the USCIS 2025 civics test rules and bump `updated`
// whenever a guide changes.

export interface GuideSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface GuideFaq {
  q: string
  a: string
}

export interface Guide {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  answer: string
  sections: GuideSection[]
  faqs: GuideFaq[]
  updated: string // YYYY-MM-DD
}

export const GUIDES_UPDATED = '2026-11-05'

export const SITE_TAGLINE =
  'Civics Study is the oral-format practice tool for the 128-question 2025 civics test.'

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-practice-oral-civics-test',
    title: 'How to practice for the oral US civics test',
    metaTitle: 'How to Practice for the Oral Citizenship Civics Test (2025 Test)',
    metaDescription:
      'The USCIS civics test is oral, so practice by hearing each question and answering out loud. A simple routine for the 128-question 2025 test.',
    answer:
      'The civics test is oral: a USCIS officer reads each question and you answer out loud in English. The most effective way to practice is the same way. Hear or read one question at a time, say your answer aloud before checking it, and keep reviewing the questions you miss until you can answer them without hesitating.',
    sections: [
      {
        heading: 'Why multiple choice is not enough',
        paragraphs: [
          'Most study apps use multiple choice or flashcards. Those help you recognize the right answer, but at the interview there are no options to pick from. You have to recall an answer and say it clearly to an officer. Practicing out loud trains that exact skill.',
        ],
      },
      {
        heading: 'A simple daily routine',
        bullets: [
          'Study 10 to 15 minutes a day rather than cramming once a week.',
          'Go one question at a time. Say your answer out loud before you look.',
          'Mark each question as confident or needs practice, and spend most of your time on the second group.',
          'Learn one accepted answer well. Any answer on the official list counts, so you do not need to memorize every option.',
          'Look up the answers that depend on where you live, such as your senators, your representative and your governor.',
          'Once a week, take a full mock interview: up to 20 random questions, stopping at 12 correct or 9 wrong, the same as the real test.',
        ],
      },
      {
        heading: 'In the week before your interview',
        bullets: [
          'Run a mock interview every day and aim to pass with room to spare.',
          'Re-check the answers that change, such as the current President, Vice President and Speaker of the House.',
          'Practice answering in short, clear phrases. A complete sentence is not required.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the US citizenship civics test oral or written?',
        a: 'The civics test is oral. A USCIS officer asks the questions and you answer out loud in English. There is no multiple choice. The reading and writing parts of the English test are separate.',
      },
      {
        q: 'Do I need to answer in a full sentence?',
        a: 'No. A short answer that matches one of the accepted answers is enough. For example, for "What is the supreme law of the land?" you can simply say "the Constitution."',
      },
      {
        q: 'Can I ask the officer to repeat a question?',
        a: 'Yes. If you did not hear or understand a question, you can politely ask the officer to repeat it.',
      },
    ],
    updated: GUIDES_UPDATED,
  },
  {
    slug: '2025-civics-test-changes',
    title: 'What changed in the 2025 civics test',
    metaTitle: '2025 Civics Test Changes: 128 Questions, 20 Asked, 12 to Pass',
    metaDescription:
      'The 2025 USCIS civics test has 128 questions, up to 20 asked and 12 correct to pass. Who takes it and how it differs from the 2008 test.',
    answer:
      'The 2025 civics test applies to anyone who filed Form N-400 on or after October 20, 2025. The question list grew from 100 to 128, the officer asks up to 20 questions instead of 10, and you need 12 correct to pass instead of 6. The officer stops as soon as you reach 12 correct or 9 incorrect.',
    sections: [
      {
        heading: '2008 test vs 2025 test',
        bullets: [
          'Who takes it: 2008 test if you filed before October 20, 2025; 2025 test if you filed on or after that date.',
          'Question list: 100 questions (2008) vs 128 questions (2025).',
          'Questions asked: up to 10 (2008) vs up to 20 (2025).',
          'To pass: 6 correct (2008) vs 12 correct (2025).',
          'Test ends early: at 6 correct (2008) vs at 12 correct or 9 wrong (2025).',
        ],
      },
      {
        heading: 'What stayed the same',
        bullets: [
          'The civics test is still oral and in English, unless you qualify for an exemption.',
          'You still pass with 60% correct.',
          'The 65/20 special consideration still exists: 10 questions from a set of 20, with 6 correct to pass.',
          'The reading, writing and speaking parts of the English test did not change.',
        ],
      },
      {
        heading: 'How to tell which test you will take',
        paragraphs: [
          'It depends only on the date your Form N-400 was filed, not your interview date. Check the filing date on your receipt notice. On or after October 20, 2025 means the 2025 test.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How many questions are on the 2025 civics test?',
        a: 'There are 128 official questions. The officer asks up to 20 of them during your interview.',
      },
      {
        q: 'How many do I need to get right on the 2025 civics test?',
        a: 'You need 12 correct answers to pass. The officer stops asking once you reach 12 correct or 9 incorrect.',
      },
      {
        q: 'I filed before October 20, 2025. Which test do I take?',
        a: 'You take the 2008 civics test: up to 10 questions from a list of 100, with 6 correct to pass.',
      },
    ],
    updated: GUIDES_UPDATED,
  },
  {
    slug: 'how-many-questions-on-civics-test',
    title: 'How many questions are on the citizenship civics test?',
    metaTitle: 'How Many Questions Are on the Citizenship Civics Test? (2025 Test)',
    metaDescription:
      'There are 128 official civics questions. The officer asks up to 20 and you need 12 correct to pass. How scoring and early stopping work.',
    answer:
      'On the 2025 civics test there are 128 official questions. At your naturalization interview the officer asks up to 20 of them, and you need 12 correct to pass. The officer stops as soon as you reach 12 correct (you pass) or 9 incorrect (you do not pass), so many people answer fewer than 20.',
    sections: [
      {
        heading: 'How the scoring works',
        bullets: [
          'Questions are chosen from the official list of 128.',
          'Any answer on the official accepted-answer list counts as correct.',
          'Reach 12 correct and the civics test ends with a pass.',
          'Reach 9 incorrect and the civics test ends without a pass.',
          'If you are 65 or older with 20 or more years as a permanent resident, you are asked 10 questions from a set of 20 and need 6 correct.',
        ],
      },
      {
        heading: 'What this means for studying',
        paragraphs: [
          'Because questions are random, you need to be ready for all 128, not just a favorite few. The early stop means a strong start matters: if you answer the first 12 correctly, you are done.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Will I be asked all 20 questions?',
        a: 'Not always. The officer stops once you have 12 correct or 9 incorrect, so you are only asked all 20 if the result is still undecided.',
      },
      {
        q: 'Are the questions multiple choice?',
        a: 'No. The officer asks each question out loud and you answer out loud.',
      },
    ],
    updated: GUIDES_UPDATED,
  },
  {
    slug: '65-20-rule',
    title: 'The 65/20 rule for the civics test',
    metaTitle: 'The 65/20 Rule for the Citizenship Civics Test Explained',
    metaDescription:
      'If you are 65+ and a permanent resident for 20+ years, you study 20 marked civics questions, are asked 10 and need 6 correct.',
    answer:
      'If you are 65 or older and have been a lawful permanent resident for 20 or more years when you file Form N-400, you qualify for special consideration on the civics test. You only study 20 specially marked questions. The officer asks 10 of them and you need 6 correct to pass, and you may take the civics test in the language of your choice with an interpreter.',
    sections: [
      {
        heading: 'Who qualifies',
        bullets: [
          'You are 65 or older at the time you file Form N-400.',
          'You have been a lawful permanent resident (green card holder) for at least 20 years at that time.',
        ],
      },
      {
        heading: 'How the 65/20 test works',
        bullets: [
          'Study list: the 20 questions marked with an asterisk on the official list.',
          'Questions asked: 10.',
          'To pass: 6 correct.',
          'Language: you may take the civics test in your own language with an interpreter.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I still have to take the English test under 65/20?',
        a: 'No. If you qualify for 65/20 you are also exempt from the English test, so you can take the civics test in your own language with an interpreter. Similar English exemptions apply at age 50 with 20 years and age 55 with 15 years as a permanent resident, but only 65/20 also shortens the civics list.',
      },
      {
        q: 'Which questions are on the 65/20 list?',
        a: 'The 20 questions marked with an asterisk on the official USCIS list. Civics Study has a dedicated 65/20 mode that shows only those questions.',
      },
    ],
    updated: GUIDES_UPDATED,
  },
  {
    slug: 'what-if-i-fail-the-civics-test',
    title: 'What happens if you fail the civics test?',
    metaTitle: 'What Happens If You Fail the Citizenship Civics Test?',
    metaDescription:
      'If you fail the civics test, USCIS gives you a second chance, usually 60 to 90 days later, on only the part you failed.',
    answer:
      'If you do not pass the civics test at your interview, you get a second chance. USCIS schedules a re-test, usually within 60 to 90 days, and you only retake the part you did not pass. If you do not pass the second time, your application is denied and you would need to file again.',
    sections: [
      {
        heading: 'Before your re-test',
        bullets: [
          'Focus on the questions you missed or hesitated on.',
          'Practice out loud every day, not just reading the answers.',
          'Take full mock interviews until you pass them comfortably.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I have to retake the English test if I only failed civics?',
        a: 'No. At the re-test you only retake the portion you did not pass.',
      },
      {
        q: 'How long until the civics re-test?',
        a: 'USCIS usually schedules the re-test 60 to 90 days after your first interview.',
      },
    ],
    updated: GUIDES_UPDATED,
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
