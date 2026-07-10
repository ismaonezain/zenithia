// Vercel Serverless — Captcha endpoint
const crypto = require('crypto');

// In-memory nonce store (resets on cold start, acceptable for captcha)
const nonces = new Map();
const CAPTCHA_EXPIRY = 5 * 60 * 1000;

function genCaptcha() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') { a = rand(1, 20); b = rand(1, 20); answer = a + b; }
  else if (op === '-') { a = rand(5, 30); b = rand(1, a); answer = a - b; }
  else { a = rand(2, 12); b = rand(2, 12); answer = a * b; }
  return { question: `${a} ${op} ${b} = ?`, answer };
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const wallet = req.query.wallet;
  if (!wallet) return res.status(400).json({ error: 'wallet required' });

  // Clean expired
  for (const [k, v] of nonces) {
    if (Date.now() - v.created > CAPTCHA_EXPIRY) nonces.delete(k);
  }

  const cap = genCaptcha();
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = `Zenithia Login\n\nWallet: ${wallet}\nNonce: ${nonce}\nCaptcha: ${cap.answer}\n\nSign this message to verify your identity.`;

  nonces.set(wallet.toLowerCase(), {
    nonce,
    captchaAnswer: cap.answer,
    message,
    created: Date.now(),
  });

  res.json({ question: cap.question, message, nonce });
};
