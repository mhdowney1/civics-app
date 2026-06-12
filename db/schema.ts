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

export const payments = pgTable(
  'payments',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    stripeCustomerId: text('stripe_customer_id'),
    amountCents: integer('amount_cents'),
    status: text('status').notNull().default('pending'), // pending | paid
    freeTestUsedAt: timestamp('free_test_used_at'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userUnique: uniqueIndex('payments_user_idx').on(table.userId),
  }),
)

export type PaymentRow = typeof payments.$inferSelect
