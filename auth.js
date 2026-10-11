const crypto = require('node:crypto');
const db = require('./database');
const config = require('./config');
const attempts = new Map();
function hash(password) { return crypto.scryptSync(password, config.sessionSecret, 64).toString('hex'); }
function verify(password, stored) { try { return crypto.timingSafeEqual(Buffer.from(hash(password), 'hex'), Buffer.from(stored, 'hex')); } catch { return false; } }
function token() { return crypto.randomBytes(32).toString('hex'); }
function tokenHash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function signIn(email, password) { const key = email.toLowerCase(); const current = attempts.get(key) || { count: 0, until: 0 }; if (current.until > Date.now()) return { error: 'Too many sign-in attempts. Try again shortly.' }; const user = db.getUserByEmail(key); if (!user || !verify(password, user.password_hash)) { current.count += 1; if (current.count >= 5) current.until = Date.now() + 60000; attempts.set(key, current); return null; } attempts.delete(key); if (!user.email_verified) return { error: 'Please verify your email before signing in.' }; const raw = token(); db.createSession(tokenHash(raw), user.id, new Date(Date.now() + 86400000).toISOString()); return { token: raw, user: db.getUser(user.id) }; }
function signOut(raw) { if (raw) db.deleteSession(tokenHash(raw)); }
function userFromToken(raw) { return raw ? db.getSessionUser(tokenHash(raw)) : null; }
module.exports = { hash, signIn, signOut, userFromToken, token, tokenHash };
