-- Wells can no longer be archived. A well that was archived loses the mark and is listed again
-- with the status it had.
ALTER TABLE "wells" DROP CONSTRAINT "wells_archived_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "wells" DROP COLUMN "archived_at";--> statement-breakpoint
ALTER TABLE "wells" DROP COLUMN "archived_by";