'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Check, Download, LockKeyhole, Sparkles } from 'lucide-react'
import { Eyebrow } from '@/components/site'

export function WorkflowSignup(){
  const [email,setEmail]=useState('')
  const [configured,setConfigured]=useState(false)
  const [loadingConfig,setLoadingConfig]=useState(true)
  const [sending,setSending]=useState(false)
  const [message,setMessage]=useState('')
  const [success,setSuccess]=useState(false)

  useEffect(()=>{fetch('/api/subscribe',{cache:'no-store'}).then(r=>r.json()).then(data=>setConfigured(Boolean(data.configured))).catch(()=>setConfigured(false)).finally(()=>setLoadingConfig(false))},[])

  async function handleSubmit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setMessage('');setSending(true)
    try{
      const response=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
      const data=await response.json()
      if(!response.ok)throw new Error(data.error||'We could not save your email. Please try again.')
      setSuccess(true);setMessage('Thanks! Your email is on the list. Your download is starting.')
      const link=document.createElement('a');link.href='/downloads/flowmint-linkedin-content-workflow.pdf';link.download='flowmint-linkedin-content-workflow.pdf';document.body.appendChild(link);link.click();link.remove()
    }catch(error){setMessage(error instanceof Error?error.message:'Something went wrong. Please try again.')}
    finally{setSending(false)}
  }

  return <section className="lead-magnet section-wrap" id="free-workflow"><div className="lead-copy"><Eyebrow>YOUR FREE FLOWMINT DOWNLOAD</Eyebrow><h2>Never run out of something useful to post.</h2><p className="lead-intro">Choose a topic you care about. AI finds 5 timely ideas from across the web—so you can pick an angle and turn it into your next LinkedIn post.</p><ul className="lead-benefits"><li><Check/><span><strong>Pick a category</strong> you want to talk about</span></li><li><Check/><span><strong>Discover 5 timely topics</strong> with source links</span></li><li><Check/><span><strong>Choose your angle</strong> and make it your own</span></li></ul><div className="lead-product-note"><Sparkles/><span><b>From idea to content—without the blank page.</b><small>Get the workflow as a PDF and start building a repeatable content system your way.</small></span></div></div><div className="signup-card"><div className="signup-card-icon"><Download/></div><span className="signup-kicker">FREE LINKEDIN TOPIC WORKFLOW</span><h3>Send me the workflow</h3><p>Enter your email to join the Flowmint list and download the guide.</p><form onSubmit={handleSubmit}><label htmlFor="workflow-email">Email address</label><input id="workflow-email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required disabled={!configured||sending}/><button className="button button-dark signup-submit" type="submit" disabled={!configured||loadingConfig||sending||success}>{sending?'Sending…':success?'Sent':'Get the free workflow'}<ArrowRight size={15}/></button></form><div className={`signup-status ${success?'signup-success':''}`} role="status" aria-live="polite">{message||(!loadingConfig&&!configured?'Email signup is not connected yet. The download unlocks once a signup service is configured.':'')}</div><div className="privacy-note"><LockKeyhole size={13}/><span>Only used to send Flowmint updates and this download.</span></div></div></section>
}
