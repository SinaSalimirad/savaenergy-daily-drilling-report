CREATE TYPE "public"."sce_manufactured_by" AS ENUM('Oiltools', 'Derrick', 'Scomi', 'National Oilwell', 'Varco', 'Roxio', 'Brandt', 'Swaco', 'Sweco', 'Pionner', 'Unknown', 'Chinese');--> statement-breakpoint
ALTER TABLE "daily_report" RENAME TO "daily_reports";--> statement-breakpoint
ALTER TABLE "product" RENAME TO "products";--> statement-breakpoint
ALTER TABLE "product_inventory" RENAME TO "product_inventories";--> statement-breakpoint
ALTER TABLE "project_product" RENAME TO "project_products";--> statement-breakpoint
ALTER TABLE "user" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "pumps" RENAME COLUMN "order" TO "sort_order";--> statement-breakpoint
ALTER TABLE "sections" RENAME COLUMN "order" TO "sort_order";--> statement-breakpoint
ALTER TABLE "solid_control_equipment" RENAME COLUMN "order" TO "sort_order";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "wells" TO "well_count";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_well_id_wells_id_fk" TO "daily_reports_well_id_wells_id_fk";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_created_by_user_id_fk" TO "daily_reports_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_updated_by_user_id_fk" TO "daily_reports_updated_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_section_belongs_to_well_fk" TO "daily_reports_section_belongs_to_well_fk";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_well_id_report_date_unique" TO "daily_reports_well_id_report_date_unique";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_well_id_report_no_unique" TO "daily_reports_well_id_report_no_unique";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_report_no_positive" TO "daily_reports_report_no_positive";--> statement-breakpoint
ALTER TABLE "daily_reports" RENAME CONSTRAINT "daily_report_depths_non_negative" TO "daily_reports_depths_non_negative";--> statement-breakpoint
ALTER INDEX "product_bulk_unique" RENAME TO "products_bulk_unique";--> statement-breakpoint
ALTER INDEX "product_dimensional_unique" RENAME TO "products_dimensional_unique";--> statement-breakpoint
ALTER INDEX "product_equipment_unique" RENAME TO "products_equipment_unique";--> statement-breakpoint
ALTER TABLE "products" RENAME CONSTRAINT "product_kind_fields" TO "products_kind_fields";--> statement-breakpoint
ALTER TABLE "products" RENAME CONSTRAINT "product_dimensions_positive" TO "products_dimensions_positive";--> statement-breakpoint
ALTER TABLE "product_inventories" RENAME CONSTRAINT "product_inventory_report_id_daily_report_id_fk" TO "product_inventories_report_id_daily_reports_id_fk";--> statement-breakpoint
ALTER TABLE "product_inventories" RENAME CONSTRAINT "product_inventory_project_product_id_project_product_id_fk" TO "product_inventories_project_product_id_project_products_id_fk";--> statement-breakpoint
ALTER TABLE "product_inventories" RENAME CONSTRAINT "product_inventory_report_id_project_product_id_unique" TO "product_inventories_report_id_project_product_id_unique";--> statement-breakpoint
ALTER TABLE "product_inventories" RENAME CONSTRAINT "product_inventory_initial_nonnegative" TO "product_inventories_initial_nonnegative";--> statement-breakpoint
ALTER TABLE "product_inventories" RENAME CONSTRAINT "product_inventory_used_nonnegative" TO "product_inventories_used_nonnegative";--> statement-breakpoint
ALTER TABLE "product_inventories" RENAME CONSTRAINT "product_inventory_received_nonnegative" TO "product_inventories_received_nonnegative";--> statement-breakpoint
ALTER TABLE "product_inventories" RENAME CONSTRAINT "product_inventory_returned_nonnegative" TO "product_inventories_returned_nonnegative";--> statement-breakpoint
ALTER TABLE "projects" RENAME CONSTRAINT "projects_archived_by_user_id_fk" TO "projects_archived_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "projects" RENAME CONSTRAINT "projects_created_by_user_id_fk" TO "projects_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "projects" RENAME CONSTRAINT "projects_updated_by_user_id_fk" TO "projects_updated_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "projects" RENAME CONSTRAINT "projects_wells_positive" TO "projects_well_count_positive";--> statement-breakpoint
ALTER TABLE "project_products" RENAME CONSTRAINT "project_product_project_id_projects_id_fk" TO "project_products_project_id_projects_id_fk";--> statement-breakpoint
ALTER TABLE "project_products" RENAME CONSTRAINT "project_product_product_id_product_id_fk" TO "project_products_product_id_products_id_fk";--> statement-breakpoint
ALTER TABLE "project_products" RENAME CONSTRAINT "project_product_created_by_user_id_fk" TO "project_products_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "project_products" RENAME CONSTRAINT "project_product_updated_by_user_id_fk" TO "project_products_updated_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "project_products" RENAME CONSTRAINT "project_product_project_id_product_id_unique" TO "project_products_project_id_product_id_unique";--> statement-breakpoint
ALTER TABLE "project_products" RENAME CONSTRAINT "project_product_price_positive" TO "project_products_price_positive";--> statement-breakpoint
ALTER TABLE "pumps" RENAME CONSTRAINT "pumps_created_by_user_id_fk" TO "pumps_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "pumps" RENAME CONSTRAINT "pumps_updated_by_user_id_fk" TO "pumps_updated_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "pumps" RENAME CONSTRAINT "pumps_project_id_order_unique" TO "pumps_project_id_sort_order_unique";--> statement-breakpoint
ALTER TABLE "pumps" RENAME CONSTRAINT "pumps_order_positive" TO "pumps_sort_order_positive";--> statement-breakpoint
ALTER TABLE "pumps" DROP CONSTRAINT "pumps_duplex_rod_diameter";--> statement-breakpoint
ALTER TABLE "pumps" ADD CONSTRAINT "pumps_duplex_rod_diameter" CHECK (("pumps"."type" <> 'duplex' or "pumps"."rod_diameter" is not null) and ("pumps"."rod_diameter" is null or ("pumps"."rod_diameter" > 0 and "pumps"."rod_diameter" <= "pumps"."liner_diameter")));--> statement-breakpoint
ALTER TABLE "sections" RENAME CONSTRAINT "sections_created_by_user_id_fk" TO "sections_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "sections" RENAME CONSTRAINT "sections_updated_by_user_id_fk" TO "sections_updated_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "sections" RENAME CONSTRAINT "sections_well_id_order_unique" TO "sections_well_id_sort_order_unique";--> statement-breakpoint
ALTER TABLE "sections" RENAME CONSTRAINT "sections_order_non_negative" TO "sections_sort_order_non_negative";--> statement-breakpoint
ALTER TABLE "solid_control_equipment" RENAME CONSTRAINT "solid_control_equipment_created_by_user_id_fk" TO "solid_control_equipment_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "solid_control_equipment" RENAME CONSTRAINT "solid_control_equipment_updated_by_user_id_fk" TO "solid_control_equipment_updated_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "solid_control_equipment" RENAME CONSTRAINT "solid_control_equipment_project_id_order_unique" TO "solid_control_equipment_project_id_sort_order_unique";--> statement-breakpoint
ALTER TABLE "solid_control_equipment" RENAME CONSTRAINT "solid_control_equipment_order_positive" TO "solid_control_equipment_sort_order_positive";--> statement-breakpoint
ALTER TABLE "users" RENAME CONSTRAINT "user_username_unique" TO "users_username_unique";--> statement-breakpoint
ALTER TABLE "wells" RENAME CONSTRAINT "wells_created_by_user_id_fk" TO "wells_created_by_users_id_fk";--> statement-breakpoint
ALTER TABLE "wells" RENAME CONSTRAINT "wells_updated_by_user_id_fk" TO "wells_updated_by_users_id_fk";--> statement-breakpoint
CREATE TABLE "solid_control_equipment_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sce_id" uuid NOT NULL,
	"hours" integer,
	"total_usage" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "solid_control_equipment_usage" ADD CONSTRAINT "solid_control_equipment_usage_sce_id_solid_control_equipment_id_fk" FOREIGN KEY ("sce_id") REFERENCES "public"."solid_control_equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solid_control_equipment_usage" ADD CONSTRAINT "solid_control_equipment_usage_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solid_control_equipment_usage" ADD CONSTRAINT "solid_control_equipment_usage_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
