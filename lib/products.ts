export type Product = { slug: string; name: string; category: string; description: string; status: 'available' | 'coming-soon'; href: string; label: string }

export const products: Product[] = [
  { slug: 'linkedin-content-automation', name: 'LinkedIn Content Automation', category: 'CONTENT WORKFLOW', description: 'Choose a posting category and have AI agents find five timely LinkedIn topic ideas across the web.', status: 'available', href: '/products/linkedin-content-automation', label: 'Explore topic discovery' },
]

export const workflowSteps = ['Choose a posting category', 'Scan the web for ideas', 'Explore five timely topics', 'Choose your angle', 'Create, review, and publish']
