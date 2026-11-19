CREATE TYPE "public"."hole_type" AS ENUM('conductor', 'casing', 'liner', 'open_hole');--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"well_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"hole_size" numeric(5, 3) NOT NULL,
	"hole_type" "hole_type",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "sections_well_id_order_unique" UNIQUE("well_id","order"),
	CONSTRAINT "sections_order_non_negative" CHECK ("sections"."order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;