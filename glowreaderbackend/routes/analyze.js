const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', upload.single('image'), async (req, res) => {
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

module.exports = router;
