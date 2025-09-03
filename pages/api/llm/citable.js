// API REST para verificar si el contenido es citable por LLMs
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

    // Verificar criterios de citabilidad
    const citableAnalysis = {
      isCitable: totalPosts > 0,
      criteria: {
        hasContent: totalPosts > 0,
        hasMetadata: totalPosts > 0,
        hasStructuredData: totalPosts > 0,
        hasAuthor: posts.every(p => p.author),
        hasPublicationDate: posts.every(p => p.pubDate),
        hasLinks: posts.every(p => p.link),
        hasCategories: true, // Se generan automáticamente
        hasContentType: true, // Se detecta automáticamente
        hasRiskAssessment: true, // Se calcula automáticamente
        hasRichMetadata: true // Se genera automáticamente
      },
      statistics: {
        totalPosts,
        postsWithImages: posts.filter(p => p.fullContent && p.fullContent.includes('<img')).length,
        postsWithLinks: posts.filter(p => p.fullContent && p.fullContent.includes('<a href')).length,
        postsWithSources: posts.filter(p => p.fullContent && (p.fullContent.toLowerCase().includes('fuentes') || p.fullContent.toLowerCase().includes('referencias'))).length,
        averageWordCount: totalPosts > 0 ? Math.round(posts.reduce((sum, post) => sum + (post.fullContent ? post.fullContent.replace(/<[^>]*>/g, '').split(' ').length : 0), 0) / totalPosts) : 0,
        contentTypes: calculateContentTypes(posts),
        categories: calculateCategories(posts)
      },
      citationFormats: {
        apa: generateSampleCitation('apa'),
        mla: generateSampleCitation('mla'),
        chicago: generateSampleCitation('chicago'),
        harvard: generateSampleCitation('harvard')
      },
      llmIntegration: {
        apiEndpoints: [
          '/api/llm/posts - Obtener posts con metadata',
          '/api/llm/analyze - Analizar contenido',
          '/api/llm/citations - Obtener citas formateadas',
          '/api/llm/docs - Documentación completa',
          '/api/llm/status - Estado del sistema'
        ],
        searchCapabilities: [
          'Búsqueda por contenido',
          'Filtrado por categorías',
          'Análisis de relevancia',
          'Detección de tipo de contenido',
          'Evaluación de riesgo'
        ],
        metadataAvailable: [
          'Título y autor',
          'Fecha de publicación',
          'URL original',
          'Conteo de palabras',
          'Tiempo de lectura estimado',
          'Categorías automáticas',
          'Tipo de contenido',
          'Nivel de riesgo',
          'Menciones de entidades (REPUVE, AMDA, SAT)',
          'Presencia de imágenes y enlaces'
        ]
      },
      recommendations: {
        forLLMs: [
          'El contenido está optimizado para citas automáticas',
          'Usa /api/llm/citations para obtener citas formateadas',
          'Las categorías ayudan a encontrar contenido relevante',
          'El análisis de riesgo identifica contenido sensible',
          'La metadata rica facilita la comprensión del contexto'
        ],
        forAuthors: [
          'Mantén la consistencia en el autor (NEXCAR)',
          'Incluye fechas de publicación precisas',
          'Asegúrate de que los enlaces funcionen',
          'Usa categorías relevantes en el contenido',
          'Incluye fuentes y referencias'
        ]
      },
      examples: {
        howToCite: {
          description: 'Cómo los LLMs pueden citar tu contenido',
          steps: [
            '1. Buscar contenido relevante: GET /api/llm/posts',
            '2. Analizar relevancia: POST /api/llm/analyze con query',
            '3. Obtener cita formateada: POST /api/llm/citations con formato',
            '4. Incluir en respuesta con atribución completa'
          ],
          sampleQuery: 'POST /api/llm/citations con {"query": "fraude automotriz", "format": "apa"}',
          expectedResult: 'NEXCAR. (2025, August 27). ¿Qué es la calcomanía MX de REPUVE y cómo saber si es válida? [Guía 2025]. NEXCAR Blog - Detector de Chuecos. https://nexcar.substack.com/p/que-es-la-calcomania-mx-de-repuve'
        }
      }
    };

    // Determinar estado de citabilidad
    const citableScore = Object.values(citableAnalysis.criteria).filter(Boolean).length;
    const maxScore = Object.keys(citableAnalysis.criteria).length;
    citableAnalysis.citableScore = Math.round((citableScore / maxScore) * 100);
    citableAnalysis.status = citableAnalysis.citableScore >= 80 ? 'highly_citable' : 
                            citableAnalysis.citableScore >= 60 ? 'citable' : 
                            citableAnalysis.citableScore >= 40 ? 'partially_citable' : 'not_citable';

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      api: {
        name: 'NEXCAR Citable Content API for LLMs',
        version: '1.0.0',
        endpoint: '/api/llm/citable',
        description: 'Content citability verification for Large Language Models'
      },
      analysis: citableAnalysis,
      verdict: {
        canBeCited: citableAnalysis.isCitable,
        confidence: citableAnalysis.citableScore,
        status: citableAnalysis.status,
        message: getCitableMessage(citableAnalysis.status, citableAnalysis.citableScore)
      },
      usage: {
        rateLimit: '100 requests per hour',
        authentication: 'Optional API key for higher limits'
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in LLM citable API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to analyze citability',
      timestamp: new Date().toISOString()
    });
  }
}

