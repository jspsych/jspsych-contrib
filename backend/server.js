const OpenAI = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.use(bodyParser.json());
app.use(cors());

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, ai_model } = req.body;

    const stream = await openai.chat.completions.create({
      model: ai_model,
      messages: messages,
      stream: true,
    });

    res.header("Content-Type", "text/plain");
    for await (const chunk of stream.toReadableStream()) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
