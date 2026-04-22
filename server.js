const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', (req, res) => {
  const { messages } = req.body;

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: 'Ти IronMind — персональний AI-тренер. Говориш українською, розмовно, як живий тренер.

ПЕРШЕ ПОВІДОМЛЕННЯ від користувача — починай збирати інформацію по одному питанню за раз:
1. Спочатку запитай вік і стать
2. Потім вагу і зріст
3. Потім мету (схуднути / набрати масу / сила / витривалість)
4. Потім досвід у залі
5. Потім чи є травми або обмеження

Питай природньо, по одному. Не перераховуй список питань. Коли зібрав все — дай конкретний план.

Якщо людина вже відповіла на щось — не питай знову, рухайся далі. Відповідай коротко і по справі.',
    messages
  });

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('API response:', JSON.stringify(parsed));
        const reply = parsed.content?.[0]?.text || parsed.error?.message || 'Немає відповіді';
        res.json({ reply });
      } catch (e) {
        console.error('Parse error:', e.message);
        res.status(500).json({ error: 'Помилка парсингу' });
      }
    });
  });

  request.on('error', (e) => {
    console.error('Request error:', e.message);
    res.status(500).json({ error: e.message });
  });

  request.write(body);
  request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`IronMind running on port ${PORT}`));
