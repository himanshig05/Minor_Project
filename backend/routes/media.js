'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { classifyAudioBuffer } = require('../services/gemini');
const { classifyFramesWithGemini } = require('../services/gemini');
const { extractFramesFromVideo } = require('../utils/ffmpeg');
const { classifyImagesWithGemini } = require('../services/gemini');


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
      err.status = 400;
      throw err;
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-'));
    const inputPath = path.join(tmpDir, 'input.mp4');
    fs.writeFileSync(inputPath, req.file.buffer);

    const framesDir = path.join(tmpDir, 'frames');
    fs.mkdirSync(framesDir);
    await extractFramesFromVideo(inputPath, framesDir, 20);

    const frameFiles = fs.readdirSync(framesDir)
      .filter(f => f.endsWith('.jpg'))
      .map(f => fs.readFileSync(path.join(framesDir, f)));

    const result = await classifyFramesWithGemini(frameFiles);

    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

    res.json({ 
      bytes: req.file.size, 
      mimeType: req.file.mimetype, 
      frames: frameFiles.length, 
      result 
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-image', upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      const err = new Error('No images uploaded. Use form-data field name "files".');
      err.status = 400;
      throw err;
    }

    // Convert each uploaded image buffer
    const imageBuffers = req.files.map(file => file.buffer);
    const result = await classifyImagesWithGemini(imageBuffers);

    res.json({
      files: req.files.length,
      totalBytes: req.files.reduce((sum, f) => sum + f.size, 0),
      result
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;

