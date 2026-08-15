# Sistema de Roteamento - Terrestre

## Visão Geral

O sistema de roteamento permite selecionar dois nós (origem e destino) no mapa do grid e calcular automaticamente a melhor rota entre eles, considerando as posições dos dinossauros. A rota é atualizada em tempo real conforme os dinossauros se movem.

## Arquitetura

### 1. Tipos de Dados (`src/types/dinosaur.ts`)

```typescript
interface RouteData {
  path: string[];                              // Array de IDs dos nós
  coordinates: Array<{ lat: number; lon: number }>; // Coordenadas geográficas
  distance_m: number;                         // Distância em metros
  duration_s: number;                         // Duração estimada em segundos
  computed_at: number;                        // Timestamp de cálculo
}
```

### 2. Hook de Estado (`src/hooks/useTerrialMap.ts`)

O hook `useTerrialMap` gerencia:

```typescript
interface MapState {
  graph: CityGraph | null;           // Grafo do grid
  dinosaurs: Dinosaur[];             // Lista de dinossauros
  loading: boolean;                  // Estado de carregamento
  error: string | null;              // Mensagens de erro
  wsConnected: boolean;              // Status da conexão WebSocket
  route: RouteData | null;           // Rota calculada
  selectedNodes: [string, string] | null; // Nós selecionados [origem, destino]
}
```

**Funções Retornadas:**

- `selectNode(nodeId: string)` - Seleciona um nó para origem ou destino
- `clearRoute()` - Limpa a rota e os nós selecionados

### 3. Componente de Mapa (`src/components/TerrestrialMap.tsx`)

#### Props

```typescript
interface TerrestrialMapProps {
  graph: CityGraph | null;
  dinosaurs: Dinosaur[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  route?: RouteData | null;                    // Nova
  selectedNodes?: [string, string] | null;    // Nova
  onNodeSelect?: (nodeId: string) => void;    // Nova
}
```

#### Funcionalidades

