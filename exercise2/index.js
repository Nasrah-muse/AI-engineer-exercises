import Replicate from "replicate";
import dotenv from "dotenv";
dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

import readline from "readline";

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

}
