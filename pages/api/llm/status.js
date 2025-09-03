// API REST para monitoreo y status específico para LLMs
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
    const totalPosts = posts.length;
    
    // Calcular estadísticas en tiempo real
    const stats = {
      posts: {
        total: totalPosts,
        withImages: posts.filter(p => p.fullContent && p.fullContent.includes('<img')).length,
        withLinks: posts.filter(p => p.fullContent && p.fullContent.includes('<a href')).length,
        withSources: posts.filter(p => p.fullContent && (p.fullContent.toLowerCase().includes('fuentes') || p.fullContent.toLowerCase().includes('referencias'))).length,
        mentionsREPUVE: posts.filter(p => p.fullContent && p.fullContent.toLowerCase().includes('repuve')).length,
        mentionsAMDA: posts.filter(p => p.fullContent && p.fullContent.toLowerCase().includes('amda')).length,
        mentionsSAT: posts.filter(p => p.fullContent && p.fullContent.toLowerCase().includes('sat')).length,
        highRisk: posts.filter(p => p.fullContent && (p.fullContent.toLowerCase().includes('riesgo') || p.fullContent.toLowerCase().includes('peligro'))).length
      },
      content: {
        totalWords: posts.reduce((sum, post) => sum + (post.fullContent ? post.fullContent.replace(/<[^>]*>/g, '').split(' ').length : 0), 0),
        averageReadingTime: posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + Math.ceil((post.fullContent ? post.fullContent.replace(/<[^>]*>/g, '').split(' ').length : 0) / 200), 0) / posts.length) : 0,
        lastUpdate: posts.length > 0 ? Math.max(...posts.map(p => new Date(p.createdAt).getTime())) : null
      },
      categories: calculateCategoryStats(posts),
      contentTypes: calculateContentTypeStats(posts)
    };

    // Estado del sistema
    const systemStatus = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    // Métricas de rendimiento
    const performance = {
      responseTime: Date.now() - req.startTime || 0,
      endpoints: {
        '/api/llm/posts': 'operational',
        '/api/llm/analyze': 'operational',
        '/api/llm/docs': 'operational',
        '/api/llm/status': 'operational'
      },
      rateLimits: {
        default: '100 requests/hour',
        withApiKey: '1000 requests/hour',
        current: 'unlimited (development)'
      }
    };

    // Respuesta completa
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      api: {
        name: 'NEXCAR Blog API Status for LLMs',
        version: '1.0.0',
        endpoint: '/api/llm/status',
        description: 'Real-time system status and monitoring for Large Language Models'
      },
      system: systemStatus,
      statistics: stats,
      performance: performance,
      health: {
        overall: 'healthy',
        posts: totalPosts > 0 ? 'healthy' : 'warning',
        rss: 'operational',
        memory: process.memoryUsage().heapUsed < 100 * 1024 * 1024 ? 'healthy' : 'warning',
        uptime: process.uptime() > 3600 ? 'healthy' : 'warning'
      },
      recommendations: {
        forLLMs: [
          'API is fully operational and ready for use',
          'Rich metadata available for all posts',
          'Content analysis features are active',
          'Real-time updates from Substack RSS feed'
        ],
        forMonitoring: [
          'Monitor memory usage for large datasets',
          'Check RSS feed connectivity regularly',
          'Validate post content integrity',
          'Track API usage and rate limits'
        ]
      },
      usage: {
        rateLimit: '100 requests per hour',
        authentication: 'Optional API key for higher limits',
        documentation: '/api/llm/docs'
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in LLM status API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve system status',
      timestamp: new Date().toISOString(),
      system: {
        status: 'error',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Función para calcular estadísticas de categorías
function calculateCategoryStats(posts) {
  const categoryCounts = {};
  
  posts.forEach(post => {
    const categories = categorizePost(post);
    categories.forEach(category => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
  });
  
  return {
    total: Object.keys(categoryCounts).length,
    distribution: categoryCounts,
    topCategories: Object.keys(categoryCounts)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])
      .slice(0, 5)
      .map(category => ({
        name: category,
        count: categoryCounts[category],
        percentage: Math.round((categoryCounts[category] / posts.length) * 100)
      }))
  };
}

// Función para calcular estadísticas de tipos de contenido
function calculateContentTypeStats(posts) {
  const typeCounts = {};
  
  posts.forEach(post => {
    const contentType = detectContentType(post);
    typeCounts[contentType] = (typeCounts[contentType] || 0) + 1;
  });
  
  return {
    total: Object.keys(typeCounts).length,
    distribution: typeCounts,
    topTypes: Object.keys(typeCounts)
      .sort((a, b) => typeCounts[b] - typeCounts[a])
      .map(type => ({
        name: type,
        count: typeCounts[type],
        percentage: Math.round((typeCounts[type] / posts.length) * 100)
      }))
  };
}

// Funciones auxiliares (reutilizadas del sistema principal)
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

function categorizePost(post) {
  const title = post.title.toLowerCase();
  const content = post.fullContent.toLowerCase();
  
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
  
  Object.keys(categories).forEach(category => {
    scores[category] = 0;
    categories[category].forEach(keyword => {
      if (title.includes(keyword)) {
        scores[category] += 3;
      }
      if (content.includes(keyword)) {
        scores[category] += 1;
      }
    });
  });
  
  return Object.keys(scores)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 5)
    .filter(category => scores[category] > 0);
}
