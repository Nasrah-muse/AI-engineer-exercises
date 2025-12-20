import Replicate from "replicate";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import readline from "readline";
dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});


function getTheme() {
  return new Promise((resolve) => {
    if (process.argv[2]) return resolve(process.argv[2]);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question("Enter image theme: ", (answer) => {
      rl.close();
      if (!answer.trim()) process.exit(1)
      resolve(answer.trim())
    })
  })
}

async function main() {
  const theme = await getTheme();
  console.log("theme:", theme)

  const ratios = { square: "1:1", landscape: "16:9", portrait: "9:16" }
const styles = ["vivid", "natural"]

if (!fs.existsSync("images")) fs.mkdirSync("images")
if (!fs.existsSync("metadata")) fs.mkdirSync("metadata")

    const images = [];

  for (const [ratioName, ratio] of Object.entries(ratios)) {
    for (const style of styles) {
      console.log(`Generating ${ratioName} | ${style}...`);

      const prompt = `
            High quality image.
            Theme: ${theme}.
            Style: ${style}.
            Cinematic lighting, sharp focus, professional look
      `;

      try {
        const output = await replicate.run(
          "google/imagen-4-fast",
          {
            input: { prompt, aspect_ratio: ratio }
          }
        );

        const imageUrl = output.url();
        const res = await fetch(imageUrl);
        const buffer = Buffer.from(await res.arrayBuffer());

        const filename = `${theme.replace(/\s+/g, "_")}_${ratioName}_${style}.jpg`;
        fs.writeFileSync(`images/${filename}`, buffer);

        const meta = {
          theme,
          ratio: ratioName,
          style,
          model: "google/imagen-4-fast",
          prompt,
          filename,
          url: imageUrl,
          generated_at: new Date().toISOString()
        };

        fs.writeFileSync(`metadata/${filename}.json`, JSON.stringify(meta, null, 2));

        images.push({ filename, meta });
        console.log(`Saved: images/${filename}`);
      } catch (err) {
        console.error("Error generating image:", err.message);
      }
    }
  }
}
main();
