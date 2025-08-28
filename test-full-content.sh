#!/bin/bash

echo "🔍 Verificando Contenido Completo del Post..."
echo "=============================================="

# Test 1: Verificar que el RSS esté funcionando
echo "1. Estado del RSS:"
rss_status=$(curl -s http://localhost:3000/api/rss | jq '.success')
echo "RSS funcionando: $rss_status"

# Test 2: Contar posts disponibles
echo -e "\n2. Posts disponibles:"
rss_count=$(curl -s http://localhost:3000/api/rss | jq '.count')
echo "Total posts: $rss_count"

# Test 3: Verificar contenido del último post
echo -e "\n3. Contenido del último post:"
latest_post=$(curl -s http://localhost:3000/api/rss | jq '.posts[0]')
title=$(echo "$latest_post" | jq -r '.title')
excerpt_length=$(echo "$latest_post" | jq '.excerpt | length')
full_content_length=$(echo "$latest_post" | jq '.fullContent | length')

echo "Título: $title"
echo "Excerpt: $excerpt_length caracteres"
echo "Contenido completo: $full_content_length caracteres"

# Test 4: Verificar que el contenido sea significativamente mayor
if [ "$full_content_length" -gt 1000 ]; then
    echo "✅ SUCCESS: El contenido completo se está cargando correctamente"
    echo "   - Excerpt: $excerpt_length caracteres"
    echo "   - Contenido completo: $full_content_length caracteres"
    echo "   - Diferencia: $((full_content_length - excerpt_length)) caracteres adicionales"
else
    echo "❌ ERROR: El contenido completo no se está cargando"
    echo "   - Se esperaba > 1000 caracteres, se obtuvo: $full_content_length"
fi

# Test 5: Verificar que el contenido contenga HTML
echo -e "\n5. Verificando contenido HTML:"
html_check=$(curl -s http://localhost:3000/api/rss | jq -r '.posts[0].fullContent' | grep -o '<[^>]*>' | head -5)
if [ -n "$html_check" ]; then
    echo "✅ HTML detectado en el contenido:"
    echo "$html_check"
else
    echo "❌ No se detectó HTML en el contenido"
fi

echo -e "\n🎯 RESULTADO FINAL:"
if [ "$full_content_length" -gt 1000 ]; then
    echo "✅ CAMBIO 1 IMPLEMENTADO CORRECTAMENTE"
    echo "   El post completo se está cargando desde Substack"
    echo "   Contenido: $full_content_length caracteres"
else
    echo "❌ CAMBIO 1 FALLÓ"
    echo "   Solo se está cargando el preview"
fi

echo -e "\n🌐 Abre http://localhost:3000 para ver el post completo"
echo "📱 Deberías ver TODO el contenido del blog post, no solo el preview"
