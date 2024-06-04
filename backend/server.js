const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_KEY;

app.use(bodyParser.json());
app.use(cors());

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, ai_model } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: ai_model,
        messages: [{ role: "system", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.choices[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing request");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
