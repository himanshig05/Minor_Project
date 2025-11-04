'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { classifyAudioBuffer } = require('../services/gemini');
const { extractAudioToWav } = require('../utils/ffmpeg');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

router.post('/verify-audio', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No file uploaded. Use form-data field name "file".');
      err.status = 400; throw err;
    }
    const mimeType = req.file.mimetype || 'application/octet-stream';
    const result = await classifyAudioBuffer(req.file.buffer, mimeType);
    res.json({ bytes: req.file.size, mimeType, result });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-video', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No file uploaded. Use form-data field name "file".');
      err.status = 400; throw err;
    }

    // Write buffer to temp file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-'));
    const inputPath = path.join(tmpDir, 'input');
    fs.writeFileSync(inputPath, req.file.buffer);

    const wavPath = path.join(tmpDir, 'audio.wav');
    await extractAudioToWav(inputPath, wavPath);
    const audioBuffer = fs.readFileSync(wavPath);

    const result = await classifyAudioBuffer(audioBuffer, 'audio/wav');

    // Cleanup
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_e) {}

    res.json({ bytes: req.file.size, mimeType: req.file.mimetype, result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

