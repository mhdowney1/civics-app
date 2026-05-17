CREATE TABLE "progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"question_id" integer NOT NULL,
	"status" text DEFAULT 'unseen' NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"times_incorrect" integer DEFAULT 0 NOT NULL,
	"last_reviewed" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "progress_user_question_idx" ON "progress" USING btree ("user_id","question_id");