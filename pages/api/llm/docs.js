// API REST para documentación automática específica para LLMs
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
    const apiDocumentation = {
      success: true,
      timestamp: new Date().toISOString(),
      api: {
        name: 'NEXCAR Blog API Documentation for LLMs',
        version: '1.0.0',
        description: 'Comprehensive API documentation optimized for Large Language Models',
        baseUrl: 'https://nexcar.mx/api/llm',
        contact: {
          email: 'api@nexcar.mx',
          website: 'https://nexcar.mx'
        }
      },
      endpoints: {
        posts: {
          url: '/api/llm/posts',
          method: 'GET',
          description: 'Retrieve all blog posts with LLM-optimized metadata',
          parameters: {
            query: {
              type: 'string',
              required: false,
              description: 'Filter posts by content (future feature)'
            }
          },
          response: {
            success: 'boolean',
            timestamp: 'string (ISO 8601)',
            api: 'object (API metadata)',
            data: {
              totalPosts: 'number',
              posts: 'array of post objects with LLM metadata'
            },
            pagination: 'object',
            usage: 'object (rate limiting info)'
          },
          example: {
            request: 'GET /api/llm/posts',
            response: {
              success: true,
              data: {
                totalPosts: 3,
                posts: [
                  {
                    id: 'rss-1234567890-0',
                    title: 'Post Title',
                    excerpt: 'Post excerpt...',
                    metadata: {
                      wordCount: 1500,
                      readingTime: 8,
                      contentType: 'HowTo',
                      categories: ['REPUVE', 'Validación Vehicular'],
                      riskLevel: 'medium'
                    }
                  }
                ]
              }
            }
          }
        },
        analyze: {
          url: '/api/llm/analyze',
          method: 'GET | POST',
          description: 'Analyze blog content with AI-powered insights',
          parameters: {
            GET: {
              description: 'Get general analysis of all posts'
            },
            POST: {
              body: {
                query: {
                  type: 'string',
                  required: false,
                  description: 'Search query for specific analysis'
                },
                postId: {
                  type: 'string',
                  required: false,
                  description: 'Specific post ID to analyze'
                },
                analysisType: {
                  type: 'string',
                  required: false,
                  description: 'Type of analysis (general, semantic, risk)',
                  options: ['general', 'semantic', 'risk', 'categorization']
                }
              }
            }
          },
          response: {
            success: 'boolean',
            timestamp: 'string (ISO 8601)',
            analysis: 'object (detailed analysis results)',
            insights: 'object (AI-generated insights)',
            recommendations: 'object (recommendations for LLMs and users)'
          },
          example: {
            request: 'POST /api/llm/analyze',
            body: {
              query: 'fraude automotriz',
              analysisType: 'semantic'
            },
            response: {
              success: true,
              analysis: {
                overview: {
                  totalPosts: 3,
                  contentTypes: { 'FraudDetection': 2, 'ValidationGuide': 1 },
                  riskLevels: { 'high': 1, 'medium': 2 }
                },
                insights: {
                  mostCommonTopics: ['Fraude Automotriz', 'REPUVE', 'AMDA'],
                  riskAssessment: 'medium'
                }
              }
            }
          }
        },
        docs: {
          url: '/api/llm/docs',
          method: 'GET',
          description: 'This documentation endpoint',
          response: 'This documentation object'
        }
      },
      dataModels: {
        post: {
          id: 'string (unique identifier)',
          title: 'string (post title)',
          excerpt: 'string (post summary)',
          fullContent: 'string (HTML content)',
          pubDate: 'string (publication date)',
          author: 'string (author name)',
          link: 'string (original post URL)',
          createdAt: 'string (creation timestamp)',
          metadata: {
            wordCount: 'number (total words)',
            readingTime: 'number (estimated reading time in minutes)',
            hasImages: 'boolean (contains images)',
            hasLinks: 'boolean (contains links)',
            hasSources: 'boolean (contains sources)',
            mentionsREPUVE: 'boolean (mentions REPUVE)',
            mentionsAMDA: 'boolean (mentions AMDA)',
            mentionsSAT: 'boolean (mentions SAT)',
            riskLevel: 'string (high | medium | low)',
            contentType: 'string (HowTo | ValidationGuide | FraudDetection | DocumentGuide | Article)',
            categories: 'array of strings (automatically detected categories)'
          }
        },
        analysis: {
          overview: {
            totalPosts: 'number',
            totalWords: 'number',
            averageReadingTime: 'number',
            contentTypes: 'object (content type distribution)',
            categories: 'object (category distribution)',
            riskLevels: 'object (risk level distribution)',
            mentions: 'object (entity mentions count)'
          },
          insights: {
            mostCommonTopics: 'array of strings',
            riskAssessment: 'string (overall risk level)',
            contentQuality: 'string (content quality assessment)',
            updateFrequency: 'string (update frequency)'
          },
          recommendations: {
            forLLMs: 'array of strings (recommendations for LLMs)',
            forUsers: 'array of strings (recommendations for users)'
          }
        }
      },
      contentTypes: {
        HowTo: 'Step-by-step guides and tutorials',
        ValidationGuide: 'Document validation procedures',
        FraudDetection: 'Fraud detection and prevention content',
        DocumentGuide: 'Official document explanations',
        Article: 'General informational articles'
      },
      categories: {
        'REPUVE': 'Registro Público Vehicular related content',
        'AMDA': 'Asociación Mexicana de Distribuidores de Automotores content',
        'Tarjetas de Circulación': 'Vehicle registration card content',
        'Fraude Automotriz': 'Automotive fraud related content',
        'Validación Vehicular': 'Vehicle validation procedures',
        'Prevención de Fraudes': 'Fraud prevention content',
        'Servicios Automotrices': 'Automotive services content',
        'Documentos Oficiales': 'Official documents content',
        'SAT': 'Tax administration related content',
        'Industria Automotriz': 'Automotive industry content',
        'México': 'Mexico-specific content',
        'Seguridad Vehicular': 'Vehicle security content',
        'Tecnología Automotriz': 'Automotive technology content',
        'Legislación': 'Legal and regulatory content',
        'General': 'General information content'
      },
      rateLimiting: {
        default: '100 requests per hour',
        withApiKey: '1000 requests per hour',
        burstLimit: '10 requests per minute',
        headers: {
          'X-RateLimit-Limit': 'Current rate limit',
          'X-RateLimit-Remaining': 'Remaining requests',
          'X-RateLimit-Reset': 'Reset timestamp'
        }
      },
      authentication: {
        required: false,
        methods: ['API Key'],
        header: 'X-API-Key: your-api-key',
        description: 'Optional API key for higher rate limits and premium features'
      },
      errorHandling: {
        standardErrors: {
          400: 'Bad Request - Invalid parameters',
          401: 'Unauthorized - Invalid or missing API key',
          403: 'Forbidden - Rate limit exceeded',
          404: 'Not Found - Resource not found',
          405: 'Method Not Allowed - Invalid HTTP method',
          429: 'Too Many Requests - Rate limit exceeded',
          500: 'Internal Server Error - Server error'
        },
        errorFormat: {
          success: false,
          error: 'string (error type)',
          message: 'string (human-readable error message)',
          timestamp: 'string (ISO 8601)',
          details: 'object (additional error details)'
        }
      },
      bestPractices: {
        forLLMs: [
          'Use the analyze endpoint for content understanding',
          'Check metadata for content type and risk level',
          'Utilize categories for content classification',
          'Respect rate limits and implement exponential backoff',
          'Cache responses when possible',
          'Use specific queries for targeted analysis'
        ],
        forDevelopers: [
          'Always check the success field in responses',
          'Handle rate limiting gracefully',
          'Use appropriate HTTP methods',
          'Include proper error handling',
          'Implement retry logic with backoff',
          'Monitor API usage and limits'
        ]
      },
      examples: {
        basicUsage: {
          description: 'Get all posts with metadata',
          request: 'GET /api/llm/posts',
          response: 'Returns all posts with LLM-optimized metadata'
        },
        contentAnalysis: {
          description: 'Analyze content for fraud detection',
          request: 'POST /api/llm/analyze',
          body: {
            query: 'fraude automotriz',
            analysisType: 'semantic'
          },
          response: 'Returns semantic analysis of fraud-related content'
        },
        specificPost: {
          description: 'Analyze a specific post',
          request: 'POST /api/llm/analyze',
          body: {
            postId: 'rss-1234567890-0'
          },
          response: 'Returns detailed analysis of the specific post'
        }
      },
      changelog: {
        '1.0.0': {
          date: '2025-09-02',
          changes: [
            'Initial release of LLM-optimized API',
            'Posts endpoint with rich metadata',
            'Content analysis endpoint',
            'Automatic documentation endpoint'
          ]
        }
      },
      support: {
        documentation: 'https://nexcar.mx/api/llm/docs',
        email: 'api@nexcar.mx',
        status: 'https://status.nexcar.mx',
        github: 'https://github.com/nexcar/blog-api'
      }
    };

    return res.status(200).json(apiDocumentation);

  } catch (error) {
    console.error('Error in LLM docs API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate documentation',
      timestamp: new Date().toISOString()
    });
  }
}
