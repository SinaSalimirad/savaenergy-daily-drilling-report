CREATE TYPE "public"."pump_type" AS ENUM('triplex', 'duplex');--> statement-breakpoint
CREATE TABLE "pumps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"model" text NOT NULL,
	"type" "pump_type" NOT NULL,
	"liner_diameter" numeric(5, 3) NOT NULL,
	"stroke_length" numeric(5, 3) NOT NULL,
	"efficiency" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pumps_project_id_order_unique" UNIQUE("project_id","order"),
	CONSTRAINT "pumps_order_positive" CHECK ("pumps"."order" >= 1),
	CONSTRAINT "pumps_liner_diameter_positive" CHECK ("pumps"."liner_diameter" > 0),
	CONSTRAINT "pumps_stroke_length_positive" CHECK ("pumps"."stroke_length" > 0),
	CONSTRAINT "pumps_efficiency_percentage" CHECK ("pumps"."efficiency" > 0 and "pumps"."efficiency" <= 100)
);
--> statement-breakpoint
ALTER TABLE "pumps" ADD CONSTRAINT "pumps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pumps" ADD CONSTRAINT "pumps_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pumps" ADD CONSTRAINT "pumps_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;