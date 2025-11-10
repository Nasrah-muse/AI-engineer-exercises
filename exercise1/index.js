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

(async () => {
  console.log("=== Smart Content Assistant ===\n")

   const topic = await askQuestion("Enter a topic: ")

  console.log("\nGenarating blog outline...\n")

  const outlinePrompt = `Create a detailed blog post outline about "${topic}". Include introduction, main sections, and conclusion.`
  const outline = await generateText(outlinePrompt)

  console.log("\nSummarizing outline...\n")

  const summaryResponse = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Summarize the given blog outline in 2 concise sentences." },
      { role: "user", content: outline },
    ],
  })

  const summary = summaryResponse.choices[0].message.content
  console.log(" Summary:", summary, "\n")

  while (true) {
    const question = await askQuestion("Ask a follow-up question (or type 'exit' to quit): ")
    if (question.toLowerCase() === "exit") break

    const answerPrompt = `
      Context: ${outline}
      Question: ${question}
    `

    const answerResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers based on the provided context. If the answer is not in the context, say 'I don’t have enough information to answer that.'",
        },
        { role: "user", content: answerPrompt },
      ],
    })

    console.log(" Answer:", answerResponse.choices[0].message.content, "\n")
  }

  input.close()
})()

