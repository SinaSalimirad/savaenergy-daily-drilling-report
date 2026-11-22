CREATE TYPE "public"."pit_type" AS ENUM('active', 'reserve', 'not mud');--> statement-breakpoint
CREATE TABLE "pits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"capacity" numeric(8, 2),
	"type" "pit_type" NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pits_project_id_name_unique" UNIQUE("project_id","name"),
	CONSTRAINT "pits_capacity_positive" CHECK ("pits"."capacity" > 0)
);
--> statement-breakpoint
ALTER TABLE "pits" ADD CONSTRAINT "pits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;