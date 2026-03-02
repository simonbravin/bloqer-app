-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "finance";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "quality";

-- CreateEnum
CREATE TYPE "public"."OrgRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'ACCOUNTANT', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'CHECKBOX', 'URL', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "public"."ProjectPhase" AS ENUM ('PRE_CONSTRUCTION', 'CONSTRUCTION', 'CLOSEOUT', 'COMPLETE');

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tax_id" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "subscription_status" TEXT NOT NULL DEFAULT 'TRIAL',
    "subscription_plan" TEXT,
    "subscription_start_date" TIMESTAMP(3),
    "subscription_end_date" TIMESTAMP(3),
    "max_projects" INTEGER NOT NULL DEFAULT 3,
    "max_users" INTEGER NOT NULL DEFAULT 5,
    "max_storage_gb" INTEGER NOT NULL DEFAULT 1,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_reason" TEXT,
    "blocked_at" TIMESTAMP(3),
    "blocked_by" TEXT,
    "enabled_modules" JSONB,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."org_profiles" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "tax_id" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "base_currency" TEXT NOT NULL DEFAULT 'USD',
    "default_tax_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "default_indirect_cost_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "logo_storage_key" TEXT,
    "document_footer_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "full_name" TEXT NOT NULL,
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_org_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "active_org_id" TEXT NOT NULL,
    "last_switched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_org_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invited_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."org_members" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "custom_permissions" JSONB,
    "restricted_to_projects" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."module_activations" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivated_at" TIMESTAMP(3),

    CONSTRAINT "module_activations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_keys" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "scopes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."idempotency_keys" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "response_json" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "request_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "before_snapshot" JSONB,
    "after_snapshot" JSONB,
    "details_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."super_admin_logs" (
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

