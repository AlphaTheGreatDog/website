import { Resend } from 'resend'

// Centralized so every caller shares the same "is email configured" check
// instead of each re-reading process.env.RESEND_API_KEY.
let client: Resend | null = null

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  if (!client) {
    client = new Resend(apiKey)
  }
  return client
}

// The address contact-form notifications are sent from. Resend requires a
// verified sending domain in production; falls back to their shared
// onboarding address for local/dev use.
export const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'
