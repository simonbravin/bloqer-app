-- AlterTable: add custom_permissions to org_members
ALTER TABLE "public"."org_members" ADD COLUMN IF NOT EXISTS "custom_permissions" JSONB;

-- CreateTable: user_org_preferences (multi-empresa)
CREATE TABLE IF NOT EXISTS "public"."user_org_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "active_org_id" TEXT NOT NULL,
    "last_switched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_org_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_org_preferences_user_id_key" ON "public"."user_org_preferences"("user_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_org_preferences_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."user_org_preferences" ADD CONSTRAINT "user_org_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
