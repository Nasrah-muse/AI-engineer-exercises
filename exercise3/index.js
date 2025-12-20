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

  const angry = await replicate.run(
    "minimax/speech-02-turbo",
    {
      input: {
        text: "I stayed patient for too long, hoping things would change.",
        voice_id: "English_MatureBoss",
        emotion: "angry",
        speed: 1,
        pitch: 0,
        volume: 1,
        sample_rate: 32000,
        audio_format: "mp3",
        channel: "mono",
      }
    }
  );

   const audioUrl = angry.url();
  if (!audioUrl) {
    console.error("Audio URL not returned");
    return;
  }

  const res = await fetch(audioUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  fs.writeFileSync("audio/angry.mp3", buffer);
 }

main();
