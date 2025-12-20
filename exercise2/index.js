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
    const galleryHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Image Gallery - ${theme}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; }
    h1 { text-align: center; }
    .gallery { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
    .card { background: white; padding: 10px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); width: 300px; }
    .card img { width: 100%; border-radius: 10px; }
    .card pre { font-size: 12px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>Gallery - ${theme}</h1>
  <div class="gallery">
    ${images.map(img => `
      <div class="card">
        <img src="./images/${img.filename}" alt="${img.meta.theme}">
        <pre>${JSON.stringify(img.meta, null, 2)}</pre>
      </div>
    `).join("\n")}
  </div>
</body>
</html>
`;

  fs.writeFileSync("gallery.html", galleryHtml)
  console.log("\n gallery created: gallery.html")
}
main();
