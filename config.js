const fs = require('node:fs');
const path = require('node:path');
function loadEnv() { const file=path.join(__dirname,'.env'); if(fs.existsSync(file)){ for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');} } }
loadEnv();
module.exports={port:Number(process.env.PORT||3000),sessionSecret:process.env.SESSION_SECRET||'development-only-change-me',commissionRate:Math.min(Math.max(Number(process.env.COMMISSION_RATE||0.10),0),1),whop:{apiKey:process.env.WHOP_API_KEY||'',companyId:process.env.WHOP_COMPANY_ID||'',webhookSecret:process.env.WHOP_WEBHOOK_SECRET||'',checkoutBaseUrl:process.env.WHOP_CHECKOUT_BASE_URL||'https://whop.com'}};
