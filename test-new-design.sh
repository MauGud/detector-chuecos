#!/bin/bash

echo "🎨 Probando Nuevo Diseño NEXCAR Blog..."
echo "======================================="

# Test 1: Health Check
echo "1. Health Check:"
curl -s http://localhost:3000/api/health | jq '.status'
echo -e "\n"

# Test 2: Verificar posts en RSS
echo "2. Posts disponibles en RSS:"
rss_count=$(curl -s http://localhost:3000/api/rss | jq '.count')
echo "Total posts en RSS: $rss_count"

# Test 3: Obtener título del último post
echo -e "\n3. Último post disponible:"
latest_title=$(curl -s http://localhost:3000/api/rss | jq -r '.posts[0].title')
echo "Título: $latest_title"

# Test 4: Verificar contenido del último post
echo -e "\n4. Contenido del último post:"
content_length=$(curl -s http://localhost:3000/api/rss | jq '.posts[0].fullContent | length')
echo "Longitud del contenido: $content_length caracteres"

# Test 5: Verificar que el post tenga link
echo -e "\n5. Link del último post:"
post_link=$(curl -s http://localhost:3000/api/rss | jq -r '.posts[0].link')
echo "Link: $post_link"

# Test 6: Verificar fecha de publicación
echo -e "\n6. Fecha de publicación:"
pub_date=$(curl -s http://localhost:3000/api/rss | jq -r '.posts[0].pubDate')
echo "Fecha: $pub_date"

echo -e "\n✅ Tests del nuevo diseño completados!"
echo "🌐 Abre http://localhost:3000 en tu navegador para ver el nuevo diseño"
echo "📱 El último post debería mostrarse completo con fondo blanco"
