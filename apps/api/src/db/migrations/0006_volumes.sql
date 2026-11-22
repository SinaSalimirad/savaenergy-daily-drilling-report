CREATE TABLE "mud_losses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"dumped_bbl" numeric(10, 2),
	"shakers_bbl" numeric(10, 2),
	"evaporation_bbl" numeric(10, 2),
	"super_clone_bbl" numeric(10, 2),
	"trip_loss_bbl" numeric(10, 2),
	"desander_desilter_bbl" numeric(10, 2),
	"pit_cleaning_bbl" numeric(10, 2),
	"other_bbl" numeric(10, 2),
	"formation_bbl" numeric(10, 2),
	"left_in_hole_bbl" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mud_losses_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "volume_accountings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"start_volume_bbl" numeric(10, 2),
	"water_added_bbl" numeric(10, 2),
	"chemical_volume_bbl" numeric(10, 2),
	"diesel_added_bbl" numeric(10, 2),
	"received_bbl" numeric(10, 2),
	"returned_bbl" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "volume_accountings_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
ALTER TABLE "mud_losses" ADD CONSTRAINT "mud_losses_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volume_accountings" ADD CONSTRAINT "volume_accountings_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;