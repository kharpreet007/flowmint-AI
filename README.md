# Flowmint AI

A product-led marketing site for Flowmint AI, built with Next.js, React, TypeScript, and Tailwind CSS. Product details live in `lib/products.ts`, so new products can be added to the catalog without rebuilding the page structure.

## Run locally

1. Install Node.js 18.17 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set the public site URL and contact email when ready.
4. Run `npm run dev` and open the local address shown in the terminal.

Use `npm run build` to create the production build and `npm start` to serve it.

## Routes

- `/` — brand introduction, featured product, workflow visual, and signup placeholder
- `/products` — product catalog with availability states
- `/products/linkedin-content-automation` — current product detail
- `/products/digital-planners`, `/products/journals`, `/products/ecards`, `/products/ai-workflows`, `/products/prompt-library`, and `/products/ebooks` — individual digital-store category pages
- `/workflows` — workflow approach and example
- `/about` — brand positioning
- `/resources` — free workflow entry point and upcoming resources
- `/contact` — contact details, enabled by `NEXT_PUBLIC_CONTACT_EMAIL`

## Integrations

The free LinkedIn workflow signup sends an email, source label, and timestamp to the server-side `EMAIL_SIGNUP_WEBHOOK_URL`. Set this to an HTTPS webhook that accepts a JSON POST; an optional `EMAIL_SIGNUP_WEBHOOK_SECRET` is sent as a Bearer token. The PDF downloads only after the webhook confirms success. Until a webhook is configured, the site says email signup is disconnected and keeps the gated download button disabled; it does not pretend to collect addresses. The product page reads `NEXT_PUBLIC_PRODUCT_CHECKOUT_URL` for its checkout link; leave it blank until a real checkout destination is ready. No price is assumed.

Analytics is not active by default. Add a provider through a consent-aware script/component in `app/layout.tsx` and send events for product detail views, product CTA clicks, signup completion, and outbound checkout clicks. Keep provider credentials server-side; any `NEXT_PUBLIC_` value is public.

## SEO and accessibility

Metadata is set centrally in `app/layout.tsx` and per route. `app/sitemap.ts` and `app/robots.ts` use `NEXT_PUBLIC_SITE_URL`. The UI includes semantic landmarks, descriptive link names, visible focus behavior from browser defaults, a skip link, reduced-motion support, and responsive navigation.

## Deploy on Vercel

1. Push this project to a Git repository.
2. Set up an HTTPS webhook to add a submitted email to your mailing list. It should accept JSON with `email`, `source`, and `createdAt`, and return a successful HTTP status after saving.
3. Import the repository in Vercel; it detects Next.js automatically.
4. Add `NEXT_PUBLIC_SITE_URL`, `EMAIL_SIGNUP_WEBHOOK_URL`, and, when ready, `NEXT_PUBLIC_CONTACT_EMAIL` under project environment variables. Add `EMAIL_SIGNUP_WEBHOOK_SECRET` if your webhook expects a Bearer token.
5. Deploy. Vercel will build the site on each connected Git update.

No checkout, mailing list provider, or analytics account is required to run the current MVP.

### Simple webhook setup

If you have not picked an email platform yet, create a webhook in an automation service such as Make, then connect that webhook to the email list you choose. Set the webhook URL in `.env.local` as `EMAIL_SIGNUP_WEBHOOK_URL` for local development and in Vercel's environment variables for production. It must accept the JSON fields `email`, `source`, and `createdAt`, and return a 2xx response after the address is saved. Restart the local server after changing `.env.local`.
