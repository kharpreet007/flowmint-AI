import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Workflow, Sparkles, Layers3, Search, Download, Play } from 'lucide-react'
import { Eyebrow, SectionHeading } from '@/components/site'
import { FreeEbookSignup } from '@/components/free-ebook-signup'

const productTypes = [
  { icon: Sparkles, name: 'Productivity Tools', copy: 'Simple tools to help you plan your day, stay organized, and make steady progress on the work that matters.', href: '/products/linkedin-content-automation', image: '/images/flowmint-hero-workspace.jpg', alt: 'Digital planner and notebook on a bright workspace' },
  { icon: Layers3, name: 'Product Design', copy: 'Explore practical, user-centered design ideas that turn real needs into clear, useful digital experiences.', href: '/products', image: '/images/flowmint-product-design.svg', alt: 'Digital product design board with app wireframes, a user flow, and design notes' },
  { icon: Workflow, name: 'Workflow Automation', copy: 'Repeatable workflows that simplify everyday tasks and keep your work moving.', href: '/products/ai-workflows', image: '/images/flowmint-workflow-tools.jpg', alt: 'Laptop displaying a simple connected workflow' },
]

export default function Home() {
  return <>
    <section className="home-hero section-wrap">
      <div className="home-hero-grid">
        <div className="home-hero-copy">
          <Eyebrow>DIGITAL PRODUCTS FOR MODERN WORK</Eyebrow>
          <h1>Digital products<br /><span>for better work.</span></h1>
          <p>Practical productivity tools, templates, and systems designed to help you work smarter.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="#explore-products">Explore products <ArrowRight size={16} /></Link>
            <Link className="text-link" href="/contact">Consultation <ArrowUpRight size={15} /></Link>
          </div>
        </div>
        <div className="home-hero-visual" aria-label="A preview of Flowmint's digital productivity products">
          <div className="home-hero-photo">
            <Image src="/images/flowmint-hero-workspace.jpg" alt="Tablet with a digital planner, notebook, and prompt cards" fill priority sizes="(max-width: 760px) 100vw, 50vw" />
            <div className="home-photo-caption"><span>THE FLOWMINT EDIT</span><b>Thoughtful tools<br/>for everyday work.</b></div>
          </div>
          <span className="home-hero-orbit" aria-hidden="true" />
        </div>
      </div>
    </section>

    <section className="home-product-types section-wrap" id="explore-products">
      <SectionHeading eyebrow="EXPLORE PRODUCTS" title="Find the format that fits your work." />
      <div className="home-category-grid">
        {productTypes.map(({ icon: Icon, name, copy, href, image, alt }) => <Link className="home-category-card" href={href} key={name}>
          <span className="home-category-image"><Image src={image} alt={alt} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" /><span className="home-category-icon"><Icon size={18} /></span><ArrowUpRight className="home-category-image-arrow" size={17}/></span>
          <span className="home-category-content"><h3>{name}</h3><p>{copy}</p><span className="home-category-link">Explore <ArrowUpRight size={15} /></span></span>
        </Link>)}
      </div>
    </section>

    <section className="home-how section-wrap">
      <div className="home-how-heading">
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <h2>Go from finding a product to putting it to work.</h2>
        <p>Choose a useful starting point, get access, and adapt it to the way you work.</p>
      </div>
      <div className="home-how-steps">
        {[
          { icon: Search, number: '1', title: 'Explore', copy: 'Find a product that matches your need.' },
          { icon: Download, number: '2', title: 'Get access', copy: 'Open the product page for details and available access options.' },
          { icon: Play, number: '3', title: 'Use and make it yours', copy: 'Follow the guide and adapt it to your workflow.' },
        ].map(({ icon: Icon, number, title, copy }, index) => <article className="home-how-step" key={number}>
          <span className="home-how-number">{number}</span>
          <Icon className="home-how-icon" size={22} />
          <h3>{title}</h3>
          <p>{copy}</p>
          {index < 2 && <ArrowRight className="home-how-arrow" size={18} aria-hidden="true" />}
        </article>)}
      </div>
    </section>


    <FreeEbookSignup />

    <section className="home-consulting">
      <div className="home-consulting-inner">
        <Eyebrow>NEED SOMETHING CUSTOM?</Eyebrow>
        <h2>Tell us what you’re trying to build.</h2>
        <p>We’ll help you find or create a practical solution for the way you work.</p>
        <Link className="button button-dark" href="/consultation">Book 1:1 consultation <ArrowRight size={16} /></Link>
      </div>
    </section>

    <section className="home-final-cta section-wrap">
      <div><Eyebrow>FLOWMINT AI</Eyebrow><h2>Find something useful.<br /><span>Start building today.</span></h2></div>
      <div className="home-final-actions">
        <Link className="button button-dark" href="/products">Explore products <ArrowRight size={16} /></Link>
        <Link className="text-link" href="/contact">Consultation <ArrowUpRight size={15} /></Link>
      </div>
    </section>
  </>
}
