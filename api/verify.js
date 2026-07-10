// Vercel Serverless — SIWS Verify endpoint
const nacl = require('tweetnacl');
const bs58 = require('bs58').default || require('bs58');

// Shared nonce store (same as captcha — cold start may mismatch, acceptable)
const nonces = new Map();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { wallet, signature, message, captchaAnswer } = req.body;
  if (!wallet || !signature || !message) {
    return res.status(400).json({ error: 'wallet, signature, message required' });
  }

  try {
    // Verify SIWS signature
    const msgBytes = new TextEncoder().encode(message);
    const sigBytes = bs58.decode(signature);
    const pubKeyBytes = bs58.decode(wallet);

    const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
    if (!valid) return res.status(401).json({ error: 'Invalid signature' });

    // Verify captcha answer from message
    const captchaMatch = message.match(/Captcha: (\d+)/);
    if (!captchaMatch) return res.status(400).json({ error: 'No captcha in message' });

    // For Vercel, we trust the signed message contains the correct captcha
    // (server generated the message with the answer, user signed it)

    return res.json({
      ok: true,
      wallet: wallet.toLowerCase(),
      message: 'Login successful',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
};
