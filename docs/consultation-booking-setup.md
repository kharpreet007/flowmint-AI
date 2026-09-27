# Consultation checkout setup

The booking flow uses Razorpay Payment Links for hosted checkout, Supabase as a private booking store, and Resend for confirmation email. The booking store reserves each date/time before checkout and prevents two active website bookings for the same slot. Times are currently offered in India Standard Time (IST).

## 1. Create the booking store

1. Create or open the Flowmint project in Supabase.
2. Open **SQL Editor** and run [`supabase/consultation-bookings.sql`](../supabase/consultation-bookings.sql).
3. From the Supabase project settings, copy the Project URL and a server-side Secret key (`sb_secret_...`). A legacy `service_role` key is supported too.

The table is not accessible to anonymous visitors. The site’s server routes use the secret key to reserve and confirm slots.

## 2. Configure Razorpay

1. Finish Razorpay account activation and required business/KYC details.
2. In **Test Mode**, create an API key pair and copy the Key ID and Key Secret.
3. Add a webhook with URL `https://YOUR_DOMAIN/api/webhooks/razorpay`.
4. Subscribe to `payment_link.paid` and `payment_link.expired`.
5. Copy the webhook secret you create in Razorpay.

The checkout uses hosted Payment Links with a 15-minute expiry. The site verifies the link and captured payment with Razorpay before it marks the slot confirmed. If an expired payment arrives after another booking has claimed that slot, the site initiates a full refund.

## 3. Configure confirmation email

1. Create a Resend account and API key.
2. Verify a Flowmint sending domain and choose a sender address on that domain.
3. Add the API key and sender address to the hosting environment.

Add and verify these settings before accepting real payments. If email delivery is unavailable, the booking remains in the store and the webhook shows a failed delivery in Razorpay.

## 4. Add environment variables

Add these in Vercel under **Project Settings → Environment Variables**, for each environment you use. Do not commit actual secret values to GitHub.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your canonical production URL, such as `https://flowmint.ai` |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode Key ID while testing |
| `RAZORPAY_KEY_SECRET` | Matching Razorpay Test Mode Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret from the Razorpay webhook configuration |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Server-side Supabase secret key |
| `RESEND_API_KEY` | Resend API key |
| `CONSULTATION_FROM_EMAIL` | Verified sender, for example `Flowmint <hello@your-domain.com>` |
| `CONSULTATION_TIME_ZONE` | `Asia/Kolkata` |

Redeploy after adding or changing environment variables. Keep live Razorpay keys out of previews and local examples.

## 5. Test before launch

Use Razorpay Test Mode to check the full path: reserve an open slot, complete a test payment, verify the booking status in Supabase, and confirm that the customer receives the email with the paid amount and slot. Also test an abandoned checkout and a second attempt for the same slot. Once the test flow works and Razorpay has activated the account, replace Test Mode keys with Live Mode keys and verify the live webhook URL and secret.

The booking store protects slots booked through Flowmint. It does not read an existing personal Google Calendar, so any meetings already in another calendar need to be reflected in the times you offer until a calendar connection is added.
