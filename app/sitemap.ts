import type { MetadataRoute } from 'next'
import { storeCategories } from '@/lib/categories'
const routes=['','/products','/products/linkedin-content-automation','/workflows','/about','/resources','/contact']
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL||'https://flowmint.ai';const categoryRoutes=storeCategories.map(category=>`/products/${category.slug}`);return [...routes,...categoryRoutes].map(route=>({url:`${base}${route}`,changeFrequency:route===''?'weekly':'monthly',priority:route===''?1:.7}))}
