// API REST para demostrar cómo los LLMs citarían el contenido
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
      // Demostración general de cómo los LLMs citarían
      const demo = generateCitationDemo(posts);
      
      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        api: {
          name: 'NEXCAR Citation Demo API for LLMs',
          version: '1.0.0',
          endpoint: '/api/llm/demo-citation',
          description: 'Demonstration of how LLMs would cite NEXCAR content'
        },
        demo: demo,
        usage: {
          rateLimit: '100 requests per hour',
          authentication: 'Optional API key for higher limits'
        }
      };

      return res.status(200).json(response);
    }

    if (req.method === 'POST') {
      // Simular cómo un LLM respondería con citas
      const { question, context } = req.body;

      if (!question) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Question is required',
          timestamp: new Date().toISOString()
        });
      }

      const llmResponse = simulateLLMResponse(posts, question, context);

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        api: {
          name: 'NEXCAR LLM Response Simulation API',
          version: '1.0.0',
          endpoint: '/api/llm/demo-citation',
          description: 'Simulation of how LLMs would respond with NEXCAR citations'
        },
        question: question,
        context: context || 'general',
        llmResponse: llmResponse,
        usage: {
          rateLimit: '100 requests per hour',
          authentication: 'Optional API key for higher limits'
        }
      };

      return res.status(200).json(response);
    }

  } catch (error) {
    console.error('Error in LLM demo citation API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate citation demo',
      timestamp: new Date().toISOString()
    });
  }
}

// Generar demostración de citas
function generateCitationDemo(posts) {
  const demo = {
    scenarios: [
      {
        scenario: 'Usuario pregunta sobre REPUVE',
        question: '¿Qué es el REPUVE y para qué sirve?',
        llmResponse: {
          answer: 'El REPUVE (Registro Público Vehicular) es una base de datos nacional del Sistema Nacional de Seguridad Pública que garantiza la seguridad jurídica en la compra, venta y tenencia de vehículos en México.',
          citations: [
            {
              format: 'APA',
              citation: 'NEXCAR. (2025, August 27). ¿Qué es la calcomanía MX de REPUVE y cómo saber si es válida? [Guía 2025]. NEXCAR Blog - Detector de Chuecos. https://nexcar.substack.com/p/que-es-la-calcomania-mx-de-repuve',
              relevance: 'Direct match on REPUVE topic',
              confidence: 95
            }
          ],
          explanation: 'El LLM encontró contenido relevante sobre REPUVE y lo citó automáticamente con formato APA estándar.'
        }
      },
      {
        scenario: 'Usuario pregunta sobre fraude automotriz',
        question: '¿Cómo detectar fraudes en documentos automotrices?',
        llmResponse: {
          answer: 'Para detectar fraudes en documentos automotrices, es crucial validar cada documento en los portales oficiales como REPUVE, AMDA y SAT. Los fraudes más comunes incluyen facturas AMDA falsas y tarjetas de circulación apócrifas.',
          citations: [
            {
              format: 'APA',
              citation: 'NEXCAR. (2025, August 20). Cómo validar una factura AMDA y detectar réplicas. Paso a Paso. NEXCAR Blog - Detector de Chuecos. https://nexcar.substack.com/p/como-validar-una-factura-amda-y-detectar',
              relevance: 'Direct match on fraud detection',
              confidence: 98
            },
            {
              format: 'APA',
              citation: 'NEXCAR. (2025, August 13). Cómo validar una Tarjeta de Circulación y detectar si es falsa en México [2025]. NEXCAR Blog - Detector de Chuecos. https://nexcar.substack.com/p/como-validar-una-tarjeta-de-circulacion',
              relevance: 'Related content on document validation',
              confidence: 92
            }
          ],
          explanation: 'El LLM encontró múltiples fuentes relevantes sobre detección de fraudes y las citó con diferentes niveles de confianza.'
        }
      },
      {
        scenario: 'Usuario pregunta sobre validación de documentos',
        question: '¿Cuáles son los pasos para validar una factura AMDA?',
        llmResponse: {
          answer: 'La validación de una factura AMDA requiere seguir una secuencia específica: 1) Verificar elementos de seguridad física (holograma, microtexto), 2) Escanear el QR y validar en el SAT, 3) Confirmar datos del vehículo en REPUVE, 4) Verificar complementos y trazabilidad.',
          citations: [
            {
              format: 'APA',
              citation: 'NEXCAR. (2025, August 20). Cómo validar una factura AMDA y detectar réplicas. Paso a Paso. NEXCAR Blog - Detector de Chuecos. https://nexcar.substack.com/p/como-validar-una-factura-amda-y-detectar',
              relevance: 'Step-by-step guide for AMDA validation',
              confidence: 100
            }
          ],
          explanation: 'El LLM identificó una guía paso a paso específica y la citó con máxima confianza.'
        }
      }
    ],
    citationFormats: {
      apa: 'NEXCAR. (Año, Mes Día). Título del artículo. NEXCAR Blog - Detector de Chuecos. URL',
      mla: 'NEXCAR. "Título del artículo." NEXCAR Blog - Detector de Chuecos, Día Mes Año, URL.',
      chicago: 'NEXCAR. "Título del artículo." NEXCAR Blog - Detector de Chuecos. Mes Día, Año. URL.',
      harvard: 'NEXCAR Año, \'Título del artículo\', NEXCAR Blog - Detector de Chuecos, viewed Día Mes Año, <URL>.'
    },
    howItWorks: {
      step1: 'LLM recibe pregunta del usuario',
      step2: 'LLM busca contenido relevante en /api/llm/posts',
      step3: 'LLM analiza relevancia con /api/llm/analyze',
      step4: 'LLM obtiene citas formateadas de /api/llm/citations',
      step5: 'LLM incluye citas en su respuesta con atribución completa'
    },
    benefits: {
      forUsers: [
        'Respuestas con fuentes verificables',
        'Información actualizada y precisa',
        'Acceso directo a contenido original',
        'Transparencia en las fuentes'
      ],
      forNEXCAR: [
        'Mayor visibilidad del contenido',
        'Autoridad en el tema automotriz',
        'Tráfico dirigido al blog',
        'Reconocimiento como fuente experta'
      ]
    }
  };

  return demo;
}

