# 🚀 Instrucciones de Deploy - Detector de Chuecos

## 📋 Prerequisitos

- ✅ Node.js 18+ instalado
- ✅ Cuenta en Vercel (gratuita)
- ✅ Feed RSS de Substack funcionando

## 🔧 Configuración Local

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en desarrollo:**
```bash
npm run dev
```

3. **Verificar build de producción:**
```bash
npm run build
```

## 🌐 Deploy en Vercel

### Deploy Directo (Recomendado)

1. **Ejecutar deploy:**
```bash
npx vercel --prod
```

2. **Seguir instrucciones:**
   - Iniciar sesión en Vercel (si es necesario)
   - Confirmar configuración del proyecto
   - Esperar deploy automático

## 🔗 Configuración de RSS

### Feed Automático
- **URL RSS:** `https://nexcar.substack.com/feed`
- **Carga automática:** Al abrir la página
- **Sincronización:** En tiempo real
- **Fallback:** Datos de ejemplo si RSS falla

## 🧪 Verificar Funcionamiento

### 1. API Endpoints

- **Health:** `https://TU_URL.vercel.app/api/health`
- **Posts:** `https://TU_URL.vercel.app/api/posts`
- **RSS:** `https://TU_URL.vercel.app/api/rss`

### 2. Test Manual

```bash
# Health check
curl https://TU_URL.vercel.app/api/health

# Get posts
curl https://TU_URL.vercel.app/api/posts

# Cargar desde RSS
curl https://TU_URL.vercel.app/api/rss
```

## 🚀 Características del Sistema

- **Carga inicial automática:** RSS se carga al abrir la página
- **Sistema de fallback:** Datos de ejemplo si RSS falla
- **Detección de duplicados:** Evita posts repetidos
- **Health check automático:** Monitoreo de conexión
- **Logs detallados:** Para debugging y monitoreo
- **Barra lateral:** Muestra posts anteriores en cards
- **Post principal completo:** Contenido completo de Substack

## 🎯 Próximos Pasos

1. **Deploy en Vercel** con `npx vercel --prod`
2. **Verificar funcionamiento** de todos los endpoints
3. **Personalizar URL** en configuraciones si es necesario
4. **Monitorear logs** en dashboard de Vercel

---

**Nota:** Este sistema funciona completamente con RSS automático. No requiere Zapier ni configuración adicional.
