require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { initDatabase } = require('./utils/initDatabase');
const socketHandlers = require('./socketHandlers');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const solicitacaoRoutes = require('./routes/solicitacaoRoutes');
const voluntarioRoutes = require('./routes/voluntarioRoutes');
const abrigoRoutes = require('./routes/abrigoRoutes');
const mapaRoutes = require('./routes/mapaRoutes');

// Criar aplicação Express e servidor HTTP
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES DE SEGURANÇA
// ==========================================

// Helmet - Adiciona headers de segurança
app.use(helmet());

// CORS - Permitir requisições do frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ==========================================
// MIDDLEWARES GERAIS
// ==========================================

// Parser de JSON
app.use(express.json({ limit: '10mb' }));

// Parser de URL encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições (ambiente de desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// INICIALIZAR BANCO DE DADOS
// ==========================================

initDatabase();

// Inicializar Socket.IO
socketHandlers(io);

// ==========================================
// ROTAS
// ==========================================

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: '🌊 Sistema de Gerenciamento de Enchentes - API',
    versao: '1.0.0',
    status: 'online',
    documentacao: '/api/info',
    endpoints: {
      autenticacao: '/api/auth',
      solicitacoes: '/api/solicitacoes',
      voluntarios: '/api/voluntarios',
      abrigos: '/api/abrigos',
      mapa: '/api/mapa'
    }
  });
});

// Informações da API
app.get('/api/info', (req, res) => {
  res.json({
    nome: 'Sistema de Gerenciamento de Enchentes',
    versao: '1.0.0',
    descricao: 'API para gerenciamento de voluntários, abrigos e solicitações durante enchentes',
    endpoints: {
      autenticacao: {
        registro: 'POST /api/auth/registro',
        login: 'POST /api/auth/login',
        verificar: 'GET /api/auth/verificar'
      },
      solicitacoes: {
        listar: 'GET /api/solicitacoes',
        criar: 'POST /api/solicitacoes',
        buscar: 'GET /api/solicitacoes/:id',
        atualizar: 'PUT /api/solicitacoes/:id',
        deletar: 'DELETE /api/solicitacoes/:id',
        minhas: 'GET /api/solicitacoes/minhas',
        atribuir: 'POST /api/solicitacoes/:id/atribuir',
        estatisticas: 'GET /api/solicitacoes/estatisticas'
      },
      voluntarios: {
        listar: 'GET /api/voluntarios',
        buscar: 'GET /api/voluntarios/:id',
        meuPerfil: 'GET /api/voluntarios/meu-perfil',
        atualizar: 'PUT /api/voluntarios/:id'
      },
      abrigos: {
        listar: 'GET /api/abrigos',
        buscar: 'GET /api/abrigos/:id',
        meuPerfil: 'GET /api/abrigos/meu-perfil',
        atualizar: 'PUT /api/abrigos/:id',
        estatisticas: 'GET /api/abrigos/estatisticas'
      },
      mapa: {
        obterLocalizacoes: 'GET /api/mapa',
        obterProximos: 'GET /api/mapa/proximos',
        geocode: 'GET /api/mapa/geocode?address=ENDERECO',
        reverseGeocode: 'GET /api/mapa/reverse-geocode?lat=LAT&lng=LNG',
        lugaresProximos: 'GET /api/mapa/places?lat=LAT&lng=LNG&raio=1000&tipo=shelter',
        realtimeLocations: 'GET /api/mapa/realtime',
        realtimeStats: 'GET /api/mapa/realtime/stats',
        realtimeNearby: 'GET /api/mapa/realtime/proximos?lat=LAT&lng=LNG&raio=10',
        openStreetMapTiles: 'GET /api/mapa/tiles/{z}/{x}/{y}'
      },
      socketio: {
        url: 'ws://localhost:' + PORT,
        auth: 'token no handshake.auth.token',
        events: {
          'location-update': '{latitude, longitude, accuracy?, timestamp?}',
          'request-nearby-locations': '{latitude, longitude, radiusKm?}',
          'share-location': '{targetUserId, location}',
          'join-room': 'roomId',
          'leave-room': 'void',
          'get-stats': 'void',
          'get-all-locations': 'void',
          'ping': 'void'
        }
      }
    },
    tipos_usuario: ['voluntario', 'abrigo', 'usuario_final'],
    tipos_voluntario: ['resgate', 'ceder_espaco', 'doacao'],
    tipos_solicitacao: ['resgate', 'abrigo', 'doacao'],
    prioridades: ['Baixa', 'Media', 'Alta', 'Urgente'],
    status_solicitacao: ['Pendente', 'Em andamento', 'Concluida', 'Cancelada'],
    status_lotacao: ['verde', 'azul', 'amarelo', 'vermelho']
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/solicitacoes', solicitacaoRoutes);
app.use('/api/voluntarios', voluntarioRoutes);
app.use('/api/abrigos', abrigoRoutes);
app.use('/api/mapa', mapaRoutes);

// ==========================================
// TRATAMENTO DE ERROS
// ==========================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    erro: true,
    mensagem: 'Rota não encontrada',
    status: 404,
    path: req.path
  });
});

// Handler de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    erro: true,
    mensagem: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    status: err.status || 500
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

server.listen(PORT, () => {
  console.log('');
  console.log('🌊 ====================================== 🌊');
  console.log('   Sistema de Gerenciamento de Enchentes');
  console.log('🌊 ====================================== 🌊');
  console.log('');
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api/info`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('');
  console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📡 Endpoints disponíveis:');
  console.log('   - POST /api/auth/registro');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/solicitacoes');
  console.log('   - GET  /api/voluntarios');
  console.log('   - GET  /api/abrigos');
  console.log('   - GET  /api/mapa');
  console.log('');
  console.log('🔌 Socket.IO: Ativo para localização em tempo real');
  console.log('🔒 Segurança: CORS, Helmet, JWT');
  console.log('');
  console.log('Pressione CTRL+C para parar o servidor');
  console.log('');
});

// Tratamento de sinais para shutdown gracioso
process.on('SIGTERM', () => {
  console.log('\n🛑 Servidor encerrando...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Servidor encerrando...');
  process.exit(0);
});

module.exports = app;
