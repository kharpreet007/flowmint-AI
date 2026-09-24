import type { Metadata } from 'next'
import './globals.css'
import { Shell } from '@/components/site'

export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flowmint.ai'), title: { default: 'Flowmint AI — Digital products for modern work', template: '%s | Flowmint AI' }, description: 'Thoughtful digital products for modern work, including templates, journals, prompt cards, and practical workflows.', openGraph: { title: 'Flowmint AI', description: 'Digital products for modern work.', siteName: 'Flowmint AI', type: 'website' }, robots: { index: true, follow: true } }
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a><Shell>{children}</Shell></body></html> }
