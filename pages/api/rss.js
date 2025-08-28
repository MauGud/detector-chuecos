import { loadPostsFromRSS } from '../../lib/posts';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const posts = await loadPostsFromRSS();
    
    res.status(200).json({
      success: true,
      posts: posts,
      count: posts.length,
      lastUpdate: new Date().toISOString(),
      source: 'RSS Feed'
    });

  } catch (error) {
    console.error('Error loading RSS:', error);
    res.status(500).json({ 
      error: 'Error loading RSS feed',
      message: error.message 
    });
  }
}
