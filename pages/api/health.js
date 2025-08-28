import { getPostsCount } from '../../lib/posts';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const postsCount = getPostsCount();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'NEXCAR Blog API',
      version: '1.0.0',
      posts: {
        count: postsCount,
        lastCheck: new Date().toISOString()
      },
      endpoints: {
        webhook: '/api/webhook - POST only',
        posts: '/api/posts - GET only', 
        rss: '/api/rss - GET only',
        health: '/api/health - GET only'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
