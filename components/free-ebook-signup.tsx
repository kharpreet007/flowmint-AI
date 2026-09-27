'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Check, Download, LockKeyhole, Sparkles } from 'lucide-react'
import { Eyebrow } from '@/components/site'

export function FreeEbookSignup() {
  const [email, setEmail] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/subscribe', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false))
      .finally(() => setLoadingConfig(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setSending(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, marketingConsent }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'We could not save your email. Please try again.')
      setSuccess(true)
      setMessage(data.subscribed
        ? 'Thanks for joining the Flowmint list. Your ebook download is starting.'
        : 'Your ebook download is starting. You have not been subscribed to product updates.')
      const link = document.createElement('a')
      link.href = '/downloads/flowmint-digital-products-starter-ebook.pdf'
      link.download = 'flowmint-digital-products-starter-ebook.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="lead-magnet section-wrap" id="free-ebook">
      <div className="lead-copy">
        <Eyebrow>YOUR FREE DIGITAL STARTER EBOOK</Eyebrow>
        <h2>Small tools. Clearer days. Less repeat work.</h2>
        <p className="lead-intro">
          Get a free starter ebook with practical productivity tools, 44 ready-to-use prompts, and simple workflow automation exercises. Plan what matters, find a useful next step, and make recurring tasks easier.
        </p>
        <ul className="lead-benefits">
          <li><Check /><span><strong>Productivity tools</strong> for planning, focus, and reflection</span></li>
          <li><Check /><span><strong>44 prompts</strong> to spark ideas and simplify everyday work</span></li>
          <li><Check /><span><strong>Workflow automation planner</strong> to make repeat tasks easier</span></li>
        </ul>
        <div className="lead-product-note">
          <Sparkles />
          <span><b>One free bundle. Practical ways to make progress.</b><small>Explore the tools, try the prompts, and keep what works for you.</small></span>
        </div>
      </div>
      <div className="signup-card">
        <div className="signup-card-icon"><Download /></div>
        <span className="signup-kicker">FREE DIGITAL STARTER EBOOK</span>
        <h3>Get your free ebook</h3>
        <p>Enter your email to get the ebook. You can also opt in to occasional Flowmint product updates.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="ebook-email">Email address</label>
          <input id="ebook-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={!configured || sending} />
          <label className="signup-consent" htmlFor="ebook-marketing-consent">
            <input id="ebook-marketing-consent" type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} disabled={!configured || sending} />
            <span>Yes, send me occasional Flowmint product news and useful resources. I can unsubscribe anytime.</span>
          </label>
          <button className="button button-dark signup-submit" type="submit" disabled={!configured || loadingConfig || sending || success}>
            {sending ? 'Sending…' : success ? 'Sent' : 'Get my free ebook'}<ArrowRight size={15} />
          </button>
        </form>
        <div className={`signup-status ${success ? 'signup-success' : ''}`} role="status" aria-live="polite">
          {message || (!loadingConfig && !configured ? 'Email signup is not connected yet. The ebook unlocks once a signup service is configured.' : '')}
        </div>
        <div className="privacy-note"><LockKeyhole size={13} /><span>Your email is used to provide the ebook. Product updates are sent only if you opt in.</span></div>
      </div>
    </section>
  )
}
