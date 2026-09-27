'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react'

type Props = { bookingId: string; paymentLinkId: string }

export function ConsultationPaymentResult({ bookingId, paymentLinkId }: Props) {
  const [state, setState] = useState<'loading' | 'confirmed' | 'pending' | 'refund' | 'error'>('loading')
  const [message, setMessage] = useState('We’re verifying your payment securely.')

  useEffect(() => {
    if (!bookingId || !paymentLinkId) {
      setState('error')
      setMessage('We could not find payment details for this visit. If you completed payment, please contact Flowmint.')
      return
    }
    let active = true
    let attempts = 0
    const verify = async () => {
      try {
        const response = await fetch('/api/consultation/verify-payment', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, paymentLinkId }),
          cache: 'no-store',
        })
        const result = await response.json()
        if (!active) return
        if (result.state === 'confirmed') { setState('confirmed'); setMessage(result.message); return }
        if (result.state === 'refund') { setState('refund'); setMessage(result.message); return }
        if (result.state === 'not_paid') { setState('error'); setMessage(result.message); return }
        if (result.state === 'error' || response.status >= 400) { setState('error'); setMessage(result.message || result.error || 'We could not verify this payment.'); return }
        attempts += 1
        setState('pending')
        setMessage(result.message || 'Payment is still being verified. This page will check again shortly.')
        if (attempts < 6) window.setTimeout(verify, 2500)
      } catch {
        if (!active) return
        attempts += 1
        setState('pending')
        setMessage('Payment verification is taking longer than expected. Please keep this page open or contact Flowmint.')
        if (attempts < 6) window.setTimeout(verify, 3000)
      }
    }
    void verify()
    return () => { active = false }
  }, [bookingId, paymentLinkId])

  const successful = state === 'confirmed'
  const pending = state === 'loading' || state === 'pending'
  return <section className="consult-payment-result section-wrap">
    <div className="consult-payment-result-card">
      <span className={`consult-result-icon${successful ? ' success' : ''}`}>{pending ? <LoaderCircle className="spin" size={25}/> : successful ? <CheckCircle2 size={27}/> : <CircleAlert size={26}/>}</span>
      <p className="eyebrow"><span className="eyebrow-dot"/>{successful ? 'BOOKING CONFIRMED' : pending ? 'PAYMENT STATUS' : state === 'refund' ? 'REFUND STARTED' : 'BOOKING UPDATE'}</p>
      <h1>{successful ? 'You’re booked.' : pending ? 'Just a moment.' : state === 'refund' ? 'We’re returning your payment.' : 'Your booking isn’t confirmed yet.'}</h1>
      <p>{message}</p>
      {successful && <p className="consult-result-email">A confirmation email will be sent to the address you entered at checkout.</p>}
      <div className="consult-result-actions"><Link className="button button-dark" href={successful ? '/' : '/consultation'}>{successful ? 'Back to Flowmint' : 'Choose a consultation time'} <ArrowRight size={16}/></Link></div>
    </div>
  </section>
}
