# Localização em Tempo Real com Socket.IO

Este documento explica como usar a API de localização em tempo real implementada no backend.

## Tecnologias Utilizadas

- **Node.js** - Servidor backend
- **Socket.IO** - Comunicação em tempo real
- **OpenStreetMap** - Tiles de mapa via proxy
- **Leaflet** - Framework de mapas (frontend)

## Funcionalidades

### 1. Comunicação em Tempo Real
- Compartilhamento de localizações via WebSocket
- Atualização automática de posições
- Salas para comunicação em grupo
- Autenticação JWT obrigatória

### 2. API REST
- Endpoints para obter localizações ativas
- Busca de localizações próximas
- Estatísticas do serviço
- Proxy para tiles OpenStreetMap

### 3. GPS Integration
- Suporte a `navigator.geolocation`
- Precisão configurável
- Cache inteligente de localizações

## Endpoints REST

### Localizações em Tempo Real

```http
GET /api/mapa/realtime
Authorization: Bearer TOKEN
```

Retorna todas as localizações ativas dos usuários conectados.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "userId": 123,
        "latitude": -22.9068,
        "longitude": -43.1729,
        "accuracy": 10,
        "timestamp": 1703123456789,
        "userInfo": {
          "nome": "João Silva",
          "tipo": "voluntario",
          "status": "ativo"
        },
        "lastUpdate": "2023-12-20T10:30:56.789Z"
      }
    ],
    "count": 1,
    "timestamp": "2023-12-20T10:30:56.789Z"
  }
}
```

### Estatísticas

```http
GET /api/mapa/realtime/stats
Authorization: Bearer TOKEN
```

Retorna estatísticas do serviço de localização.

### Localizações Próximas

```http
GET /api/mapa/realtime/proximos?lat=-22.9068&lng=-43.1729&raio=10
Authorization: Bearer TOKEN
```

Retorna localizações próximas a uma coordenada.

### Tiles OpenStreetMap

```http
GET /api/mapa/tiles/{z}/{x}/{y}
```

Proxy para tiles do OpenStreetMap. Não requer autenticação.

## Eventos Socket.IO

### Conexão

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'SEU_JWT_TOKEN'
  }
});
```

### Eventos de Envio

#### Atualizar Localização
```javascript
socket.emit('location-update', {
  latitude: -22.9068,
  longitude: -43.1729,
  accuracy: 10,
  timestamp: Date.now()
});
```

#### Solicitar Localizações Próximas
```javascript
socket.emit('request-nearby-locations', {
  latitude: -22.9068,
  longitude: -43.1729,
  radiusKm: 10
});
```

#### Compartilhar Localização
```javascript
socket.emit('share-location', {
  targetUserId: 456,
  location: {
    latitude: -22.9068,
    longitude: -43.1729
  }
});
```

#### Entrar em Sala
```javascript
socket.emit('join-room', 'sala-emergencia-rio');
```

#### Solicitar Todas as Localizações
```javascript
socket.emit('get-all-locations');
```

#### Ping
```javascript
socket.emit('ping');
```

### Eventos de Recebimento

#### Localização Atualizada
```javascript
socket.on('location-updated', (data) => {
  console.log('Sua localização foi atualizada:', data);
});
```

#### Localização de Outro Usuário
```javascript
socket.on('user-location-updated', (data) => {
  console.log('Usuário atualizou localização:', data);
  // data: { userId, location, userInfo }
});
```

#### Localizações Próximas
```javascript
socket.on('nearby-locations', (data) => {
  console.log('Localizações próximas:', data);
  // data: { locations, center, radiusKm, count }
});
```

#### Todas as Localizações
```javascript
socket.on('all-locations', (data) => {
  console.log('Todas as localizações:', data);
  // data: { locations, count, timestamp }
});
```

#### Localização Compartilhada
```javascript
socket.on('location-shared', (data) => {
  console.log('Localização compartilhada:', data);
  // data: { fromUserId, fromUserInfo, location, timestamp }
});
```

## Exemplo Completo de Frontend

Veja o arquivo `FRONTEND_SOCKET_EXAMPLE.js` para um exemplo completo de implementação no frontend usando:

- Socket.IO Client
- navigator.geolocation
- Leaflet para mapas
- Gerenciamento de eventos

## Configuração

### Backend

1. Instalar dependências:
```bash
cd backend
npm install
```

2. Configurar variáveis de ambiente em `backend/.env`:
```env
GOOGLE_MAPS_API_KEY=AIzaSyCGluqWargFyChOHOp8iPWnf2kHsV0F3oY
JWT_SECRET=sua_chave_jwt
```

3. Iniciar servidor:
```bash
npm run dev
```

### Frontend

1. Instalar dependências:
```bash
npm install socket.io-client leaflet
```

2. Implementar conforme exemplo em `FRONTEND_SOCKET_EXAMPLE.js`

## Segurança

- Todas as conexões Socket.IO requerem autenticação JWT
- Tokens são validados em cada conexão
- Localizações são armazenadas apenas em memória (não persistidas)
- Limpeza automática de usuários inativos (>30min)
- CORS configurado para origem do frontend

## Limitações

- Localizações são armazenadas apenas em memória (reiniciam com servidor)
- Máximo 30 minutos de inatividade antes de remoção
- Sem persistência de histórico de localizações
- Rate limiting não implementado (recomendado para produção)

## Próximos Passos

- Implementar persistência de localizações no banco
- Adicionar rate limiting
- Implementar geofencing
- Adicionar notificações push
- Otimizar para alta concorrência