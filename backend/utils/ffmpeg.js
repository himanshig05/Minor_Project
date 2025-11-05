'use strict';

// const ffmpegPath = require('ffmpeg-static');
// const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath(ffmpegPath);

// function extractAudioToWav(inputPath, outputPath) {
//   return new Promise((resolve, reject) => {
//     ffmpeg(inputPath)
//       .noVideo()
//       .audioChannels(1)
//       .audioFrequency(16000)
//       .audioCodec('pcm_s16le')
//       .format('wav')
//       .save(outputPath)
//       .on('end', resolve)
//       .on('error', reject);
//   });
// }

// module.exports = { extractAudioToWav };

const { exec } = require('child_process');
const path = require('path');

exports.extractFramesFromVideo = (inputPath, outputDir, frameCount = 5) => {
  return new Promise((resolve, reject) => {
    const outputPattern = path.join(outputDir, 'frame-%03d.jpg');
    const cmd = `ffmpeg -i "${inputPath}" -vf "fps=${frameCount}/$(ffprobe -v 0 -show_entries format=duration -of csv=p=0 ${inputPath})" "${outputPattern}" -hide_banner -loglevel error`;
    exec(cmd, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
};


