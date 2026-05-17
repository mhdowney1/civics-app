import data from '@/data/questions.json'
import type { CategoryName, Question } from './types'

export const QUESTIONS: Question[] = data as Question[]
export const TOTAL_QUESTIONS = QUESTIONS.length
export const STARRED_QUESTIONS: Question[] = QUESTIONS.filter((q) => q.starred)

export function getQuestionById(id: number): Question | undefined {
  return QUESTIONS.find((q) => q.id === id)
}

export function getByCategory(category: CategoryName): Question[] {
  return QUESTIONS.filter((q) => q.category === category)
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
