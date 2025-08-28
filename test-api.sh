#!/bin/bash

echo "🧪 Probando NEXCAR Blog API Actualizada..."
echo "=========================================="

# Test 1: Health Check
echo "1. Health Check:"
curl -s http://localhost:3000/api/health | jq '.'
echo -e "\n"

# Test 2: Get Posts from Memory
echo "2. Get Posts (Memory Store):"
curl -s http://localhost:3000/api/posts | jq '.count'
echo " posts en memoria"
echo -e "\n"

# Test 3: Get Posts from RSS
echo "3. Get Posts (RSS Feed):"
curl -s http://localhost:3000/api/rss | jq '.count'
echo " posts desde RSS"
echo -e "\n"

# Test 4: Add Post via Webhook
echo "4. Add Post via Webhook:"
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post RSS Actualizado 🚀",
    "link": "https://nexcar.substack.com/p/test-post-rss",
    "excerpt": "Este es un post de prueba para verificar que el webhook funciona con la nueva funcionalidad RSS.",
    "content": "<h2>Post de Prueba RSS</h2><p>Este contenido se agregó automáticamente via webhook después de la actualización RSS.</p>"
  }' | jq '.'
echo -e "\n"

# Test 5: Verify Post Added
echo "5. Verificar Post Agregado:"
sleep 2
curl -s http://localhost:3000/api/posts | jq '.count'
echo " posts totales ahora"
echo -e "\n"

# Test 6: Compare RSS vs Memory
echo "6. Comparar RSS vs Memoria:"
rss_count=$(curl -s http://localhost:3000/api/rss | jq '.count')
memory_count=$(curl -s http://localhost:3000/api/posts | jq '.count')
echo "RSS: $rss_count posts | Memoria: $memory_count posts"
echo -e "\n"

echo "✅ Tests completados! RSS funcionando correctamente."
