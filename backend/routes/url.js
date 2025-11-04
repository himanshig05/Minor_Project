'use strict';

const express = require('express');
const { z } = require('zod');
const cheerio = require('cheerio');
const { classifyNewsText } = require('../services/gemini');

const router = express.Router();

const requestSchema = z.object({
  url: z.string().url('invalid url'),
});

router.post('/verify-url', async (req, res, next) => {
  try {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map(i => i.message).join(', ');
      const err = new Error(message);
      err.status = 400; throw err;
    }

    const { url } = parsed.data;
    const html = await fetchHtml(url);
    const text = extractTextFromHtml(html);

    if (!text || text.trim().length < 20) {
      const err = new Error('Could not extract enough text from the URL');
      err.status = 422; throw err;
    }

    const truncated = truncate(text, 8000);
    const result = await classifyNewsText(truncated);
    res.json({ source: url, extracted_length: truncated.length, result });
  } catch (err) {
    next(err);
  }
});

async function fetchHtml(url) {
  const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FakeNewsVerifier/1.0)' } });
  if (!resp.ok) {
    const e = new Error(`Failed to fetch URL: HTTP ${resp.status}`);
    e.status = 502; throw e;
  }
  return await resp.text();
}

function extractTextFromHtml(html) {
  const $ = cheerio.load(html);
  const parts = [];
  const title = $('title').text();
  if (title) parts.push(title);
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) parts.push(metaDesc);
  const ogDesc = $('meta[property="og:description"]').attr('content');
  if (ogDesc) parts.push(ogDesc);
  const article = $('article').text();
  if (article && article.trim().length > 100) parts.push(article);
  const body = $('body').text();
  if (body) parts.push(body);
  const text = parts.join('\n').replace(/\s+/g, ' ').trim();
  return text;
}

function truncate(s, n) {
  if (s.length <= n) return s;
  return s.slice(0, n);
}

module.exports = router;


  