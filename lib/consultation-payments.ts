import {
  CONSULTATION_PRICES,
  claimLatePaymentRefund,
  getConsultationBooking,
  markBookingPaid,
  refundLatePayment,
  sendConsultationConfirmation,
  sendRefundNotice,
  updateConsultationBooking,
} from '@/lib/consultation-booking'

async function razorpayGet(path: string) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Payment verification is not configured.')
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
    cache: 'no-store', signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('Payment could not be verified.')
  return response.json()
}

export async function verifyAndConfirmConsultation(bookingId: string, paymentLinkId: string) {
  const booking = await getConsultationBooking({ id: bookingId })
  if (!booking || booking.payment_link_id !== paymentLinkId) return { state: 'error', status: 404, message: 'We could not find this booking.' }

  const link = await razorpayGet(`payment_links/${encodeURIComponent(paymentLinkId)}`)
  if (link.reference_id !== booking.id) return { state: 'error', status: 400, message: 'This payment does not match the booking.' }
  if (link.status === 'expired' || link.status === 'cancelled') {
    return { state: 'not_paid', status: 200, message: 'Payment was not completed before the time hold ended. No consultation is confirmed. Choose another time to try again.' }
  }
  if (link.status !== 'paid') return { state: 'pending', status: 202, message: 'Payment is still being verified. Refresh this page in a moment.' }

  const amount = CONSULTATION_PRICES[booking.session_minutes]
  if (link.amount !== amount || link.currency !== 'INR') return { state: 'error', status: 400, message: 'The payment amount does not match this session.' }
  const paymentId = String(link.payments?.find((payment: { status?: string }) => payment.status === 'captured')?.payment_id || link.payments?.[0]?.payment_id || '')
  if (!paymentId) return { state: 'pending', status: 202, message: 'Payment is still being verified. Refresh this page in a moment.' }
  const payment = await razorpayGet(`payments/${encodeURIComponent(paymentId)}`)
  if (payment.status !== 'captured' || payment.amount !== amount || payment.currency !== 'INR' || payment.payment_link_id !== paymentLinkId) {
    return { state: 'pending', status: 202, message: 'Payment is still being verified. Refresh this page in a moment.' }
  }

  const result = await markBookingPaid(booking, paymentId, payment.amount, payment.currency)
  if (result === 'refund') {
    if (await claimLatePaymentRefund(booking.id)) {
      try {
        const refund = await refundLatePayment(paymentId, booking.id)
        await updateConsultationBooking(booking.id, { status: 'refunded_late_payment', refund_id: refund.id })
        await sendRefundNotice(booking).catch(() => null)
      } catch (error) {
        await updateConsultationBooking(booking.id, { status: 'refund_pending' })
        throw error
      }
    }
    return { state: 'refund', status: 200, message: 'The selected time was no longer available. A full refund has been initiated. Please allow your bank’s normal processing time.' }
  }
  if (result !== 'confirmed' && result !== 'already_confirmed') return { state: 'error', status: 409, message: 'We could not confirm the booking. Please contact Flowmint.' }

  try { await sendConsultationConfirmation(booking, paymentId) } catch { /* Keep payment confirmed and let Razorpay retry the webhook. */ }
  const latest = await getConsultationBooking({ id: booking.id })
  const emailSent = latest?.confirmation_email_status === 'sent'
  return {
    state: 'confirmed', status: 200,
    emailSent,
    message: emailSent
      ? 'Payment received. Your consultation is confirmed, and a confirmation email is on its way.'
      : 'Payment received and your slot is confirmed. Email confirmation is pending; contact Flowmint if it does not arrive.',
  }
}
