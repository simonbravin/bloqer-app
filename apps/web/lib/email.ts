/**
 * Email service for Construction ERP.
 * Mock implementation logs to console; replace with Resend/Nodemailer for production.
 */

const RESET_TOKEN_EXPIRY_HOURS = 1

export function getResetTokenExpires(): Date {
  const expires = new Date()
  expires.setHours(expires.getHours() + RESET_TOKEN_EXPIRY_HOURS)
  return expires
}

export type SendPasswordResetOptions = {
  to: string
  resetToken: string
  resetUrl: string
}

/**
 * Sends a password reset email.
 * Mock: logs link to console. In production, use Resend or Nodemailer.
 */
export async function sendPasswordResetEmail(
  options: SendPasswordResetOptions
): Promise<{ ok: boolean; error?: string }> {
  const { to, resetToken, resetUrl } = options
  const link = `${resetUrl}?token=${resetToken}`

  try {
    // Mock: log instead of sending (replace with actual provider)
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('[Email Mock] Password reset requested:', { to, link })
    }

    // Production: uncomment and configure Resend/Nodemailer
    // const res = await resend.emails.send({ from: '...', to, subject: '...', html: `...${link}...` })
    // if (!res.data) return { ok: false, error: res.error?.message }

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email'
    return { ok: false, error: message }
  }
}
