const fs = require("node:fs");

const sampleRate = 44100;

function writeWav(fileName, tones) {
  const samples = [];
  for (const tone of tones) {
    const count = Math.floor(sampleRate * tone.duration);
    for (let index = 0; index < count; index += 1) {
      const progress = index / count;
      const envelope = Math.min(1, progress * 20, (1 - progress) * 20);
      samples.push(Math.sin((2 * Math.PI * tone.frequency * index) / sampleRate) * envelope * 0.45);
    }
    for (let index = 0; index < Math.floor(sampleRate * tone.pause); index += 1) samples.push(0);
  }

  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, index) => data.writeInt16LE(Math.round(sample * 32767), index * 2));
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(fileName, Buffer.concat([header, data]));
}

writeWav("assets/sounds/timer-warning.wav", [{ frequency: 880, duration: 0.12, pause: 0 }]);
writeWav("assets/sounds/timer-finished.wav", [
  { frequency: 660, duration: 0.16, pause: 0.04 },
  { frequency: 880, duration: 0.24, pause: 0 },
]);
