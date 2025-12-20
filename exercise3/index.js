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

  const happy = await replicate.run(
    "minimax/speech-02-turbo",
    {
      input: {
        text: "I smiled brightly today because everything finally worked out perfectly.",
        voice_id: "English_FriendlyPerson",
        emotion: "happy",
        speed: 1,
        pitch: 0,
        volume: 1,
        sample_rate: 32000,
        audio_format: "mp3",
        channel: "mono",
      }
    }
  );

   const audioUrl = happy.url();
  if (!audioUrl) {
    console.error("Audio URL not returned");
    return;
  }

  const res = await fetch(audioUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  fs.writeFileSync("audio/happy.mp3", buffer);
 }

main();
