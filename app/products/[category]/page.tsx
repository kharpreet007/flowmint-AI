import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen, CalendarDays, MailOpen, MessageSquareText, NotebookPen, Workflow } from 'lucide-react'
import { CTA, Eyebrow, PageIntro, ProductCard } from '@/components/site'
import { getStoreCategory, storeCategories } from '@/lib/categories'
import { products } from '@/lib/products'

const categoryIcons={'digital-planners':CalendarDays,journals:NotebookPen,ecards:MailOpen,'ai-workflows':Workflow,'prompt-library':MessageSquareText,ebooks:BookOpen}
type Params={category:string}

export function generateStaticParams(){return storeCategories.map(category=>({category:category.slug}))}
export async function generateMetadata({params}:{params:Params}):Promise<Metadata>{const category=getStoreCategory(params.category);return category?{title:category.name,description:category.description}:{title:'Product category not found'}}

export default function CategoryPage({params}:{params:Params}){
  const category=getStoreCategory(params.category)
  if(!category)notFound()
  const Icon=categoryIcons[category.slug as keyof typeof categoryIcons]
  const availableProducts=category.slug==='ai-workflows'?products.filter(product=>product.slug==='linkedin-content-automation'):[]
  return <>
    <PageIntro eyebrow={`FLOWMINT STORE · ${category.name.toUpperCase()}`} title={category.name} copy={category.description}/>
    <section className="section-wrap category-detail">
      <div className="category-detail-heading"><span className="category-detail-icon"><Icon size={22}/></span><div><Eyebrow>{category.status==='available'?'EXPLORE THIS COLLECTION':'COMING SOON'}</Eyebrow><h2>{category.shortDescription}</h2></div></div>
      <div className="category-detail-grid"><div className="category-about"><p>{category.status==='available'?'Start with the available product in this collection:':`We’re preparing the first ${category.name.toLowerCase()} for the Flowmint store.`}</p>{category.status==='coming-soon'&&<div className="coming-note"><span className="status"><i/>In the works</span><p>We’re shaping useful products for this category. Check back as the collection grows.</p></div>}<Link className="text-link" href="/products">Back to all products <ArrowRight size={15}/></Link></div><ul className="category-benefits">{category.examples.map((example,index)=><li key={example}><span>0{index+1}</span>{example}</li>)}</ul></div>
      {availableProducts.length>0&&<div className="category-available"><SectionHeadingMini/><div className="product-grid">{availableProducts.map(product=><ProductCard key={product.slug} product={product}/>)}</div></div>}
    </section>
    <CTA title={category.status==='available'?'Find your next useful idea.':'A useful collection is taking shape.'} copy={category.status==='available'?'Explore the available LinkedIn topic discovery workflow.':'Explore other Flowmint formats while this collection is in the works.'} button={category.status==='available'?'Explore LinkedIn Content Automation':'Browse all product types'} href={category.status==='available'?'/products/linkedin-content-automation':'/products'}/>
  </>
}

function SectionHeadingMini(){return <div className="section-heading"><Eyebrow>AVAILABLE IN THIS COLLECTION</Eyebrow><h2>Start with topic discovery.</h2></div>}
