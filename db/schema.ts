import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const STATUS_VALUES = ['unseen', 'confident', 'needs_practice'] as const
export type Status = (typeof STATUS_VALUES)[number]

export const progress = pgTable(
  'progress',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    questionId: integer('question_id').notNull(),
    status: text('status').notNull().default('unseen'),
    timesCorrect: integer('times_correct').notNull().default(0),
    timesIncorrect: integer('times_incorrect').notNull().default(0),
    lastReviewed: timestamp('last_reviewed'),
  },
  (table) => ({
    userQuestionUnique: uniqueIndex('progress_user_question_idx').on(
      table.userId,
      table.questionId,
    ),
  }),
)

export type ProgressRow = typeof progress.$inferSelect
export type ProgressInsert = typeof progress.$inferInsert
