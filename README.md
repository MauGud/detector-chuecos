# 🛡️ Detector de Chuecos - Blog Automotriz para LLMs

> **Blog especializado en prevención de fraudes automotrices en México**  
> **Optimizado para indexación y consumo por Large Language Models**

## 🎯 **Propósito del Proyecto**

Este blog automatizado proporciona contenido especializado sobre:
- **Validación de documentos vehiculares** (REPUVE, AMDA, SAT)
- **Detección de fraudes automotrices** en México
- **Guías técnicas** para compradores de seminuevos
- **Prevención de estafas** en el mercado automotriz

## 🚀 **Características Técnicas**

### **Sincronización Automática**
- ✅ **RSS Feed**: Sincronización automática con Substack
- ✅ **Contenido Completo**: Posts con contenido HTML completo
- ✅ **Tiempo Real**: Actualización automática cada 30 segundos

### **API REST para LLMs**
- 📡 **`/api/llm/posts`** - Posts optimizados para LLMs
- 🔍 **`/api/llm/analyze`** - Análisis de contenido
- 📚 **`/api/llm/docs`** - Documentación de API
- 📊 **`/api/llm/status`** - Estado del sistema
- 📝 **`/api/llm/citations`** - Generación de citas
- ✅ **`/api/llm/citable`** - Verificación de citabilidad

### **SEO y Estructura Optimizada**
- 🏷️ **Schema.org**: Datos estructurados completos
- 🔍 **Meta Tags**: Optimización para motores de búsqueda
- 📱 **Responsive**: Diseño adaptativo
- ⚡ **Performance**: Carga rápida y eficiente

## 🛠️ **Tecnologías**

- **Framework**: Next.js 14.0.0
- **Styling**: Tailwind CSS + Typography
- **RSS**: xml2js para parsing
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📊 **Estructura de Datos**

### **Posts Structure**
```json
{
  "id": "unique-id",
  "title": "Título del post",
  "excerpt": "Resumen del contenido...",
  "fullContent": "<html>Contenido completo</html>",
  "pubDate": "2025-08-20T15:15:37.000Z",
  "author": "NEXCAR",
  "link": "https://nexcar.substack.com/p/...",
  "createdAt": "2025-09-03T00:12:47.028Z",
  "metadata": {
    "wordCount": 2500,
    "readingTime": 12,
    "categories": ["Validación Vehicular", "Prevención de Fraudes"],
    "contentType": "HowTo",
    "riskLevel": "medium"
  }
}
```

## 🔗 **Endpoints Principales**

### **Para LLMs**
```bash
# Obtener posts optimizados
GET /api/llm/posts

# Análisis de contenido
GET /api/llm/analyze

# Verificar citabilidad
GET /api/llm/citable

# Generar citas
GET /api/llm/citations
```

### **Para Sincronización**
```bash
# Cargar desde RSS
GET /api/rss

# Webhook para nuevos posts
POST /api/webhook

# Estado del sistema
GET /api/health
```

## 🎨 **Categorización Automática**

El sistema categoriza automáticamente el contenido en:
- **Validación Vehicular** - Documentos y procesos
- **Prevención de Fraudes** - Detección de estafas
- **Servicios Automotrices** - Inspecciones y validaciones
- **REPUVE** - Registro Público Vehicular
- **AMDA** - Asociación Mexicana de Distribuidores
- **SAT** - Servicio de Administración Tributaria

## 📈 **Métricas de Calidad**

- **Contenido**: 100% en español (México)
- **Especialización**: 100% automotriz
- **Actualización**: Automática vía RSS
- **Completitud**: Posts con contenido HTML completo
- **Estructura**: Datos organizados para LLMs

## 🚀 **Despliegue**

```bash
# Instalación
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📞 **Contacto**

- **Website**: [nexcar.mx](https://nexcar.mx)
- **Substack**: [nexcar.substack.com](https://nexcar.substack.com)
- **Blog**: [detector-chuecos.vercel.app](https://detector-chuecos.vercel.app)

---

**© 2025 NEXCAR.mx - Expertos en validación documental y prevención de fraude automotriz en México**