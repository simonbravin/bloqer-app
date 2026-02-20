/**
 * One-time backfill: set paidDate = issueDate for all PAID transactions
 * where paidDate is null. This fixes "Pagos realizados hasta la fecha"
 * and "Cobros recibidos hasta la fecha" in Proyección de caja for data
 * that was marked PAID before the app started setting paidDate.
 *
 * Run: pnpm --filter @repo/database run db:backfill-paid-date
 */
import { prisma } from './client'

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE finance.finance_transactions
    SET paid_date = issue_date
    WHERE status = 'PAID' AND paid_date IS NULL AND deleted = false
  `
  console.log(`Backfill completed: ${result} row(s) updated.`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
