CREATE TYPE "public"."sce_type" AS ENUM('shale_shaker', 'desander', 'desilter', 'mud_cleaner', 'centrifuge', 'degasser', 'other');--> statement-breakpoint
CREATE TABLE "solid_control_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"type" "sce_type" NOT NULL,
	"unit_no" smallint NOT NULL,
	"manufacturer" text,
	"model" text,
	"screen_size" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "solid_control_equipment_project_id_order_unique" UNIQUE("project_id","order"),
	CONSTRAINT "solid_control_equipment_project_id_type_unit_no_unique" UNIQUE("project_id","type","unit_no"),
	CONSTRAINT "solid_control_equipment_order_positive" CHECK ("solid_control_equipment"."order" >= 1),
	CONSTRAINT "solid_control_equipment_unit_no_positive" CHECK ("solid_control_equipment"."unit_no" >= 1)
);
--> statement-breakpoint
ALTER TABLE "solid_control_equipment" ADD CONSTRAINT "solid_control_equipment_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solid_control_equipment" ADD CONSTRAINT "solid_control_equipment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solid_control_equipment" ADD CONSTRAINT "solid_control_equipment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;