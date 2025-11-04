'use strict';

const express = require('express');
const { z } = require('zod'); //validate and parse data
const { classifyNewsText } = require('../services/gemini');

const router = express.Router();

const requestSchema = z.object({
  text: z.string().min(10, 'text must be at least 10 characters').max(10000, 'text too long')
});

router.post('/verify', async (req, res, next) => {
  try {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map(i => i.message).join(', ');
      const err = new Error(message);
      err.status = 400;
      throw err;
    }

    const { text } = parsed.data;
    const result = await classifyNewsText(text);

    res.json({
      input_length: text.length,
      result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

