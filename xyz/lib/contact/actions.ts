'use server'

import { getAdminEmails } from '@/lib/db/queries'
import { getResendClient, CONTACT_FROM_EMAIL } from '@/lib/mail/resend'

export type ContactActionState = { error: string; success?: false } | { success: true } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Minimal HTML escaping — this text is echoed verbatim into an HTML email,
// so untrusted input must not be interpreted as markup.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildAdminNotificationEmail(name: string, email: string, query: string) {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeQuery = escapeHtml(query).replace(/\n/g, '<br />')
  const submittedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const html = `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    <div style="border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px;">
      <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #6b6b6b; margin: 0 0 4px;">XYZ &mdash; Contact Us</p>
      <h1 style="font-size: 20px; margin: 0;">New customer query received</h1>
    </div>

    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      A visitor submitted the contact form on the website. Their details are below.
    </p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; width: 120px; color: #6b6b6b; vertical-align: top; border-top: 1px solid #e5e5e5;">Name</td>
        <td style="padding: 10px 0; border-top: 1px solid #e5e5e5;">${safeName}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b6b6b; vertical-align: top; border-top: 1px solid #e5e5e5;">Email</td>
        <td style="padding: 10px 0; border-top: 1px solid #e5e5e5;">
          <a href="mailto:${safeEmail}" style="color: #1a1a1a;">${safeEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #6b6b6b; vertical-align: top; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;">Submitted</td>
        <td style="padding: 10px 0; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;">${submittedAt}</td>
      </tr>
    </table>

    <p style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #6b6b6b; margin: 24px 0 8px;">Query</p>
    <p style="font-size: 14px; line-height: 1.7; background: #f7f6f4; border: 1px solid #e5e5e5; border-radius: 4px; padding: 16px; margin: 0 0 24px; white-space: pre-line;">${safeQuery}</p>

    <p style="font-size: 12px; color: #6b6b6b; margin: 0;">
      Reply directly to this email, or write to ${safeEmail}, to respond to ${safeName}.
    </p>
  </div>`

  const text = [
    'New customer query received via the XYZ contact form.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Submitted: ${submittedAt}`,
    '',
    'Query:',
    query,
  ].join('\n')

  return { html, text }
}

export async function submitContactQuery(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const query = String(formData.get('query') ?? '').trim()

  if (!name) {
    return { error: 'Enter your name.' }
  }
  if (!EMAIL_RE.test(email)) {
    return { error: 'Enter a valid email address.' }
  }
  if (!query) {
    return { error: 'Enter your question or message.' }
  }
  if (query.length > 5000) {
    return { error: 'Message is too long. Please keep it under 5000 characters.' }
  }

  const adminEmails = await getAdminEmails()
  if (adminEmails.length === 0) {
    return { error: 'We couldn\u2019t send your message right now. Please try again later.' }
  }

  const resend = getResendClient()
  if (!resend) {
    // No RESEND_API_KEY configured — fail loudly in dev instead of silently
    // dropping the query, since that's easy to miss.
    console.error(
      'submitContactQuery: RESEND_API_KEY is not set, so the admin notification email was not sent.'
    )
    return { error: 'We couldn\u2019t send your message right now. Please try again later.' }
  }

  const { html, text } = buildAdminNotificationEmail(name, email, query)
  // Subject line goes into an email header — strip any newlines a user
  // could smuggle in via the name field.
  const safeSubjectName = name.replace(/[\r\n]/g, ' ').slice(0, 100)

  const { error } = await resend.emails.send({
    from: `XYZ Website <${CONTACT_FROM_EMAIL}>`,
    to: adminEmails,
    replyTo: email,
    subject: `New Contact Us query from ${safeSubjectName}`,
    html,
    text,
  })

  if (error) {
    console.error('submitContactQuery: Resend failed to send admin notification', error)
    return { error: 'We couldn\u2019t send your message right now. Please try again later.' }
  }

  return { success: true }
}
