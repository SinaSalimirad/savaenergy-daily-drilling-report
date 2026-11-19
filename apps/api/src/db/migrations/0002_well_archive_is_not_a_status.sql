ALTER TABLE "wells" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
-- Wells archived before this migration lost their real status, so they return as "planned".
-- They stay archived: `archived_at` was already set by the archive endpoint.
UPDATE "wells" SET "status" = 'planned' WHERE "status" = 'archived';--> statement-breakpoint
DROP TYPE "public"."well_status";--> statement-breakpoint
CREATE TYPE "public"."well_status" AS ENUM('planned', 'active', 'completed', 'suspended');--> statement-breakpoint
ALTER TABLE "wells" ALTER COLUMN "status" SET DATA TYPE "public"."well_status" USING "status"::"public"."well_status";