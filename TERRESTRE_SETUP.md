# 🦖 Sistema Terrestre - Guia Rápido

## O que foi implementado?

O arquivo `Terrestre.tsx` foi completamente reescrito para integrar-se com o backend em tempo real. Agora a página exibe:

✅ **Grid dinâmico** (8x8) com nós e arestas vindos do backend
✅ **Dinossauros em tempo real** atualizados via WebSocket a cada 3 segundos
✅ **Status visual** dos dinossauros (calmo 🟢, estressado 🟡, agressivo 🔴)
✅ **Painel lateral** com estatísticas e status da conexão
✅ **Mapa interativo** com SVG escalável

## Como testar?

### 1️⃣ Inicie o Backend
```bash
cd backend
source venv/bin/activate  # Ativar virtual env
python3 -m pip install -r requirements.txt  # Se for primeira vez
uvicorn main:app --reload
```

Banco de dados será criado automaticamente em `backend/dinosaurs.db`

### 2️⃣ Inicie o Frontend
```bash
cd hackfools
npm install  # Se for primeira vez
npm run dev
```

Frontend estará disponível em `http://localhost:5173`

### 3️⃣ Teste a integração
```bash
bash test-integration.sh
```

Este script verifica:
- ✓ Conexão com backend
- ✓ Carregamento do grafo
- ✓ Conexão com dinossauros
- ✓ WebSocket funcionando
- ✓ Cálculo de rota

### 4️⃣ Navegue até TERRESTRE
No frontend, clique em "TERRESTRE" no menu para ver o mapa dinâmico.

## Arquitetura

```
┌─────────────────────────────────────────┐
│ Frontend (React + TypeScript)           │
├─────────────────────────────────────────┤
│ Terrestre.tsx (Page)                    │
│   ↓                                     │
│ useTerrialMap (Hook)                    │
│   ├─ api.getGraph()       ──→ GET /graph
│   ├─ api.getDinosaurs()   ──→ GET /dinosaurs
│   └─ api.connectWebSocket ──→ WS /ws/{client_id}
│                                ↑
│ TerrestrialMap (Component)    │
│   ├─ Renderiza SVG Grid      │
│   ├─ Nós (interseções)       │
│   ├─ Arestas (ruas)          │
│   └─ Dinossauros (animais)   │
│                              │
└──────────────────────────────┼──────────┘
                               │
                               ↓
        ┌──────────────────────────────────┐
        │ Backend (FastAPI + Python)       │
        ├──────────────────────────────────┤
        │ GET /graph                       │
        │   → Grid 8x8, nós, arestas       │
        │                                  │
        │ GET /dinosaurs                   │
        │   → Lista de dinossauros atuais  │
        │                                  │
        │ WS /ws/{client_id}               │
        │   → Broadcast dinos_update       │
        │   → cada 3 segundos              │
        │                                  │
        │ Banco SQLite: dinosaurs.db       │
        └──────────────────────────────────┘
```

## Estrutura de Dados

### Nós do Grid
```typescript
{
  id: "r0_c0",      // Coordenada no grid
  lat: -23.5505,    // Latitude
  lon: -46.6333,    // Longitude
  row: 0,           // Linha
  col: 0            // Coluna
}
```

### Dinossauros
```typescript
{
  id: 1,
  specie: "Velociraptor",
  latitude: -23.5505,
  longitude: -46.6333,
  type: "carnivore",           // carnivore | herbivore
  status: "calm",              // calm | stressed | aggressive
  speed: 3.2,                  // m/s
  hunger: 24.5,                // 0-100
  stress: 12.1                 // 0-100
}
```

### Mensagem WebSocket
```json
{
  "type": "dinos_update",
  "data": [
    {"id": 1, "specie": "Velociraptor", ...},
    {"id": 2, "specie": "Triceratops", ...}
  ]
}
```

## Próximos Passos

### Curto Prazo 🚀
- [ ] Implementar clique em nós para selecionar origem/destino
- [ ] Mostrar rota entre dois pontos
- [ ] Adicionar zoom/pan do mapa
- [ ] Alertas em tempo real quando dinossauro se aproxima

### Médio Prazo 🔧
- [ ] Sistema de roteamento seguro (evitando dinossauros)
- [ ] Histórico de movimentos
- [ ] Filtros de espécies/status
- [ ] Busca de dinossauros

### Longo Prazo 🎯
- [ ] Modo "seguir dinossauro"
- [ ] Simulação de caça
- [ ] Análise de padrões comportamentais
- [ ] Integração com mapa real (OpenStreetMap)

## Troubleshooting

### ❌ "Erro de conexão com backend"
```bash
# Verifique se o backend está rodando:
curl http://localhost:8000/docs
# Deveria abrir a documentação Swagger
```

### ❌ "WebSocket desconectado"
```bash
# Verifique o console do navegador (F12)
# Verifique se o backend está respondendo
# Tente recarregar a página (F5)
```

### ❌ "Nenhum dinossauro aparece"
```bash
# O backend talvez tenha o banco vazio
# Remova o arquivo dinosaurs.db e reinicie o backend:
rm backend/dinosaurs.db
cd backend && uvicorn main:app --reload
```

### ❌ "Mapa não renderiza"
```bash
# Verifique se o grafo foi carregado:
curl http://localhost:8000/graph | python -m json.tool
# Deveria retornar nodes e edges
```

## Documentação Completa

Para mais detalhes, veja:
- [Backend README](./backend/README.md) - Documentação do backend
- [Terrestre Integration](./hackfools/TERRESTRE_INTEGRATION.md) - Guia de integração

## Suporte

Para dúvidas ou problemas, verifique:
1. Logs do backend (terminal onde rodou uvicorn)
2. Console do navegador (F12 → Console)
3. Documentação dos endpoints (http://localhost:8000/docs)
