const fs = require('node:fs');
const path = require('node:path');
function loadEnv() { const file = path.join(__dirname, '.env'); if (fs.existsSync(file)) { for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) { const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, ''); } } }
loadEnv();
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : require('node:crypto').randomBytes(32).toString('hex'));
if (process.env.NODE_ENV === 'production' && sessionSecret.length < 32) throw new Error('SESSION_SECRET must be set to a random value of at least 32 characters in production.');
module.exports = { port: Number(process.env.PORT || 3000), sessionSecret, commissionRate: Math.min(Math.max(Number(process.env.COMMISSION_RATE || 0.10), 0), 1), supabase: { url: process.env.SUPABASE_URL || '', publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '', serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '' }, whop: { apiKey: process.env.WHOP_API_KEY || '', companyId: process.env.WHOP_COMPANY_ID || '', webhookSecret: process.env.WHOP_WEBHOOK_SECRET || '', checkoutBaseUrl: process.env.WHOP_CHECKOUT_BASE_URL || 'https://whop.com' } };
