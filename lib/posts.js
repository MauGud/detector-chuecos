import { parseString } from 'xml2js';

let postsStore = [];

export function getAllPosts() {
  return postsStore.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

export function addPost(postData) {
  const existingPost = postsStore.find(p => p.link === postData.link);
  if (existingPost) {
    console.log('Post already exists:', postData.title);
    return existingPost;
  }

  const newPost = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: postData.title?.trim() || 'Sin título',
    link: postData.link?.trim() || '#',
    fullContent: postData.content || postData.fullContent || postData.excerpt || 'Sin contenido',
    excerpt: postData.excerpt ? 
      postData.excerpt.replace(/<[^>]*>/g, '').substring(0, 300).trim() + '...' : 
      'Sin descripción disponible',
    pubDate: postData.pubDate || new Date().toISOString(),
    author: postData.author || 'NEXCAR',
    createdAt: new Date().toISOString()
  };
  
  postsStore.unshift(newPost);
  console.log(`Post agregado: ${newPost.title.substring(0, 50)}...`);
  return newPost;
}

// Función para obtener el contenido completo de un post desde Substack
async function fetchFullPostContent(postUrl) {
  try {
    console.log(`🔄 Obteniendo contenido completo de: ${postUrl}`);
    
    const response = await fetch(postUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NEXCAR-Blog/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Buscar el contenido principal del post en Substack
    // Substack tiene una estructura específica que necesitamos identificar
    let content = null;
    
    // Opción 1: Buscar el contenido principal del post
    const contentMatch = html.match(/<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<div[^>]*class="[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    
    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1];
      console.log(`✅ Contenido principal encontrado: ${content.length} caracteres`);
    } else {
      // Opción 2: Buscar el artículo principal
      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      if (articleMatch && articleMatch[1]) {
        content = articleMatch[1];
        console.log(`✅ Artículo encontrado: ${content.length} caracteres`);
      } else {
        // Opción 3: Buscar cualquier div con contenido sustancial
        const divMatches = html.match(/<div[^>]*>([\s\S]*?)<\/div>/gi);
        if (divMatches) {
          // Filtrar solo divs con contenido sustancial (más de 3000 caracteres)
          const substantialDivs = divMatches
            .map(div => div.replace(/<div[^>]*>([\s\S]*?)<\/div>/i, '$1'))
            .filter(divContent => divContent.length > 3000)
            .sort((a, b) => b.length - a.length);
          
          if (substantialDivs.length > 0) {
            content = substantialDivs[0];
            console.log(`✅ Div sustancial encontrado: ${content.length} caracteres`);
          }
        }
      }
    }
    
    if (content) {
      // Limpieza mínima: solo eliminar scripts y estilos
      content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      
      // Eliminar espacios excesivos
      content = content.replace(/\n\s*\n/g, '\n');
      content = content.trim();
      
      console.log(`✅ Contenido real obtenido: ${content.length} caracteres`);
      return content;
    }
    
    throw new Error('No se pudo extraer contenido del post');
    
  } catch (error) {
    console.error(`❌ Error obteniendo contenido completo: ${error.message}`);
    return null;
  }
}

export async function loadPostsFromRSS() {
  try {
    const response = await fetch('https://nexcar.substack.com/feed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NEXCAR-Blog/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    return new Promise(async (resolve, reject) => {
      parseString(xmlText, async (err, result) => {
        if (err) {
          console.error('Error parsing RSS:', err);
          reject(err);
          return;
        }
        
        try {
          const items = result?.rss?.channel?.[0]?.item || [];
          const posts = [];
          
          // Procesar solo los primeros 3 posts para evitar demoras
          const limitedItems = items.slice(0, 3);
          
          for (let i = 0; i < limitedItems.length; i++) {
            const item = limitedItems[i];
            
            const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Sin título';
            const link = Array.isArray(item.link) ? item.link[0] : item.link || '#';
            
            // Extraer contenido completo del RSS
            let fullContent = '';
            let excerpt = '';
            
            // Substack incluye el contenido completo en el RSS
            if (item['content:encoded'] && Array.isArray(item['content:encoded'])) {
              fullContent = item['content:encoded'][0];
              console.log(`✅ Contenido completo encontrado en RSS: ${fullContent.length} caracteres`);
            } else if (item.description && Array.isArray(item.description)) {
              fullContent = item.description[0];
              console.log(`✅ Usando description como contenido: ${fullContent.length} caracteres`);
            } else if (item.content && Array.isArray(item.content)) {
              fullContent = item.content[0];
              console.log(`✅ Usando content como contenido: ${fullContent.length} caracteres`);
            }
            
            // Crear excerpt limpio
            if (fullContent) {
              excerpt = fullContent.replace(/<[^>]*>/g, '').substring(0, 300).trim() + '...';
            } else {
              excerpt = 'Sin descripción disponible';
            }
            
            // Si no hay contenido completo, usar excerpt
            if (!fullContent || fullContent.length < 500) {
              fullContent = excerpt;
              console.log(`⚠️ Usando excerpt como contenido: ${fullContent.length} caracteres`);
            }
            
            const post = {
              id: `rss-${Date.now()}-${i}`,
              title,
              link,
              fullContent,
              excerpt,
              pubDate: Array.isArray(item.pubDate) ? item.pubDate[0] : item.pubDate || new Date().toISOString(),
              author: 'NEXCAR',
              createdAt: new Date().toISOString()
            };
            
            posts.push(post);
            console.log(`📝 Post ${i + 1} procesado: ${title.substring(0, 50)}...`);
          }
          
          // Reemplazar store con posts del RSS
          postsStore = posts;
          console.log(`✅ Cargados ${posts.length} posts del RSS con contenido completo`);
          resolve(posts);
          
        } catch (parseError) {
          console.error('Error processing RSS data:', parseError);
          reject(parseError);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching RSS:', error);
    // Si falla, devolver post de ejemplo
    const fallbackPost = {
      id: 'fallback-1',
      title: 'Cómo validar una factura AMDA es original - A simple vista todas parecen reales, pero hay detalles que delatan a las falsas',
      link: 'https://nexcar.substack.com/p/como-validar-una-factura-amda-y-detectar',
      excerpt: 'Seguro que tu factura AMDA es original? A simple vista todas parecen reales, pero hay detalles que delatan a las falsas. En esta guía te cuento cómo detectarlas.',
      fullContent: `<h2>Cómo identificar una factura AMDA falsa</h2><p><strong>Seguro que tu factura AMDA es original?</strong> A simple vista todas parecen reales, pero hay detalles que delatan a las falsas.</p><p>Las facturas falsas son un problema creciente que puede traerte serios problemas con el SAT. Por eso es crucial que sepas identificarlas antes de que sea demasiado tarde.</p>`,
      pubDate: 'Wed, 20 Aug 2025 15:15:37 GMT',
      author: 'NEXCAR',
      createdAt: new Date().toISOString()
    };
    postsStore = [fallbackPost];
    return [fallbackPost];
  }
}

export function getPostById(id) {
  return postsStore.find(post => post.id === id);
}

export function getPostsCount() {
  return postsStore.length;
}

export { postsStore };
