import Link from 'next/link'
import { ArrowRight, Check, Compass, Link2, Search, Sparkles, TimerReset, UserRoundCheck } from 'lucide-react'
import { Eyebrow } from '@/components/site'

const audiences=[
  ['Founders & entrepreneurs','Build your personal brand while building your business.'],
  ['Product & business professionals','Share expertise, lessons, and useful perspectives.'],
  ['Consultants & freelancers','Show how you think and attract potential clients.'],
  ['Creators & coaches','Find timely angles your audience cares about.'],
  ['Job seekers & professionals','Build your presence in the industry you want to grow in.'],
  ['Anyone','Post consistently without the content headache.'],
]

const questions=['What should I post about?','What is worth talking about right now?','What angle should I take?','Where can I find credible sources?','How do I turn an idea into a good LinkedIn post?']

const benefits=[
  {icon:Search,title:'Discover faster',copy:'Find timely topics without manually searching across multiple websites.'},
  {icon:Link2,title:'Create with context',copy:'Explore ideas with source links and build your post on something meaningful.'},
  {icon:TimerReset,title:'Stay consistent',copy:'Create a repeatable content-discovery habit instead of relying on inspiration.'},
  {icon:UserRoundCheck,title:'Own the final voice',copy:'AI finds the opportunities. You decide what you want to say.'},
]

export function LinkedInSalesSection(){return <section className="linkedin-sales section-wrap" id="available-product">
  <div className="linkedin-sales-hero"><Eyebrow>LINKEDIN CONTENT AUTOMATION · AVAILABLE NOW</Eyebrow><h2>Turn “What should I post?” into your next LinkedIn post.</h2><p>Built for professionals who want to stay visible on LinkedIn without spending hours every week figuring out what to post.</p></div>
  <div className="audience-block"><div className="sales-subhead"><span>01</span><div><h3>Who is this for?</h3><p>For people with something to share, but not always the time to find their next topic.</p></div></div><div className="audience-grid">{audiences.map(([title,copy])=><article key={title}><Check size={16}/><h4>{title}</h4><p>{copy}</p></article>)}</div></div>
  <div className="posting-problem"><div className="sales-subhead"><span>02</span><div><h3>Do you struggle to post consistently?</h3><p>You know you should be posting on LinkedIn. But when you sit down to write, the questions start:</p></div></div><div className="question-grid">{questions.map((question,index)=><div key={question}><span>0{index+1}</span><b>{question}</b></div>)}</div><p className="problem-close">And before you know it, another week has passed without posting.</p><div className="system-callout"><Compass size={19}/><strong>You don’t need more content pressure. You need a better system.</strong></div></div>
  <div className="automation-value"><div className="sales-subhead"><span>03</span><div><Eyebrow>THE POWER OF CONTENT AUTOMATION</Eyebrow><h3>Stop starting from a blank page.</h3><p>Instead of searching for something to post, let AI handle the first layer of discovery. You choose the category; the agents surface five timely topics across the web.</p></div></div><div className="automation-benefits">{benefits.map(({icon:Icon,title,copy})=><article key={title}><span><Icon size={18}/></span><h4>{title}</h4><p>{copy}</p></article>)}</div><Link className="button button-dark" href="/products/linkedin-content-automation">Explore LinkedIn Content Automation <ArrowRight size={16}/></Link></div>
</section>}