1. **Nós Clicáveis**: Cada nó do grid pode ser clicado para seleção
   - Cursor muda para `pointer` ao passar sobre nós
   - Nó de origem é destacado em VERDE (#52B788)
   - Nó de destino é destacado em VERMELHO (#EF4444)

2. **Desenho de Rota**: A rota calculada é exibida como:
   - Linha CIANO (#40E0D0) com glow
   - Ponto verde na origem
   - Ponto vermelho no destino
   - Pontos ciano nos nós intermediários

3. **Overlay Interativo**: Instruções em tempo real:
   - Etapa 1: "Clique no primeiro nó (origem)"
   - Etapa 2: "Clique no segundo nó (destino)"
   - Etapa 3: Mostra informações da rota calculada

### 4. Página Terrestre (`src/pages/Terrestre.tsx`)

#### Sidebar - Seção "Sistema de Roteamento"

Exibe:
- Nós selecionados (origem e destino)
- Distância da rota em km
- Tempo estimado em segundos
- Número de nós na rota
- Botão "LIMPAR ROTA"

## Fluxo de Uso

### 1. Seleção de Nós

```
Usuário clica em nó A
  ↓
selectNode("r0_c0") chamado
  ↓
selectedNodes = ["r0_c0"]
  ↓
Nó A destacado em VERDE
  ↓
Usuário clica em nó B
  ↓
selectNode("r7_c7") chamado
  ↓
selectedNodes = ["r0_c0", "r7_c7"]
```

### 2. Cálculo de Rota

```
selectedNodes.length === 2
  ↓
POST /route {
  client_id: "client_xxx",
  origin_node: "r0_c0",
  destination_node: "r7_c7"
}
  ↓
Backend calcula rota (considera dinossauros perigosos)
  ↓
Resposta com RouteData
  ↓
state.route = RouteData
```

### 3. Desenho e Exibição

```
Rota desenhada no mapa (linhas ciano)
  ↓
Sidebar mostra:
  - Distância: 3.45 km
  - Tempo: 145 s
  - Nós: 24
  ↓
Overlay mostra rota ativa com coordenadas selecionadas
```

### 4. Atualização em Tempo Real

```
Dinossauro perigoso se aproxima da rota
  ↓
Backend detecta ameaça
  ↓
WebSocket envia route_update
  ↓
Nova rota recalculada
  ↓
state.route atualizado
  ↓
Mapa redesenhado com nova rota
```

## Comunicação Backend

### POST /route

**Requisição:**
```json
{
  "client_id": "client_1234567890_abc123",
  "origin_node": "r0_c0",
  "destination_node": "r7_c7"
}
```

**Resposta:**
```json
{
  "path": ["r0_c0", "r0_c1", "r0_c2", ...],
  "coordinates": [
    {"lat": -23.5505, "lon": -46.6333},
    {"lat": -23.5506, "lon": -46.6332},
    ...
  ],
  "distance_m": 3450.0,
  "duration_s": 145.2,
  "computed_at": 1737000000.123
}
```

### DELETE /route/{client_id}

Para o monitoramento automático da rota.

### WebSocket route_update

**Mensagem:**
```json
{
  "type": "route_update",
  "data": {
    "path": ["r0_c0", "r0_c1", ...],
    "coordinates": [...],
    "distance_m": 3550.0,
    "duration_s": 150.5,
    "computed_at": 1737000003.456
  }
}
```

Enviada automaticamente quando a rota é ameaçada.

## Estados e Transições

```
STATE: SEM SELEÇÃO
├─ selectedNodes = null
├─ route = null
└─ Ação: Clique em nó A → selectNode("r0_c0")
           ↓

STATE: SELEÇÃO PARCIAL
├─ selectedNodes = ["r0_c0"]
├─ route = null
└─ Ação: Clique em nó B → selectNode("r7_c7")
           ↓

STATE: ROTA SELECIONADA
├─ selectedNodes = ["r0_c0", "r7_c7"]
├─ route = RouteData (desenhada no mapa)
└─ Ação 1: Clique em "LIMPAR ROTA" → clearRoute()
   Ação 2: WebSocket route_update → route atualizado
             ↓ (volta para ROTA SELECIONADA com novo caminho)
             
Ao chamar clearRoute():
├─ DELETE /route/{client_id} enviado ao backend
├─ selectedNodes = null
├─ route = null
└─ Volta para SEM SELEÇÃO
```

## Estilos e Cores

| Elemento | Cor | Hex | Uso |
|----------|-----|-----|-----|
| Nó Origem | Verde | #52B788 | Primeiro nó selecionado |
| Nó Destino | Vermelho | #EF4444 | Segundo nó selecionado |
| Rota | Ciano | #40E0D0 | Caminho calculado |
| Glow | Ciano | #40E0D0 | Efeito de luz na rota |
| Nó Normal | Verde Escuro | #074334 | Nó não selecionado |
| Borda | Verde Claro | #74C69D | Contorno do nó |

## Validações

- **Mesmo nó duas vezes**: Ignorado (não permite origem = destino)
- **Clique duplo**: Limpa seleção anterior e começa nova
- **Sem conexão**: Erro exibido no sidebar
- **Rota ameaçada**: Backend recalcula automaticamente

## Otimizações

1. **Memoização**: Nós, arestas e pixels calculados apenas quando necessário
2. **WebSocket**: Escuta apenas mensagens relevantes (route_update)
3. **Cleanup**: Rota deletada ao desmontar o componente
4. **Transição Suave**: Overlay mostra instruções progressivas

## Troubleshooting

### Nós não ficam clicáveis
- Verifique se `onNodeSelect` é passada para TerrestrialMap
- Verifique console para erros

### Rota não aparece
- Verifique se o backend está rodando em localhost:8000
- Verifique console para erros de API
- Verifique se o CORS está habilitado no backend

### Rota não atualiza em tempo real
- Verifique conexão WebSocket (sidebar mostra status)
- Verifique se há dinossauros perigosos na rota

### Erro ao calcular rota
- Pode ser que nós selecionados não estejam conectados
- Tente selecionar nós mais próximos
- Verifique console para detalhes do erro
