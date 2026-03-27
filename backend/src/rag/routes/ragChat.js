const express = require('express');

const router = express.Router();

/** Health check for portfolio RAG service (no auth — add rate limiting in production). */
router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'portfolio-rag' });
});

// POST /chat — uncomment and implement when runPortfolioRagChat is ready
// const { runPortfolioRagChat } = require('../services/ragChat');
// router.post('/chat', express.json(), async (req, res, next) => { ... });

module.exports = router;
