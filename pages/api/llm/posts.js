// API REST específica para LLMs - Endpoint de posts optimizado
import { postsStore } from '../../../lib/posts';

export default async function handler(req, res) {
  // Configurar CORS para LLMs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Content-Type', 'application/json');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported',
      allowedMethods: ['GET']
    });
  }

  try {
    const posts = postsStore;
    const totalPosts = postsStore.length;

    // Estructura optimizada para LLMs
    const llmOptimizedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      fullContent: post.fullContent,
      pubDate: post.pubDate,
      author: post.author,
      link: post.link,
      createdAt: post.createdAt,
      
      // Metadatos específicos para LLMs
      metadata: {
        wordCount: post.fullContent.replace(/<[^>]*>/g, '').split(' ').length,
        readingTime: Math.ceil(post.fullContent.replace(/<[^>]*>/g, '').split(' ').length / 200),
        hasImages: post.fullContent.includes('<img'),
        hasLinks: post.fullContent.includes('<a href'),
        hasSources: post.fullContent.toLowerCase().includes('fuentes') || post.fullContent.toLowerCase().includes('referencias'),
        mentionsREPUVE: post.fullContent.toLowerCase().includes('repuve'),
        mentionsAMDA: post.fullContent.toLowerCase().includes('amda'),
        mentionsSAT: post.fullContent.toLowerCase().includes('sat'),
        riskLevel: post.fullContent.toLowerCase().includes('riesgo') || post.fullContent.toLowerCase().includes('peligro') ? 'high' : 'medium',
        contentType: detectContentType(post),
        categories: categorizePost(post)
      }
    }));

    // Respuesta optimizada para LLMs
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      api: {
        name: 'NEXCAR Blog API for LLMs',
        version: '1.0.0',
        endpoint: '/api/llm/posts',
        description: 'Optimized posts endpoint for Large Language Models'
      },
      data: {
        totalPosts,
        posts: llmOptimizedPosts
      },
      pagination: {
        current: 1,
        total: 1,
        perPage: totalPosts
      },
      usage: {
        rateLimit: '100 requests per hour',
        authentication: 'Optional API key for higher limits'
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in LLM posts API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve posts',
      timestamp: new Date().toISOString()
    });
  }
}

// Función para detectar tipo de contenido (reutilizada del sistema principal)
function detectContentType(post) {
  const title = post.title.toLowerCase();
  const content = post.fullContent.toLowerCase();
  
  if (title.includes('paso') || title.includes('cómo') || content.includes('paso 1') || content.includes('paso 2')) {
    return 'HowTo';
  }
  if (title.includes('validar') || title.includes('detectar') || title.includes('verificar')) {
    return 'ValidationGuide';
  }
  if (title.includes('fraude') || title.includes('falso') || title.includes('apócrifo')) {
    return 'FraudDetection';
  }
  if (title.includes('repuve') || title.includes('amda') || title.includes('tarjeta')) {
    return 'DocumentGuide';
  }
  return 'Article';
}

// Función para categorizar posts (reutilizada del sistema principal)
function categorizePost(post) {
  const title = post.title.toLowerCase();
  const content = post.fullContent.toLowerCase();
  const combinedText = `${title} ${content}`;
  
  const categories = {
    'REPUVE': ['repuve', 'registro público vehicular', 'calcomanía mx', 'sello', 'chip'],
    'AMDA': ['amda', 'factura amda', 'papel seguridad', 'cfdi'],
    'Tarjetas de Circulación': ['tarjeta de circulación', 'tarjeta circulación', 'documento vehicular'],
    'Fraude Automotriz': ['fraude', 'falso', 'apócrifo', 'falsificación', 'estafa'],
    'Validación Vehicular': ['validar', 'verificar', 'detectar', 'inspección'],
    'Prevención de Fraudes': ['prevención', 'evitar', 'protección', 'seguridad'],
    'Servicios Automotrices': ['servicio', 'inspección', 'consultoría', 'dictamen'],
    'Documentos Oficiales': ['documento', 'oficial', 'gobierno', 'autoridad'],
    'SAT': ['sat', 'factura electrónica', 'cfdi', 'fiscal'],
    'Industria Automotriz': ['automotriz', 'vehículo', 'auto', 'carro'],
    'México': ['méxico', 'mexicano', 'nacional', 'gobierno'],
    'Seguridad Vehicular': ['seguridad', 'robo', 'hurto', 'protección'],
    'Tecnología Automotriz': ['tecnología', 'digital', 'electrónico', 'sistema'],
    'Legislación': ['ley', 'norma', 'regulación', 'legal'],
    'General': ['general', 'información', 'consejo', 'guía']
  };
  
  const scores = {};
  
  // Calcular scores para cada categoría
  Object.keys(categories).forEach(category => {
    scores[category] = 0;
    categories[category].forEach(keyword => {
      // Keywords en título tienen mayor peso
      if (title.includes(keyword)) {
        scores[category] += 3;
      }
      // Keywords en contenido tienen peso normal
      if (content.includes(keyword)) {
        scores[category] += 1;
      }
    });
  });
  
  // Retornar las 5 categorías con mayor score
  return Object.keys(scores)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 5)
    .filter(category => scores[category] > 0);
}
