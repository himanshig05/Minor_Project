'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Buffer } = require('buffer');

function getEnvApiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    const error = new Error('GOOGLE_API_KEY is not set. Add it to your environment or .env file.');
    error.status = 500;
    throw error;
  }
  return key;
}

async function classifyNewsText(text) {
  const apiKey = getEnvApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = process.env.MODEL_ID || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelId });

  const systemPrompt = [
    'You are a rigorous fact-checking assistant.',
    'Classify the following news text as FAKE, REAL, or UNSURE.',
    'Your output MUST be compact JSON with keys: verdict, is_fake, confidence, rationale.',
    'Rules:',
    '- verdict: one of "FAKE", "REAL", "UNSURE"',
    '- is_fake: boolean, true only if verdict is FAKE',
    '- confidence: number from 0 to 1',
    '- rationale: concise explanation (1-3 sentences).',
    'Do not include code fences or any extra text.'
  ].join('\n');

  const userContent = `NEWS:\n${text}`;

  const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }] });
  const response = result.response;
  const raw = response.text();
  const cleaned = raw.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return normalizeOutput(parsed);
  } catch (_e) {
    // Fallback: try to coerce simple patterns
    return {
      verdict: 'UNSURE',
      is_fake: false,
      confidence: 0.3,
      rationale: 'Could not parse model output reliably.'
    };
  }
}

function normalizeOutput(parsed) {
  const verdictRaw = String(parsed.verdict || '').toUpperCase();
  const isFake = Boolean(parsed.is_fake);
  const confidenceNum = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5;
  const rationaleStr = typeof parsed.rationale === 'string' ? parsed.rationale : 'No rationale provided.';

  let verdict = 'UNSURE';
  if (verdictRaw === 'FAKE') verdict = 'FAKE';
  else if (verdictRaw === 'REAL') verdict = 'REAL';

  return { verdict, is_fake: isFake, confidence: confidenceNum, rationale: rationaleStr };
}

module.exports = { classifyNewsText };

async function classifyAudioBuffer(buffer, mimeType) {
  const apiKey = getEnvApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = process.env.MODEL_ID || 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelId });

  const systemPrompt = [
    'You are a rigorous fact-checking assistant.',
    'You will receive an audio clip that may contain news claims.',
    'Transcribe briefly if needed and classify the main claim as FAKE, REAL, or UNSURE.',
    'Output compact JSON: { verdict, is_fake, confidence, rationale } (no code fences).'
  ].join('\n');

  const base64 = buffer.toString('base64');

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: systemPrompt },
        { inlineData: { mimeType, data: base64 } }
      ]
    }]
  });
  const raw = result.response.text();
  const cleaned = raw.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return normalizeOutput(parsed);
  } catch (_e) {
    return { verdict: 'UNSURE', is_fake: false, confidence: 0.3, rationale: 'Could not parse model output reliably.' };
  }
}

module.exports.classifyAudioBuffer = classifyAudioBuffer;

