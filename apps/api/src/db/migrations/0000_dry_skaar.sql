CREATE TYPE "public"."product_kind" AS ENUM('bulk', 'dimensional', 'equipment');--> statement-breakpoint
CREATE TYPE "public"."product_package_unit" AS ENUM('kg', 'lb', 'mt', 'gal', 'l', 'm3', 'bbl');--> statement-breakpoint
CREATE TYPE "public"."project_currency" AS ENUM('USD', 'EUR', 'IRR');--> statement-breakpoint
CREATE TYPE "public"."project_product_origin" AS ENUM('foreign', 'local');--> statement-breakpoint
CREATE TYPE "public"."pump_type" AS ENUM('triplex', 'duplex');--> statement-breakpoint
CREATE TYPE "public"."hole_type" AS ENUM('conductor', 'casing', 'liner', 'open_hole');--> statement-breakpoint
CREATE TYPE "public"."sce_type" AS ENUM('shale_shaker', 'desander', 'desilter', 'mud_cleaner', 'centrifuge', 'degasser', 'other');--> statement-breakpoint
CREATE TYPE "public"."rig_type" AS ENUM('onshore', 'offshore');--> statement-breakpoint
CREATE TYPE "public"."well_designation" AS ENUM('exploration', 'appraisal', 'development', 'injection', 'observation');--> statement-breakpoint
CREATE TYPE "public"."well_status" AS ENUM('planned', 'active', 'completed', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."well_type" AS ENUM('vertical', 'directional');--> statement-breakpoint
CREATE TABLE "daily_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"well_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"report_no" integer NOT NULL,
	"report_date" date NOT NULL,
	"bit_depth_m" numeric(12, 5),
	"bit_td_m" numeric(12, 5),
	"bit_tvd_m" numeric(12, 5),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "daily_report_well_id_report_date_unique" UNIQUE("well_id","report_date"),
	CONSTRAINT "daily_report_well_id_report_no_unique" UNIQUE("well_id","report_no"),
	CONSTRAINT "daily_report_report_no_positive" CHECK ("daily_report"."report_no" > 0),
	CONSTRAINT "daily_report_depths_non_negative" CHECK ("daily_report"."bit_depth_m" >= 0 AND "daily_report"."bit_td_m" >= 0 AND "daily_report"."bit_tvd_m" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "product_kind" DEFAULT 'bulk' NOT NULL,
	"package_size" numeric(5, 3),
	"package_unit" "product_package_unit",
	"specific_gravity" numeric(5, 3),
	"length_m" numeric(8, 2),
	"width_m" numeric(8, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_kind_fields" CHECK ((
        "product"."kind" = 'bulk'
        AND "product"."package_size" IS NOT NULL
        AND "product"."package_unit" IS NOT NULL
        AND "product"."specific_gravity" IS NOT NULL
        AND "product"."length_m" IS NULL
        AND "product"."width_m" IS NULL
      ) OR (
        "product"."kind" = 'dimensional'
        AND "product"."length_m" IS NOT NULL
        AND "product"."width_m" IS NOT NULL
        AND "product"."package_size" IS NULL
        AND "product"."package_unit" IS NULL
        AND "product"."specific_gravity" IS NULL
      ) OR (
        "product"."kind" = 'equipment'
        AND "product"."package_size" IS NULL
        AND "product"."package_unit" IS NULL
        AND "product"."specific_gravity" IS NULL
        AND "product"."length_m" IS NULL
        AND "product"."width_m" IS NULL
      )),
	CONSTRAINT "product_dimensions_positive" CHECK ("product"."length_m" > 0 AND "product"."width_m" > 0)
);
--> statement-breakpoint
CREATE TABLE "product_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"project_product_id" uuid NOT NULL,
	"initial" integer DEFAULT 0 NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"received" integer DEFAULT 0 NOT NULL,
	"returned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_inventory_report_id_project_product_id_unique" UNIQUE("report_id","project_product_id"),
	CONSTRAINT "product_inventory_initial_nonnegative" CHECK ("product_inventory"."initial" >= 0),
	CONSTRAINT "product_inventory_used_nonnegative" CHECK ("product_inventory"."used" >= 0),
	CONSTRAINT "product_inventory_received_nonnegative" CHECK ("product_inventory"."received" >= 0),
	CONSTRAINT "product_inventory_returned_nonnegative" CHECK ("product_inventory"."returned" >= 0)
);
--> statement-breakpoint
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
CREATE TABLE "project_product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"origin" "project_product_origin" NOT NULL,
	"price" numeric(14, 5),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "project_product_project_id_product_id_unique" UNIQUE("project_id","product_id"),
	CONSTRAINT "project_product_price_positive" CHECK ("project_product"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "pumps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"model" text NOT NULL,
	"type" "pump_type" NOT NULL,
	"liner_diameter" numeric(5, 3) NOT NULL,
	"stroke_length" numeric(5, 3) NOT NULL,
	"rod_diameter" numeric(5, 3),
	"efficiency" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pumps_project_id_order_unique" UNIQUE("project_id","order"),
	CONSTRAINT "pumps_order_positive" CHECK ("pumps"."order" >= 1),
	CONSTRAINT "pumps_liner_diameter_positive" CHECK ("pumps"."liner_diameter" > 0),
	CONSTRAINT "pumps_stroke_length_positive" CHECK ("pumps"."stroke_length" > 0),
	CONSTRAINT "pumps_duplex_rod_diameter" CHECK (("pumps"."type" <> 'duplex' or "pumps"."rod_diameter" is not null) and ("pumps"."rod_diameter" is null or ("pumps"."rod_diameter" > 0 and "pumps"."rod_diameter" < "pumps"."liner_diameter"))),
	CONSTRAINT "pumps_efficiency_percentage" CHECK ("pumps"."efficiency" > 0 and "pumps"."efficiency" <= 100)
);
--> statement-breakpoint
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
	CONSTRAINT "sections_id_well_id_unique" UNIQUE("id","well_id"),
	CONSTRAINT "sections_order_non_negative" CHECK ("sections"."order" >= 0)
);
--> statement-breakpoint
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
	"rig_name" text NOT NULL,
	"rig_type" "rig_type" NOT NULL,
	"water_depth" numeric(12, 5),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "wells_project_id_name_unique" UNIQUE("project_id","name"),
	CONSTRAINT "wells_water_depth_offshore_only" CHECK ("wells"."rig_type" = 'offshore' OR "wells"."water_depth" IS NULL),
	CONSTRAINT "wells_water_depth_non_negative" CHECK ("wells"."water_depth" >= 0)
);
--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_section_belongs_to_well_fk" FOREIGN KEY ("section_id","well_id") REFERENCES "public"."sections"("id","well_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_project_product_id_project_product_id_fk" FOREIGN KEY ("project_product_id") REFERENCES "public"."project_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_archived_by_user_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pumps" ADD CONSTRAINT "pumps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pumps" ADD CONSTRAINT "pumps_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pumps" ADD CONSTRAINT "pumps_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solid_control_equipment" ADD CONSTRAINT "solid_control_equipment_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solid_control_equipment" ADD CONSTRAINT "solid_control_equipment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solid_control_equipment" ADD CONSTRAINT "solid_control_equipment_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wells" ADD CONSTRAINT "wells_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_bulk_unique" ON "product" USING btree (lower("name"),"package_size","package_unit","specific_gravity") WHERE "product"."kind" = 'bulk';--> statement-breakpoint
CREATE UNIQUE INDEX "product_dimensional_unique" ON "product" USING btree (lower("name"),"length_m","width_m") WHERE "product"."kind" = 'dimensional';--> statement-breakpoint
CREATE UNIQUE INDEX "product_equipment_unique" ON "product" USING btree (lower("name")) WHERE "product"."kind" = 'equipment';