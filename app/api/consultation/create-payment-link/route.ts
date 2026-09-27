import { NextResponse } from 'next/server'
import { BOOKING_TIME_ZONE, CONSULTATION_PRICES, CONSULTATION_TIMES, hasBookingStorage, reserveConsultation, updateConsultationBooking } from '@/lib/consultation-booking'

export const dynamic = 'force-dynamic'

function validBookingDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const chosen = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(chosen.getTime()) || chosen.toISOString().slice(0, 10) !== value) return false
  const parts = new Intl.DateTimeFormat('en', { timeZone: BOOKING_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const part = (type: string) => parts.find(item => item.type === type)?.value || ''
  const todayInBookingTimeZone = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`)
  const earliest = new Date(todayInBookingTimeZone)
  earliest.setUTCDate(earliest.getUTCDate() + 1)
  const latest = new Date(earliest)
  latest.setUTCDate(latest.getUTCDate() + 29)
  return chosen >= earliest && chosen <= latest
}

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret || !hasBookingStorage()) {
    return NextResponse.json({ error: 'Consultation booking is being set up. Please try again soon.' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Please review your booking details and try again.' }, { status: 400 })
  }

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const date = String(body.date || '')
  const time = String(body.time || '')
  const minutes = Number(body.minutes)
  const amountPaise = CONSULTATION_PRICES[minutes]

  if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter your name and a valid email address.' }, { status: 400 })
  }
  if (!amountPaise || !validBookingDate(date) || !CONSULTATION_TIMES.includes(time)) {
    return NextResponse.json({ error: 'Choose a valid session, date, and available time.' }, { status: 400 })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  let bookingId: string | null
  try {
    bookingId = await reserveConsultation({ name, email, minutes, amountPaise, date, time, expiresAt: expiresAt.toISOString() })
  } catch {
    return NextResponse.json({ error: 'Booking storage is unavailable right now. Please try again shortly.' }, { status: 503 })
  }
  if (!bookingId) {
    return NextResponse.json({ error: 'That time was just selected by someone else. Please choose another slot.' }, { status: 409 })
  }

  try {
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        accept_partial: false,
        reference_id: bookingId,
        description: `Flowmint ${minutes}-minute consultation`,
        customer: { name, email },
        notify: { email: false, sms: false },
        reminder_enable: false,
        expire_by: Math.floor(expiresAt.getTime() / 1000),
        callback_url: `${siteUrl}/consultation/complete?booking_id=${encodeURIComponent(bookingId)}`,
        callback_method: 'get',
        notes: { booking_id: bookingId, session_minutes: String(minutes), slot_date: date, slot_time: time, time_zone: BOOKING_TIME_ZONE },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    })
    const paymentLink = await response.json()
    if (!response.ok || !paymentLink.short_url || !paymentLink.id) throw new Error('Payment link creation failed')
    await updateConsultationBooking(bookingId, {
      payment_link_id: paymentLink.id,
      payment_link_url: paymentLink.short_url,
      status: 'pending_payment',
    })
    return NextResponse.json({ paymentUrl: paymentLink.short_url })
  } catch {
    await updateConsultationBooking(bookingId, { status: 'payment_link_failed' }).catch(() => null)
    return NextResponse.json({ error: 'We could not open secure checkout. Your time was not booked. Please try again.' }, { status: 502 })
  }
}
