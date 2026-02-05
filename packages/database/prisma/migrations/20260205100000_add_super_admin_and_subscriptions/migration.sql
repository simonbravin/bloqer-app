-- AlterTable: User - add is_super_admin
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "is_super_admin" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "users_is_super_admin_idx" ON "public"."users"("is_super_admin");

-- AlterTable: Organization - subscription & blocking
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "subscription_status" TEXT NOT NULL DEFAULT 'TRIAL';
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "subscription_plan" TEXT;
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "subscription_start_date" TIMESTAMP(3);
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "subscription_end_date" TIMESTAMP(3);
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "max_projects" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "max_users" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "max_storage_gb" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "is_blocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "blocked_reason" TEXT;
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "blocked_at" TIMESTAMP(3);
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "blocked_by" TEXT;
ALTER TABLE "public"."organizations" ADD COLUMN IF NOT EXISTS "enabled_modules" JSONB;
CREATE INDEX IF NOT EXISTS "organizations_subscription_status_idx" ON "public"."organizations"("subscription_status");
CREATE INDEX IF NOT EXISTS "organizations_is_blocked_idx" ON "public"."organizations"("is_blocked");

-- CreateTable: SuperAdminLog
CREATE TABLE IF NOT EXISTS "public"."super_admin_logs" (
    "id" TEXT NOT NULL,
    "super_admin_id" TEXT NOT NULL,
    "super_admin_email" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admin_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "super_admin_logs_super_admin_id_idx" ON "public"."super_admin_logs"("super_admin_id");
CREATE INDEX IF NOT EXISTS "super_admin_logs_target_type_target_id_idx" ON "public"."super_admin_logs"("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "super_admin_logs_created_at_idx" ON "public"."super_admin_logs"("created_at");

-- CreateTable: OrgUsageMetrics
CREATE TABLE IF NOT EXISTS "public"."org_usage_metrics" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "projects_created" INTEGER NOT NULL DEFAULT 0,
    "storage_used_mb" INTEGER NOT NULL DEFAULT 0,
    "api_calls" INTEGER NOT NULL DEFAULT 0,
    "module_usage" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_usage_metrics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "org_usage_metrics_org_id_month_year_key" ON "public"."org_usage_metrics"("org_id", "month", "year");
CREATE INDEX IF NOT EXISTS "org_usage_metrics_org_id_idx" ON "public"."org_usage_metrics"("org_id");
ALTER TABLE "public"."org_usage_metrics" ADD CONSTRAINT "org_usage_metrics_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
