import { NextResponse } from 'next/server'
import { verifyAndConfirmConsultation } from '@/lib/consultation-payments'

export const dynamic = 'force-dynamic'

async function respond(bookingId: string, paymentLinkId: string) {
  if (!bookingId || !paymentLinkId) return NextResponse.json({ error: 'No payment details were received.' }, { status: 400 })
  try {
    const result = await verifyAndConfirmConsultation(bookingId, paymentLinkId)
    return NextResponse.json(result, { status: result.status })
  } catch {
    return NextResponse.json({ error: 'Payment verification is temporarily unavailable. Please refresh in a moment.' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  let body: { bookingId?: string; paymentLinkId?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid payment confirmation.' }, { status: 400 }) }
  return respond(body.bookingId || '', body.paymentLinkId || '')
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams
  return respond(query.get('booking_id') || '', query.get('razorpay_payment_link_id') || '')
}
