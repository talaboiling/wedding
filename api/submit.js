import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, attending } = request.body;

    if (!name || !attending) {
      return response.status(400).json({ error: 'Name and confirmation are required' });
    }

    const entry = {
      name,
      attending,
      timestamp: new Date().toLocaleString('kk-KZ', { timeZone: 'Asia/Almaty' })
    };

    // Push the entry to a Redis list named "guests_talgat_laura"
    // By using rpush, the newest entries are added to the end
    await kv.rpush('guests_talgat_laura', entry);

    return response.status(200).json({ success: true, message: 'Response saved successfully' });
  } catch (error) {
    console.error('Submission error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
