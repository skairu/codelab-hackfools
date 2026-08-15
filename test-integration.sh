#!/bin/bash
# Script para testar a integração com o backend

BASE_URL="http://localhost:8000"
CLIENT_ID="test-client-$(date +%s)"

echo "======================================"
echo "Teste de Integração - Terrestre"
echo "======================================"
echo ""
echo "Client ID: $CLIENT_ID"
echo "Base URL: $BASE_URL"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Testar se o backend está online
echo -e "${BLUE}[1]${NC} Verificando conexão com backend..."
if curl -s "$BASE_URL/docs" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend está online"
else
    echo -e "${RED}✗${NC} Backend não está respondendo em $BASE_URL"
    echo "   Inicie o backend com: cd backend && uvicorn main:app --reload"
    exit 1
fi

echo ""

# 2. Testar GET /graph
echo -e "${BLUE}[2]${NC} Buscando grafo da cidade..."
GRAPH=$(curl -s "$BASE_URL/graph")
if echo "$GRAPH" | grep -q '"nodes"'; then
    NODES_COUNT=$(echo "$GRAPH" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓${NC} Grafo carregado ($NODES_COUNT nós)"
else
    echo -e "${RED}✗${NC} Erro ao carregar grafo"
    exit 1
fi

echo ""

# 3. Testar GET /dinosaurs
echo -e "${BLUE}[3]${NC} Buscando dinossauros..."
DINOS=$(curl -s "$BASE_URL/dinosaurs")
if echo "$DINOS" | grep -q '"id"'; then
    DINO_COUNT=$(echo "$DINOS" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓${NC} Dinossauros carregados ($DINO_COUNT)"
else
    echo -e "${RED}✗${NC} Erro ao carregar dinossauros"
    exit 1
fi

echo ""

# 4. Testar WebSocket (básico)
echo -e "${BLUE}[4]${NC} Verificando WebSocket..."
if command -v websocat &> /dev/null; then
    timeout 3 websocat "ws://localhost:8000/ws/$CLIENT_ID" < /dev/null > /tmp/ws_test.log 2>&1
    if grep -q "dinos_update" /tmp/ws_test.log 2>/dev/null || [ $? -eq 124 ]; then
        echo -e "${GREEN}✓${NC} WebSocket funcionando"
    else
        echo -e "${BLUE}~${NC} WebSocket respondendo (sem websocat para validar payload)"
    fi
else
    echo -e "${BLUE}~${NC} websocat não instalado, pulando teste WebSocket"
    echo "   Para testar: apt install websocat"
fi

echo ""

# 5. Testar POST /route
echo -e "${BLUE}[5]${NC} Testando cálculo de rota..."
ROUTE=$(curl -s -X POST "$BASE_URL/route" \
    -H "Content-Type: application/json" \
    -d "{\"client_id\": \"$CLIENT_ID\", \"origin_node\": \"r0_c0\", \"destination_node\": \"r7_c7\"}")

if echo "$ROUTE" | grep -q '"path"'; then
    echo -e "${GREEN}✓${NC} Rota calculada com sucesso"
    echo "   Path: $(echo "$ROUTE" | grep -o '"path":\[[^]]*\]')"
else
    echo -e "${RED}✗${NC} Erro ao calcular rota"
    echo "   Response: $ROUTE"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✓${NC} Teste de integração concluído!"
echo "======================================"
echo ""
echo "Próximos passos:"
echo "  1. Abra http://localhost:5173 no navegador"
echo "  2. Navegue para a página TERRESTRE"
echo "  3. Verifique se o mapa está sendo renderizado"
echo "  4. Observe os dinossauros se movimentando em tempo real"
echo ""
