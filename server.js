const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', (req, res) => {
  const { messages } = req.body;

  const systemPrompt = 'Ти IronMind - персональний AI-тренер з важкої атлетики. Говориш украiнською, розмовно, як живий тренер. Збирай iнформацiю по одному питанню за раз: спочатку вiк i стать, потiм вагу i зрiст, потiм мету (схуднути або набрати масу або розвинути силу), потiм досвiд у залi, потiм чи є травми або обмеження. Питай природньо по одному питанню - не перераховуй список одразу. Коли зiбрав всю iнформацiю - дай конкретний персональний план. Вiдповiдай коротко i по справi без зайвих слiв.';

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages
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
        res.json({ reply: reply });
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
app.listen(PORT, () => console.log('IronMind running on port ' + PORT));
