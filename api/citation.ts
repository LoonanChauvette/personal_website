import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const doi = req.query.doi as string;
  
  if (!doi) {
    return res.status(400).json({ 
      error: 'Missing DOI parameter',
      message: 'Please provide a DOI to generate citation'
    });
  }

  try {
    const response = await fetch('https://api.citationapi.com/v1/citations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.CITATION_API_KEY || '',
      },
      body: JSON.stringify({
        url: `https://doi.org/${doi}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let message = 'Failed to fetch citation';
      if (response.status === 404 || response.status === 422) {
        message = 'Citation not available for this publication';
      } else if (response.status === 429) {
        message = 'Too many requests. Please try again in a moment';
      } else if (response.status === 401) {
        message = 'Citation service authentication failed';
      }
      
      return res.status(response.status).json({
        error: `Citation API error: ${response.status}`,
        message: errorData.message || message,
        doi
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Citation API error:', error);
    return res.status(500).json({
      error: 'Network error',
      message: 'Failed to connect to citation service. Please try again.'
    });
  }
}
