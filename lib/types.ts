export type SectionName =
  | 'American Government'
  | 'American History'
  | 'Symbols and Holidays'

export type CategoryName =
  | 'Principles of American Government'
  | 'System of Government'
  | 'Rights and Responsibilities'
  | 'Colonial Period and Independence'
  | '1800s'
  | 'Recent American History and Other Important Historical Information'
  | 'Symbols'
  | 'Holidays'

export interface Question {
  id: number
  question: string
  questionEs?: string
  answers: string[]
  answersEs?: string[]
  category: CategoryName
  section: SectionName
  starred: boolean
  variable: boolean
}

export type Status = 'unseen' | 'confident' | 'needs_practice'

export interface ProgressRecord {
  questionId: number
  status: Status
  timesCorrect: number
  timesIncorrect: number
  lastReviewed: string | null
}

export const CATEGORIES: CategoryName[] = [
  'Principles of American Government',
  'System of Government',
  'Rights and Responsibilities',
  'Colonial Period and Independence',
  '1800s',
  'Recent American History and Other Important Historical Information',
  'Symbols',
  'Holidays',
]
