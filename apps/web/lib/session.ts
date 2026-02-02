import { auth } from '@/lib/auth'

export async function getSession() {
  return auth()
}