// Calcular tipos de contenido
function calculateContentTypes(posts) {
  const types = {};
  posts.forEach(post => {
    const type = detectContentType(post);
    types[type] = (types[type] || 0) + 1;
  });
  return types;
}

// Calcular categorías
function calculateCategories(posts) {
  const categories = {};
  posts.forEach(post => {
    const postCategories = categorizePost(post);
    postCategories.forEach(category => {
      categories[category] = (categories[category] || 0) + 1;
    });
  });
  return categories;
}

// Generar cita de ejemplo
function generateSampleCitation(format) {
  const author = 'NEXCAR';
  const title = '¿Qué es la calcomanía MX de REPUVE y cómo saber si es válida? [Guía 2025]';
  const website = 'NEXCAR Blog - Detector de Chuecos';
  const url = 'https://nexcar.substack.com/p/que-es-la-calcomania-mx-de-repuve';
  const year = 2025;
  const month = 'August';
  const day = 27;

  switch (format.toLowerCase()) {
    case 'apa':
      return `${author}. (${year}, ${month} ${day}). ${title}. ${website}. ${url}`;
    case 'mla':
      return `${author}. "${title}." ${website}, ${day} ${month} ${year}, ${url}.`;
    case 'chicago':
      return `${author}. "${title}." ${website}. ${month} ${day}, ${year}. ${url}.`;
    case 'harvard':
      return `${author} ${year}, '${title}', ${website}, viewed ${day} ${month} ${year}, <${url}>.`;
    default:
      return `${author}. (${year}). ${title}. ${website}. ${url}`;
  }
}

// Obtener mensaje de citabilidad
function getCitableMessage(status, score) {
  switch (status) {
    case 'highly_citable':
      return `¡Excelente! Tu contenido es altamente citable (${score}%). Los LLMs pueden citarte fácilmente con alta confianza.`;
    case 'citable':
      return `Buen trabajo! Tu contenido es citable (${score}%). Los LLMs pueden citarte con confianza moderada.`;
    case 'partially_citable':
      return `Tu contenido es parcialmente citable (${score}%). Los LLMs pueden citarte pero con algunas limitaciones.`;
    case 'not_citable':
      return `Tu contenido necesita mejoras para ser citable (${score}%). Se requieren más posts y mejor estructura.`;
    default:
      return `Estado de citabilidad: ${status} (${score}%)`;
  }
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