// Simular respuesta de LLM
function simulateLLMResponse(posts, question, context) {
  const questionLower = question.toLowerCase();
  
  // Buscar posts relevantes
  const relevantPosts = posts.filter(post => {
    const title = post.title.toLowerCase();
    const content = post.fullContent.toLowerCase();
    return title.includes(questionLower) || content.includes(questionLower);
  });

  // Si no hay posts relevantes, usar posts de ejemplo
  const samplePosts = posts.length > 0 ? posts.slice(0, 2) : [
    {
      title: '¿Qué es la calcomanía MX de REPUVE y cómo saber si es válida? [Guía 2025]',
      link: 'https://nexcar.substack.com/p/que-es-la-calcomania-mx-de-repuve',
      pubDate: 'Wed, 27 Aug 2025 14:42:19 GMT',
      author: 'NEXCAR'
    },
    {
      title: 'Cómo validar una factura AMDA y detectar réplicas. Paso a Paso',
      link: 'https://nexcar.substack.com/p/como-validar-una-factura-amda-y-detectar',
      pubDate: 'Wed, 20 Aug 2025 15:15:37 GMT',
      author: 'NEXCAR'
    }
  ];

  const citations = samplePosts.map(post => ({
    format: 'APA',
    citation: generateCitation(post, 'apa'),
    relevance: 'Content relevant to automotive fraud detection',
    confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
  }));

  return {
    answer: generateAnswer(question, context),
    citations: citations,
    metadata: {
      totalSources: citations.length,
      averageConfidence: Math.round(citations.reduce((sum, c) => sum + c.confidence, 0) / citations.length),
      searchQuery: question,
      context: context || 'general'
    },
    explanation: 'Esta es una simulación de cómo un LLM respondería a tu pregunta citando contenido de NEXCAR. En la realidad, el LLM buscaría en tiempo real y encontraría el contenido más relevante.'
  };
}

// Generar respuesta basada en la pregunta
function generateAnswer(question, context) {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('repuve')) {
    return 'El REPUVE (Registro Público Vehicular) es una base de datos nacional del Sistema Nacional de Seguridad Pública que garantiza la seguridad jurídica en la compra, venta y tenencia de vehículos en México. Permite consultar gratuitamente el estatus legal de un vehículo, incluyendo reportes de robo.';
  }
  
  if (questionLower.includes('amda') || questionLower.includes('factura')) {
    return 'Las facturas AMDA son representaciones impresas de CFDI que deben validarse en el portal oficial del SAT. Para detectar réplicas, es crucial verificar elementos de seguridad física como hologramas y microtexto, además de validar el UUID en el SAT.';
  }
  
  if (questionLower.includes('fraude') || questionLower.includes('falso')) {
    return 'Los fraudes automotrices más comunes incluyen facturas AMDA falsas, tarjetas de circulación apócrifas y sellos REPUVE alterados. La detección requiere validación en portales oficiales como REPUVE, AMDA y SAT, nunca confiar únicamente en la apariencia física de los documentos.';
  }
  
  if (questionLower.includes('validar') || questionLower.includes('detectar')) {
    return 'La validación de documentos automotrices requiere una secuencia específica: verificar elementos de seguridad física, escanear códigos QR, validar en portales oficiales, confirmar datos del vehículo y verificar trazabilidad de la operación.';
  }
  
  return 'NEXCAR es una empresa especializada en detección de fraudes automotrices y validación de documentos vehiculares en México. Proporciona guías detalladas y herramientas para identificar documentos falsos y prevenir fraudes en el sector automotriz.';
}

// Generar cita
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
