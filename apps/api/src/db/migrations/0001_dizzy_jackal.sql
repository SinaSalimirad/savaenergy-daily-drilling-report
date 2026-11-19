CREATE TYPE "public"."rig_type" AS ENUM('onshore', 'offshore');--> statement-breakpoint
ALTER TABLE "wells" ADD COLUMN "rig_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "wells" ADD COLUMN "rig_type" "rig_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_water_depth_offshore_only" CHECK ("wells"."rig_type" = 'offshore' OR "wells"."water_depth" IS NULL);