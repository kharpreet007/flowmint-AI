import type { Metadata } from 'next'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { Eyebrow } from '@/components/site'
import { ConsultationBookingForm } from '@/components/consultation-booking-form'

export const metadata: Metadata = {
  title: 'Book a 1:1 Consultation',
  description: 'Choose a 30- or 60-minute Flowmint consultation and request a date and time that works for you.',
}

export default function ConsultationPage() {
  return <>
    <section className="consultation-page section-wrap">
      <Link className="consult-back" href="/"><ArrowLeft size={15}/> Back to Flowmint</Link>
      <div className="consultation-intro">
        <Eyebrow>FLOWMINT 1:1 CONSULTATION</Eyebrow>
        <h1>Make progress on a challenge that matters.</h1>
        <p>Bring a question, a work-in-progress, or an idea you want to make real. We’ll use the time to find a clear, practical next step.</p>
      </div>
      <div className="consultation-layout">
        <div className="consultation-details">
          <h2>A focused conversation, shaped around you.</h2>
          <p>Use your session to think through a product idea, improve a workflow, or get unstuck on a practical work challenge.</p>
          <ul><li><Check size={16}/>One-to-one time focused on your goal</li><li><Check size={16}/>Practical ideas you can act on</li><li><Check size={16}/>A clear next step to take away</li></ul>
          <p className="consult-timezone">All available dates and times are shown in India Standard Time (IST).</p>
        </div>
        <div className="consultation-booking-card"><ConsultationBookingForm/></div>
      </div>
    </section>
  </>
}
