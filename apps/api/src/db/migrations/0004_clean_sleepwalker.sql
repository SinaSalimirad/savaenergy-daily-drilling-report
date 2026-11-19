CREATE TYPE "public"."product_kind" AS ENUM('bulk', 'dimensional', 'equipment');--> statement-breakpoint
CREATE TYPE "public"."product_package_unit" AS ENUM('kg', 'lb', 'mt', 'gal', 'l', 'm3', 'bbl');--> statement-breakpoint
CREATE TYPE "public"."project_product_origin" AS ENUM('foreign', 'local');--> statement-breakpoint
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
ALTER TABLE "sections" ADD CONSTRAINT "sections_id_well_id_unique" UNIQUE("id","well_id");--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_section_belongs_to_well_fk" FOREIGN KEY ("section_id","well_id") REFERENCES "public"."sections"("id","well_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_project_product_id_project_product_id_fk" FOREIGN KEY ("project_product_id") REFERENCES "public"."project_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_product" ADD CONSTRAINT "project_product_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
