import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // Parse URL from request
  const url = new URL(request.url);
  const doi = url.searchParams.get('doi');
  
  if (!doi) {
    return new Response(JSON.stringify({ 
      error: 'Missing DOI parameter',
      message: 'Please provide a DOI to generate citation'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch('https://api.citationapi.com/v1/citations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.CITATION_API_KEY,
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
      
      return new Response(JSON.stringify({
        error: `Citation API error: ${response.status}`,
        message: errorData.message || message,
        doi
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Citation API error:', error);
    return new Response(JSON.stringify({
      error: 'Network error',
      message: 'Failed to connect to citation service. Please try again.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
