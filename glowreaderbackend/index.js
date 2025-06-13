const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const analyzeRoute = require('./routes/analyze');

dotenv.config();
const app = express();
const port = 4000;

app.use(cors({
  origin: process.env.CLIENT_URL, // set in .env and Render
  credentials: true,
}));
app.use(express.json());

app.use('/api/analyze', analyzeRoute); // 👈 Route

app.listen(port, () => {
  console.log(`🚀 GlowReader backend running at http://localhost:${port}`);
});
