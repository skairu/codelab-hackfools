# Dino Traffic Control — Backend

Backend em **FastAPI + SQLAlchemy** para o sistema de controle de tráfego de
dinossauros. Este backend mescla:

- o **CRUD de dinossauros** original (banco SQLite via SQLAlchemy);
- o **motor de simulação** (movimenta os dinos sobre um grafo de ruas e
  evolui fome/estresse/status a cada "tick");
- o **motor de roteamento** (calcula a rota do usuário penalizando vias
  próximas de dinos, e recalcula sozinho quando um dino perigoso se
  aproxima da rota ativa);
- um **endpoint WebSocket**, que transmite as posições em tempo real e
  empurra o recálculo automático de rota para quem estiver acompanhando.

> O front-end incluído no zip original não faz parte desta entrega — a
> integração aqui é pensada para qualquer front-end que fale HTTP + WebSocket
> com os contratos descritos abaixo.

---

## 1. Instalação

Requer Python 3.10+ (usa `str | None`, sintaxe de union types).

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Rodando a API

```bash
uvicorn main:app --reload
```

- A API sobe em `http://localhost:8000`.
- Documentação interativa (Swagger) em `http://localhost:8000/docs`.
- Um banco SQLite (`dinosaurs.db`) é criado automaticamente na primeira
  execução, na pasta do projeto.
- Se o banco estiver vazio, o servidor **popula automaticamente 25 dinos**
  aleatórios ao subir (ver `NUM_DINOS` em `config.py`), para já haver algo
  se movendo assim que você conectar.
- A simulação roda em background (uma tarefa `asyncio`) a cada `TICK_SECONDS`
  (padrão: 3s), atualizando o banco e fazendo broadcast via WebSocket.

Para reiniciar do zero, basta apagar o arquivo `dinosaurs.db` e subir a API
de novo.

## 3. Rodando o WebSocket

O WebSocket **não é um servidor separado** — ele roda dentro da mesma
aplicação FastAPI/uvicorn do passo 2. Basta a API estar de pé.

- **URL:** `ws://localhost:8000/ws/{client_id}`
- `client_id` é escolhido pelo front-end (ex: um UUID gerado por sessão de
  navegador) e deve ser **o mesmo** usado depois em `POST /route`, para que o
  backend saiba para qual conexão empurrar o recálculo automático daquela
  rota específica.

Assim que a conexão abre, o servidor já manda um snapshot inicial (não é
preciso esperar o próximo tick). A partir daí, chegam duas categorias de
mensagem, sempre no formato `{"type": ..., "data": ...}`:

### `dinos_update` (broadcast, todo tick)

Enviada para **todos os clientes conectados** a cada tick da simulação —
alimenta os dinos se movendo no mapa.

```json
{
  "type": "dinos_update",
  "data": [
    {
      "id": 1,
      "specie": "Velociraptor",
      "type": "carnivore",
      "status": "calm",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "speed": 3.2,
      "hunger": 24.5,
      "stress": 12.1
    }
  ]
}
```

`status` pode ser `"calm"`, `"stressed"` ou `"aggressive"`.

### `route_update` (só para o dono da rota, quando necessário)

Enviada **apenas para o `client_id`** cuja rota ativa foi ameaçada por um
dino estressado/agressivo (ou por uma via interditada) e precisou ser
recalculada. A maioria dos clientes, na maioria dos ticks, não recebe nada
disso — é uma abordagem orientada a evento, não polling.

```json
{
  "type": "route_update",
  "data": {
    "path": ["r0_c0", "r0_c1", "r0_c2"],
    "coordinates": [{"lat": -23.55, "lon": -46.63}, ...],
    "distance_m": 450.0,
    "duration_s": 56.3,
    "computed_at": 1737000000.123
  }
}
```

A conexão é majoritariamente de saída (servidor → cliente); o servidor
apenas mantém a conexão viva escutando mensagens do cliente (não é
obrigatório o front-end mandar nada).

## 4. Como conectar o front-end

Fluxo típico de uso:

1. Ao carregar a página, gere um `client_id` (ex: `crypto.randomUUID()`) e
   guarde-o na sessão do usuário.
2. Abra o WebSocket: `ws://localhost:8000/ws/{client_id}`. Escute mensagens
   `dinos_update` para desenhar/mover os dinos no mapa.
3. Busque `GET /graph` uma vez para desenhar a malha viária base (nós e
   arestas com lat/lon).
