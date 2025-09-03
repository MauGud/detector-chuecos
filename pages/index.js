import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { loadPostsFromRSS } from '../lib/posts';
import { 
  Calendar, ExternalLink, User, Bell, RefreshCw, BookOpen,
  ArrowRight, Clock, Eye, Zap, Rss, Activity
} from 'lucide-react';

// Sistema de categorización avanzado para LLMs
const categorizePost = (post) => {
  const title = post.title.toLowerCase();
  const content = post.fullContent.toLowerCase();
  
  // Sistema de scoring para relevancia
  const categoryScores = {
    'REPUVE': 0,
    'AMDA': 0,
    'Tarjetas de Circulación': 0,
    'Fraude Automotriz': 0,
    'Inspección Vehicular': 0,
    'Documentación': 0,
    'Seguridad': 0,
    'Guías': 0,
    'Validación Vehicular': 0,
    'Prevención de Fraudes': 0,
    'Servicios Automotrices': 0
  };

  // Palabras clave con pesos
  const keywords = {
    'REPUVE': ['repuve', 'registro público vehicular', 'registro vehicular', 'consulta repuve'],
    'AMDA': ['amda', 'factura', 'facturación', 'dealer', 'concesionario'],
    'Tarjetas de Circulación': ['tarjeta de circulación', 'circulación', 'tarjeta vehicular', 'permiso de circulación'],
    'Fraude Automotriz': ['fraude', 'estafa', 'engaño', 'fraude vehicular', 'vehículo robado', 'falso', 'apócrifo'],
    'Inspección Vehicular': ['inspección', 'revisión', 'verificación', 'inspección vehicular', 'revisión técnica', 'inspeccionar'],
    'Documentación': ['documento', 'validación', 'autenticidad', 'documentación vehicular', 'papeles', 'validar'],
    'Seguridad': ['seguridad', 'robo', 'prevención', 'protección', 'seguridad vehicular'],
    'Guías': ['guía', 'tutorial', 'cómo', 'paso a paso', 'instrucciones'],
    'Validación Vehicular': ['validar', 'verificar', 'comprobar', 'validación', 'verificación'],
    'Prevención de Fraudes': ['prevenir', 'evitar', 'prevención', 'protección contra fraudes'],
    'Servicios Automotrices': ['servicio', 'servicios', 'automotriz', 'vehicular', 'nexcar']
  };

  // Calcular scores
  Object.keys(keywords).forEach(category => {
    keywords[category].forEach(keyword => {
      if (title.includes(keyword)) {
        categoryScores[category] += 3; // Título tiene más peso
      }
      if (content.includes(keyword)) {
        categoryScores[category] += 1; // Contenido tiene menos peso
      }
    });
  });

  // Ordenar por relevancia y tomar las top 5
  const sortedCategories = Object.entries(categoryScores)
    .filter(([_, score]) => score > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, _]) => category);

  return sortedCategories.length > 0 ? sortedCategories : ['Servicios Automotrices'];
};

