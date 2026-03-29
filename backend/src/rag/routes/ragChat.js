const express = require('express');
const { runPortfolioRagChat } = require('../services/ragChat');

const router = express.Router();

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (no extra package needed).
// Limits each IP to RAG_MAX_REQUESTS calls per RAG_WINDOW_MS.
// Replace with express-rate-limit + Redis for production multi-instance deploy.
// ---------------------------------------------------------------------------
const RAG_WINDOW_MS = 60_000; // 1 minute
const RAG_MAX_REQUESTS = 15;  // per IP per window
const ipCounters = new Map();  // ip -> { count, resetAt }

function ragRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = ipCounters.get(ip);

  if (!entry || now >= entry.resetAt) {
    ipCounters.set(ip, { count: 1, resetAt: now + RAG_WINDOW_MS });
    return next();
  }

  if (entry.count >= RAG_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  entry.count += 1;
  return next();
}

// Prune expired entries periodically to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipCounters.entries()) {
    if (now >= entry.resetAt) ipCounters.delete(ip);
  }
}, RAG_WINDOW_MS * 2);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET /api/portfolio-rag/health — public, no auth needed. */
router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'portfolio-rag' });
});

/** POST /api/portfolio-rag/chat — public + rate limited. */
router.post('/chat', express.json(), ragRateLimiter, async (req, res, next) => {
  try {
    const { message } = req.body;

    // Validate
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required and must be a string.' });
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({ error: 'message must not be empty.' });
    }
    if (trimmed.length > 800) {
      return res.status(400).json({ error: 'message must be 800 characters or fewer.' });
    }

    const { reply, sources } = await runPortfolioRagChat(trimmed);

    return res.json({ reply, sources });
  } catch (err) {
    next(err); // handled by Express error middleware
  }
});

module.exports = router;
