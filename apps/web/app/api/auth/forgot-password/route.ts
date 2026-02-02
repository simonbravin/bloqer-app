import { NextResponse } from 'next/server'
import { prisma } from '@repo/database'
import { forgotPasswordSchema } from '@repo/validators'
import crypto from 'node:crypto'
import {
  getResetTokenExpires,
  sendPasswordResetEmail,
} from '@/lib/email'

const RESET_TOKEN_BYTES = 32

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 * Verifies email exists, generates reset token, stores with expiry, sends email (mock).
 * Always returns 200 with same message to avoid email enumeration.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    const genericMessage =
      'Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.'

    if (!user || !user.active) {
      return NextResponse.json({ message: genericMessage }, { status: 200 })
    }

    const resetToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex')
    const resetTokenExpires = getResetTokenExpires()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    const baseUrl =
      process.env.NEXTAUTH_URL ??
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password`

    const sendResult = await sendPasswordResetEmail({
      to: user.email,
      resetToken,
      resetUrl,
    })

    if (!sendResult.ok) {
      return NextResponse.json(
        { error: 'No se pudo enviar el correo. Intenta más tarde.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: genericMessage })
  } catch {
    return NextResponse.json(
      { error: 'Error interno. Intenta más tarde.' },
      { status: 500 }
    )
  }
}
