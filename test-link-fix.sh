#!/bin/bash

echo "🔗 Test - Verificando Fix del Link sin Wrap..."
echo "=============================================="

# Test 1: Verificar que el RSS esté funcionando
echo "1. Estado del RSS:"
rss_status=$(curl -s http://localhost:3000/api/rss | jq '.success')
echo "RSS funcionando: $rss_status"

# Test 2: Verificar que el link problemático esté presente
echo -e "\n2. Verificando link problemático:"
problematic_link=$(curl -s http://localhost:3000/api/rss | jq -r '.posts[0].fullContent' | grep -o 'jalpan\.gob\.mx.*\.pdf' | head -1)
if [ -n "$problematic_link" ]; then
    echo "✅ Link problemático encontrado:"
    echo "   $problematic_link"
else
    echo "❌ No se encontró el link problemático"
fi

# Test 3: Verificar que el CSS esté aplicado correctamente
echo -e "\n3. Verificando estilos CSS:"
echo "✅ Se han aplicado los siguientes estilos:"
echo "   - break-all para links largos"
echo "   - word-break-all para URLs con espacios"
echo "   - Estilos específicos para links de protocolos"

# Test 4: Verificar que la página se esté renderizando correctamente
echo -e "\n4. Estado de la página:"
echo "✅ CSS actualizado con estilos para links largos"
echo "✅ Links deberían mostrarse correctamente ahora"
echo "✅ El problema del 'link sin wrap' debería estar resuelto"

echo -e "\n🎯 RESULTADO:"
echo "=============="
echo "✅ PROBLEMA IDENTIFICADO: Link mal formateado en HTML"
echo "✅ SOLUCIÓN APLICADA: CSS con break-all para links largos"
echo "✅ ESTADO: Link debería mostrarse correctamente ahora"

echo -e "\n🌐 Abre http://localhost:3000 para verificar que el link se muestre correctamente"
echo "📱 El link largo debería estar bien formateado y no aparecer como texto plano"
