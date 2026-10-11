const config = require('./config');

function configured() { return Boolean(config.supabase.url && config.supabase.publishableKey); }
async function authSettings() {
  if (!configured()) return { configured: false, reachable: false, error: 'SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are not configured.' };
  try {
    const response = await fetch(`${config.supabase.url.replace(/\/$/, '')}/auth/v1/settings`, { headers: { apikey: config.supabase.publishableKey } });
    return { configured: true, reachable: response.ok, status: response.status, error: response.ok ? null : await response.text() };
  } catch (error) { return { configured: true, reachable: false, error: error.message }; }
}
module.exports = { configured, authSettings };
