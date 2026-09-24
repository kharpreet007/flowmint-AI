import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Sparkles } from 'lucide-react'
import { Eyebrow, ProductCategoryGrid, SectionHeading } from '@/components/site'
import { WorkflowSignup } from '@/components/workflow-signup'
import { LinkedInSalesSection } from '@/components/linkedin-sales-section'

export default function Home(){return <>
  <section className="sales-hero section-wrap">
    <Eyebrow>DIGITAL PRODUCTS FOR MODERN WORK</Eyebrow>
    <h1>Make everyday work easier with <span>thoughtful digital products.</span></h1>
    <p className="sales-hero-copy">Useful digital products give you a clear place to start. Plan with <span className="purple-emphasis">less guesswork, turn ideas into action, and reuse simple systems</span> that work for you—without building everything from scratch.</p>
    <div className="sales-benefits">
      <div><span><Check size={15}/></span><b>Start with structure</b><small>Spend less time setting up and more time moving forward.</small></div>
      <div><span><Check size={15}/></span><b>Make it your own</b><small>Adapt practical tools to your goals, habits, and way of working.</small></div>
      <div><span><Check size={15}/></span><b>Reuse what helps</b><small>Keep the routines and resources that make everyday work easier.</small></div>
    </div>
    <div className="hero-actions"><Link className="button button-dark" href="#digital-store">Explore the digital store <ArrowRight size={16}/></Link><Link className="text-link" href="#free-workflow">Get a free workflow <ArrowUpRight size={15}/></Link></div>
  </section>

  <section className="manifesto"><div className="manifesto-inner"><Eyebrow>THE FLOWMINT POINT OF VIEW</Eyebrow><h2>Don’t just use AI.<br/><span>Make something useful.</span></h2><p>AI becomes more useful when it meets the right idea, format, and moment. We create thoughtful digital products that make everyday work and life a little easier.</p><p>That belief led to our first tool: <strong>LinkedIn Content Automation.</strong> Choose a category you enjoy posting about; five specialized AI agents scan the web to find five timely topics, so you can focus on the angle only you can bring.</p><div className="manifesto-actions"><Link className="text-link" href="/about">Meet Flowmint AI <ArrowUpRight size={15}/></Link><Link className="text-link" href="/products/linkedin-content-automation">Explore LinkedIn Content Automation <ArrowUpRight size={15}/></Link></div><div className="manifesto-stamp"><Sparkles size={17}/><span>MAKE THE WORK<br/>WORK FOR YOU</span></div></div></section>

  <LinkedInSalesSection/>

  <WorkflowSignup/>

  <section className="section-wrap shop-categories" id="digital-store"><div className="section-row"><SectionHeading eyebrow="THE DIGITAL STORE" title="Small tools for a better workday." copy="Digital products made to be useful from the moment you open them. Start with the available product and explore what’s coming next."/><Link className="underlined-link" href="/products">Visit the digital store <ArrowRight size={15}/></Link></div><ProductCategoryGrid/></section>
</>}
