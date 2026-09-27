import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function mailchimpConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX
  if (!apiKey || !audienceId || !serverPrefix) return null
  return { apiKey, audienceId, serverPrefix }
}

export async function GET() {
  return NextResponse.json(
    { configured: Boolean(mailchimpConfig()) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request) {
  const config = mailchimpConfig()
  if (!config) {
    return NextResponse.json(
      { error: 'Email signup is not connected yet. Please check back soon.' },
      { status: 503 },
    )
  }

  let email = ''
  let marketingConsent = false
  try {
    const body = await request.json()
    email = String(body.email || '').trim().toLowerCase()
    marketingConsent = body.marketingConsent === true
  } catch {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  // The ebook request does not imply permission for marketing. Only send opted-in
  // addresses to Mailchimp; the site serves the requested ebook either way.
  if (!marketingConsent) return NextResponse.json({ ok: true, subscribed: false })

  const subscriberHash = createHash('md5').update(email).digest('hex')
  const url = `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${encodeURIComponent(config.audienceId)}/members/${subscriberHash}`
  const authorization = Buffer.from(`flowmint:${config.apiKey}`).toString('base64')

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${authorization}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email_address: email, status_if_new: 'subscribed', status: 'subscribed' }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })

    if (!response.ok) {
      // Do not expose Mailchimp's response body or account details to the browser.
      return NextResponse.json(
        { error: 'We could not add you to the Flowmint list. Please check your email and try again.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, subscribed: true })
  } catch {
    return NextResponse.json(
      { error: 'We could not reach Mailchimp. Please try again in a moment.' },
      { status: 502 },
    )
  }
}
