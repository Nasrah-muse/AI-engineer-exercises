import Replicate from "replicate";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  if (!fs.existsSync("audio")) fs.mkdirSync("audio");

  console.log("audio generating...");

  const fear = await replicate.run(
    "minimax/speech-02-turbo",
    {
      input: {
        text: "My hands shake, my thoughts race, and my courage feels distant.",
        voice_id: "English_UpsetGirl",
        emotion: "fearful",
        speed: 1,
        pitch: 0,
        volume: 1,
        sample_rate: 32000,
        audio_format: "mp3",
        channel: "mono",
      }
    }
  );

   const audioUrl = fear.url();
  if (!audioUrl) {
    console.error("Audio URL not returned");
    return;
  }

  const res = await fetch(audioUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  fs.writeFileSync("audio/fear.mp3", buffer);
 }

main();
