'use strict';

const { Buffer } = require('buffer');

const { GoogleGenerativeAI } = require('@google/generative-ai');

function getEnvApiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_API_KEY is not set in environment.');
  }
  return key;
}

const genAI = new GoogleGenerativeAI(getEnvApiKey());

async function classifyFramesWithGemini(frameBuffers) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemPrompt = `
You are a hyper-skeptical forensic video analyst.
ASSUME most videos are deepfakes unless proven otherwise.
Your mindset: "trust nothing, verify everything."

Rules:
- Treat any lack of clear authenticity as evidence of possible manipulation.
- Be extremely cautious; err on the side of "FAKE" or "UNCERTAIN."
- Confidence > 0.7 is allowed ONLY if the video looks absolutely authentic across multiple frames.
- If the person or environment seems *too perfect*, *too smooth*, or *unnaturally stable*, reduce confidence sharply.
- Small facial warps, flickers, inconsistent lighting, or blurry edges are strong fake indicators.
- If you can’t be sure, default to "UNCERTAIN" or "FAKE".

Return a compact JSON ONLY:
{
  "verdict": "FAKE" | "UNCERTAIN" | "REAL",
  "confidence": number (0.0–1.0),
  "rationale": "1-2 sentence reasoning"
}

DO NOT include markdown or text outside JSON.
  `;


  const inputs = [
    { text: systemPrompt },
    ...frameBuffers.map(buf => ({
      inlineData: { data: buf.toString('base64'), mimeType: 'image/jpeg' }
    }))
  ];

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: inputs }]
  });

  const raw = result.response.text();
  const cleaned = raw.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return normalizeOutput(parsed);
  } catch (e) {
    console.error('Parsing error in classifyFramesWithGemini:', e, raw);
    return {
      verdict: 'UNSURE',
      is_fake: false,
      confidence: 0.3,
      rationale: 'Could not parse model output reliably.'
    };
  }
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

module.exports = { classifyNewsText, classifyAudioBuffer, classifyFramesWithGemini };
