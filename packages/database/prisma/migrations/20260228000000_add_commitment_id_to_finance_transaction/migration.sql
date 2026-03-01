-- AlterTable (finance schema)
ALTER TABLE "finance"."finance_transactions" ADD COLUMN IF NOT EXISTS "commitment_id" UUID;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "finance_transactions_commitment_id_idx" ON "finance"."finance_transactions"("commitment_id");

-- AddForeignKey (reference to public.commitments)
ALTER TABLE "finance"."finance_transactions"
  ADD CONSTRAINT "finance_transactions_commitment_id_fkey"
  FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
