-- Existing projects need a value before NOT NULL can apply, so the column is added with a
-- temporary default of 0 and the default is dropped right after (new rows must send `wells`).
ALTER TABLE "projects" ADD COLUMN "wells" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "wells" DROP DEFAULT;
