CREATE TYPE "public"."wellbore_interval_type" AS ENUM('casing', 'liner', 'open_hole');--> statement-breakpoint
CREATE TABLE "bits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"bit_type" text NOT NULL,
	"size_in" numeric(6, 3) NOT NULL,
	"manufacturer" text,
	"nozzles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bits_report_id_unique" UNIQUE("report_id"),
	CONSTRAINT "bits_size_positive" CHECK ("bits"."size_in" > 0)
);
--> statement-breakpoint
CREATE TABLE "drill_string_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"tool_type" text NOT NULL,
	"length_m" numeric(8, 2) NOT NULL,
	"od_in" numeric(6, 3) NOT NULL,
	"id_in" numeric(6, 3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drill_string_tools_report_id_order_unique" UNIQUE("report_id","order"),
	CONSTRAINT "drill_string_tools_length_positive" CHECK ("drill_string_tools"."length_m" > 0),
	CONSTRAINT "drill_string_tools_id_below_od" CHECK ("drill_string_tools"."id_in" > 0 and "drill_string_tools"."id_in" < "drill_string_tools"."od_in")
);
--> statement-breakpoint
CREATE TABLE "hydraulic_inputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"flowrate_gpm" numeric(7, 1),
	"rop_m_hr" numeric(6, 2),
	"cuttings_diameter_in" numeric(4, 3),
	"cuttings_density_sg" numeric(4, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hydraulic_inputs_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "survey_stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"well_id" uuid NOT NULL,
	"md_m" numeric(8, 2) NOT NULL,
	"inclination_deg" numeric(5, 2) NOT NULL,
	"azimuth_deg" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "survey_stations_well_id_md_unique" UNIQUE("well_id","md_m"),
	CONSTRAINT "survey_stations_inclination_range" CHECK ("survey_stations"."inclination_deg" between 0 and 180),
	CONSTRAINT "survey_stations_azimuth_range" CHECK ("survey_stations"."azimuth_deg" >= 0 and "survey_stations"."azimuth_deg" < 360)
);
--> statement-breakpoint
CREATE TABLE "wellbore_intervals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"interval_type" "wellbore_interval_type" NOT NULL,
	"top_md_m" numeric(8, 2) NOT NULL,
	"bottom_md_m" numeric(8, 2) NOT NULL,
	"od_in" numeric(6, 3),
	"id_in" numeric(6, 3) NOT NULL,
	"linear_weight_lb_ft" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wellbore_intervals_report_id_order_unique" UNIQUE("report_id","order"),
	CONSTRAINT "wellbore_intervals_bottom_below_top" CHECK ("wellbore_intervals"."bottom_md_m" > "wellbore_intervals"."top_md_m"),
	CONSTRAINT "wellbore_intervals_id_positive" CHECK ("wellbore_intervals"."id_in" > 0)
);
--> statement-breakpoint
ALTER TABLE "bits" ADD CONSTRAINT "bits_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_string_tools" ADD CONSTRAINT "drill_string_tools_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hydraulic_inputs" ADD CONSTRAINT "hydraulic_inputs_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_stations" ADD CONSTRAINT "survey_stations_well_id_wells_id_fk" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellbore_intervals" ADD CONSTRAINT "wellbore_intervals_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;