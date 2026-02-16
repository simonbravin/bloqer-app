-- AlterTable
ALTER TABLE "public"."notifications" ADD COLUMN "actor_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
