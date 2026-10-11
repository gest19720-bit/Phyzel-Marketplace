const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');
const db = require('./database');
const auth = require('./auth');
const whop = require('./whop');
const supabase = require('./supabase');
const webhooks = require('./webhooks');
const { json, requireUser, requireRole } = require('./http-middleware');

const staticFiles = new Set(['html', 'css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'ico']);
const contentTypes = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', ico: 'image/x-icon' };
function parseCookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((item) => { const index = item.indexOf('='); return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1))]; })); }
function readBody(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', (chunk) => { raw += chunk; if (raw.length > 1e6) req.destroy(); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON body')); } }); req.on('error', reject); }); }
function readRawBody(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', (chunk) => { raw += chunk; }); req.on('end', () => resolve(raw)); req.on('error', reject); }); }
function clean(value, max = 500) { return String(value ?? '').trim().slice(0, max); }
function validEmail(value) { return /^\S+@\S+\.\S+$/.test(String(value || '')); }
function setSessionCookie(res, token) { res.setHeader('Set-Cookie', `pzy_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`); }
function clearSessionCookie(res) { res.setHeader('Set-Cookie', 'pzy_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); }

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cookies = parseCookies(req);
  req.user = auth.userFromToken(cookies.pzy_session);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, database: 'sqlite', supabase: await supabase.authSettings(), whop: whop.status(), emailVerification: process.env.EMAIL_PROVIDER_CONFIGURED === 'true' });
    if (req.method === 'GET' && url.pathname === '/api/me') return json(res, 200, { user: req.user || null });
    if (req.method === 'GET' && url.pathname === '/api/auth/verify') { const user = db.verifyEmail(clean(url.searchParams.get('token'), 200)); return user ? json(res, 200, { user, message: 'Email verified. You can now sign in.' }) : json(res, 400, { error: 'This verification link is invalid or expired.' }); }
    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const body = await readBody(req);
      const sellerRegistration = body.accountType === 'seller';
      if (clean(body.name, 120).length < 2 || !validEmail(body.email) || String(body.password || '').length < 8) return json(res, 400, { error: 'Name, valid email, and password of at least 8 characters are required.' });
      if (body.password !== body.passwordConfirmation) return json(res, 400, { error: 'Passwords do not match.' });
      if (body.acceptTerms !== true) return json(res, 400, { error: 'You must accept the terms and privacy policy.' });
      if (sellerRegistration && (!clean(body.businessName, 150) || !clean(body.category, 80) || clean(body.description, 20).length < 20 || body.termsAccepted !== true)) return json(res, 400, { error: 'Seller business details, a description of at least 20 characters, and seller terms are required.' });
      if (db.getUserByEmail(body.email)) return json(res, 409, { error: 'An account with that email already exists. Sign in instead.' });
      const verificationToken = auth.token();
      const user = db.createUser({ name: clean(body.name, 120), email: clean(body.email, 200).toLowerCase(), passwordHash: auth.hash(body.password), verificationToken, verificationExpires: new Date(Date.now() + 86400000).toISOString() });
      if (sellerRegistration) db.saveSellerApplication(user.id, body);
      const response = { user, verificationRequired: true, sellerApplicationSaved: sellerRegistration, message: sellerRegistration ? 'Account created and seller application saved as a draft. Verify your email before signing in, then submit the application.' : 'Account created. Verify your email before signing in.' };
      if (process.env.NODE_ENV !== 'production') response.devVerificationUrl = `/api/auth/verify?token=${verificationToken}`;
      return json(res, 201, response);
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/login') { const body = await readBody(req); const result = auth.signIn(clean(body.email, 200).toLowerCase(), String(body.password || '')); if (!result) return json(res, 401, { error: 'Invalid email or password.' }); if (result.error) return json(res, 403, { error: result.error }); setSessionCookie(res, result.token); return json(res, 200, { user: result.user }); }
    if (req.method === 'POST' && url.pathname === '/api/auth/logout') { auth.signOut(cookies.pzy_session); clearSessionCookie(res); return json(res, 200, { ok: true }); }
    if (req.method === 'POST' && url.pathname === '/api/auth/password-reset/request') { const body = await readBody(req); if (validEmail(body.email)) { const resetToken = auth.token(); db.createResetToken(body.email, resetToken, new Date(Date.now() + 3600000).toISOString()); } return json(res, 200, { message: 'If an account exists, reset instructions will be sent.' }); }
    if (req.method === 'POST' && url.pathname === '/api/auth/password-reset/confirm') { const body = await readBody(req); if (String(body.password || '').length < 8) return json(res, 400, { error: 'Password must be at least 8 characters.' }); const user = db.resetPassword(clean(body.token, 200), auth.hash(body.password)); return user ? json(res, 200, { message: 'Password updated. Sign in again.' }) : json(res, 400, { error: 'This reset link is invalid or expired.' }); }
    if (req.method === 'GET' && url.pathname === '/api/buyer/profile') { if (!requireUser(req, res)) return; return json(res, 200, { profile: db.getBuyerProfile(req.user.id) }); }
    if (req.method === 'PUT' && url.pathname === '/api/buyer/profile') { if (!requireUser(req, res)) return; const body = await readBody(req); if (!clean(body.country, 80)) return json(res, 400, { error: 'Country is required.' }); return json(res, 200, { profile: db.upsertBuyerProfile(req.user.id, body) }); }
    if (req.method === 'GET' && url.pathname === '/api/seller/application') { if (!requireUser(req, res)) return; return json(res, 200, { application: db.getSellerApplication(req.user.id) }); }
    if ((req.method === 'PUT' || req.method === 'POST') && (url.pathname === '/api/seller/application' || url.pathname === '/api/seller-applications')) { if (!requireUser(req, res)) return; const body = await readBody(req); if (!clean(body.businessName, 150) || !clean(body.category, 80) || clean(body.description, 20).length < 20) return json(res, 400, { error: 'Business name, marketplace, and a description of at least 20 characters are required.' }); return json(res, 200, { application: db.saveSellerApplication(req.user.id, body) }); }
    if (req.method === 'POST' && url.pathname === '/api/seller/application/submit') { if (!requireUser(req, res)) return; const application = db.getSellerApplication(req.user.id); if (!application || !application.terms_accepted) return json(res, 400, { error: 'Complete the application and accept seller terms before submitting.' }); if (!req.user.email_verified) return json(res, 403, { error: 'Verify your email before submitting a seller application.' }); return json(res, 200, { application: db.submitSellerApplication(req.user.id), message: 'Your seller application has been submitted. Our team will review your information and notify you when a decision has been made.' }); }
    if (req.method === 'GET' && url.pathname === '/api/seller/dashboard') { if (!requireRole(req, res, ['seller', 'admin'])) return; return json(res, 200, { user: req.user, application: db.getSellerApplication(req.user.id), onboarding: db.db.prepare('SELECT * FROM seller_onboarding WHERE user_id=?').get(req.user.id) || null }); }
    if (req.method === 'GET' && url.pathname === '/api/listings') return json(res, 200, { listings: db.listListings({ type: url.searchParams.get('type') || undefined, search: url.searchParams.get('q') || undefined, category: url.searchParams.get('category') || undefined, featured: url.searchParams.get('featured') === '1' }) });
    if (req.method === 'GET' && url.pathname.startsWith('/api/listings/')) { const listing = db.getListing(url.pathname.split('/').pop()); return listing ? json(res, 200, { listing }) : json(res, 404, { error: 'Listing not found' }); }
    if (req.method === 'GET' && url.pathname === '/api/orders') { if (!requireUser(req, res)) return; return json(res, 200, { orders: db.getOrders(req.user.id) }); }
    if (req.method === 'POST' && url.pathname === '/api/checkout') { if (!requireUser(req, res)) return; const body = await readBody(req); const listing = db.getListing(clean(body.listingId, 100)); if (!listing) return json(res, 404, { error: 'Listing not found' }); const order = db.createOrder(req.user.id, listing, Math.max(1, Math.min(Number(body.quantity) || 1, 20))); try { return json(res, 201, { order, checkout: await whop.createCheckout({ order, listing }) }); } catch (error) { return json(res, 503, { error: error.message, order }); } }
    if (req.method === 'GET' && url.pathname === '/api/admin/overview') {
      if (!requireRole(req, res, ['admin'])) return;
      const counts = {
        businesses: db.db.prepare('SELECT COUNT(*) AS count FROM businesses').get().count,
        approvedSellers: db.db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='seller'").get().count,
        pendingApplications: db.db.prepare("SELECT COUNT(*) AS count FROM seller_applications WHERE status IN ('Pending','Under Review')").get().count,
        publishedListings: db.db.prepare("SELECT COUNT(*) AS count FROM listings WHERE status='published'").get().count,
        totalOrders: db.db.prepare('SELECT COUNT(*) AS count FROM orders').get().count,
        paidOrders: db.db.prepare("SELECT COUNT(*) AS count FROM orders WHERE payment_status='paid'").get().count,
        verifiedRevenue: db.db.prepare("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE payment_status='paid'").get().total,
        recordedCommission: db.db.prepare("SELECT COALESCE(SUM(commission),0) AS total FROM orders WHERE payment_status='paid'").get().total
      };
      const recentOrders = db.db.prepare('SELECT reference,total,currency,payment_status,created_at FROM orders ORDER BY created_at DESC LIMIT 8').all();
      return json(res, 200, { counts, recentOrders });
    }
    if (req.method === 'GET' && url.pathname === '/api/admin/applications') { if (!requireRole(req, res, ['admin'])) return; return json(res, 200, { applications: db.getApplications() }); }
    if (req.method === 'POST' && url.pathname.startsWith('/api/admin/applications/')) { if (!requireRole(req, res, ['admin'])) return; const applicationId = url.pathname.split('/').pop(); const body = await readBody(req); const statuses = { approve: 'Approved', approved: 'Approved', reject: 'Rejected', rejected: 'Rejected', changes_requested: 'Changes Requested', suspend: 'Suspended', suspended: 'Suspended', under_review: 'Under Review' }; const status = statuses[String(body.status || '').toLowerCase()]; if (!status) return json(res, 400, { error: 'Invalid application status.' }); return json(res, 200, { application: db.reviewApplication(applicationId, status, req.user.id, clean(body.notes, 1000)) }); }
    if (req.method === 'POST' && url.pathname === '/api/webhooks/whop') { const raw = await readRawBody(req); return json(res, 200, webhooks.processWhopWebhook(raw, req.headers['whop-signature'] || '')); }
    if (req.method === 'GET') { let file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1); if (!path.extname(file)) file = '404.html'; const extension = path.extname(file).slice(1); if (staticFiles.has(extension)) { const full = path.join(__dirname, file); if (fs.existsSync(full)) { res.writeHead(200, { 'Content-Type': contentTypes[extension] || 'application/octet-stream' }); return res.end(fs.readFileSync(full)); } } }
    return json(res, 404, { error: 'Not found' });
  } catch (error) { console.error(error); return json(res, 500, { error: 'Unexpected server error.' }); }
}
if (require.main === module) http.createServer(handler).listen(config.port, () => console.log(`Phyzel Marketplace running at http://localhost:${config.port}`));
module.exports = handler;
