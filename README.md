# Phyzel Marketplace MVP

Ghana-first Fashion Marketplace, Food Marketplace, and Trading Marketplace built with HTML, CSS, vanilla JavaScript, and a minimal Node.js server.

## Run locally

Requires Node.js 22 or newer.

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Open `http://localhost:3000`. Run syntax checks with `npm run check`.

## Architecture

- `server.js`: HTTP server, API routes, static files, authorization boundaries.
- `database.js`: persistent SQLite schema and data access.
- `auth.js`: scrypt password hashing, persistent hashed sessions, sign-in rate limiting.
- `app.js`: shared frontend behavior and first-visit buyer/seller role-selection modal.
- `onboarding.js`: buyer registration and seller draft/submission workflows.
- `whop.js` and `webhooks.js`: server-only payment boundary and signed event processing.
- `supabase.js`: verified Supabase Auth connectivity using the project URL and publishable key.

The database stores users, sessions, buyer profiles, seller applications, seller profiles, seller onboarding progress, businesses, listings, orders, and audit records. The browser never grants a role; the server does.

## Environment variables

- `PORT`: local HTTP port.
- `SESSION_SECRET`: long random secret used for password hashing.
- `COMMISSION_RATE`: decimal marketplace commission, such as `0.10`.
- `WHOP_API_KEY`, `WHOP_COMPANY_ID`, `WHOP_WEBHOOK_SECRET`: server-only Whop values.
- `WHOP_CHECKOUT_BASE_URL`: provider adapter base URL.
- `EMAIL_PROVIDER_CONFIGURED`: set to `true` only after real email delivery is connected.
- `SUPABASE_URL`: the Supabase project URL.
- `SUPABASE_PUBLISHABLE_KEY`: the client-safe Supabase publishable key. Never put a service-role key in frontend code.

Email verification is enforced. In local development, registration returns a verification URL in the API response for manual testing because no email provider is configured. This is not a production email-delivery implementation.

## Roles and onboarding

The homepage displays a first-visit role-selection modal. Buyer registration and seller registration are separate. Seller applications can be saved as drafts, require a verified email and accepted seller terms before submission, and remain pending until an authorized administrator approves them. Approval updates the server-side role to `seller` and creates seller onboarding records.

For local admin testing, register and verify an account, then promote it with:

```powershell
node -e "const {DatabaseSync}=require('node:sqlite'); const db=new DatabaseSync('marketplace.sqlite'); db.prepare('UPDATE users SET role=\'admin\' WHERE email=?').run('your-email@example.com')"
```

## Honest integration status

Supabase Auth connectivity is configured for the supplied project and is reported by `/api/health`. The current marketplace records remain SQLite-backed until `supabase-schema.sql` is reviewed and applied in Supabase Dashboard → SQL Editor; no silent dual-write or fake migration is claimed. Whop is not configured in this checkout, so checkout remains unavailable and no payment success is simulated. Email delivery, production deployment, document uploads/private storage, seller listing-authoring UI, and live Whop webhooks still require external configuration and verification.

## Validation performed

- JavaScript syntax checks passed.
- Existing SQLite database migrated successfully.
- Unverified login returned HTTP 403.
- Verification endpoint enabled sign-in.
- Buyer profile persistence passed.
- Seller draft save and submission passed.
- Old marketplace routes remain removed and return HTTP 404.
- Existing listing/order isolation and Whop pending behavior remain server-side.
