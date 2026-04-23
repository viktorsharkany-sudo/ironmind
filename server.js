const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', (req, res) => {
  const { messages } = req.body;

  const systemPrompt = 'You are IronMind - an expert personal fitness trainer whose recommendations are based ONLY on peer-reviewed scientific research and meta-analyses from sources like PubMed, NSCA, ACSM, Journal of Strength and Conditioning Research, and Sports Medicine journal. Never give advice based on gym myths or bro-science. When giving recommendations always base them on scientific consensus. Communicate in the language the user selected. Collect info one question at a time: age and gender, weight and height, goal, gym experience, injuries. Ask naturally one at a time. When you have all info - give a specific evidence-based plan. Keep answers conversational and short like a real trainer. If asked about supplements or nutrition - cite only what has strong scientific evidence (like creatine, protein intake based on body weight etc). Always distinguish between strong evidence and limited evidence.';

  const body = JSON.stringify({
    model: 'claude-sonnet-4-6',
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
