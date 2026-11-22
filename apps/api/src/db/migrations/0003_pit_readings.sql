CREATE TABLE "pit_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"pit_id" uuid NOT NULL,
	"volume" numeric(8, 2) NOT NULL,
	"mud_weight" numeric(6, 2),
	"mud_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pit_readings_report_id_pit_id_unique" UNIQUE("report_id","pit_id"),
	CONSTRAINT "pit_readings_volume_nonnegative" CHECK ("pit_readings"."volume" >= 0),
	CONSTRAINT "pit_readings_mud_weight_positive" CHECK ("pit_readings"."mud_weight" > 0)
);
--> statement-breakpoint
ALTER TABLE "pit_readings" ADD CONSTRAINT "pit_readings_report_id_daily_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."daily_report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pit_readings" ADD CONSTRAINT "pit_readings_pit_id_pits_id_fk" FOREIGN KEY ("pit_id") REFERENCES "public"."pits"("id") ON DELETE no action ON UPDATE no action;