-- CreateTable
CREATE TABLE "public"."org_usage_metrics" (
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

-- CreateTable
CREATE TABLE "public"."custom_field_definitions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_type" "public"."FieldType" NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "searchable" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "help_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_field_values" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "field_definition_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_definitions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_instances" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "workflow_definition_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "current_step" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_approvals" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "workflow_instance_id" TEXT NOT NULL,
    "org_member_id" TEXT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "client_name" TEXT,
    "location" TEXT,
    "m2" DECIMAL(15,2),
    "phase" "public"."ProjectPhase" NOT NULL DEFAULT 'PRE_CONSTRUCTION',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "start_date" DATE,
    "planned_end_date" DATE,
    "baseline_planned_end_date" DATE,
    "actual_end_date" DATE,
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "total_budget" DECIMAL(15,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "org_member_id" TEXT NOT NULL,
    "project_role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wbs_nodes" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "quantity" DECIMAL(15,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "planned_hours" DECIMAL(15,2),
    "planned_cost" DECIMAL(15,2),
    "actual_hours" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "planned_start_date" TIMESTAMP(3),
    "planned_end_date" TIMESTAMP(3),
    "actual_start_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "progress_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "health_status" TEXT,

    CONSTRAINT "wbs_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_versions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "version_code" TEXT NOT NULL,
    "version_type" TEXT NOT NULL DEFAULT 'BASELINE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "markup_mode" TEXT NOT NULL DEFAULT 'SIMPLE',
    "global_overhead_pct" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "global_financial_pct" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "global_profit_pct" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "global_tax_pct" DECIMAL(5,2) NOT NULL DEFAULT 21,
    "created_by_org_member_id" TEXT NOT NULL,
    "approved_by_org_member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),

    CONSTRAINT "budget_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_lines" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "budget_version_id" TEXT NOT NULL,
    "wbs_node_id" TEXT NOT NULL,
    "resource_id" TEXT,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "direct_cost_total" DECIMAL(15,2) NOT NULL,
    "imported_direct_cost_total" DECIMAL(15,2),
    "sale_price_total" DECIMAL(15,2) NOT NULL,
    "overhead_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "indirect_cost_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "financial_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "profit_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "retention_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "actual_cost_total" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "budget_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_resources" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "budget_line_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."change_orders" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "budget_version_id" TEXT,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "change_type" TEXT NOT NULL,
    "budget_impact_type" TEXT NOT NULL DEFAULT 'DEVIATION',
    "request_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_date" DATE,
    "implemented_date" DATE,
    "reason" TEXT NOT NULL,
    "justification" TEXT,
    "cost_impact" DECIMAL(15,2) NOT NULL,
    "time_impact_days" INTEGER NOT NULL DEFAULT 0,
    "requested_by_org_member_id" TEXT NOT NULL,
    "approved_by_org_member_id" TEXT,
    "party_id" TEXT,
    "rejection_reason" TEXT,
    "feedback_requested" TEXT,
    "workflow_instance_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "change_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."change_order_approvals" (
    "id" TEXT NOT NULL,
    "change_order_id" TEXT NOT NULL,
    "org_member_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_order_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."change_order_lines" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "change_order_id" TEXT NOT NULL,
    "wbs_node_id" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    "original_qty" DECIMAL(15,4),
    "new_qty" DECIMAL(15,4),
    "original_unit_cost" DECIMAL(15,2),
    "new_unit_cost" DECIMAL(15,2),
    "original_total_cost" DECIMAL(15,2),
    "new_total_cost" DECIMAL(15,2),
    "delta_cost" DECIMAL(15,2) NOT NULL,
    "justification" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "change_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parties" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "party_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "website" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resources" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "supplier_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."party_contacts" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "party_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_parties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "category" TEXT NOT NULL,
    "subcategories" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_by_staff" TEXT,
    "countries" TEXT[],
    "regions" TEXT[],
    "description" TEXT,
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "specialties" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "avg_rating" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "org_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_date" TIMESTAMP(3),
    "total_spent_all_time" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "on_time_percentage" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "quality_score" DECIMAL(3,2) NOT NULL DEFAULT 5,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_party_contacts" (
    "id" TEXT NOT NULL,
    "global_party_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "region" TEXT,
    "language" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_party_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."org_party_links" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "global_party_id" TEXT NOT NULL,
    "local_alias" TEXT,
    "local_contact_name" TEXT,
    "local_contact_email" TEXT,
    "local_contact_phone" TEXT,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "payment_terms" TEXT,
    "discount_pct" DECIMAL(5,2),
    "credit_limit" DECIMAL(15,2),
    "notes" TEXT,
    "internal_code" TEXT,
    "tags" TEXT[],
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "last_order_date" TIMESTAMP(3),
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_party_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_party_claims" (
    "id" TEXT NOT NULL,
    "global_party_id" TEXT NOT NULL,
    "claimant_name" TEXT NOT NULL,
    "claimant_email" TEXT NOT NULL,
    "claimant_phone" TEXT,
    "claimant_role" TEXT NOT NULL,
    "company" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verification_token" TEXT,
    "verification_docs" TEXT[],
    "message" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_party_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_party_reviews" (
    "id" TEXT NOT NULL,
    "global_party_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "org_member_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "review" TEXT,
    "quality_rating" INTEGER,
    "delivery_rating" INTEGER,
    "price_rating" INTEGER,
    "service_rating" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" TEXT,
    "order_ids" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "flagged_reason" TEXT,
    "moderated_by" TEXT,
    "moderated_at" TIMESTAMP(3),
    "supplier_response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_party_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_products" (
    "id" TEXT NOT NULL,
    "global_party_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "unit" TEXT NOT NULL,
    "reference_price_min" DECIMAL(15,2),
    "reference_price_max" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "price_updated_at" TIMESTAMP(3),
    "specifications" JSONB NOT NULL DEFAULT '{}',
    "certifications" TEXT[],
    "technical_docs" TEXT[],
    "image_url" TEXT,
    "images" TEXT[],
    "datasheet_url" TEXT,
    "video_url" TEXT,
    "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "lead_time_days" INTEGER,
    "min_order_qty" DECIMAL(15,4),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."currencies" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "finance"."exchange_rates" (
    "id" TEXT NOT NULL,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" DECIMAL(15,6) NOT NULL,
    "effective_date" DATE NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."finance_transactions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT,
    "party_id" TEXT,
    "certification_id" TEXT,
    "type" TEXT NOT NULL,
    "document_type" TEXT NOT NULL DEFAULT 'INVOICE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "transaction_number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "due_date" DATE,
    "paid_date" DATE,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(15,2) NOT NULL,
    "tax_total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL,
    "amount_base_currency" DECIMAL(15,2) NOT NULL,
    "retention_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "adjustment_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "adjustment_notes" TEXT,
    "exchange_rate_snapshot" JSONB,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_org_member_id" TEXT,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "daily_report_id" TEXT,
    "commitment_id" TEXT,

    CONSTRAINT "finance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."finance_lines" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "wbs_node_id" TEXT,
    "description" TEXT NOT NULL,
    "unit" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,2) NOT NULL,
    "line_total" DECIMAL(15,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "finance_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."payments" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "bank_account_id" TEXT,
    "payment_number" TEXT NOT NULL,
    "paid_on" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'WIRE',
    "reference" TEXT,
    "notes" TEXT,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."bank_accounts" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "account_number" TEXT,
    "currency_code" TEXT NOT NULL DEFAULT 'USD',
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."overhead_allocations" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "allocation_pct" DECIMAL(5,2) NOT NULL,
    "allocation_amount" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "overhead_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commitments" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "commitment_type" TEXT NOT NULL,
    "commitment_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issue_date" DATE NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "reference" TEXT,
    "description" TEXT,
    "total" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "total_base_currency" DECIMAL(15,2) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by_org_member_id" TEXT NOT NULL,
    "approved_by_org_member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."commitment_lines" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "commitment_id" TEXT NOT NULL,
    "wbs_node_id" TEXT,
    "description" TEXT NOT NULL,
    "unit" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_price" DECIMAL(15,2) NOT NULL,
    "line_total" DECIMAL(15,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "commitment_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certifications" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "budget_version_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "issued_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "integrity_seal" TEXT,
    "issued_by_org_member_id" TEXT,
    "approved_by_org_member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issued_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certification_lines" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "certification_id" TEXT NOT NULL,
    "wbs_node_id" TEXT NOT NULL,
    "budget_line_id" TEXT NOT NULL,
    "prev_progress_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "period_progress_pct" DECIMAL(5,2) NOT NULL,
    "total_progress_pct" DECIMAL(5,2) NOT NULL,
    "contractual_qty_snapshot" DECIMAL(15,4) NOT NULL,
    "unit_price_snapshot" DECIMAL(15,2) NOT NULL,
    "prev_qty" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "period_qty" DECIMAL(15,4) NOT NULL,
    "total_qty" DECIMAL(15,4) NOT NULL,
    "remaining_qty" DECIMAL(15,4) NOT NULL,
    "prev_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "period_amount" DECIMAL(15,2) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_subcategories" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_items" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT NOT NULL,
    "subcategory_id" TEXT,
    "unit" TEXT NOT NULL,
    "min_stock_qty" DECIMAL(15,4),
    "reorder_qty" DECIMAL(15,4),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_locations" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_movements" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "from_location_id" TEXT,
    "to_location_id" TEXT,
    "project_id" TEXT,
    "wbs_node_id" TEXT,
    "transaction_id" TEXT,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daily_report_id" TEXT,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality"."rfis" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "wbs_node_id" TEXT,
    "raised_by_org_member_id" TEXT NOT NULL,
    "assigned_to_org_member_id" TEXT,
    "subject" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "due_date" DATE,
    "answered_date" DATE,
    "closed_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality"."rfi_comments" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "rfi_id" TEXT NOT NULL,
    "org_member_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfi_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality"."submittals" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "wbs_node_id" TEXT,
    "number" INTEGER NOT NULL,
    "submittal_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "spec_section" TEXT,
    "submitted_by_party_id" TEXT,
    "reviewed_by_org_member_id" TEXT,
    "submitted_date" DATE,
    "due_date" DATE NOT NULL,
    "reviewed_date" DATE,
    "review_comments" TEXT,
    "revision_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submittals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality"."inspections" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "wbs_node_id" TEXT,
    "number" INTEGER NOT NULL,
    "inspection_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_date" DATE,
    "completed_date" DATE,
    "inspector_org_member_id" TEXT,
    "findings" TEXT,
    "corrective_actions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality"."inspection_items" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "item_description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inspection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_folders" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT,
    "folder_id" TEXT,
    "title" TEXT NOT NULL,
    "doc_type" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_versions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "notes" TEXT,
    "uploaded_by_org_member_id" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_links" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."templates" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "template_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "storage_key" TEXT NOT NULL,
    "variables" JSONB,
    "notes" TEXT,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."export_runs" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT,
    "requested_by_org_member_id" TEXT NOT NULL,
    "export_type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "file_storage_key" TEXT,
    "params_json" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "export_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."saved_reports" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entity_type" TEXT NOT NULL,
    "filters_json" JSONB NOT NULL,
    "columns_json" JSONB NOT NULL,
    "sort_json" JSONB,
    "aggregations_json" JSONB,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."saved_report_runs" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "requested_by_org_member_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "file_storage_key" TEXT,
    "params_override" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "saved_report_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_reports" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" TEXT NOT NULL,
    "last_run_at" TIMESTAMP(3),
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedules" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "project_start_date" TIMESTAMP(3) NOT NULL,
    "project_end_date" TIMESTAMP(3) NOT NULL,
    "working_days_per_week" INTEGER NOT NULL DEFAULT 6,
    "hours_per_day" INTEGER NOT NULL DEFAULT 8,
    "is_baseline" BOOLEAN NOT NULL DEFAULT false,
    "baseline_date" TIMESTAMP(3),
    "created_by_org_member_id" TEXT NOT NULL,
    "approved_by_org_member_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedule_tasks" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "wbs_node_id" TEXT NOT NULL,
    "taskType" TEXT NOT NULL DEFAULT 'TASK',
    "planned_start_date" TIMESTAMP(3) NOT NULL,
    "planned_end_date" TIMESTAMP(3) NOT NULL,
    "planned_duration" INTEGER NOT NULL,
    "actual_start_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "actual_duration" INTEGER,
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "early_start" TIMESTAMP(3),
    "early_finish" TIMESTAMP(3),
    "late_start" TIMESTAMP(3),
    "late_finish" TIMESTAMP(3),
    "total_float" INTEGER,
    "free_float" INTEGER,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "constraint_type" TEXT,
    "constraint_date" TIMESTAMP(3),
    "assigned_to" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_dependencies" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "predecessor_id" TEXT NOT NULL,
    "successor_id" TEXT NOT NULL,
    "dependency_type" TEXT NOT NULL DEFAULT 'FS',
    "lag_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."progress_updates" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "wbs_node_id" TEXT,
    "schedule_task_id" TEXT,
    "as_of_date" DATE NOT NULL,
    "progress_pct" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_reports" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "report_date" DATE NOT NULL,
    "summary" VARCHAR(200) NOT NULL,
    "work_accomplished" TEXT,
    "observations" TEXT,
    "weather" TEXT,
    "temperature_high" DECIMAL(5,2),
    "temperature_low" DECIMAL(5,2),
    "delays" TEXT,
    "safety_incidents" TEXT,
    "visitors" TEXT,
    "deliveries" TEXT,
    "labor_count_total" INTEGER,
    "equipment_count_total" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_org_member_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "wbs_node_id" TEXT,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "budget_line_id" TEXT,
    "labor_costs" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "material_costs" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "other_costs" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_report_wbs_nodes" (
    "id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "wbs_node_id" TEXT NOT NULL,

    CONSTRAINT "daily_report_wbs_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_report_labor" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "worker_count" INTEGER NOT NULL,
    "hours_worked" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "daily_report_labor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_report_equipment" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "hours_used" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "daily_report_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_report_photos" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_report_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_consumptions" (
    "id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "cost_per_unit" DECIMAL(15,2),
    "total_cost" DECIMAL(15,2),
    "movement_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_report_suppliers" (
    "id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "global_party_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quantity" DECIMAL(15,4),
    "quantity_unit" TEXT,
    "delivery_status" TEXT,
    "days_late" INTEGER,
    "invoice_number" TEXT,
    "invoice_url" TEXT,
    "description" TEXT,
    "quality" TEXT,
    "issues" TEXT,
    "commitment_id" TEXT,
    "payment_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_report_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wbs_progress_updates" (
    "id" TEXT NOT NULL,
    "wbs_node_id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "hours_added" DECIMAL(15,2) NOT NULL,
    "cost_added" DECIMAL(15,2),
    "progress_before" DECIMAL(5,2) NOT NULL,
    "progress_after" DECIMAL(5,2) NOT NULL,
    "status" TEXT NOT NULL,
    "variance" DECIMAL(5,2),
    "notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wbs_progress_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_line_actual_costs" (
    "id" TEXT NOT NULL,
    "budget_line_id" TEXT NOT NULL,
    "daily_report_id" TEXT NOT NULL,
    "labor_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "material_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "equipment_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subcontract_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "other_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "budgeted_cost" DECIMAL(15,2),
    "variance" DECIMAL(5,2),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "budget_line_actual_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alerts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "daily_report_id" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affected_entity_id" TEXT,
    "affected_entity_type" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_log_entries" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "log_date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weather" TEXT,
    "created_by_org_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."outbox_events" (
    "id" TEXT NOT NULL,
    "org_id" TEXT,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "next_retry_at" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_endpoints" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_deliveries" (
    "id" TEXT NOT NULL,
    "webhook_endpoint_id" TEXT NOT NULL,
    "outbox_event_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "http_status" INTEGER,
    "response_body" TEXT,
    "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."construction_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wbs_templates" (
    "id" TEXT NOT NULL,
    "project_template_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT,
    "default_quantity" DECIMAL(15,4),
    "construction_system_id" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wbs_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_resource_templates" (
    "id" TEXT NOT NULL,
    "wbs_template_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(15,4) NOT NULL,
    "estimated_cost" DECIMAL(15,2) NOT NULL,
    "supplier_name" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_resource_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "public"."organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_active_idx" ON "public"."organizations"("active");

-- CreateIndex
CREATE INDEX "organizations_subscription_status_idx" ON "public"."organizations"("subscription_status");

-- CreateIndex
CREATE INDEX "organizations_is_blocked_idx" ON "public"."organizations"("is_blocked");

-- CreateIndex
CREATE UNIQUE INDEX "org_profiles_org_id_key" ON "public"."org_profiles"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "public"."users"("active");

-- CreateIndex
CREATE INDEX "users_is_super_admin_idx" ON "public"."users"("is_super_admin");

-- CreateIndex
CREATE UNIQUE INDEX "user_org_preferences_user_id_key" ON "public"."user_org_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "public"."invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_org_id_status_idx" ON "public"."invitations"("org_id", "status");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "public"."invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_org_id_email_key" ON "public"."invitations"("org_id", "email");

-- CreateIndex
CREATE INDEX "org_members_user_id_idx" ON "public"."org_members"("user_id");

-- CreateIndex
CREATE INDEX "org_members_org_id_role_idx" ON "public"."org_members"("org_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "org_members_org_id_user_id_key" ON "public"."org_members"("org_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "public"."sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "public"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "public"."sessions"("expires_at");

-- CreateIndex
CREATE INDEX "module_activations_org_id_active_idx" ON "public"."module_activations"("org_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "module_activations_org_id_module_key" ON "public"."module_activations"("org_id", "module");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "public"."api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_org_id_idx" ON "public"."api_keys"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "public"."refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "public"."refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_key_key" ON "public"."idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "idempotency_keys_org_id_scope_idx" ON "public"."idempotency_keys"("org_id", "scope");

-- CreateIndex
CREATE INDEX "idempotency_keys_expires_at_idx" ON "public"."idempotency_keys"("expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_org_id_entity_type_entity_id_idx" ON "public"."audit_logs"("org_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "public"."audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "super_admin_logs_super_admin_id_idx" ON "public"."super_admin_logs"("super_admin_id");

-- CreateIndex
CREATE INDEX "super_admin_logs_target_type_target_id_idx" ON "public"."super_admin_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "super_admin_logs_created_at_idx" ON "public"."super_admin_logs"("created_at");

-- CreateIndex
CREATE INDEX "org_usage_metrics_org_id_idx" ON "public"."org_usage_metrics"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_usage_metrics_org_id_month_year_key" ON "public"."org_usage_metrics"("org_id", "month", "year");

-- CreateIndex
CREATE INDEX "custom_field_definitions_org_id_entity_type_idx" ON "public"."custom_field_definitions"("org_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definitions_org_id_entity_type_field_name_key" ON "public"."custom_field_definitions"("org_id", "entity_type", "field_name");

-- CreateIndex
CREATE INDEX "custom_field_values_entity_id_entity_type_idx" ON "public"."custom_field_values"("entity_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_values_field_definition_id_entity_id_key" ON "public"."custom_field_values"("field_definition_id", "entity_id");

-- CreateIndex
CREATE INDEX "workflow_definitions_org_id_entity_type_active_idx" ON "public"."workflow_definitions"("org_id", "entity_type", "active");

-- CreateIndex
CREATE INDEX "workflow_instances_entity_id_entity_type_idx" ON "public"."workflow_instances"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "public"."workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_approvals_workflow_instance_id_idx" ON "public"."workflow_approvals"("workflow_instance_id");

-- CreateIndex
CREATE INDEX "projects_org_id_status_idx" ON "public"."projects"("org_id", "status");

-- CreateIndex
CREATE INDEX "projects_org_id_phase_idx" ON "public"."projects"("org_id", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "projects_org_id_project_number_key" ON "public"."projects"("org_id", "project_number");

-- CreateIndex
CREATE INDEX "project_members_org_member_id_idx" ON "public"."project_members"("org_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_org_member_id_key" ON "public"."project_members"("project_id", "org_member_id");

-- CreateIndex
CREATE INDEX "wbs_nodes_project_id_parent_id_idx" ON "public"."wbs_nodes"("project_id", "parent_id");

-- CreateIndex
CREATE INDEX "wbs_nodes_project_id_category_idx" ON "public"."wbs_nodes"("project_id", "category");

-- CreateIndex
CREATE INDEX "wbs_nodes_actual_hours_idx" ON "public"."wbs_nodes"("actual_hours");

-- CreateIndex
CREATE INDEX "wbs_nodes_progress_pct_idx" ON "public"."wbs_nodes"("progress_pct");

-- CreateIndex
CREATE INDEX "wbs_nodes_health_status_idx" ON "public"."wbs_nodes"("health_status");

-- CreateIndex
CREATE UNIQUE INDEX "wbs_nodes_project_id_code_key" ON "public"."wbs_nodes"("project_id", "code");

-- CreateIndex
CREATE INDEX "budget_versions_project_id_status_idx" ON "public"."budget_versions"("project_id", "status");

-- CreateIndex
CREATE INDEX "budget_versions_org_id_idx" ON "public"."budget_versions"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_versions_project_id_version_code_key" ON "public"."budget_versions"("project_id", "version_code");

-- CreateIndex
CREATE INDEX "budget_lines_budget_version_id_idx" ON "public"."budget_lines"("budget_version_id");

-- CreateIndex
CREATE INDEX "budget_lines_wbs_node_id_idx" ON "public"."budget_lines"("wbs_node_id");

-- CreateIndex
CREATE INDEX "budget_lines_resource_id_idx" ON "public"."budget_lines"("resource_id");

-- CreateIndex
CREATE INDEX "budget_lines_actual_cost_total_idx" ON "public"."budget_lines"("actual_cost_total");

-- CreateIndex
CREATE INDEX "budget_resources_budget_line_id_idx" ON "public"."budget_resources"("budget_line_id");

-- CreateIndex
CREATE INDEX "change_orders_project_id_status_idx" ON "public"."change_orders"("project_id", "status");

-- CreateIndex
CREATE INDEX "change_orders_project_id_budget_impact_type_idx" ON "public"."change_orders"("project_id", "budget_impact_type");

-- CreateIndex
CREATE UNIQUE INDEX "change_orders_project_id_number_key" ON "public"."change_orders"("project_id", "number");

-- CreateIndex
CREATE INDEX "change_order_approvals_change_order_id_idx" ON "public"."change_order_approvals"("change_order_id");

-- CreateIndex
CREATE INDEX "change_order_lines_change_order_id_idx" ON "public"."change_order_lines"("change_order_id");

-- CreateIndex
CREATE INDEX "parties_org_id_party_type_idx" ON "public"."parties"("org_id", "party_type");

-- CreateIndex
CREATE INDEX "parties_org_id_name_idx" ON "public"."parties"("org_id", "name");

-- CreateIndex
CREATE INDEX "parties_org_id_category_idx" ON "public"."parties"("org_id", "category");

-- CreateIndex
CREATE INDEX "resources_org_id_category_idx" ON "public"."resources"("org_id", "category");

-- CreateIndex
CREATE INDEX "resources_org_id_active_idx" ON "public"."resources"("org_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "resources_org_id_code_key" ON "public"."resources"("org_id", "code");

-- CreateIndex
CREATE INDEX "party_contacts_party_id_idx" ON "public"."party_contacts"("party_id");

-- CreateIndex
CREATE INDEX "global_parties_category_idx" ON "public"."global_parties"("category");

-- CreateIndex
CREATE INDEX "global_parties_verified_idx" ON "public"."global_parties"("verified");

-- CreateIndex
CREATE INDEX "global_parties_name_idx" ON "public"."global_parties"("name");

-- CreateIndex
CREATE INDEX "global_parties_last_used_date_idx" ON "public"."global_parties"("last_used_date");

-- CreateIndex
CREATE INDEX "global_parties_on_time_percentage_idx" ON "public"."global_parties"("on_time_percentage");

-- CreateIndex
CREATE INDEX "global_party_contacts_global_party_id_idx" ON "public"."global_party_contacts"("global_party_id");

-- CreateIndex
CREATE INDEX "global_party_contacts_region_idx" ON "public"."global_party_contacts"("region");

-- CreateIndex
CREATE INDEX "org_party_links_org_id_preferred_idx" ON "public"."org_party_links"("org_id", "preferred");

-- CreateIndex
CREATE INDEX "org_party_links_org_id_status_idx" ON "public"."org_party_links"("org_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "org_party_links_org_id_global_party_id_key" ON "public"."org_party_links"("org_id", "global_party_id");

-- CreateIndex
CREATE UNIQUE INDEX "global_party_claims_verification_token_key" ON "public"."global_party_claims"("verification_token");

-- CreateIndex
CREATE INDEX "global_party_claims_global_party_id_idx" ON "public"."global_party_claims"("global_party_id");

-- CreateIndex
CREATE INDEX "global_party_claims_status_idx" ON "public"."global_party_claims"("status");

-- CreateIndex
CREATE INDEX "global_party_claims_claimant_email_idx" ON "public"."global_party_claims"("claimant_email");

-- CreateIndex
CREATE INDEX "global_party_reviews_global_party_id_status_idx" ON "public"."global_party_reviews"("global_party_id", "status");

-- CreateIndex
CREATE INDEX "global_party_reviews_rating_idx" ON "public"."global_party_reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "global_party_reviews_global_party_id_org_id_key" ON "public"."global_party_reviews"("global_party_id", "org_id");

-- CreateIndex
CREATE INDEX "global_products_category_idx" ON "public"."global_products"("category");

-- CreateIndex
CREATE INDEX "global_products_name_idx" ON "public"."global_products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "global_products_global_party_id_sku_key" ON "public"."global_products"("global_party_id", "sku");

-- CreateIndex
CREATE INDEX "exchange_rates_effective_date_idx" ON "finance"."exchange_rates"("effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_from_currency_to_currency_effective_date_key" ON "finance"."exchange_rates"("from_currency", "to_currency", "effective_date");

-- CreateIndex
CREATE INDEX "finance_transactions_org_id_project_id_idx" ON "finance"."finance_transactions"("org_id", "project_id");

-- CreateIndex
CREATE INDEX "finance_transactions_org_id_type_status_idx" ON "finance"."finance_transactions"("org_id", "type", "status");

-- CreateIndex
CREATE INDEX "finance_transactions_issue_date_idx" ON "finance"."finance_transactions"("issue_date");

-- CreateIndex
CREATE INDEX "finance_transactions_due_date_idx" ON "finance"."finance_transactions"("due_date");

-- CreateIndex
CREATE INDEX "finance_transactions_daily_report_id_idx" ON "finance"."finance_transactions"("daily_report_id");

-- CreateIndex
CREATE INDEX "finance_transactions_certification_id_idx" ON "finance"."finance_transactions"("certification_id");

-- CreateIndex
CREATE INDEX "finance_transactions_commitment_id_idx" ON "finance"."finance_transactions"("commitment_id");

-- CreateIndex
CREATE UNIQUE INDEX "finance_transactions_org_id_transaction_number_key" ON "finance"."finance_transactions"("org_id", "transaction_number");

-- CreateIndex
CREATE INDEX "finance_lines_transaction_id_idx" ON "finance"."finance_lines"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_transaction_id_idx" ON "finance"."payments"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_paid_on_idx" ON "finance"."payments"("paid_on");

-- CreateIndex
CREATE INDEX "payments_bank_account_id_idx" ON "finance"."payments"("bank_account_id");

-- CreateIndex
CREATE INDEX "bank_accounts_org_id_idx" ON "finance"."bank_accounts"("org_id");

-- CreateIndex
CREATE INDEX "overhead_allocations_transaction_id_idx" ON "finance"."overhead_allocations"("transaction_id");

-- CreateIndex
CREATE INDEX "overhead_allocations_project_id_idx" ON "finance"."overhead_allocations"("project_id");

-- CreateIndex
CREATE INDEX "commitments_project_id_status_idx" ON "public"."commitments"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "commitments_org_id_project_id_commitment_number_key" ON "public"."commitments"("org_id", "project_id", "commitment_number");

-- CreateIndex
CREATE INDEX "commitment_lines_commitment_id_idx" ON "public"."commitment_lines"("commitment_id");

-- CreateIndex
CREATE INDEX "certifications_project_id_status_idx" ON "public"."certifications"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_project_id_number_key" ON "public"."certifications"("project_id", "number");

-- CreateIndex
CREATE INDEX "certification_lines_certification_id_idx" ON "public"."certification_lines"("certification_id");

-- CreateIndex
CREATE INDEX "inventory_subcategories_category_id_idx" ON "inventory"."inventory_subcategories"("category_id");

-- CreateIndex
CREATE INDEX "inventory_items_org_id_category_id_idx" ON "inventory"."inventory_items"("org_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_org_id_sku_key" ON "inventory"."inventory_items"("org_id", "sku");

-- CreateIndex
CREATE INDEX "inventory_locations_org_id_type_idx" ON "inventory"."inventory_locations"("org_id", "type");

-- CreateIndex
CREATE INDEX "inventory_locations_project_id_idx" ON "inventory"."inventory_locations"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_movements_idempotency_key_key" ON "inventory"."inventory_movements"("idempotency_key");

-- CreateIndex
CREATE INDEX "inventory_movements_item_id_to_location_id_idx" ON "inventory"."inventory_movements"("item_id", "to_location_id");

-- CreateIndex
CREATE INDEX "inventory_movements_project_id_idx" ON "inventory"."inventory_movements"("project_id");

-- CreateIndex
CREATE INDEX "inventory_movements_created_at_idx" ON "inventory"."inventory_movements"("created_at");

-- CreateIndex
CREATE INDEX "inventory_movements_daily_report_id_idx" ON "inventory"."inventory_movements"("daily_report_id");

-- CreateIndex
CREATE INDEX "rfis_project_id_status_idx" ON "quality"."rfis"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rfis_project_id_number_key" ON "quality"."rfis"("project_id", "number");

-- CreateIndex
CREATE INDEX "rfi_comments_rfi_id_idx" ON "quality"."rfi_comments"("rfi_id");

-- CreateIndex
CREATE INDEX "submittals_project_id_status_idx" ON "quality"."submittals"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "submittals_project_id_number_key" ON "quality"."submittals"("project_id", "number");

-- CreateIndex
CREATE INDEX "inspections_project_id_status_idx" ON "quality"."inspections"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "inspections_project_id_number_key" ON "quality"."inspections"("project_id", "number");

-- CreateIndex
CREATE INDEX "inspection_items_inspection_id_idx" ON "quality"."inspection_items"("inspection_id");

-- CreateIndex
CREATE INDEX "document_folders_org_id_project_id_idx" ON "public"."document_folders"("org_id", "project_id");

-- CreateIndex
CREATE INDEX "document_folders_org_id_parent_id_idx" ON "public"."document_folders"("org_id", "parent_id");

-- CreateIndex
CREATE INDEX "documents_org_id_project_id_idx" ON "public"."documents"("org_id", "project_id");

-- CreateIndex
CREATE INDEX "documents_org_id_doc_type_idx" ON "public"."documents"("org_id", "doc_type");

-- CreateIndex
CREATE INDEX "documents_folder_id_idx" ON "public"."documents"("folder_id");

-- CreateIndex
CREATE INDEX "document_versions_document_id_idx" ON "public"."document_versions"("document_id");

-- CreateIndex
CREATE INDEX "document_links_document_id_idx" ON "public"."document_links"("document_id");

-- CreateIndex
CREATE INDEX "document_links_entity_type_entity_id_idx" ON "public"."document_links"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "templates_org_id_template_type_idx" ON "public"."templates"("org_id", "template_type");

-- CreateIndex
CREATE INDEX "export_runs_org_id_status_idx" ON "public"."export_runs"("org_id", "status");

-- CreateIndex
CREATE INDEX "export_runs_created_at_idx" ON "public"."export_runs"("created_at");

-- CreateIndex
CREATE INDEX "saved_reports_org_id_entity_type_idx" ON "public"."saved_reports"("org_id", "entity_type");

-- CreateIndex
CREATE INDEX "saved_report_runs_report_id_idx" ON "public"."saved_report_runs"("report_id");

-- CreateIndex
CREATE INDEX "custom_reports_org_id_idx" ON "public"."custom_reports"("org_id");

-- CreateIndex
CREATE INDEX "custom_reports_created_by_user_id_idx" ON "public"."custom_reports"("created_by_user_id");

-- CreateIndex
CREATE INDEX "custom_reports_category_idx" ON "public"."custom_reports"("category");

-- CreateIndex
CREATE INDEX "schedules_org_id_idx" ON "public"."schedules"("org_id");

-- CreateIndex
CREATE INDEX "schedules_project_id_idx" ON "public"."schedules"("project_id");

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "public"."schedules"("status");

-- CreateIndex
CREATE INDEX "schedule_tasks_schedule_id_idx" ON "public"."schedule_tasks"("schedule_id");

-- CreateIndex
CREATE INDEX "schedule_tasks_wbs_node_id_idx" ON "public"."schedule_tasks"("wbs_node_id");

-- CreateIndex
CREATE INDEX "schedule_tasks_is_critical_idx" ON "public"."schedule_tasks"("is_critical");

-- CreateIndex
CREATE INDEX "task_dependencies_schedule_id_idx" ON "public"."task_dependencies"("schedule_id");

-- CreateIndex
CREATE INDEX "task_dependencies_predecessor_id_idx" ON "public"."task_dependencies"("predecessor_id");

-- CreateIndex
CREATE INDEX "task_dependencies_successor_id_idx" ON "public"."task_dependencies"("successor_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_dependencies_predecessor_id_successor_id_key" ON "public"."task_dependencies"("predecessor_id", "successor_id");

-- CreateIndex
CREATE INDEX "progress_updates_project_id_as_of_date_idx" ON "public"."progress_updates"("project_id", "as_of_date");

-- CreateIndex
CREATE INDEX "daily_reports_project_id_idx" ON "public"."daily_reports"("project_id");

-- CreateIndex
CREATE INDEX "daily_reports_project_id_report_date_idx" ON "public"."daily_reports"("project_id", "report_date");

-- CreateIndex
CREATE INDEX "daily_reports_status_idx" ON "public"."daily_reports"("status");

-- CreateIndex
CREATE INDEX "daily_reports_budget_line_id_idx" ON "public"."daily_reports"("budget_line_id");

-- CreateIndex
CREATE INDEX "daily_report_wbs_nodes_daily_report_id_idx" ON "public"."daily_report_wbs_nodes"("daily_report_id");

-- CreateIndex
CREATE INDEX "daily_report_wbs_nodes_wbs_node_id_idx" ON "public"."daily_report_wbs_nodes"("wbs_node_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_report_wbs_nodes_daily_report_id_wbs_node_id_key" ON "public"."daily_report_wbs_nodes"("daily_report_id", "wbs_node_id");

-- CreateIndex
CREATE INDEX "daily_report_labor_daily_report_id_idx" ON "public"."daily_report_labor"("daily_report_id");

-- CreateIndex
CREATE INDEX "daily_report_equipment_daily_report_id_idx" ON "public"."daily_report_equipment"("daily_report_id");

-- CreateIndex
CREATE INDEX "daily_report_photos_daily_report_id_idx" ON "public"."daily_report_photos"("daily_report_id");

-- CreateIndex
CREATE INDEX "inventory_consumptions_daily_report_id_idx" ON "public"."inventory_consumptions"("daily_report_id");

-- CreateIndex
CREATE INDEX "inventory_consumptions_inventory_item_id_idx" ON "public"."inventory_consumptions"("inventory_item_id");

-- CreateIndex
CREATE INDEX "daily_report_suppliers_daily_report_id_idx" ON "public"."daily_report_suppliers"("daily_report_id");

-- CreateIndex
CREATE INDEX "daily_report_suppliers_global_party_id_idx" ON "public"."daily_report_suppliers"("global_party_id");

-- CreateIndex
CREATE INDEX "daily_report_suppliers_type_idx" ON "public"."daily_report_suppliers"("type");

-- CreateIndex
CREATE INDEX "wbs_progress_updates_wbs_node_id_idx" ON "public"."wbs_progress_updates"("wbs_node_id");

-- CreateIndex
CREATE INDEX "wbs_progress_updates_daily_report_id_idx" ON "public"."wbs_progress_updates"("daily_report_id");

-- CreateIndex
CREATE INDEX "wbs_progress_updates_status_idx" ON "public"."wbs_progress_updates"("status");

-- CreateIndex
CREATE INDEX "budget_line_actual_costs_budget_line_id_idx" ON "public"."budget_line_actual_costs"("budget_line_id");

-- CreateIndex
CREATE INDEX "budget_line_actual_costs_date_idx" ON "public"."budget_line_actual_costs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "budget_line_actual_costs_budget_line_id_daily_report_id_key" ON "public"."budget_line_actual_costs"("budget_line_id", "daily_report_id");

-- CreateIndex
CREATE INDEX "alerts_project_id_idx" ON "public"."alerts"("project_id");

-- CreateIndex
CREATE INDEX "alerts_daily_report_id_idx" ON "public"."alerts"("daily_report_id");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "public"."alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_resolved_idx" ON "public"."alerts"("resolved");

-- CreateIndex
CREATE INDEX "site_log_entries_project_id_log_date_idx" ON "public"."site_log_entries"("project_id", "log_date");

-- CreateIndex
CREATE INDEX "outbox_events_status_created_at_idx" ON "public"."outbox_events"("status", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_next_retry_at_idx" ON "public"."outbox_events"("next_retry_at");

-- CreateIndex
CREATE INDEX "webhook_endpoints_org_id_active_idx" ON "public"."webhook_endpoints"("org_id", "active");

-- CreateIndex
CREATE INDEX "webhook_deliveries_webhook_endpoint_id_idx" ON "public"."webhook_deliveries"("webhook_endpoint_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_outbox_event_id_idx" ON "public"."webhook_deliveries"("outbox_event_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "public"."notifications"("user_id", "read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "public"."notifications"("created_at");

-- CreateIndex
CREATE INDEX "wbs_templates_project_template_id_idx" ON "public"."wbs_templates"("project_template_id");

-- CreateIndex
CREATE INDEX "wbs_templates_parent_id_idx" ON "public"."wbs_templates"("parent_id");

-- CreateIndex
CREATE INDEX "wbs_templates_construction_system_id_idx" ON "public"."wbs_templates"("construction_system_id");

-- CreateIndex
CREATE INDEX "wbs_templates_code_idx" ON "public"."wbs_templates"("code");

-- CreateIndex
CREATE INDEX "budget_resource_templates_wbs_template_id_idx" ON "public"."budget_resource_templates"("wbs_template_id");

-- AddForeignKey
ALTER TABLE "public"."org_profiles" ADD CONSTRAINT "org_profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_profiles" ADD CONSTRAINT "org_profiles_base_currency_fkey" FOREIGN KEY ("base_currency") REFERENCES "finance"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_org_preferences" ADD CONSTRAINT "user_org_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_members" ADD CONSTRAINT "org_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_members" ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module_activations" ADD CONSTRAINT "module_activations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idempotency_keys" ADD CONSTRAINT "idempotency_keys_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_usage_metrics" ADD CONSTRAINT "org_usage_metrics_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_field_values" ADD CONSTRAINT "custom_field_values_field_definition_id_fkey" FOREIGN KEY ("field_definition_id") REFERENCES "public"."custom_field_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_definitions" ADD CONSTRAINT "workflow_definitions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_instances" ADD CONSTRAINT "workflow_instances_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_approvals" ADD CONSTRAINT "workflow_approvals_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "public"."workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_approvals" ADD CONSTRAINT "workflow_approvals_org_member_id_fkey" FOREIGN KEY ("org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_members" ADD CONSTRAINT "project_members_org_member_id_fkey" FOREIGN KEY ("org_member_id") REFERENCES "public"."org_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wbs_nodes" ADD CONSTRAINT "wbs_nodes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wbs_nodes" ADD CONSTRAINT "wbs_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_versions" ADD CONSTRAINT "budget_versions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_versions" ADD CONSTRAINT "budget_versions_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_versions" ADD CONSTRAINT "budget_versions_approved_by_org_member_id_fkey" FOREIGN KEY ("approved_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_lines" ADD CONSTRAINT "budget_lines_budget_version_id_fkey" FOREIGN KEY ("budget_version_id") REFERENCES "public"."budget_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_lines" ADD CONSTRAINT "budget_lines_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_lines" ADD CONSTRAINT "budget_lines_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_resources" ADD CONSTRAINT "budget_resources_budget_line_id_fkey" FOREIGN KEY ("budget_line_id") REFERENCES "public"."budget_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_orders" ADD CONSTRAINT "change_orders_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_orders" ADD CONSTRAINT "change_orders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_orders" ADD CONSTRAINT "change_orders_budget_version_id_fkey" FOREIGN KEY ("budget_version_id") REFERENCES "public"."budget_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_orders" ADD CONSTRAINT "change_orders_requested_by_org_member_id_fkey" FOREIGN KEY ("requested_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_orders" ADD CONSTRAINT "change_orders_approved_by_org_member_id_fkey" FOREIGN KEY ("approved_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_orders" ADD CONSTRAINT "change_orders_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_order_approvals" ADD CONSTRAINT "change_order_approvals_change_order_id_fkey" FOREIGN KEY ("change_order_id") REFERENCES "public"."change_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_order_approvals" ADD CONSTRAINT "change_order_approvals_org_member_id_fkey" FOREIGN KEY ("org_member_id") REFERENCES "public"."org_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_order_lines" ADD CONSTRAINT "change_order_lines_change_order_id_fkey" FOREIGN KEY ("change_order_id") REFERENCES "public"."change_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_order_lines" ADD CONSTRAINT "change_order_lines_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parties" ADD CONSTRAINT "parties_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resources" ADD CONSTRAINT "resources_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."party_contacts" ADD CONSTRAINT "party_contacts_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_party_contacts" ADD CONSTRAINT "global_party_contacts_global_party_id_fkey" FOREIGN KEY ("global_party_id") REFERENCES "public"."global_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_party_links" ADD CONSTRAINT "org_party_links_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_party_links" ADD CONSTRAINT "org_party_links_global_party_id_fkey" FOREIGN KEY ("global_party_id") REFERENCES "public"."global_parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_party_links" ADD CONSTRAINT "org_party_links_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_party_claims" ADD CONSTRAINT "global_party_claims_global_party_id_fkey" FOREIGN KEY ("global_party_id") REFERENCES "public"."global_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_party_reviews" ADD CONSTRAINT "global_party_reviews_global_party_id_fkey" FOREIGN KEY ("global_party_id") REFERENCES "public"."global_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_products" ADD CONSTRAINT "global_products_global_party_id_fkey" FOREIGN KEY ("global_party_id") REFERENCES "public"."global_parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."exchange_rates" ADD CONSTRAINT "exchange_rates_from_currency_fkey" FOREIGN KEY ("from_currency") REFERENCES "finance"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."exchange_rates" ADD CONSTRAINT "exchange_rates_to_currency_fkey" FOREIGN KEY ("to_currency") REFERENCES "finance"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_currency_fkey" FOREIGN KEY ("currency") REFERENCES "finance"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_deleted_by_org_member_id_fkey" FOREIGN KEY ("deleted_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_transactions" ADD CONSTRAINT "finance_transactions_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_lines" ADD CONSTRAINT "finance_lines_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "finance"."finance_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."finance_lines" ADD CONSTRAINT "finance_lines_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."payments" ADD CONSTRAINT "payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "finance"."finance_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."payments" ADD CONSTRAINT "payments_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "finance"."bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."payments" ADD CONSTRAINT "payments_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."bank_accounts" ADD CONSTRAINT "bank_accounts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."overhead_allocations" ADD CONSTRAINT "overhead_allocations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "finance"."finance_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."overhead_allocations" ADD CONSTRAINT "overhead_allocations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitments" ADD CONSTRAINT "commitments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitments" ADD CONSTRAINT "commitments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitments" ADD CONSTRAINT "commitments_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitments" ADD CONSTRAINT "commitments_currency_fkey" FOREIGN KEY ("currency") REFERENCES "finance"."currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitments" ADD CONSTRAINT "commitments_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitments" ADD CONSTRAINT "commitments_approved_by_org_member_id_fkey" FOREIGN KEY ("approved_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitment_lines" ADD CONSTRAINT "commitment_lines_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commitment_lines" ADD CONSTRAINT "commitment_lines_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_budget_version_id_fkey" FOREIGN KEY ("budget_version_id") REFERENCES "public"."budget_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_issued_by_org_member_id_fkey" FOREIGN KEY ("issued_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_approved_by_org_member_id_fkey" FOREIGN KEY ("approved_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certification_lines" ADD CONSTRAINT "certification_lines_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "public"."certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certification_lines" ADD CONSTRAINT "certification_lines_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certification_lines" ADD CONSTRAINT "certification_lines_budget_line_id_fkey" FOREIGN KEY ("budget_line_id") REFERENCES "public"."budget_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_subcategories" ADD CONSTRAINT "inventory_subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory"."inventory_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_items" ADD CONSTRAINT "inventory_items_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory"."inventory_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_items" ADD CONSTRAINT "inventory_items_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "inventory"."inventory_subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_locations" ADD CONSTRAINT "inventory_locations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_locations" ADD CONSTRAINT "inventory_locations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "inventory"."inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "inventory"."inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "finance"."finance_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."rfis" ADD CONSTRAINT "rfis_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."rfis" ADD CONSTRAINT "rfis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."rfis" ADD CONSTRAINT "rfis_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."rfis" ADD CONSTRAINT "rfis_raised_by_org_member_id_fkey" FOREIGN KEY ("raised_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."rfis" ADD CONSTRAINT "rfis_assigned_to_org_member_id_fkey" FOREIGN KEY ("assigned_to_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."rfi_comments" ADD CONSTRAINT "rfi_comments_rfi_id_fkey" FOREIGN KEY ("rfi_id") REFERENCES "quality"."rfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."rfi_comments" ADD CONSTRAINT "rfi_comments_org_member_id_fkey" FOREIGN KEY ("org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."submittals" ADD CONSTRAINT "submittals_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."submittals" ADD CONSTRAINT "submittals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."submittals" ADD CONSTRAINT "submittals_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."submittals" ADD CONSTRAINT "submittals_submitted_by_party_id_fkey" FOREIGN KEY ("submitted_by_party_id") REFERENCES "public"."parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."submittals" ADD CONSTRAINT "submittals_reviewed_by_org_member_id_fkey" FOREIGN KEY ("reviewed_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."inspections" ADD CONSTRAINT "inspections_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."inspections" ADD CONSTRAINT "inspections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."inspections" ADD CONSTRAINT "inspections_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."inspections" ADD CONSTRAINT "inspections_inspector_org_member_id_fkey" FOREIGN KEY ("inspector_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality"."inspection_items" ADD CONSTRAINT "inspection_items_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "quality"."inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_folders" ADD CONSTRAINT "document_folders_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_folders" ADD CONSTRAINT "document_folders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_folders" ADD CONSTRAINT "document_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."document_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_versions" ADD CONSTRAINT "document_versions_uploaded_by_org_member_id_fkey" FOREIGN KEY ("uploaded_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_links" ADD CONSTRAINT "document_links_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."templates" ADD CONSTRAINT "templates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."templates" ADD CONSTRAINT "templates_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."export_runs" ADD CONSTRAINT "export_runs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."export_runs" ADD CONSTRAINT "export_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."export_runs" ADD CONSTRAINT "export_runs_requested_by_org_member_id_fkey" FOREIGN KEY ("requested_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_reports" ADD CONSTRAINT "saved_reports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_reports" ADD CONSTRAINT "saved_reports_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_report_runs" ADD CONSTRAINT "saved_report_runs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."saved_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_report_runs" ADD CONSTRAINT "saved_report_runs_requested_by_org_member_id_fkey" FOREIGN KEY ("requested_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_reports" ADD CONSTRAINT "custom_reports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_reports" ADD CONSTRAINT "custom_reports_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_approved_by_org_member_id_fkey" FOREIGN KEY ("approved_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_tasks" ADD CONSTRAINT "schedule_tasks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_tasks" ADD CONSTRAINT "schedule_tasks_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_dependencies" ADD CONSTRAINT "task_dependencies_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_dependencies" ADD CONSTRAINT "task_dependencies_predecessor_id_fkey" FOREIGN KEY ("predecessor_id") REFERENCES "public"."schedule_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_dependencies" ADD CONSTRAINT "task_dependencies_successor_id_fkey" FOREIGN KEY ("successor_id") REFERENCES "public"."schedule_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_updates" ADD CONSTRAINT "progress_updates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_updates" ADD CONSTRAINT "progress_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_updates" ADD CONSTRAINT "progress_updates_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_updates" ADD CONSTRAINT "progress_updates_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "public"."schedule_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."progress_updates" ADD CONSTRAINT "progress_updates_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_reports" ADD CONSTRAINT "daily_reports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_reports" ADD CONSTRAINT "daily_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_reports" ADD CONSTRAINT "daily_reports_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_reports" ADD CONSTRAINT "daily_reports_approved_by_org_member_id_fkey" FOREIGN KEY ("approved_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_reports" ADD CONSTRAINT "daily_reports_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_reports" ADD CONSTRAINT "daily_reports_budget_line_id_fkey" FOREIGN KEY ("budget_line_id") REFERENCES "public"."budget_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_wbs_nodes" ADD CONSTRAINT "daily_report_wbs_nodes_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_wbs_nodes" ADD CONSTRAINT "daily_report_wbs_nodes_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_labor" ADD CONSTRAINT "daily_report_labor_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_equipment" ADD CONSTRAINT "daily_report_equipment_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_photos" ADD CONSTRAINT "daily_report_photos_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_photos" ADD CONSTRAINT "daily_report_photos_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_consumptions" ADD CONSTRAINT "inventory_consumptions_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_consumptions" ADD CONSTRAINT "inventory_consumptions_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory"."inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_suppliers" ADD CONSTRAINT "daily_report_suppliers_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_report_suppliers" ADD CONSTRAINT "daily_report_suppliers_global_party_id_fkey" FOREIGN KEY ("global_party_id") REFERENCES "public"."global_parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wbs_progress_updates" ADD CONSTRAINT "wbs_progress_updates_wbs_node_id_fkey" FOREIGN KEY ("wbs_node_id") REFERENCES "public"."wbs_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wbs_progress_updates" ADD CONSTRAINT "wbs_progress_updates_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_line_actual_costs" ADD CONSTRAINT "budget_line_actual_costs_budget_line_id_fkey" FOREIGN KEY ("budget_line_id") REFERENCES "public"."budget_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_line_actual_costs" ADD CONSTRAINT "budget_line_actual_costs_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "public"."daily_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_log_entries" ADD CONSTRAINT "site_log_entries_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_log_entries" ADD CONSTRAINT "site_log_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_log_entries" ADD CONSTRAINT "site_log_entries_created_by_org_member_id_fkey" FOREIGN KEY ("created_by_org_member_id") REFERENCES "public"."org_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outbox_events" ADD CONSTRAINT "outbox_events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_endpoint_id_fkey" FOREIGN KEY ("webhook_endpoint_id") REFERENCES "public"."webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_outbox_event_id_fkey" FOREIGN KEY ("outbox_event_id") REFERENCES "public"."outbox_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wbs_templates" ADD CONSTRAINT "wbs_templates_project_template_id_fkey" FOREIGN KEY ("project_template_id") REFERENCES "public"."project_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wbs_templates" ADD CONSTRAINT "wbs_templates_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."wbs_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wbs_templates" ADD CONSTRAINT "wbs_templates_construction_system_id_fkey" FOREIGN KEY ("construction_system_id") REFERENCES "public"."construction_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_resource_templates" ADD CONSTRAINT "budget_resource_templates_wbs_template_id_fkey" FOREIGN KEY ("wbs_template_id") REFERENCES "public"."wbs_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

