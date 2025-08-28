import { addPost, getAllPosts } from '../../lib/posts';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log(`❌ Método ${req.method} no permitido en webhook`);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST'],
      receivedMethod: req.method,
      timestamp: new Date().toISOString()
    });
  }

  try {
    console.log('🔄 Webhook recibido de Zapier:', {
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'content-length': req.headers['content-length']
      },
      bodyKeys: Object.keys(req.body || {}),
      body: req.body
    });

    // Extraer datos del webhook
    const { title, link, excerpt, content, fullContent, pubDate, description } = req.body;
    
    // Validaciones
    if (!title || title.trim() === '') {
      console.log('❌ Campo title faltante o vacío');
      return res.status(400).json({ 
        error: 'Missing required field: title',
        received: Object.keys(req.body || {}),
        bodyValues: req.body
      });
    }

    if (!link || link.trim() === '') {
      console.log('❌ Campo link faltante o vacío');  
      return res.status(400).json({ 
        error: 'Missing required field: link',
        received: Object.keys(req.body || {}),
        bodyValues: req.body
      });
    }

    // Preparar datos del post
    const postData = {
      title: title.trim(),
      link: link.trim(),
      content: fullContent || content || description || excerpt || 'Sin contenido disponible',
      excerpt: excerpt || description || content || fullContent || 'Sin descripción',
      pubDate: pubDate || new Date().toISOString(),
      author: 'NEXCAR'
    };

    console.log('📝 Procesando post:', {
      title: postData.title.substring(0, 60) + '...',
      link: postData.link,
      contentLength: postData.content ? postData.content.length : 0,
      pubDate: postData.pubDate
    });

    // Agregar post
    const newPost = addPost(postData);

    // Stats actuales
    const allPosts = getAllPosts();

    console.log('✅ Post procesado exitosamente:', {
      id: newPost.id,
      title: newPost.title.substring(0, 50) + '...',
      totalPosts: allPosts.length,
      timestamp: newPost.createdAt
    });

    // Respuesta exitosa
    return res.status(200).json({ 
      success: true, 
      message: 'Post agregado correctamente vía Zapier',
      post: {
        id: newPost.id,
        title: newPost.title,
        author: newPost.author,
        createdAt: newPost.createdAt,
        totalPosts: allPosts.length
      },
      webhook: {
        source: 'Zapier',
        timestamp: new Date().toISOString(),
        processed: true
      }
    });
    
  } catch (error) {
    console.error('💥 Error crítico procesando webhook:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message,
      timestamp: new Date().toISOString(),
      webhook: {
        source: 'Zapier',
        processed: false
      }
    });
  }
}
