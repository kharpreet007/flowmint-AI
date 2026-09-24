import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import { CTA, Eyebrow, PageIntro } from '@/components/site'
export const metadata:Metadata={title:'Contact',description:'Get in touch with Flowmint AI.'}
export default function Contact(){const email=process.env.NEXT_PUBLIC_CONTACT_EMAIL;return <><PageIntro eyebrow="GET IN TOUCH" title="Have a workflow in mind?" copy="We’re building Flowmint AI around real work and real friction. Tell us what you’d like to make simpler."/><section className="section-wrap contact-card"><span className="contact-icon"><Mail/></span><div><Eyebrow>START A CONVERSATION</Eyebrow><h2>Share what you’re working on.</h2><p>Questions, product feedback, or a workflow you wish existed—we’d love to hear about it.</p>{email?<a className="button button-dark" href={`mailto:${email}`}>Email Flowmint AI <ArrowRight size={16}/></a>:<p className="setup-hint">Contact email isn’t configured yet. Add <code>NEXT_PUBLIC_CONTACT_EMAIL</code> to your environment settings.</p>}</div></section><CTA/></>}
