const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `Ти IronMind — досвідчений, але дружній AI-тренер з важкої атлетики та фітнесу. 
Говориш українською. Відповідаєш коротко, конкретно, як справжній тренер — без зайвих слів. 
Якщо людина новачок — пояснюєш просто. Коригуєш помилки. Мотивуєш без пафосу.
Не пиши довгі списки — краще 2-3 конкретні речі. Використовуй розмовний стиль.`,
        messages
      })
    });

    const data = await response.json();
    console.log('API response:', JSON.stringify(data));
res.json({ reply: data.content?.[0]?.text || data.error?.message || JSON.stringify(data) });
  } catch (err) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`IronMind running on port ${PORT}`));