4. Quando o usuário escolher origem/destino (ex: clicando em dois nós do
   mapa), chame `POST /route` com `client_id`, `origin_node` e
   `destination_node`. A resposta já traz a rota calculada.
5. A partir daí, apenas escute o WebSocket: se um dino perigoso se aproximar
   da rota, o backend recalcula sozinho e manda `route_update` — não é
   preciso o front-end voltar a chamar `POST /route`.
6. Ao sair da tela de navegação (ou trocar de rota), chame
   `DELETE /route/{client_id}` para parar o monitoramento automático.

Exemplo mínimo em JavaScript:

```javascript
const clientId = crypto.randomUUID();
const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === "dinos_update") {
    // atualizar posição dos dinos no mapa
  } else if (type === "route_update") {
    // redesenhar a rota do usuário
  }
};

// depois que o usuário escolher origem/destino:
await fetch("http://localhost:8000/route", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    client_id: clientId,
    origin_node: "r0_c0",
    destination_node: "r7_c7",
  }),
});
```

## 5. Endpoints REST

### Dinossauros (CRUD)

| Método | Rota                  | Descrição                                                   |
|--------|------------------------|--------------------------------------------------------------|
| POST   | `/dinosaurs`           | Cria um dinossauro (é automaticamente encaixado na malha viária mais próxima) |
| GET    | `/dinosaurs`           | Lista todos os dinossauros                                   |
| GET    | `/dinosaurs/{id}`      | Detalhe de um dinossauro                                     |
| PUT    | `/dinosaurs/{id}`      | Atualiza um dinossauro (se lat/lon mudar, ele é reencaixado na malha) |

Corpo esperado (`DinosaurCreate` / `DinosaurUpdate`):

```json
{
  "specie": "Triceratops",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "type": "herbivore",
  "status": "calm"
}
```

`type`: `"herbivore"` ou `"carnivore"`. `status`: `"calm"`, `"stressed"` ou
`"aggressive"`. Os campos `speed`, `hunger` e `stress` são gerenciados pelo
servidor (gerados na criação e depois evoluídos pela simulação a cada tick).

### Grafo de ruas

| Método | Rota      | Descrição                                                |
|--------|-----------|------------------------------------------------------------|
| GET    | `/graph`  | Retorna `{"nodes": [...], "edges": [...]}` do grafo de ruas |

### Rotas

| Método | Rota                   | Descrição                                     |
|--------|-------------------------|-------------------------------------------------|
| POST   | `/route`                | Calcula (e passa a monitorar) uma rota A→B      |
| DELETE | `/route/{client_id}`    | Para de monitorar a rota desse cliente          |

### Administração

| Método | Rota                | Descrição                                  |
|--------|----------------------|----------------------------------------------|
| POST   | `/admin/interdict`   | Bloqueia uma via manualmente (`node_a`/`node_b`) |
| DELETE | `/admin/interdict`   | Libera uma via                                |
| GET    | `/admin/alerts`      | Lista dinos estressados/agressivos            |

## 6. Estrutura do projeto

```
backend/
  main.py                 # monta a app, o loop de simulação e todos os endpoints
  database.py              # engine/sessão SQLAlchemy (SQLite)
  models.py                 # modelo Dinosaurs (tabela) + enums Type/Status
  schemas.py                 # modelos Pydantic de entrada/saída da API
  config.py                   # parâmetros ajustáveis (nº de dinos, tick, grid, raio de influência...)
  graph_builder.py             # gera o grafo sintético de ruas (grid com lat/lon)
  simulation.py                 # DinosaurSimulator: move os dinos e evolui fome/estresse/status
  routing.py                     # RoutingEngine: rota com peso dinâmico + recálculo automático
  websocket_manager.py            # ConnectionManager: broadcast e push por cliente
  requirements.txt
  README.md
```

## 7. Observações sobre escala e comportamento

- Os parâmetros em `config.py` (`NUM_DINOS=25`, `TICK_SECONDS=3`, grid 8x8)
  são calibrados para um protótipo (10–50 dinos, tempo real na casa de
  segundos). Para outra escala, esse é o primeiro arquivo a mexer.
- O grafo de ruas é um **grid sintético** (não usa OpenStreetMap), gerado em
  memória a cada subida do servidor — só as posições/estado dos dinos ficam
  persistidos no banco.
- Ao criar ou atualizar (via `PUT`) um dinossauro com um `latitude`/
  `longitude` fora da malha, ele é automaticamente encaixado no nó mais
  próximo do grafo, para poder se mover e participar do cálculo de rotas.
