import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
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
    bonusTests: integer('bonus_tests').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userUnique: uniqueIndex('payments_user_idx').on(table.userId),
  }),
)

export type PaymentRow = typeof payments.$inferSelect

export const usersMeta = pgTable(
  'users_meta',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    email: text('email').notNull(),
    firstName: text('first_name'),
    referralCode: text('referral_code').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userUnique: uniqueIndex('users_meta_user_idx').on(table.userId),
    referralCodeUnique: uniqueIndex('users_meta_referral_code_idx').on(table.referralCode),
  }),
)

export type UsersMetaRow = typeof usersMeta.$inferSelect

export const emailSequences = pgTable('email_sequences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  // welcome | nudge | re_engagement | study_tip | payment_receipt
  type: text('type').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export type EmailSequenceRow = typeof emailSequences.$inferSelect

export const referrals = pgTable(
  'referrals',
  {
    id: serial('id').primaryKey(),
    referrerUserId: text('referrer_user_id').notNull(),
    referredUserId: text('referred_user_id').notNull(),
    referralCode: text('referral_code').notNull(),
    bonusGranted: boolean('bonus_granted').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    referredUnique: uniqueIndex('referrals_referred_idx').on(table.referredUserId),
  }),
)

export type ReferralRow = typeof referrals.$inferSelect

export const mockTests = pgTable('mock_tests', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  passed: boolean('passed').notNull(),
  takenAt: timestamp('taken_at').defaultNow().notNull(),
})

export type MockTestRow = typeof mockTests.$inferSelect
