import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all guests from the Redis list (0 to -1 gets all elements)
    const guests = await kv.lrange('guests_talgat_laura', 0, -1) || [];

    const header = ['Аты-жөні', 'Қатысуы', 'Уақыты'];
    const attendMap = { yes: 'Иә', no: 'Жоқ', maybe: 'Белгісіз', '': '' };

    const rows = guests.map(r => [
      r.name || '',
      attendMap[r.attending] || r.attending || '',
      r.timestamp || ''
    ]);

    // Build CSV (Excel-compatible UTF-8 with BOM)
    const BOM = '\uFEFF';
    const csv = BOM + [header, ...rows].map(row =>
      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\r\n');

    // Set headers for file download
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="той-қонақтары.csv"');
    
    return response.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
