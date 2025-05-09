import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set on server' });
  }

  const { endpoint, ...body } = req.body;
  let url = '';
  if (endpoint === 'chat') {
    url = `${OPENAI_API_URL}/chat/completions`;
  } else if (endpoint === 'image') {
    url = `${OPENAI_API_URL}/images/generations`;
  } else {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  try {
    const openaiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({ error: data.error || 'OpenAI API error' });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err });
  }
} 