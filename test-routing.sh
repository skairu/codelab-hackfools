#!/bin/bash

# Script para testar o sistema de roteamento
# Certifique-se de que o backend está rodando em localhost:8000

API_URL="http://localhost:8000"
CLIENT_ID="test_client_$(date +%s)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         TESTE DO SISTEMA DE ROTEAMENTO                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar conectividade
echo "1️⃣  Testando conectividade com backend..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$HEALTH" = "200" ]; then
  echo "   ✅ Backend está respondendo"
else
  echo "   ❌ Erro: Backend não responde (HTTP $HEALTH)"
  echo "   Inicie o backend com: cd backend && uvicorn main:app --reload"
  exit 1
fi

# 2. Buscar grafo
echo ""
echo "2️⃣  Buscando grafo de ruas..."
GRAPH=$(curl -s "$API_URL/graph")
NODE_COUNT=$(echo "$GRAPH" | grep -o '"nodes"' | wc -l)
EDGE_COUNT=$(echo "$GRAPH" | grep -o '"edges"' | wc -l)

if [ "$NODE_COUNT" -gt 0 ]; then
  echo "   ✅ Grafo carregado"
  echo "   📊 Nós: $(echo "$GRAPH" | grep -o '"id"' | wc -l)"
  echo "   📊 Arestas: $EDGE_COUNT"
else
  echo "   ❌ Erro ao carregar grafo"
  exit 1
fi

# 3. Buscar dinossauros
echo ""
echo "3️⃣  Buscando dinossauros..."
DINOS=$(curl -s "$API_URL/dinosaurs")
DINO_COUNT=$(echo "$DINOS" | grep -o '"id"' | wc -l)

if [ "$DINO_COUNT" -gt 0 ]; then
  echo "   ✅ Dinossauros carregados"
  echo "   🦖 Total: $DINO_COUNT"
else
  echo "   ❌ Nenhum dinossauro encontrado"
fi

# 4. Testar cálculo de rota
echo ""
echo "4️⃣  Calculando rota (r0_c0 → r7_c7)..."
ROUTE=$(curl -s -X POST "$API_URL/route" \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"$CLIENT_ID\",
    \"origin_node\": \"r0_c0\",
    \"destination_node\": \"r7_c7\"
  }")

DISTANCE=$(echo "$ROUTE" | grep -o '"distance_m":[^,]*' | cut -d: -f2)
DURATION=$(echo "$ROUTE" | grep -o '"duration_s":[^,]*' | cut -d: -f2)
PATH_LENGTH=$(echo "$ROUTE" | grep -o '"path"' | wc -l)

if [ -n "$DISTANCE" ] && [ -n "$DURATION" ]; then
  echo "   ✅ Rota calculada"
  echo "   📏 Distância: ${DISTANCE} metros (~$(echo "scale=2; $DISTANCE / 1000" | bc) km)"
  echo "   ⏱️  Duração: ${DURATION} segundos"
  echo "   🛣️  Nós na rota: $PATH_LENGTH"
else
  echo "   ❌ Erro ao calcular rota"
  echo "   Resposta: $ROUTE"
fi

# 5. Testar WebSocket (simples)
echo ""
echo "5️⃣  Testando WebSocket..."
echo "   📡 URL: ws://localhost:8000/ws/$CLIENT_ID"
echo "   💡 Dica: Teste a conexão abrindo http://localhost:5173 no navegador"

# 6. Deletar rota
echo ""
echo "6️⃣  Limpando rota ($CLIENT_ID)..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/route/$CLIENT_ID" \
  -H "Content-Type: application/json")

if [ -n "$DELETE_RESPONSE" ]; then
  echo "   ✅ Rota deletada"
else
  echo "   ⚠️  Resposta vazia (pode ser normal)"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         TESTES CONCLUÍDOS! 🎯                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "  1. Inicie o frontend: cd hackfools && npm run dev"
echo "  2. Abra http://localhost:5173"
echo "  3. Clique em TERRESTRE no menu"
echo "  4. Clique em dois nós do mapa para testar a rota"
echo ""
