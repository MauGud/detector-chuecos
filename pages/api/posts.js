import { getAllPosts } from '../../lib/posts';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const posts = getAllPosts();
    
    res.status(200).json({
      success: true,
      posts: posts,
      count: posts.length,
      lastUpdate: new Date().toISOString(),
      source: 'Memory Store'
    });

  } catch (error) {
    console.error('Error obteniendo posts:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}
