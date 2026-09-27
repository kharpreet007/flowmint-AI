# Flowmint AI

A product-led marketing site for Flowmint AI, built with Next.js, React, TypeScript, and Tailwind CSS. Product details live in `lib/products.ts`, so new products can be added to the catalog without rebuilding the page structure.

## Run locally

1. Install Node.js 18.17 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set the public site URL and contact email when ready.
4. Run `npm run dev` and open the local address shown in the terminal.

Use `npm run build` to create the production build and `npm start` to serve it.

## Routes

- `/` — brand introduction, product categories, how it works, and free ebook signup
- `/products` — product catalog with availability states
- `/products/linkedin-content-automation` — current product detail
- `/products/digital-planners`, `/products/journals`, `/products/ecards`, `/products/ai-workflows`, `/products/prompt-library`, and `/products/ebooks` — individual digital-store category pages
- `/workflows` — workflow approach and example
- `/about` — brand positioning
- `/resources` — free digital starter ebook and upcoming resources
- `/contact` — contact details, enabled by `NEXT_PUBLIC_CONTACT_EMAIL`

## Integrations

The free digital products starter ebook includes productivity worksheets, 44 ready-to-use prompts, and a workflow automation planner. The signup form requests an email to unlock the ebook and has a separate, unchecked marketing opt-in. Only people who check that box are added to the Mailchimp audience. The ebook downloads after the form succeeds even if the visitor leaves marketing consent unchecked. Mailchimp credentials are used only by the server and must never be exposed through a `NEXT_PUBLIC_` variable.

### Connect Mailchimp

1. In Mailchimp, create an API key in **Account & billing → Extras → API keys**. Copy it once and keep it private.
2. Find the audience ID in **Audience → More options → Audience settings**.
3. Set these values in `.env.local` for local development:

   ```env
   MAILCHIMP_API_KEY=your-private-api-key
   MAILCHIMP_AUDIENCE_ID=your-audience-id
   MAILCHIMP_SERVER_PREFIX=usXX
   ```

   The server prefix is the data-center code such as `us19`, shown after the hyphen in the API key and used in your Mailchimp account URL.
4. In Vercel, open the project’s **Settings → Environment Variables** and add the same three values for Production (and Preview if needed). Do not use the `NEXT_PUBLIC_` prefix.
5. Restart the local development server after changing `.env.local`. For Vercel, redeploy so the new values take effect.
6. Submit a test address with the marketing checkbox selected and verify it appears in the intended Mailchimp audience. Then test with the box unchecked: the ebook should download but the address should not be added for marketing.

Mailchimp’s API can add or update audience members. This site uses the server-side API and only submits a person as subscribed after an explicit opt-in. The product page reads `NEXT_PUBLIC_PRODUCT_CHECKOUT_URL` for its checkout link; leave it blank until a real checkout destination is ready. No price is assumed.

Analytics is not active by default. Add a provider through a consent-aware script/component in `app/layout.tsx` and send events for product detail views, product CTA clicks, signup completion, and outbound checkout clicks. Keep provider credentials server-side; any `NEXT_PUBLIC_` value is public.

## SEO and accessibility

Metadata is set centrally in `app/layout.tsx` and per route. `app/sitemap.ts` and `app/robots.ts` use `NEXT_PUBLIC_SITE_URL`. The UI includes semantic landmarks, descriptive link names, visible focus behavior from browser defaults, a skip link, reduced-motion support, and responsive navigation.

## Deploy on Vercel

1. Push this project to a Git repository.
2. Import the repository in Vercel; it detects Next.js automatically.
3. Add `NEXT_PUBLIC_SITE_URL`, `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`, `MAILCHIMP_SERVER_PREFIX`, and, when ready, `NEXT_PUBLIC_CONTACT_EMAIL` under project environment variables.
4. Deploy. Vercel will build the site on each connected Git update.

Mailchimp is optional for running the site, but the signup form stays disabled until its three server-side environment variables are configured.
