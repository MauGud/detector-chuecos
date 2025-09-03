// API REST para análisis de contenido específico para LLMs
import { postsStore } from '../../../lib/posts';

export default async function handler(req, res) {
  // Configurar CORS para LLMs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Content-Type', 'application/json');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir GET y POST requests
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET and POST requests are supported',
      allowedMethods: ['GET', 'POST']
    });
  }

  try {
    const posts = postsStore;

    if (req.method === 'GET') {
      // Análisis general de todos los posts
      const analysis = analyzeAllPosts(posts);
      
      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        api: {
          name: 'NEXCAR Content Analysis API for LLMs',
          version: '1.0.0',
          endpoint: '/api/llm/analyze',
          description: 'Content analysis endpoint for Large Language Models'
        },
        analysis: analysis,
        usage: {
          rateLimit: '50 requests per hour',
          authentication: 'Optional API key for higher limits'
        }
      };

      return res.status(200).json(response);
    }

    if (req.method === 'POST') {
      // Análisis específico basado en query
      const { query, postId, analysisType } = req.body;

      if (!query && !postId) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Either query or postId is required',
          timestamp: new Date().toISOString()
        });
      }

      let targetPosts = posts;
      
      if (postId) {
        targetPosts = posts.filter(post => post.id === postId);
        if (targetPosts.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Post not found',
            message: `Post with ID ${postId} not found`,
            timestamp: new Date().toISOString()
          });
        }
      }

      const analysis = performSpecificAnalysis(targetPosts, query, analysisType);

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        api: {
          name: 'NEXCAR Specific Analysis API for LLMs',
          version: '1.0.0',
          endpoint: '/api/llm/analyze',
          description: 'Specific content analysis for Large Language Models'
        },
        query: query || `Post ID: ${postId}`,
        analysisType: analysisType || 'general',
        analysis: analysis,
        usage: {
          rateLimit: '50 requests per hour',
          authentication: 'Optional API key for higher limits'
        }
      };

      return res.status(200).json(response);
    }

  } catch (error) {
    console.error('Error in LLM analyze API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to analyze content',
      timestamp: new Date().toISOString()
    });
  }
}

// Función para análisis general de todos los posts
function analyzeAllPosts(posts) {
  const analysis = {
    overview: {
      totalPosts: posts.length,
      totalWords: 0,
      averageReadingTime: 0,
      contentTypes: {},
      categories: {},
      riskLevels: {},
      mentions: {
        REPUVE: 0,
        AMDA: 0,
        SAT: 0
      }
    },
    insights: {
      mostCommonTopics: [],
      riskAssessment: 'medium',
      contentQuality: 'high',
      updateFrequency: 'regular'
    },
    recommendations: {
      forLLMs: [
        'Content is highly structured and categorized',
        'Rich metadata available for each post',
        'Multiple content types identified',
        'Comprehensive fraud detection guides available'
      ],
      forUsers: [
        'Regular updates on fraud prevention',
        'Step-by-step validation guides',
        'Official source references included',
        'Risk assessment provided for each topic'
      ]
    }
  };

  // Analizar cada post
  posts.forEach(post => {
    const content = post.fullContent.toLowerCase();
    const wordCount = post.fullContent.replace(/<[^>]*>/g, '').split(' ').length;
    const readingTime = Math.ceil(wordCount / 200);
    
    analysis.overview.totalWords += wordCount;
    analysis.overview.averageReadingTime += readingTime;
    
    // Contar tipos de contenido
    const contentType = detectContentType(post);
    analysis.overview.contentTypes[contentType] = (analysis.overview.contentTypes[contentType] || 0) + 1;
    
    // Contar categorías
    const categories = categorizePost(post);
    categories.forEach(category => {
      analysis.overview.categories[category] = (analysis.overview.categories[category] || 0) + 1;
    });
    
    // Contar menciones
    if (content.includes('repuve')) analysis.overview.mentions.REPUVE++;
    if (content.includes('amda')) analysis.overview.mentions.AMDA++;
    if (content.includes('sat')) analysis.overview.mentions.SAT++;
    
    // Evaluar nivel de riesgo
    const riskLevel = content.includes('riesgo') || content.includes('peligro') ? 'high' : 'medium';
    analysis.overview.riskLevels[riskLevel] = (analysis.overview.riskLevels[riskLevel] || 0) + 1;
  });

  // Calcular promedios
  analysis.overview.averageReadingTime = Math.round(analysis.overview.averageReadingTime / posts.length);
  
  // Determinar temas más comunes
  analysis.insights.mostCommonTopics = Object.keys(analysis.overview.categories)
    .sort((a, b) => analysis.overview.categories[b] - analysis.overview.categories[a])
    .slice(0, 5);
  
  // Evaluar nivel de riesgo general
  const highRiskPosts = analysis.overview.riskLevels.high || 0;
  const totalPosts = posts.length;
  analysis.insights.riskAssessment = highRiskPosts > totalPosts * 0.5 ? 'high' : 'medium';

  return analysis;
}

// Función para análisis específico
function performSpecificAnalysis(posts, query, analysisType) {
  const analysis = {
    query: query,
    analysisType: analysisType || 'general',
    results: [],
    summary: {
      totalMatches: 0,
      relevanceScore: 0,
      keyInsights: []
    }
  };

  posts.forEach(post => {
    const content = post.fullContent.toLowerCase();
    const title = post.title.toLowerCase();
    const searchQuery = query ? query.toLowerCase() : '';
    
    let relevanceScore = 0;
    let matches = [];
    
    if (searchQuery) {
      // Buscar coincidencias en título (mayor peso)
      if (title.includes(searchQuery)) {
        relevanceScore += 10;
        matches.push('title');
      }
      
      // Buscar coincidencias en contenido
      if (content.includes(searchQuery)) {
        relevanceScore += 5;
        matches.push('content');
      }
      
      // Buscar coincidencias en categorías
      const categories = categorizePost(post);
      categories.forEach(category => {
        if (category.toLowerCase().includes(searchQuery)) {
          relevanceScore += 3;
          matches.push(`category: ${category}`);
        }
      });
    }
    
    if (relevanceScore > 0 || !searchQuery) {
      analysis.results.push({
        postId: post.id,
        title: post.title,
        relevanceScore: relevanceScore,
        matches: matches,
        contentType: detectContentType(post),
        categories: categorizePost(post),
        wordCount: post.fullContent.replace(/<[^>]*>/g, '').split(' ').length,
        readingTime: Math.ceil(post.fullContent.replace(/<[^>]*>/g, '').split(' ').length / 200),
        riskLevel: content.includes('riesgo') || content.includes('peligro') ? 'high' : 'medium',
        excerpt: post.excerpt
      });
    }
  });

  // Ordenar por relevancia
  analysis.results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Calcular resumen
  analysis.summary.totalMatches = analysis.results.length;
  analysis.summary.relevanceScore = analysis.results.length > 0 ? 
    analysis.results.reduce((sum, result) => sum + result.relevanceScore, 0) / analysis.results.length : 0;
  
  // Generar insights clave
  if (analysis.results.length > 0) {
    const topResult = analysis.results[0];
    analysis.summary.keyInsights.push(`Most relevant post: ${topResult.title}`);
    analysis.summary.keyInsights.push(`Content type: ${topResult.contentType}`);
    analysis.summary.keyInsights.push(`Risk level: ${topResult.riskLevel}`);
    analysis.summary.keyInsights.push(`Categories: ${topResult.categories.join(', ')}`);
  }

  return analysis;
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