// Función para obtener el color de la categoría
const getCategoryColor = (category) => {
  const colors = {
    'REPUVE': 'bg-blue-100 text-blue-800 border-blue-200',
    'AMDA': 'bg-green-100 text-green-800 border-green-200',
    'Tarjetas de Circulación': 'bg-purple-100 text-purple-800 border-purple-200',
    'Fraude Automotriz': 'bg-red-100 text-red-800 border-red-200',
    'Inspección Vehicular': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Documentación': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Seguridad': 'bg-orange-100 text-orange-800 border-orange-200',
    'Guías': 'bg-pink-100 text-pink-800 border-pink-200',
    'Validación Vehicular': 'bg-teal-100 text-teal-800 border-teal-200',
    'Prevención de Fraudes': 'bg-rose-100 text-rose-800 border-rose-200',
    'Servicios Automotrices': 'bg-slate-100 text-slate-800 border-slate-200',
    'General': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[category] || colors['General'];
};

export default function Home({ initialPosts, loadError }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [selectedPostIndex, setSelectedPostIndex] = useState(0); // Nuevo estado para post seleccionado

  // Polling para nuevos posts cada 30 segundos
  useEffect(() => {
    const checkForNewPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        
        if (data.success && data.posts.length > posts.length) {
          setPosts(data.posts);
          setLastUpdate(new Date());
          setConnectionStatus('connected');
          showNotification(`${data.posts.length - posts.length} nuevo(s) post(s) agregado(s) vía Zapier!`);
        }
      } catch (error) {
        console.error('Error verificando posts:', error);
        setConnectionStatus('error');
      }
    };

    const interval = setInterval(checkForNewPosts, 30000);
    return () => clearInterval(interval);
  }, [posts.length]);

  // Verificar conexión cada 2 minutos
  useEffect(() => {
    const healthCheck = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('warning');
        }
      } catch (error) {
        setConnectionStatus('error');
      }
    };

    const healthInterval = setInterval(healthCheck, 120000);
    return () => clearInterval(healthInterval);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 5000);
  };

  const refreshPosts = async () => {
    try {
      setLoading(true);
      
      // Refrescar desde RSS
      const rssResponse = await fetch('/api/rss');
      const rssData = await rssResponse.json();
      
      if (rssData.success) {
        setPosts(rssData.posts);
        setLastUpdate(new Date());
        showNotification('Posts actualizados desde RSS');
        setConnectionStatus('connected');
      } else {
        // Fallback a posts en memoria
        const memoryResponse = await fetch('/api/posts');
        const memoryData = await memoryResponse.json();
        
        if (memoryData.success) {
          setPosts(memoryData.posts);
          setLastUpdate(new Date());
          showNotification('Posts actualizados desde memoria');
        }
      }
    } catch (error) {
      console.error('Error refrescando posts:', error);
      showNotification('Error al actualizar posts');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Activity className="w-4 h-4 text-green-600" />;
      case 'warning': return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'error': return <Activity className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Función para cambiar el post seleccionado
  const selectPost = (index) => {
    setSelectedPostIndex(index);
    showNotification(`Cambiando a: ${posts[index].title.substring(0, 50)}...`);
  };

  // Obtener el post seleccionado
  const selectedPost = posts.length > 0 ? posts[selectedPostIndex] : null;

  // Generar metadatos dinámicos para el post seleccionado
  const generatePostMeta = (post) => {
    if (!post) return {};
    
    const categories = categorizePost(post);
    const keywords = [
      'fraude automotriz',
      'REPUVE',
      'AMDA', 
      'tarjeta de circulación',
      'inspección vehicular',
      'México',
      'validación documentos',
      'detector chuecos',
      'NEXCAR'
    ];
    
    // Extraer keywords del título y contenido
    const titleWords = post.title.toLowerCase().split(' ');
    const contentWords = post.fullContent.toLowerCase().replace(/<[^>]*>/g, '').split(' ');
    const categoryKeywords = categories.map(cat => cat.toLowerCase());
    const relevantKeywords = [...new Set([...keywords, ...titleWords, ...contentWords, ...categoryKeywords])].slice(0, 15);
    
    // Detectar tipo de contenido
    const contentType = detectContentType(post);
    
    // Extraer datos específicos del contenido
    const contentData = extractContentData(post);
    
    return {
      title: `${post.title} | Detector de Chuecos - NEXCAR`,
      description: post.excerpt || post.fullContent.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
      keywords: relevantKeywords.join(', '),
      ogTitle: post.title,
      ogDescription: post.excerpt || post.fullContent.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
      ogUrl: post.link,
      canonical: post.link,
      categories: categories,
      contentType: contentType,
      contentData: contentData
    };
  };

  // Detectar tipo de contenido para Schema específico
  const detectContentType = (post) => {
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
  };

  // Extraer datos específicos del contenido
  const extractContentData = (post) => {
    const content = post.fullContent.toLowerCase();
    const data = {
      hasSteps: content.includes('paso 1') || content.includes('paso 2'),
      hasImages: content.includes('<img'),
      hasLinks: content.includes('<a href'),
      wordCount: post.fullContent.replace(/<[^>]*>/g, '').split(' ').length,
      readingTime: Math.ceil(post.fullContent.replace(/<[^>]*>/g, '').split(' ').length / 200),
      hasChecklist: content.includes('checklist') || content.includes('lista'),
      hasSources: content.includes('fuentes') || content.includes('referencias'),
      mentionsREPUVE: content.includes('repuve'),
      mentionsAMDA: content.includes('amda'),
      mentionsSAT: content.includes('sat'),
      riskLevel: content.includes('riesgo') || content.includes('peligro') ? 'high' : 'medium'
    };
    return data;
  };

  const postMeta = selectedPost ? generatePostMeta(selectedPost) : {};

  // Generar Schema dinámico e inteligente
  const generateDynamicSchema = (post, meta) => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": meta.description,
      "author": {
        "@type": "Organization",
        "name": "NEXCAR",
        "url": "https://nexcar.mx",
        "logo": "https://nexcar.mx/images/logo-calidad-color.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+52-800-737-8833",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "NEXCAR",
        "url": "https://nexcar.mx",
        "logo": "https://nexcar.mx/images/logo-calidad-color.png",
        "sameAs": [
          "https://nexcar.mx",
          "https://calendly.com/mau-nexcar/30min"
        ]
      },
      "datePublished": post.pubDate,
      "dateModified": post.pubDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": post.link
      },
      "keywords": meta.keywords,
      "about": {
        "@type": "Thing",
        "name": "Fraude Automotriz en México"
      },
      "articleSection": meta.categories ? meta.categories[0] : "Industria Automotriz",
      "wordCount": meta.contentData.wordCount,
      "inLanguage": "es-MX",
      "isAccessibleForFree": true,
      "genre": "Educational Content",
      "mentions": meta.categories ? meta.categories.map(cat => ({
        "@type": "Thing",
        "name": cat
      })) : []
    };

    // Agregar propiedades específicas según el tipo de contenido
    if (meta.contentType === 'HowTo') {
      baseSchema["@type"] = "HowTo";
      baseSchema.name = post.title;
      baseSchema.totalTime = `PT${meta.contentData.readingTime}M`;
      baseSchema.estimatedCost = {
        "@type": "MonetaryAmount",
        "currency": "MXN",
        "value": "0"
      };
      baseSchema.supply = [
        {
          "@type": "HowToSupply",
          "name": "Documentos del vehículo"
        },
        {
          "@type": "HowToSupply",
          "name": "Acceso a internet"
        }
      ];
      baseSchema.tool = [
        {
          "@type": "HowToTool",
          "name": "Portal REPUVE"
        },
        {
          "@type": "HowToTool",
          "name": "Verificador SAT"
        }
      ];
    }

    // Agregar propiedades específicas para guías de validación
    if (meta.contentType === 'ValidationGuide') {
      baseSchema.additionalProperty = [
        {
          "@type": "PropertyValue",
          "name": "Tipo de Validación",
          "value": meta.categories[0] || "General"
        },
        {
          "@type": "PropertyValue",
          "name": "Nivel de Riesgo",
          "value": meta.contentData.riskLevel
        },
        {
          "@type": "PropertyValue",
          "name": "Tiempo de Lectura",
          "value": `${meta.contentData.readingTime} minutos`
        }
      ];
    }

    // Agregar propiedades específicas para detección de fraudes
    if (meta.contentType === 'FraudDetection') {
      baseSchema.additionalProperty = [
        {
          "@type": "PropertyValue",
          "name": "Nivel de Riesgo",
          "value": "Alto"
        },
        {
          "@type": "PropertyValue",
          "name": "Tipo de Fraude",
          "value": meta.categories[0] || "General"
        },
        {
          "@type": "PropertyValue",
          "name": "Urgencia",
          "value": "Inmediata"
        }
      ];
    }

    // Agregar propiedades específicas para guías de documentos
    if (meta.contentType === 'DocumentGuide') {
      baseSchema.additionalProperty = [
        {
          "@type": "PropertyValue",
          "name": "Tipo de Documento",
          "value": meta.categories[0] || "General"
        },
        {
          "@type": "PropertyValue",
          "name": "Autoridad Emisora",
          "value": meta.contentData.mentionsREPUVE ? "REPUVE" : meta.contentData.mentionsAMDA ? "AMDA" : "SAT"
        },
        {
          "@type": "PropertyValue",
          "name": "Validez",
          "value": "Oficial"
        }
      ];
    }

    // Agregar propiedades comunes
    baseSchema.additionalProperty = baseSchema.additionalProperty || [];
    baseSchema.additionalProperty.push(
      {
        "@type": "PropertyValue",
        "name": "Incluye Imágenes",
        "value": meta.contentData.hasImages ? "Sí" : "No"
      },
      {
        "@type": "PropertyValue",
        "name": "Incluye Enlaces",
        "value": meta.contentData.hasLinks ? "Sí" : "No"
      },
      {
        "@type": "PropertyValue",
        "name": "Incluye Fuentes",
        "value": meta.contentData.hasSources ? "Sí" : "No"
      }
    );

    return baseSchema;
  };

  // Generar FAQ dinámico e inteligente
  const generateDynamicFAQ = (post, meta) => {
    const baseFAQ = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    };

    // FAQ específico según el tipo de contenido
    if (meta.contentType === 'HowTo') {
      baseFAQ.mainEntity.push(
        {
          "@type": "Question",
          "name": `¿Cuánto tiempo toma ${post.title.toLowerCase()}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `El proceso completo toma aproximadamente ${meta.contentData.readingTime} minutos de lectura y puede requerir tiempo adicional para realizar las validaciones en los portales oficiales.`
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué necesito para seguir esta guía?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Necesitas los documentos del vehículo, acceso a internet para consultar los portales oficiales (REPUVE, SAT, AMDA), y opcionalmente una lupa para revisar elementos de seguridad."
          }
        }
      );
    }

    if (meta.contentType === 'ValidationGuide') {
      baseFAQ.mainEntity.push(
        {
          "@type": "Question",
          "name": `¿Cómo validar ${meta.categories[0]?.toLowerCase() || 'documentos'}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Para validar ${meta.categories[0]?.toLowerCase() || 'documentos'}, debes verificar el material físico, escanear códigos QR si están disponibles, y consultar los portales oficiales correspondientes.`
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué portales oficiales debo consultar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Los portales oficiales incluyen: ${meta.contentData.mentionsREPUVE ? 'REPUVE (www.repuve.gob.mx), ' : ''}${meta.contentData.mentionsAMDA ? 'AMDA, ' : ''}${meta.contentData.mentionsSAT ? 'SAT (verificacfdi.facturaelectronica.sat.gob.mx), ' : ''}y los portales estatales correspondientes.`
          }
        }
      );
    }

    if (meta.contentType === 'FraudDetection') {
      baseFAQ.mainEntity.push(
        {
          "@type": "Question",
          "name": "¿Cuáles son las señales de alerta más comunes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Las señales de alerta incluyen documentos con material de baja calidad, hologramas mal colocados, códigos QR que no funcionan, y discrepancias entre la información del documento y los registros oficiales."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué hacer si detecto un fraude?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Si detectas un fraude, no circules el vehículo, conserva todos los documentos, toma capturas de pantalla de las validaciones, y presenta una denuncia ante las autoridades competentes."
          }
        }
      );
    }

    if (meta.contentType === 'DocumentGuide') {
      baseFAQ.mainEntity.push(
        {
          "@type": "Question",
          "name": `¿Qué es ${meta.categories[0] || 'este documento'}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${meta.categories[0] || 'Este documento'} es un documento oficial emitido por ${meta.contentData.mentionsREPUVE ? 'REPUVE' : meta.contentData.mentionsAMDA ? 'AMDA' : 'las autoridades competentes'} que valida la legalidad y autenticidad de un vehículo.`
          }
        },
        {
          "@type": "Question",
          "name": "¿Cómo verificar la autenticidad del documento?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Para verificar la autenticidad, revisa el material físico, verifica elementos de seguridad como hologramas y microtexto, y consulta los portales oficiales correspondientes."
          }
        }
      );
    }

    // FAQ generales siempre incluidos
    baseFAQ.mainEntity.push(
      {
        "@type": "Question",
        "name": "¿Qué servicios ofrece NEXCAR?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NEXCAR ofrece servicios de inspección vehicular completa, validación de documentos REPUVE, detección de fraudes automotrices y consultoría especializada en la industria automotriz mexicana."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo contactar a NEXCAR?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes contactar a NEXCAR al teléfono 800-737-8833 o agendar una cita gratuita en https://calendly.com/mau-nexcar/30min para una inspección vehicular profesional."
        }
      }
    );

    return baseFAQ;
  };

  return (
    <>
      <Head>
        <title>{postMeta.title || "Detector de Chuecos - Blog para la Industria Automotriz en México | NEXCAR"}</title>
        <meta name="description" content={postMeta.description || "Blog especializado en detección de fraudes automotrices en México. Validación de documentos REPUVE, AMDA, Tarjetas de Circulación. Inspección vehicular profesional con NEXCAR."} />
        <meta name="keywords" content={postMeta.keywords || "fraude automotriz, REPUVE, AMDA, tarjeta de circulación, inspección vehicular, México, validación documentos, detector chuecos, NEXCAR"} />
        <meta name="author" content="NEXCAR - Detector de Chuecos" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="es-MX" />
        <meta name="geo.region" content="MX" />
        <meta name="geo.placename" content="México" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={selectedPost ? "article" : "website"} />
        <meta property="og:title" content={postMeta.ogTitle || "Detector de Chuecos - Blog para la Industria Automotriz en México"} />
        <meta property="og:description" content={postMeta.ogDescription || "Blog especializado en detección de fraudes automotrices. Validación de documentos REPUVE, AMDA, Tarjetas de Circulación."} />
        <meta property="og:url" content={postMeta.ogUrl || "https://nexcar.mx"} />
        <meta property="og:site_name" content="NEXCAR - Detector de Chuecos" />
        <meta property="og:locale" content="es_MX" />
                      {selectedPost && (
                <>
                  <meta property="article:author" content="NEXCAR" />
                  <meta property="article:published_time" content={selectedPost.pubDate} />
                  <meta property="article:section" content="Industria Automotriz" />
                  {postMeta.categories && postMeta.categories.map((category, index) => (
                    <meta key={index} property="article:tag" content={category} />
                  ))}
                </>
              )}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={postMeta.ogTitle || "Detector de Chuecos - Blog Automotriz México"} />
        <meta name="twitter:description" content={postMeta.ogDescription || "Blog especializado en detección de fraudes automotrices en México"} />
        
        {/* Canonical */}
        <link rel="canonical" href={postMeta.canonical || "https://nexcar.mx"} />
        
        {/* Schema.org structured data - Dynamic and Intelligent */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(selectedPost ? generateDynamicSchema(selectedPost, postMeta) : {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Detector de Chuecos - NEXCAR",
              "description": "Blog especializado en detección de fraudes automotrices en México",
              "url": "https://nexcar.mx",
              "publisher": {
                "@type": "Organization",
                "name": "NEXCAR",
                "url": "https://nexcar.mx",
                "logo": "https://nexcar.mx/images/logo-calidad-color.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+52-800-737-8833",
                  "contactType": "customer service",
                  "availableLanguage": "Spanish"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://nexcar.mx/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Additional Schema.org for Organization and LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NEXCAR",
              "url": "https://nexcar.mx",
              "logo": "https://nexcar.mx/images/logo-calidad-color.png",
              "description": "Empresa especializada en detección de fraudes automotrices y validación de documentos vehiculares en México",
              "foundingDate": "2020",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "MX",
                "addressRegion": "México"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+52-800-737-8833",
                "contactType": "customer service",
                "availableLanguage": "Spanish"
              },
              "sameAs": [
                "https://nexcar.mx",
                "https://calendly.com/mau-nexcar/30min"
              ],
              "knowsAbout": [
                "Fraude Automotriz",
                "REPUVE",
                "AMDA",
                "Tarjetas de Circulación",
                "Inspección Vehicular",
                "Validación de Documentos"
              ],
              "serviceArea": {
                "@type": "Country",
                "name": "México"
              }
            })
          }}
        />

        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "NEXCAR - Detector de Chuecos",
              "description": "Servicios de inspección vehicular y validación de documentos automotrices en México",
              "url": "https://nexcar.mx",
              "telephone": "+52-800-737-8833",
              "priceRange": "$$",
              "currenciesAccepted": "MXN",
              "paymentAccepted": "Cash, Credit Card, Bank Transfer",
              "openingHours": "Mo-Fr 09:00-18:00",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "MX",
                "addressRegion": "México"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "19.4326",
                "longitude": "-99.1332"
              },
              "areaServed": {
                "@type": "Country",
                "name": "México"
              },
              "serviceType": [
                "Inspección Vehicular",
                "Validación de Documentos",
                "Detección de Fraudes Automotrices",
                "Consultoría Automotriz"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servicios de Validación Automotriz",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Inspección Vehicular Completa",
                      "description": "Validación completa de documentos y estado del vehículo"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Validación de Documentos REPUVE",
                      "description": "Verificación de documentos del Registro Público Vehicular"
                    }
                  }
                ]
              }
            })
          }}
        />

        {/* FAQ Schema - Dynamic and Intelligent based on post content */}
        {selectedPost && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateDynamicFAQ(selectedPost, postMeta))
            }}
          />
        )}

        {/* Breadcrumbs Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "NEXCAR",
                  "item": "https://nexcar.mx"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Blog",
                  "item": "https://nexcar.mx/blog"
                },
                ...(selectedPost ? [{
                  "@type": "ListItem",
                  "position": 3,
                  "name": selectedPost.title,
                  "item": selectedPost.link
                }] : [])
              ]
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Notificación */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center animate-pulse">
            <Bell className="w-5 h-5 mr-2" />
            {notification}
          </div>
        )}

        {/* Error de carga RSS */}
        {loadError && (
          <div className="fixed top-4 left-4 z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm">
            <Rss className="w-4 h-4 inline mr-1" />
            RSS no disponible - Usando datos de ejemplo
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-50 to-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Logo en esquina superior izquierda */}
            <div className="flex justify-start mb-6">
              <a
                href="https://nexcar.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 group"
              >
                {/* Logo de nexcar real */}
                <div className="logo-container flex items-center">
                  <img
                    src="/images/logo-calidad-color.png"
                    alt="Nexcar Logo"
                    className="h-12 w-auto hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </a>
            </div>

            {/* Breadcrumbs - Debajo del logo */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a
                    href="https://nexcar.mx"
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    NEXCAR
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      Blog
                    </span>
                  </div>
                </li>
                {selectedPost && (
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 truncate max-w-xs">
                        {selectedPost.title}
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>

            {/* Título centrado */}
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                <span className="text-gray-900">DETECTOR DE</span>{' '}
                <span className="text-purple-600">CHUECOS</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Blog para la industria automotriz en México
              </p>
            </div>

            {/* Botón de Suscripción */}
            <div className="flex justify-center mb-12">
              <a
                href="https://nexcar.substack.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Suscribirse Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            {/* Información de Última Actualización */}
            <div className="flex items-center justify-center text-gray-500 text-sm mb-8">
              <Clock className="w-4 h-4 mr-2" />
              Última actualización: {formatDate(new Date())}
            </div>

            {/* Botón de Inspección de Vehículos */}
            <div className="text-center">
              <a 
                href="https://calendly.com/mau-nexcar/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Da click aquí para inspeccionar un vehículo
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Último Post Completo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Post Principal - Ocupa 3 columnas */}
            <div className="lg:col-span-3">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {selectedPostIndex === 0 ? 'Última Publicación' : 'Publicación Seleccionada'}
                </h2>
                <div className="w-24 h-1 bg-purple-600 mx-auto mb-6"></div>
              </div>

              {!selectedPost ? (
                <div className="text-center text-gray-500 py-16">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl mb-2">Cargando posts desde Substack...</p>
                  <p>Los posts aparecerán automáticamente</p>
                  <button 
                    onClick={refreshPosts}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Cargar Posts
                  </button>
                </div>
              ) : (
                <article className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                  {/* Header del post */}
                  <div className="flex items-center justify-between text-purple-600 text-sm mb-8 flex-wrap gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(selectedPost.pubDate)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {selectedPost.author}
                    </div>
                  </div>
                  
                  {/* Título */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                    {selectedPost.title}
                  </h1>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {categorizePost(selectedPost).map((category, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getCategoryColor(category)} hover:scale-105 transition-transform duration-200 cursor-default`}
                        title={`Categoría: ${category}`}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  {/* Contenido completo del post */}
                  <div className="prose prose-lg max-w-none mb-8">
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedPost.fullContent }} 
                      className="text-gray-800 leading-relaxed"
                    />
                  </div>
                  
                  {/* Footer del post */}
                  <div className="flex items-center justify-between pt-8 border-t border-gray-200 flex-wrap gap-4">
                    <div className="text-sm text-gray-500 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Sincronizado desde Substack
                    </div>
                    <a 
                      href={selectedPost.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors bg-purple-50 hover:bg-purple-100 px-6 py-3 rounded-lg"
                    >
                      Leer en Substack
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </article>
              )}
            </div>

            {/* Barra Lateral - Ocupa 1 columna */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Todos los Posts</h3>
                
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {/* Último post (primero en la lista) */}
                    {posts.length > 0 && (
                      <button
                        onClick={() => selectPost(0)}
                        className={`w-full text-left bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group ${
                          selectedPostIndex === 0 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {/* Imagen del post */}
                        {posts[0].fullContent && posts[0].fullContent.includes('<img') && (
                          <div className="mb-3">
                            <img 
                              src={posts[0].fullContent.match(/<img[^>]+src="([^"]+)"[^>]*>/)?.[1] || 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Imagen'} 
                              alt={posts[0].title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Título del post */}
                        <h4 className={`text-sm font-semibold line-clamp-3 leading-tight transition-colors ${
                          selectedPostIndex === 0 
                            ? 'text-purple-600' 
                            : 'text-gray-900 group-hover:text-purple-600'
                        }`}>
                          {posts[0].title}
                        </h4>
                        
                        {/* Fecha */}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(posts[0].pubDate)}
                        </p>
                        
                        {/* Categories in sidebar */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {categorizePost(posts[0]).slice(0, 2).map((category, catIndex) => (
                            <span
                              key={catIndex}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(category)}`}
                              title={`Categoría: ${category}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                        
                        {/* Indicador de post actual */}
                        {selectedPostIndex === 0 && (
                          <div className="mt-2 text-xs text-purple-600 font-medium">
                            ← Post actual
                          </div>
                        )}
                      </button>
                    )}
                    
                    {/* Posts anteriores */}
                    {posts.slice(1).map((post, index) => (
                      <button
                        key={post.id}
                        onClick={() => selectPost(index + 1)}
                        className={`w-full text-left bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group ${
                          selectedPostIndex === index + 1 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {/* Imagen del post */}
                        {post.fullContent && post.fullContent.includes('<img') && (
                          <div className="mb-3">
                            <img 
                              src={post.fullContent.match(/<img[^>]+src="([^"]+)"[^>]*>/)?.[1] || 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=Imagen'} 
                              alt={post.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Título del post */}
                        <h4 className={`text-sm font-semibold line-clamp-3 leading-tight transition-colors ${
                          selectedPostIndex === index + 1 
                            ? 'text-purple-600' 
                            : 'text-gray-900 group-hover:text-purple-600'
                        }`}>
                          {post.title}
                        </h4>
                        
                        {/* Fecha */}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(post.pubDate)}
                        </p>
                        
                        {/* Categories in sidebar */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {categorizePost(post).slice(0, 2).map((category, catIndex) => (
                            <span
                              key={catIndex}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(category)}`}
                              title={`Categoría: ${category}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                        
                        {/* Indicador de post actual */}
                        {selectedPostIndex === index + 1 && (
                          <div className="mt-2 text-xs text-purple-600 font-medium">
                            ← Post actual
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay posts anteriores</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2025 NEXCAR Blog. Todos los derechos reservados.</p>
              <p className="mt-2 text-sm">
                Automatizado con <span className="text-purple-600 font-medium">Substack + Zapier + Next.js</span>
              </p>
              <div className="mt-4 text-xs text-gray-500 space-x-4">
                <a href="/api/health" target="_blank" className="hover:text-purple-600 transition-colors">API Status</a>
                <a href="https://nexcar.substack.com/feed" target="_blank" className="hover:text-purple-600 transition-colors">RSS Feed</a>
                <span>Posts: {posts.length}</span>
                <span className="inline-flex items-center">
                  Status: {getStatusIcon()}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  let initialPosts = [];
  let loadError = false;

  try {
    console.log('🔄 Cargando posts iniciales desde RSS...');
    initialPosts = await loadPostsFromRSS();
    console.log(`✅ Cargados ${initialPosts.length} posts iniciales`);
  } catch (error) {
    console.error('❌ Error cargando RSS en servidor:', error);
    loadError = true;
    // Posts de fallback si falla RSS
    initialPosts = [{
      id: 'fallback-1',
      title: 'Blog NEXCAR inicializando...',
      link: 'https://nexcar.substack.com',
      excerpt: 'Conectando con el feed RSS de Substack. Los posts aparecerán automáticamente.',
      fullContent: '<p>El blog está conectándose con tu feed de Substack. Los posts se cargarán automáticamente cuando estén disponibles.</p>',
      pubDate: new Date().toISOString(),
      author: 'NEXCAR',
      createdAt: new Date().toISOString()
    }];
  }

  return {
    props: {
      initialPosts,
      loadError
    },
  };
}