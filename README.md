# NEXCAR Blog - Automatizado con Substack + Zapier + RSS

Landing page que se sincroniza automáticamente con tu blog de Substack usando RSS y webhooks de Zapier.

## 🚀 Características

- ✅ **Carga automática desde RSS** de Substack al iniciar
- ✅ **Sincronización automática** con Substack vía Zapier
- ✅ **API completa** con endpoints para RSS, posts y webhooks
- ✅ **Diseño moderno** y responsive con Tailwind CSS
- ✅ **Posts con contenido HTML** completo renderizado
- ✅ **Notificaciones en tiempo real** de nuevos posts
- ✅ **Sistema de fallback** si RSS no está disponible
- ✅ **Optimizado para SEO** y rendimiento

## 📦 Instalación

1. **Clonar y configurar:**
```bash
git clone <tu-repo>
cd nexcar-blog
npm install
```

2. **Ejecutar en desarrollo:**
```bash
npm run dev
```

3. **Deploy en Vercel:**
```bash
npm run build
# Subir a GitHub y conectar con Vercel
```

## 🔧 Configuración de Zapier

1. **Crear Zap con estos pasos:**
   - Trigger: RSS by Zapier → `https://nexcar.substack.com/feed`
   - Action: Webhooks by Zapier → `https://tu-url.vercel.app/api/webhook`

2. **Configurar webhook con estos campos:**
```json
{
  "title": "{{1. Title}}",
  "link": "{{1. Link}}",
  "content": "{{1. Content}}",
  "excerpt": "{{1. Description}}",
  "pubDate": "{{1. Pub Date}}"
}
```

## 🎯 Endpoints API

- `GET /api/health` - Status del servicio y estadísticas
- `GET /api/posts` - Obtener posts desde memoria
- `GET /api/rss` - Cargar posts directamente desde RSS
- `POST /api/webhook` - Recibir webhooks de Zapier

## 🚦 Verificar funcionamiento

1. **API saludable:** `https://tu-url.vercel.app/api/health`
2. **Posts desde RSS:** `https://tu-url.vercel.app/api/rss`
3. **Test manual del webhook:** Usar Postman o curl
4. **Logs:** Ver en dashboard de Vercel

## 🔄 Flujo automatizado

1. **Al cargar la página:** Se cargan posts desde RSS de Substack
2. **Publicas en Substack:** RSS se actualiza automáticamente
3. **Zapier detecta:** Nuevo post en el feed RSS
4. **Envía webhook:** A tu landing page
5. **Post aparece:** Automáticamente en el blog

## 🧪 Testing

Ejecuta el script de pruebas incluido:
```bash
chmod +x test-api.sh
./test-api.sh
```

## 📱 Funcionalidades Avanzadas

- **Carga inicial desde RSS:** Posts se cargan automáticamente al abrir
- **Sincronización en tiempo real:** Polling cada 30 segundos
- **Health check automático:** Verificación de conexión cada 2 minutos
- **Sistema de fallback:** Datos de ejemplo si RSS falla
- **Detección de duplicados:** Evita posts repetidos por link
- **Logs detallados:** Para debugging y monitoreo

---

**¡Tu blog está ahora completamente automatizado con RSS y Zapier! 🎉**
# detector-chuecos
