import type { Metadata } from 'next'
import { ConsultationPaymentResult } from '@/components/consultation-payment-result'

export const metadata: Metadata = { title: 'Consultation Booking Status' }

export default function ConsultationComplete({ searchParams }: { searchParams: { booking_id?: string; razorpay_payment_link_id?: string } }) {
  return <ConsultationPaymentResult
    bookingId={searchParams.booking_id || ''}
    paymentLinkId={searchParams.razorpay_payment_link_id || ''}
  />
}
