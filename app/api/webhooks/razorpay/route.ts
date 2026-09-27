import { NextResponse } from 'next/server'
import { getConsultationBooking, updateConsultationBooking, verifyRazorpayWebhook } from '@/lib/consultation-booking'
import { verifyAndConfirmConsultation } from '@/lib/consultation-payments'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!verifyRazorpayWebhook(rawBody, request.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  let event: { event?: string; payload?: { payment_link?: { entity?: { id?: string; reference_id?: string } } } }
  try { event = JSON.parse(rawBody) } catch { return NextResponse.json({ error: 'Invalid event.' }, { status: 400 }) }

  const paymentLink = event.payload?.payment_link?.entity
  if (!paymentLink?.id) return NextResponse.json({ received: true })

  if (event.event === 'payment_link.paid' && paymentLink.reference_id) {
    try {
      const result = await verifyAndConfirmConsultation(paymentLink.reference_id, paymentLink.id)
      if (result.state === 'confirmed' && !result.emailSent) {
        return NextResponse.json({ error: 'Confirmation email is not ready; retry this event.' }, { status: 503 })
      }
      if (result.state === 'error') return NextResponse.json({ error: result.message }, { status: 400 })
      return NextResponse.json({ received: true, state: result.state })
    } catch {
      return NextResponse.json({ error: 'Payment confirmation could not be completed yet.' }, { status: 503 })
    }
  }

  if (event.event === 'payment_link.expired') {
    try {
      const booking = await getConsultationBooking({ payment_link_id: paymentLink.id })
      if (booking?.status === 'pending_payment') {
        await updateConsultationBooking(booking.id, { status: 'expired' }, '&status=eq.pending_payment')
      }
    } catch {
      return NextResponse.json({ error: 'Could not update the expired booking.' }, { status: 503 })
    }
  }

  return NextResponse.json({ received: true })
}
