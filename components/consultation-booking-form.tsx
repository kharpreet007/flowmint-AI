'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, CalendarDays, Clock3, LockKeyhole } from 'lucide-react'

const durations = [
  { minutes: 30, price: 299, description: 'One focused question or a quick review.' },
  { minutes: 60, price: 499, description: 'More time to explore a challenge in depth.' },
]

const times = [
  { value: '09:00', label: '9:00 AM' }, { value: '10:30', label: '10:30 AM' },
  { value: '12:00', label: '12:00 PM' }, { value: '13:30', label: '1:30 PM' },
  { value: '15:00', label: '3:00 PM' }, { value: '16:30', label: '4:30 PM' },
]
const bookingTimeZone = 'Asia/Kolkata'

function dateInBookingTimeZone(date: Date) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: bookingTimeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const part = (type: string) => parts.find(item => item.type === type)?.value || ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function ConsultationBookingForm() {
  const [duration, setDuration] = useState(30)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const dateOptions = useMemo(() => Array.from({ length: 30 }, (_, index) => {
    const day = new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
    const value = dateInBookingTimeZone(day)
    return { value, label: new Intl.DateTimeFormat('en', { timeZone: bookingTimeZone, weekday: 'short', month: 'long', day: 'numeric' }).format(day) }
  }), [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setNotice('')
    try {
      const response = await fetch('/api/consultation/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(form.get('name') || '').trim(),
          email: String(form.get('email') || '').trim(),
          minutes: duration,
          date,
          time,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.paymentUrl) throw new Error(result.error || 'We could not start checkout. Please try again.')
      window.location.assign(result.paymentUrl)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'We could not start checkout. Please try again.')
      setSubmitting(false)
    }
  }

  return <form className="consult-booking-form" onSubmit={submit}>
    <fieldset className="consult-duration-options">
      <legend>Choose a session</legend>
      {durations.map(option => <label className={`consult-duration-card${duration === option.minutes ? ' selected' : ''}`} key={option.minutes}>
        <input type="radio" name="duration" value={option.minutes} checked={duration === option.minutes} onChange={() => setDuration(option.minutes)} />
        <span className="consult-duration-copy"><strong>{option.minutes}-minute consultation</strong><small>{option.description}</small></span>
        <span className="consult-duration-price">₹{option.price}</span>
      </label>)}
    </fieldset>

    <div className="consult-booking-grid">
      <label><span><CalendarDays size={16}/> Consultation date</span><select required value={date} onChange={event => setDate(event.target.value)}><option value="">Choose a date</option>{dateOptions.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
      <label><span><Clock3 size={16}/> Start time (IST)</span><select required value={time} onChange={event => setTime(event.target.value)}><option value="">Choose a time</option>{times.map(slot => <option value={slot.value} key={slot.value}>{slot.label}</option>)}</select></label>
    </div>

    <div className="consult-booking-grid">
      <label><span>Your name</span><input name="name" autoComplete="name" required placeholder="Name" /></label>
      <label><span>Email address</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
    </div>
    <button className="button button-dark consult-submit" type="submit" disabled={submitting}>{submitting ? 'Opening secure checkout…' : <>Continue to payment · ₹{durations.find(item => item.minutes === duration)?.price}<ArrowRight size={16}/></>}</button>
    <p className="consult-booking-note" aria-live="polite">{notice || <>Your selected time is held for 15 minutes while you pay. It’s confirmed after payment verification. <span><LockKeyhole size={13}/> Secure payment by Razorpay</span></>}</p>
  </form>
}
