ALTER TYPE "public"."project_status" ADD VALUE 'archived';--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "well";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "active_well";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "last_report";