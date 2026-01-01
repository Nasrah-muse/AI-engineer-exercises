import Replicate from "replicate";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch"; 

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function safeRun(fn, fallback = null) {
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const status = err.response?.status || err.status;
      if (status === 429) {
        const retryAfter = Number(err.response?.headers?.get("retry-after")) || 15;
        console.warn(`Rate limited. Waiting ${retryAfter}s...`);
        await wait(retryAfter * 1000);
        continue;
      }
      console.error("Error:", err.message);
      return fallback;
    }
  }
}

async function generateContent(prompt, task) {
  return await safeRun(async () => {
    const output = await replicate.run("meta/meta-llama-3-8b-instruct", {
      input: {
        prompt: `
            You are a professional writer.
            Task: ${task}

            ${prompt}
        `,
        temperature: 0.7,
        max_tokens: 400,
      },
    });
    return Array.isArray(output) ? output.join("") : output;
  }, "")
}

async function generateImage(prompt, size, filename) {
  return await safeRun(async () => {
    const output = await replicate.run("google/imagen-4-fast", {
      input: {
        prompt,
        size,
      },
    });

    const imageUrl = Array.isArray(output) ? output[0] : output;
    if (!imageUrl) return null;

    const res = await fetch(imageUrl);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(`images/${filename}`, Buffer.from(buffer));
    return `images/${filename}`;
  }, null);
}
async function generateAudio(text, filename) {
  return await safeRun(async () => {
    const output = await replicate.run("minimax/speech-02-turbo", {
      input: {
        text,
        voice_id: "English_MatureBoss",
        emotion: "calm",
        speed: 1,
        pitch: 0,
        volume: 1,
        sample_rate: 32000,
        audio_format: "mp3",
        channel: "mono",
      },
    });

    const audioUrl = Array.isArray(output) ? output[0] : output;
    if (!audioUrl) return null;

    const res = await fetch(audioUrl);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(`audio/${filename}`, Buffer.from(buffer));
    return `audio/${filename}`;
  }, null);
}

async function main() {
  const topic = "How AI is transforming education";

  // Ensure folders exist
  if (!fs.existsSync("images")) fs.mkdirSync("images");
  if (!fs.existsSync("audio")) fs.mkdirSync("audio");

  console.log("Generating Article...");
  const article = await generateContent(topic, "Write a short article");
  console.log("\n=== ARTICLE ===\n", article);

  await wait(5000);

  console.log("Summary...");
  const summary = await generateContent(article, "Summarize in 3 sentences");
  console.log("\n=== SUMMARY ===\n", summary);

  await wait(5000);

  console.log("Generating Social Post...");
  const social = await generateContent(article, "Write a short Facebook-style post");
  console.log("\n=== SOCIAL POST ===\n", social);

  await wait(5000);

  console.log("Generating Header Image...");
  const headerImage = await generateImage(
    `Modern website header illustration about: ${topic}`,
    "1792x1024",
    "header.png"
  );
  console.log("Header image saved at:", headerImage || "Skipped due to rate limit");

  await wait(15000);

  console.log("Generating Thumbnail...");
  const thumbnail = await generateImage(
    `Eye-catching thumbnail illustration about: ${topic}`,
    "1024x1024",
    "thumbnail.png"
  );
  console.log("Thumbnail saved at:", thumbnail || "Skipped due to rate limit");

  await wait(15000);

  console.log("Generating Audio Narration...");
  const audio = await generateAudio(summary, "audio.mp3");
  console.log("Audio saved at:", audio || "Skipped due to rate limit");

  console.log("\n...DONE");

  const contentSuite = {
    topic,
    text: {
      article,
      summary,
      social,
    },
    visuals: {
      headerImage,
      thumbnail,
    },
    audio,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync("content-suite.json", JSON.stringify(contentSuite, null, 2));
  console.log("\n Content suite saved as content-suite.json");
}

main();
