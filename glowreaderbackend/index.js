const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Dynamic port for Render (fixes "Cannot GET /")
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Multer for image handling (optional for future use)
const upload = multer({ storage: multer.memoryStorage() });

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Optional: Basic root route to confirm API is live
app.get('/', (req, res) => {
  res.send('✨ GlowReader API is live!');
});

// Main route for analysis
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  const { skinType, concern } = req.body;

  const prompt = `
You're a Gen-Z skincare & makeup coach 💄. The user has skin type "${skinType}" and is mainly concerned about "${concern}".
Give:
- AM routine 🌞
- PM routine 🌙
- 2–3 makeup tips 💋
- Product suggestions with (mock) links 🧴
Use a casual, uplifting tone with emojis.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 GlowReader backend running at http://localhost:${port}`);
});
