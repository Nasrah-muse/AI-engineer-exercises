import OpenAI from "openai"
import dotenv from "dotenv"
dotenv.config()
import readline from "readline";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const askQuestion = (query) => new Promise((resolve) => input.question(query, resolve))

const generateText = async (prompt) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  })
    let fullResponse = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      process.stdout.write(content);
      fullResponse += content;
    }
  }
  console.log("\n .... Stream Complete ...\n");
  return fullResponse;
};

// const result = await generateText("Explain how async/await works in JavaScript");


