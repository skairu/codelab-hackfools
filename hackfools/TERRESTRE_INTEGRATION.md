# Integração Terrestre com Backend

## O que foi implementado

A página Terrestre.tsx foi completamente reescrita para integrar-se com o sistema de simulação do backend. O sistema agora funciona com um grid dinâmico de nós e arestas vindos da API do backend, com dinossauros sendo rastreados em tempo real via WebSocket.

## Arquivos criados/modificados

### 1. **`src/types/dinosaur.ts`** (novo)
Define todos os tipos TypeScript para:
- `Dinosaur`: Dados do dinossauro (id, specie, lat/lon, type, status, speed, hunger, stress)
- `GraphNode` e `GraphEdge`: Estruturas do grafo de ruas
- `CityGraph`: O grafo completo da cidade
- `WebSocketMessage`: Mensagens do WebSocket (dinos_update, route_update)

### 2. **`src/services/api.ts`** (novo)
Serviço singleton para comunicar com o backend:
- `getGraph()`: Busca o grafo completo das ruas
- `getDinosaurs()`: Busca todos os dinossauros
- `connectWebSocket()`: Conecta ao WebSocket e recebe atualizações em tempo real
- `calculateRoute()`: Calcula rota entre dois nós
- `deleteRoute()`: Para monitorar uma rota

### 3. **`src/hooks/useTerrialMap.ts`** (novo)
Hook React personalizado que:
- Gera um client_id único para a sessão
- Gerencia o estado (grafo, dinossauros, conexão WebSocket)
- Carrega dados do backend ao montar
- Atualiza dinossauros em tempo real via WebSocket
- Faz cleanup ao desmontar

### 4. **`src/components/TerrestrialMap.tsx`** (novo)
Componente que renderiza o mapa:
- Renderiza o grid como um SVG interativo
- Mostra nós (interseções) como círculos
- Mostra arestas (ruas) como linhas
- Renderiza dinossauros com cores baseadas no status:
  - 🟢 Verde: Calmo
  - 🟡 Amarelo: Estressado
  - 🔴 Vermelho: Agressivo
- Mostra overlay com estatísticas em tempo real

### 5. **`src/pages/Terrestre.tsx`** (modificado)
Página principal agora:
- Usa o hook `useTerrialMap` para obter dados
- Renderiza sidebar com status do sistema
- Exibe estatísticas de dinossauros
- Mostra informações do grafo (nós e arestas)
- Exibe client_id
- Mostra status da conexão WebSocket

## Como funciona

```
1. Página carrega → useTerrialMap é executado
   ↓
2. Gera client_id único
   ↓
3. Busca GET /graph para obter o grafo (grid 8x8)
   ↓
4. Busca GET /dinosaurs para obter dinossauros iniciais
   ↓
5. Conecta ao WS /ws/{client_id}
   ↓
6. A cada tick do backend (3s), recebe dinos_update
   ↓
7. TerrestrialMap renderiza grid + dinossauros
```

## Configuração

### Backend deve estar rodando em:
```bash
http://localhost:8000
```

### Para iniciar:

1. **Backend (terminal 1):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

2. **Frontend (terminal 2):**
```bash
cd hackfools
npm run dev
```

## Dados do Grafo

O backend gera um grid 8x8 com:
- **Linhas:** 8
- **Colunas:** 8
- **Tamanho do bloco:** 150 metros
- **Centro:** São Paulo (-23.5505, -46.6333)
- **Nós:** r0_c0, r0_c1, ..., r7_c7
- **Total:** 64 nós, 112 arestas

## Dinossauros

- **Quantidade:** 25 por padrão
- **Espécies:** Tyrannosaurus rex, Velociraptor, Triceratops, Brachiosaurus, Stegosaurus
- **Status:** calm, stressed, aggressive
- **Atributos:** hunger (0-100), stress (0-100), speed (m/s)

## Próximas implementações

- [ ] Cálculo de rotas interativo (clique em dois nós)
- [ ] Busca de rota segura evitando dinossauros
- [ ] Rastreamento de rota do usuário
- [ ] Zoom/pan do mapa
- [ ] Filtros de dinossauros
- [ ] Alertas de dinossauros próximos
- [ ] Histórico de movimentos
