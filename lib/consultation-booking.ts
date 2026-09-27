import { createHmac, timingSafeEqual } from 'node:crypto'

export const CONSULTATION_PRICES: Record<number, number> = { 30: 29900, 60: 49900 }
export const CONSULTATION_TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30']
export const BOOKING_TIME_ZONE = process.env.CONSULTATION_TIME_ZONE || 'Asia/Kolkata'

export type ConsultationBooking = {
  id: string
  name: string
  email: string
  session_minutes: number
  amount_paise: number
  slot_date: string
  slot_time: string
  status: string
  payment_link_id: string | null
  payment_link_url: string | null
  expires_at: string
  confirmation_email_status: string
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Consultation booking storage is not configured.')
  return { url, key }
}

export function hasBookingStorage() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY))
}

async function database(path: string, init: RequestInit = {}) {
  const { url, key } = supabaseConfig()
  const authorization = key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      ...authorization,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`Booking storage returned ${response.status}.`)
  return response.status === 204 ? null : response.json()
}

export async function reserveConsultation(input: {
  name: string; email: string; minutes: number; amountPaise: number; date: string; time: string; expiresAt: string
}) {
  const rows = await database('rpc/reserve_consultation_slot', {
    method: 'POST',
    body: JSON.stringify({
      p_name: input.name,
      p_email: input.email,
      p_session_minutes: input.minutes,
      p_amount_paise: input.amountPaise,
      p_slot_date: input.date,
      p_slot_time: input.time,
      p_expires_at: input.expiresAt,
    }),
  }) as Array<{ booking_id: string | null }>
  return rows?.[0]?.booking_id || null
}

export async function getConsultationBooking(filters: { id?: string; payment_link_id?: string }) {
  const query = filters.id
    ? `id=eq.${encodeURIComponent(filters.id)}`
    : `payment_link_id=eq.${encodeURIComponent(filters.payment_link_id || '')}`
  const rows = await database(`consultation_bookings?${query}&select=*`) as ConsultationBooking[]
  return rows?.[0] || null
}

export async function updateConsultationBooking(id: string, values: Record<string, unknown>, extraFilter = '') {
  return database(`consultation_bookings?id=eq.${encodeURIComponent(id)}${extraFilter}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(values),
  }) as Promise<ConsultationBooking[] | null>
}

export async function markBookingPaid(booking: ConsultationBooking, paymentId: string, amount: number, currency: string) {
  const expected = CONSULTATION_PRICES[booking.session_minutes]
  if (currency !== 'INR' || amount !== expected || amount !== booking.amount_paise) return 'invalid' as const
  const result = await database('rpc/confirm_consultation_payment', {
    method: 'POST',
    body: JSON.stringify({ p_booking_id: booking.id, p_payment_id: paymentId }),
  }) as Array<{ result: string }>
  return result?.[0]?.result || 'invalid'
}

export async function claimConfirmationEmail(bookingId: string) {
  const result = await database('rpc/claim_consultation_confirmation_email', {
    method: 'POST',
    body: JSON.stringify({ p_booking_id: bookingId }),
  }) as Array<{ claimed: boolean }>
  return result?.[0]?.claimed === true
}

export async function claimLatePaymentRefund(bookingId: string) {
  const result = await database('rpc/claim_consultation_refund', {
    method: 'POST',
    body: JSON.stringify({ p_booking_id: bookingId }),
  }) as Array<{ claimed: boolean }>
  return result?.[0]?.claimed === true
}

export function verifyRazorpayWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest()
  let provided: Buffer
  try { provided = Buffer.from(signature, 'hex') } catch { return false }
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character))
}

export async function sendConsultationConfirmation(booking: ConsultationBooking, paymentId: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONSULTATION_FROM_EMAIL
  if (!apiKey || !from) throw new Error('Confirmation email is not configured.')
  if (!await claimConfirmationEmail(booking.id)) return false

  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${booking.slot_date}T12:00:00Z`))
  const [hour, minute] = booking.slot_time.split(':').map(Number)
  const time = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric', minute: '2-digit', timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 0, 1, hour, minute)))
  const price = `₹${Math.round(booking.amount_paise / 100)}`
  const name = escapeHtml(booking.name)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://flowmint.ai').replace(/\/$/, '')
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [booking.email],
      subject: 'Your Flowmint consultation is confirmed',
      html: `<div style="font-family:Arial,sans-serif;color:#201e26;line-height:1.6;max-width:600px;margin:auto"><p style="color:#6d5ce7;font-weight:700;letter-spacing:1px">FLOWMINT 1:1 CONSULTATION</p><h1 style="font-size:26px">Your session is confirmed.</h1><p>Hi ${name}, your payment of <strong>${price}</strong> was received and your consultation is booked.</p><div style="background:#f7f5fc;border:1px solid #e5e1ed;border-radius:12px;padding:20px;margin:24px 0"><p style="margin:0 0 8px"><strong>${booking.session_minutes}-minute consultation</strong></p><p style="margin:0">${escapeHtml(date)} at ${escapeHtml(time)} (${escapeHtml(BOOKING_TIME_ZONE)})</p></div><p>Payment reference: ${escapeHtml(paymentId)}</p><p>We’ll be in touch if we need anything else before the session.</p><p><a href="${siteUrl}" style="color:#6d5ce7">Visit Flowmint</a></p></div>`,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    await updateConsultationBooking(booking.id, { confirmation_email_status: 'pending', confirmation_email_claimed_at: null })
    throw new Error('Confirmation email could not be sent.')
  }
  await updateConsultationBooking(booking.id, { confirmation_email_status: 'sent', confirmation_email_sent_at: new Date().toISOString(), confirmation_email_claimed_at: null })
  return true
}

export async function refundLatePayment(paymentId: string, bookingId: string) {
  const apiKey = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!apiKey || !secret) throw new Error('Payment provider is not configured.')
  const authorization = `Basic ${Buffer.from(`${apiKey}:${secret}`).toString('base64')}`
  const existingResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refunds`, {
    headers: { Authorization: authorization }, cache: 'no-store', signal: AbortSignal.timeout(10000),
  })
  if (!existingResponse.ok) throw new Error('Existing refunds could not be checked.')
  const existing = await existingResponse.json() as { items?: Array<{ id: string; amount: number; status: string }> }
  const applicableRefunds = (existing.items || []).filter(refund => refund.status !== 'failed')
  const alreadyRefunded = applicableRefunds.reduce((sum, refund) => sum + refund.amount, 0)
  const payment = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authorization }, cache: 'no-store', signal: AbortSignal.timeout(10000),
  })
  if (!payment.ok) throw new Error('Payment details could not be checked before refund.')
  const paymentData = await payment.json() as { amount: number }
  const remaining = paymentData.amount - alreadyRefunded
  if (remaining <= 0) return { id: applicableRefunds[0]?.id || paymentId }
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: remaining, notes: { booking_id: bookingId, reason: 'Selected consultation slot is no longer available' } }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('The late payment refund could not be started.')
  return response.json() as Promise<{ id: string }>
}

export async function sendRefundNotice(booking: ConsultationBooking) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONSULTATION_FROM_EMAIL
  if (!apiKey || !from) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [booking.email], subject: 'Your Flowmint consultation payment is being refunded',
      text: `Your selected consultation time is no longer available. A full refund of ₹${Math.round(booking.amount_paise / 100)} has been initiated. Please choose another time at ${(process.env.NEXT_PUBLIC_SITE_URL || 'https://flowmint.ai').replace(/\/$/, '')}/consultation.`,
    }),
    cache: 'no-store', signal: AbortSignal.timeout(10000),
  })
}
