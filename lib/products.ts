export type Product = { slug: string; name: string; category: string; description: string; status: 'available' | 'coming-soon'; href: string; label: string }

export const products: Product[] = [
  { slug: 'linkedin-content-automation', name: 'LinkedIn Content Automation', category: 'CONTENT WORKFLOW', description: 'Choose a posting category and have AI agents find five timely LinkedIn topic ideas across the web.', status: 'available', href: '/products/linkedin-content-automation', label: 'Explore topic discovery' },
  { slug: 'coming-soon-2', name: 'Product #2', category: 'COMING SOON', description: 'A new practical digital product is in development.', status: 'coming-soon', href: '/products', label: 'Coming soon' },
  { slug: 'coming-soon-3', name: 'Product #3', category: 'COMING SOON', description: 'Another useful Flowmint product is taking shape.', status: 'coming-soon', href: '/products', label: 'Coming soon' },
]

export const workflowSteps = ['Choose a posting category', 'Scan the web for ideas', 'Explore five timely topics', 'Choose your angle', 'Create, review, and publish']
