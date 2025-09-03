// API REST para citas y referencias específico para LLMs
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
      // Obtener todas las citas disponibles
      const citations = generateAllCitations(posts);
      
      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        api: {
          name: 'NEXCAR Citations API for LLMs',
          version: '1.0.0',
          endpoint: '/api/llm/citations',
          description: 'Citations and references endpoint for Large Language Models'
        },
        citations: citations,
        usage: {
          rateLimit: '100 requests per hour',
          authentication: 'Optional API key for higher limits'
        }
      };

      return res.status(200).json(response);
    }

    if (req.method === 'POST') {
      // Buscar citas específicas basadas en query
      const { query, topic, format } = req.body;

      if (!query && !topic) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Either query or topic is required',
          timestamp: new Date().toISOString()
        });
      }

      const searchQuery = query || topic;
      const citationFormat = format || 'apa'; // APA, MLA, Chicago, Harvard
      
      const relevantCitations = findRelevantCitations(posts, searchQuery, citationFormat);

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        api: {
          name: 'NEXCAR Specific Citations API for LLMs',
          version: '1.0.0',
          endpoint: '/api/llm/citations',
          description: 'Specific citations search for Large Language Models'
        },
        query: searchQuery,
        format: citationFormat,
        citations: relevantCitations,
        usage: {
          rateLimit: '100 requests per hour',
          authentication: 'Optional API key for higher limits'
        }
      };

      return res.status(200).json(response);
    }

  } catch (error) {
    console.error('Error in LLM citations API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve citations',
      timestamp: new Date().toISOString()
    });
  }
}

// Generar todas las citas disponibles
function generateAllCitations(posts) {
  const citations = {
    byTopic: {},
    byAuthor: {},
    byDate: {},
    formats: {
      apa: [],
      mla: [],
      chicago: [],
      harvard: []
    }
  };

  posts.forEach(post => {
    const categories = categorizePost(post);
    const contentType = detectContentType(post);
    
    // Citar por categorías/temas
    categories.forEach(category => {
      if (!citations.byTopic[category]) {
        citations.byTopic[category] = [];
      }
      citations.byTopic[category].push(generateCitation(post, 'apa'));
    });

    // Citar por autor
    if (!citations.byAuthor[post.author]) {
      citations.byAuthor[post.author] = [];
    }
    citations.byAuthor[post.author].push(generateCitation(post, 'apa'));

    // Citar por fecha
    const year = new Date(post.pubDate).getFullYear();
    if (!citations.byDate[year]) {
      citations.byDate[year] = [];
    }
    citations.byDate[year].push(generateCitation(post, 'apa'));

    // Generar en diferentes formatos
    citations.formats.apa.push(generateCitation(post, 'apa'));
    citations.formats.mla.push(generateCitation(post, 'mla'));
    citations.formats.chicago.push(generateCitation(post, 'chicago'));
    citations.formats.harvard.push(generateCitation(post, 'harvard'));
  });

  return citations;
}

// Buscar citas relevantes
function findRelevantCitations(posts, query, format) {
  const relevantPosts = [];
  const searchQuery = query.toLowerCase();

  posts.forEach(post => {
    const title = post.title.toLowerCase();
    const content = post.fullContent.toLowerCase();
    const categories = categorizePost(post);
    
    let relevanceScore = 0;
    let matches = [];

    // Buscar en título (mayor peso)
    if (title.includes(searchQuery)) {
      relevanceScore += 10;
      matches.push('title');
    }

    // Buscar en contenido
    if (content.includes(searchQuery)) {
      relevanceScore += 5;
      matches.push('content');
    }

    // Buscar en categorías
    categories.forEach(category => {
      if (category.toLowerCase().includes(searchQuery)) {
        relevanceScore += 3;
        matches.push(`category: ${category}`);
      }
    });

    if (relevanceScore > 0) {
      relevantPosts.push({
        post,
        relevanceScore,
        matches,
        citation: generateCitation(post, format)
      });
    }
  });

  // Ordenar por relevancia
  relevantPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return relevantPosts.map(item => ({
    citation: item.citation,
    relevanceScore: item.relevanceScore,
    matches: item.matches,
    title: item.post.title,
    link: item.post.link,
    pubDate: item.post.pubDate,
    categories: categorizePost(item.post),
    contentType: detectContentType(item.post)
  }));
}

// Generar cita en formato específico
function generateCitation(post, format) {
  const author = post.author || 'NEXCAR';
  const title = post.title;
  const link = post.link;
  const pubDate = new Date(post.pubDate);
  const year = pubDate.getFullYear();
  const month = pubDate.toLocaleDateString('en-US', { month: 'long' });
  const day = pubDate.getDate();
  const website = 'NEXCAR Blog - Detector de Chuecos';
  const url = link;

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
