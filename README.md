# Phyzel Marketplace MVP

A Ghana-first online marketplace connecting customers with approved businesses and sellers.

This MVP supports three marketplace sections:

1. **Fashion & Beauty** — clothing, footwear, accessories, skincare, and beauty products.
2. **Food** — food products, groceries, packaged foods, and other relevant food offerings.
3. **General Trading** — electronics, furniture, technology, household goods, and other general merchandise.

All three sections share the same customer accounts, product infrastructure, orders, checkout, administration, and payment integration.

This MVP is a **client-side application** built with HTML, CSS, and vanilla JavaScript. It persists data in `localStorage` so it can be run directly from the file system or a static host. The architecture is intentionally prepared for a later Plio/Supabase backend migration.

## Architecture

- **Frontend:** HTML, CSS, and vanilla JavaScript
- **Persistence:** `localStorage` (browser-side) for customers, sessions, businesses, seller profiles, seller applications, listings, orders, commissions, audits, and settings
- **Auth:** local account authentication with hashed passwords stored in `localStorage`
- **Payments:** client-side Whop integration boundary in `app.js` (`window.Phyzel.Whop`) with a dev/pending mode that never simulates real paid orders
- **File layout:** flat application file structure — all application-owned source files live in the project root

Server-side source files from previous exploration (`server.js`, `database.js`, `payments.js`, `auth-server.js`, `routes.js`) are **not** used by this client-side build.

## Prerequisites

- A modern browser
- No build step, no Node.js required for the client app
- (Optional) A real Whop account and API credentials for production payment processing

## Running the application

Open `index.html` in your browser, or serve the project folder with any static server:

```bash
# If you have Python installed
python -m http.server 8000

# If you have Node installed
npx serve .
```

Then open the app in your browser, for example:

- Public site: `http://localhost:8000/index.html`
- Admin dashboard: `http://localhost:8000/admin-dashboard.html`

## Environment setup

There is no `.env` required for the client-side build. Whop integration is controlled from browser environment placeholders if needed later:

```js
// In a future server-backed version, these would live in server-side env.
window.__PHYZEL_WHOP_API_KEY = "";
window.__PHYZEL_WHOP_WEBHOOK_SECRET = "";
```

For now, leave them blank. Payments are intentionally in dev/pending mode.

## Sample development data

The application seeds clearly-labeled sample data on first load:

- Three marketplace sections: Fashion & Beauty, Food, General Trading
- Sample approved seller profiles
- Sample sample businesses
- Sample listings across all three sections

These are sample data for development only and are labeled as such in the UI. They are not real partnerships or real purchases.

If you want to reset the sample data, clear the app keys from `localStorage` in your browser devtools and reload the page. Keys are prefixed with `phyzel.`:

- `phyzel.users`
- `phyzel.sessions`
- `phyzel.businesses`
- `phyzel.sellerProfiles`
- `phyzel.sellerApplications`
- `phyzel.listings`
- `phyzel.orders`
- `phyzel.audits`
- `phyzel.settings`

Cart data is stored separately in `sessionStorage` under `phyzel_cart`.

## Authentication and roles

Three roles are supported:

- **Customer**
- **Seller** (approved only may publish listings)
- **Administrator**

Passwords are hashed in-browser before storage. Sessions are kept in `localStorage` with an in-memory check on each page load. Authorization is enforced in JavaScript on every protected view.

Unapproved sellers cannot publish listings. Customers cannot access admin pages. There is no public admin registration. The first admin is created automatically on first load with a known demo credential.

### Demo admin

- Email: `admin@phyzel.local`
- Password: `ChangeMe-123-admin`

Change this in your browser devtools after first load if you want a different admin password.

## Business registration and seller applications

Business registration and seller applications are separate workflows.

### Admin-managed business registration

Administrators can register businesses directly from `admin-businesses.html`.

Capture:

- Business name
- Description
- Contact information
- Business category
- Location in Ghana
- Logo or image reference
- Business status

Administrators can edit, activate, deactivate, and review registered businesses.

### Seller applications

A seller application form is available at `seller-application.html`. It captures:

- Applicant name
- Contact information
- Proposed store name
- Business description
- Intended marketplace section
- Business location
- Relevant business details
- Verification information

Application statuses include Pending, Under Review, Approved, Rejected, and Suspended.

Administrators review applications from `admin-applications.html`. Approval creates an approved seller profile so the applicant can publish listings.

Approval is enforced in JavaScript. Applicants cannot approve themselves through browser requests.

## Seller dashboard

Seller dashboard pages:

- `seller-dashboard.html` — overview and sales summary
- `seller-listings.html` — listing management
- `seller-orders.html` — seller-relevant orders
- `seller-profile.html` — seller profile management

Only approved sellers may publish products.

Ownership checks are enforced in JavaScript so sellers cannot modify another seller's products.

Sales summaries count only orders with verified payments.

## Administrator dashboard

Admin dashboard pages:

- `admin-dashboard.html` — overview metrics and recent orders
- `admin-businesses.html` — business registration and management
- `admin-applications.html` — seller application review
- `admin-listings.html` — marketplace listing moderation
- `admin-orders.html` — order records
- `admin-settings.html` — commission and delivery fee configuration

Dashboard metrics are computed from local data, not hardcoded.

