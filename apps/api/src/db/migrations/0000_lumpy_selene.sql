CREATE TYPE "public"."project_currency" AS ENUM('USD', 'EUR', 'IRR');--> statement-breakpoint
CREATE TYPE "public"."well_designation" AS ENUM('exploration', 'appraisal', 'development', 'injection', 'observation');--> statement-breakpoint
CREATE TYPE "public"."well_status" AS ENUM('planned', 'active', 'completed', 'archived', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."well_type" AS ENUM('vertical', 'directional');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"operator" text NOT NULL,
	"contractor" text NOT NULL,
	"field" text NOT NULL,
	"wells" integer NOT NULL,
	"currency" "project_currency" NOT NULL,
	"archived_at" timestamp with time zone,
	"archived_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "projects_name_unique" UNIQUE("name"),
	CONSTRAINT "projects_wells_positive" CHECK ("projects"."wells" > 0)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"image" text,
	"role" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"designation" "well_designation",
	"well_type" "well_type",
	"status" "well_status" NOT NULL,
	"spud_date" date,
	"water_depth" numeric(12, 5),
	"archived_at" timestamp with time zone,
	"archived_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "wells_project_id_name_unique" UNIQUE("project_id","name"),
	CONSTRAINT "wells_water_depth_non_negative" CHECK ("wells"."water_depth" >= 0)
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;