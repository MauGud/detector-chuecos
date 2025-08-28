import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { loadPostsFromRSS } from '../lib/posts';
import { 
  Calendar, ExternalLink, User, Bell, RefreshCw, BookOpen,
  ArrowRight, Clock, Eye, Zap, Rss, Activity
} from 'lucide-react';

export default function Home({ initialPosts, loadError }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');

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

  // Obtener solo el último post
  const latestPost = posts.length > 0 ? posts[0] : null;

  return (
    <>
      <Head>
        <title>NEXCAR Blog - Estrategias para tu negocio digital</title>
        <meta name="description" content="Estrategias, insights y casos reales para construir y escalar tu negocio digital. Blog automatizado con Substack y Zapier." />
        <meta property="og:title" content="NEXCAR Blog - Estrategias para tu negocio digital" />
        <meta property="og:description" content="Blog automatizado que se sincroniza con Substack vía Zapier" />
        <link rel="canonical" href="https://nexcar.substack.com" />
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
            <div className="flex justify-start mb-12">
              <div className="flex items-center space-x-3">
                {/* Logo de nexcar */}
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="none">
                    {/* Patrón geométrico central */}
                    <path d="M12 4L8 8L12 12L16 8L12 4Z" fill="black"/>
                    <path d="M12 12L8 16L12 20L16 16L12 12Z" fill="black"/>
                    <path d="M4 12L8 8L12 12L8 16L4 12Z" fill="black"/>
                    <path d="M20 12L16 8L12 12L16 16L20 12Z" fill="black"/>
                  </svg>
                </div>
                
                {/* Texto del logo */}
                <div className="text-left">
                  <div className="text-lg font-bold text-purple-400 leading-tight">
                    nexcar
                  </div>
                </div>
              </div>
            </div>

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
              <button className="inline-flex items-center bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Suscribirse Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
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
                  Última Publicación
                </h2>
                <div className="w-24 h-1 bg-purple-600 mx-auto mb-6"></div>
              </div>

              {!latestPost ? (
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
                      {formatDate(latestPost.pubDate)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {latestPost.author}
                    </div>
                  </div>
                  
                  {/* Título */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                    {latestPost.title}
                  </h1>
                  
                  {/* Contenido completo del post */}
                  <div className="prose prose-lg max-w-none mb-8">
                    <div 
                      dangerouslySetInnerHTML={{ __html: latestPost.fullContent }} 
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
                      href={latestPost.link}
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
                <h3 className="text-xl font-bold text-gray-900 mb-6">Posts Anteriores</h3>
                
                {posts.length > 1 ? (
                  <div className="space-y-4">
                    {posts.slice(1).map((post) => (
                      <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
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
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-3 leading-tight">
                          {post.title}
                        </h4>
                        
                        {/* Fecha */}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(post.pubDate)}
                        </p>
                      </div>
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