## Checkout and orders

Checkout runs through `checkout.html` and creates an order from the cart.

The client:

1. Recalculates all prices and totals from listing data
2. Validates stock at checkout time
3. Creates an order with a unique reference
4. Sets the initial payment status to pending
5. Attempts a Whop checkout through the client boundary

Orders are never marked as paid just because the customer reaches a success URL.

Failed or pending payments remain visible as pending until a verified payment arrives.

## Whop payments and marketplace commissions

Whop is intended to process customer orders and deduct Phyzel Marketplace's commission.

In this MVP, the Whop integration is a **client-side boundary** in `app.js`. It does not simulate real successful payments. If Whop is not configured, checkout creates a pending order and shows a clear message.

Requirements:

- Whop credentials remain in server-side environment variables in a production version
- Each transaction is associated with the relevant listing, seller, and order
- Webhook authenticity is verified server-side in a production version
- Webhook handling is idempotent
- Payment amounts, currency, statuses, and commission information are recorded
- Commission calculations remain consistent and auditable
- No unsupported Whop endpoints are invented

If account approval, credentials, or capabilities are missing, the app implements the surrounding payment architecture and clearly documents the blocker.

Any simulated payment is clearly identified as development-only and never marks a real order as paid.

Commission is configured locally in settings and recorded against orders when payments are verified.

## Future integrations

Design is kept ready for future integration with:

- **Plio:** business operations, customer workflows, and operational insights
- **Supabase:** financial tracking and relevant business financial information

For the initial MVP, the marketplace's own shopping, product, order, payment, commission, and administration workflows are prioritized.

Clean integration interfaces are kept where useful. No APIs are invented, and no credentials are exposed.

## Security considerations for this client build

This is a client-side MVP with local persistence. For this version:

- Authorization checks are enforced in JavaScript on protected pages
- Passwords are hashed before storage in `localStorage`
- Cart persists only for the current browser session
- Orders persist in `localStorage`
- Payment status is never derived from browser-only success navigation

Because everything runs in the browser, `localStorage` is not suitable for a production multi-user deployment. When you move to Plio/Supabase or another backend, move session, user, order, and payment state server-side and keep secrets out of the browser.

## Future database migration

This build is intentionally localStorage-first so you can move to Supabase later without rewriting the UI.

When you are ready to migrate:

- Replace `app.js` storage access with Supabase client calls
- Keep the same data shapes: users, sessions, businesses, sellerProfiles, sellerApplications, listings, orders, orderItems, payments, commissions, audits, settings
- Move password hashing and session signing server-side
- Move checkout, webhook verification, and commission recording server-side
- Keep the HTML/CSS pages largely unchanged

The data model in this client build is already aligned with that migration path.

## Testing

There is no automated test runner for this client build. Test manually:

- Load `index.html` and confirm the homepage renders
- Browse Fashion & Beauty, Food, and General Trading
- Use search, category filters, price filters, and sorting on each section page
- Open a listing and add it to cart
- Open cart and update quantities
- Sign in and complete checkout to a pending order
- Confirm pending orders appear in customer account history
- Sign in as admin and review businesses, applications, listings, orders, and settings
- Confirm unapproved sellers cannot access seller dashboard functions until approved

To reset state during testing, clear the `phyzel.*` keys in `localStorage`.

## Environment and documentation

Project files are in the project root:

- `index.html` — homepage
- `fashion-beauty.html`, `food.html`, `general-trading.html` — marketplace sections
- `product.html` — listing detail
- `business.html` — public business profile
- `seller-application.html` — seller application form
- `login.html`, `register.html` — authentication
- `customer-dashboard.html` — customer account and purchase history
- `seller-dashboard.html`, `seller-listings.html`, `seller-orders.html`, `seller-profile.html` — seller area
- `admin-dashboard.html`, `admin-businesses.html`, `admin-applications.html`, `admin-listings.html`, `admin-orders.html`, `admin-settings.html` — admin area
- `cart.html`, `checkout.html`, `checkout-result.html` — cart and checkout
- `404.html` — not found page
- `styles.css` — shared styles
- `app.js` — application core: state, persistence, auth, cart, orders, Whop boundary
- `marketplace.js` — shared marketplace rendering helpers
- `listing.js` — listing detail interactions
- `cart.js` — cart page
- `checkout.js` — checkout page
- `auth.js` — shared auth UI helpers
- `account.js` — customer dashboard
- `seller.js` — seller dashboard
- `admin.js` — admin dashboard
- `package.json`, `.env.example`, `.gitignore`, `README.md`

## Known limitations

- This is client-side only with `localStorage` persistence
- Passwords and sessions live in the browser, which is not suitable for production multi-user use
- Whop is not integrated end-to-end in this build; payments stay in dev/pending mode
- No real seller payout or commission deduction is performed
- Sample data is seeded for development only and is labeled as sample data
- Some pages assume a single-browser local user model

## Limitations and external account requirements

- Real payments require a configured Whop account and valid API credentials
- Marketplace commission deduction and seller payouts depend on Whop-supported capabilities; if unavailable, the app records commission data but does not process payouts
- For production, move authentication, orders, and payments server-side and use Supabase or another backend
- Image handling currently relies on placeholder URLs
- The initial admin is created automatically on first load; change its password after first use
