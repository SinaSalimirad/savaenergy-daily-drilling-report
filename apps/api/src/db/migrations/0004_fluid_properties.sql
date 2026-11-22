CREATE TYPE "public"."mud_sample_source" AS ENUM('Active', 'Reserve', 'Flow Line', 'Recd Mud', 'Return Mud', 'Treated Fluids', 'Brine', 'Bottom''s Up');--> statement-breakpoint
CREATE TABLE "mud_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"sample_no" integer NOT NULL,
	"sample_time" time(0),
	"sample_from" "mud_sample_source" DEFAULT 'Active' NOT NULL,
	"flowline_temp_f" numeric(5, 1),
	"depth_m" numeric(8, 2),
	"tvd_m" numeric(8, 2),
	"mud_weight_pcf" numeric(6, 2),
	"mud_temp_f" numeric(5, 1),
	"funnel_viscosity" numeric(5, 1),
	"api_filtrate_cc" numeric(5, 1),
	"hthp_filtrate_cc" numeric(5, 1),
	"api_cake" numeric(5, 1),
	"hthp_cake" numeric(5, 1),
	"oil_percent" numeric(4, 1),
	"water_percent" numeric(4, 1),
	"solids_percent" numeric(4, 1),
	"sand_percent" numeric(5, 2),
	"glycol_percent" numeric(4, 1),
	"mbt_lb_bbl" numeric(5, 1),
	"ph" numeric(4, 2),
	"ph_temp_f" numeric(5, 1),
	"alkalinity_mud_ml" numeric(5, 2),
	"pf_ml" numeric(5, 2),
	"mf_ml" numeric(5, 2),
	"chloride_mg_l" integer,
	"total_hardness_mg_l" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mud_samples_report_id_sample_no_unique" UNIQUE("report_id","sample_no"),
	CONSTRAINT "mud_samples_sample_no_range" CHECK ("mud_samples"."sample_no" between 1 and 3)
);
--> statement-breakpoint
CREATE TABLE "rheology_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"sample_no" integer NOT NULL,
	"sample_time" time(0),
	"temperature_f" numeric(5, 1),
	"r600" numeric(5, 1),
	"r300" numeric(5, 1),
	"r200" numeric(5, 1),
	"r100" numeric(5, 1),
	"r6" numeric(5, 1),
	"r3" numeric(5, 1),
	"gel_10s" numeric(5, 1),
	"gel_10m" numeric(5, 1),
	"gel_30m" numeric(5, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rheology_readings_report_id_sample_no_unique" UNIQUE("report_id","sample_no"),
	CONSTRAINT "rheology_readings_sample_no_range" CHECK ("rheology_readings"."sample_no" between 1 and 3)
);
--> statement-breakpoint
CREATE TABLE "solids_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"sample_no" integer NOT NULL,
	"sample_time" time(0),
	"mud_weight_pcf" numeric(6, 2),
	"mbt_lb_bbl" numeric(5, 1),
	"chloride_mg_l" integer,
	"oil_percent" numeric(4, 1),
	"water_percent" numeric(4, 1),
	"solids_percent" numeric(4, 1),
	"glycol_percent" numeric(4, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "solids_analyses_report_id_sample_no_unique" UNIQUE("report_id","sample_no"),
	CONSTRAINT "solids_analyses_sample_no_range" CHECK ("solids_analyses"."sample_no" between 1 and 3)
);
--> statement-breakpoint
ALTER TABLE "mud_samples" ADD CONSTRAINT "mud_samples_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rheology_readings" ADD CONSTRAINT "rheology_readings_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solids_analyses" ADD CONSTRAINT "solids_analyses_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;