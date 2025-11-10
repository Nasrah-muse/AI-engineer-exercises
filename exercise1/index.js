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