import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateContent(prompt, task) {
  const output = await replicate.run(
    "meta/meta-llama-3-70b-instruct",
    {
      input: {
        prompt: `
            You are a professional writer.
            Task: ${task}

            ${prompt}
        `,
        temperature: 0.7,
        max_tokens: 500
      }
    }
  );

  return output.join("");
}

async function main() {
  const topic = "How AI is transforming education";

  console.log("Article...");
  const article = await generateContent(topic, "Write a short article");

  await wait(5000)

  console.log("Summary...");
  const summary = await generateContent(article, "Summarize in 3 sentences");

  await wait(5000)

  console.log("Social Post...");
  const social = await generateContent(article, "Write a short social post like facebook");

  console.log("\n=== ARTICLE ===\n", article);
  console.log("\n=== SUMMARY ===\n", summary);
  console.log("\n=== SOCIAL ===\n", social);
}

main();
 