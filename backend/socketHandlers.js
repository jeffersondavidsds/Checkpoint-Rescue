const jwt = require('jsonwebtoken');
const realTimeLocationService = require('./services/realTimeLocationService');
const { formatarErro, formatarSucesso } = require('./utils/helpers');

/**
 * Handlers para eventos Socket.IO
 * Gerencia conexões em tempo real para localização
 */

const socketHandlers = (io) => {
  // Middleware de autenticação para Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Token de autenticação não fornecido'));
      }

      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adicionar dados do usuário ao socket
      socket.userId = decoded.id;
      socket.userInfo = {
        nome: decoded.nome,
        tipo: decoded.tipo,
        email: decoded.email
      };

      next();
    } catch (error) {
      console.error('Erro de autenticação Socket.IO:', error.message);
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Usuário ${socket.userId} conectado via Socket.IO`);

    // Registrar socketId no serviço
    realTimeLocationService.setUserSocket(socket.userId, socket.id);

    // ==========================================
    // EVENTOS DE LOCALIZAÇÃO
    // ==========================================

    /**
     * Atualizar localização do usuário
     * Dados esperados: { latitude, longitude, accuracy?, timestamp? }
     */
    socket.on('location-update', (locationData) => {
      try {
        if (!locationData || typeof locationData.latitude !== 'number' || typeof locationData.longitude !== 'number') {
          socket.emit('error', { message: 'Dados de localização inválidos' });
          return;
        }

        // Atualizar localização no serviço
        const userData = realTimeLocationService.updateUserLocation(
          socket.userId,
          locationData,
          socket.userInfo
        );

        // Confirmar atualização para o usuário
        socket.emit('location-updated', {
          success: true,
          location: userData.location,
          timestamp: userData.lastUpdate
        });

        // Broadcast para outros usuários na mesma sala (se aplicável)
        socket.to(socket.roomId || 'global').emit('user-location-updated', {
          userId: socket.userId,
          location: userData.location,
          userInfo: userData.userInfo
        });

        console.log(`📍 Localização atualizada: ${socket.userId} - ${locationData.latitude}, ${locationData.longitude}`);

      } catch (error) {
        console.error('Erro ao atualizar localização:', error);
        socket.emit('error', { message: 'Erro ao atualizar localização' });
      }
    });

    /**
     * Solicitar localizações próximas
     * Dados esperados: { latitude, longitude, radiusKm? }
     */
    socket.on('request-nearby-locations', (data) => {
      try {
        const { latitude, longitude, radiusKm = 10 } = data;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          socket.emit('error', { message: 'Coordenadas inválidas' });
          return;
        }

        const nearbyLocations = realTimeLocationService.getNearbyLocations(latitude, longitude, radiusKm);

        socket.emit('nearby-locations', {
          locations: nearbyLocations,
          center: { latitude, longitude },
          radiusKm,
          count: nearbyLocations.length
        });

      } catch (error) {
        console.error('Erro ao buscar localizações próximas:', error);
        socket.emit('error', { message: 'Erro ao buscar localizações próximas' });
      }
    });

    /**
     * Compartilhar localização com usuário específico
     */
    socket.on('share-location', (data) => {
      try {
        const { targetUserId, location } = data;

        if (!targetUserId || !location) {
          socket.emit('error', { message: 'Dados de compartilhamento inválidos' });
          return;
        }

        // Verificar se o usuário alvo está online
        const targetUser = realTimeLocationService.getUserLocation(targetUserId);
        if (!targetUser || !targetUser.socketId) {
          socket.emit('share-location-error', { message: 'Usuário não encontrado ou offline' });
          return;
        }

        // Enviar localização para o usuário alvo
        io.to(targetUser.socketId).emit('location-shared', {
          fromUserId: socket.userId,
          fromUserInfo: socket.userInfo,
          location: location,
          timestamp: new Date()
        });

        // Confirmar para o remetente
        socket.emit('location-shared-success', {
          targetUserId,
          location,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Erro ao compartilhar localização:', error);
        socket.emit('error', { message: 'Erro ao compartilhar localização' });
      }
    });

    // ==========================================
    // EVENTOS DE SALAS
    // ==========================================

    /**
     * Entrar em uma sala
     */
    socket.on('join-room', (roomId) => {
      try {
        if (!roomId || typeof roomId !== 'string') {
          socket.emit('error', { message: 'ID da sala inválido' });
          return;
        }

        // Sair da sala anterior se existir
        if (socket.roomId) {
          socket.leave(socket.roomId);
          realTimeLocationService.leaveRoom(socket.userId, socket.roomId);
        }

        // Entrar na nova sala
        socket.join(roomId);
        socket.roomId = roomId;
        realTimeLocationService.joinRoom(socket.userId, roomId);

        // Notificar outros na sala
        socket.to(roomId).emit('user-joined-room', {
          userId: socket.userId,
          userInfo: socket.userInfo,
          roomId
        });

        // Confirmar entrada
        socket.emit('room-joined', {
          roomId,
          userCount: realTimeLocationService.getRoomUsers(roomId).size
        });

        console.log(`🏠 Usuário ${socket.userId} entrou na sala ${roomId}`);

      } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        socket.emit('error', { message: 'Erro ao entrar na sala' });
      }
    });

    /**
     * Sair da sala atual
     */
    socket.on('leave-room', () => {
      try {
        if (socket.roomId) {
          socket.to(socket.roomId).emit('user-left-room', {
            userId: socket.userId,
            roomId: socket.roomId
          });

          socket.leave(socket.roomId);
          realTimeLocationService.leaveRoom(socket.userId, socket.roomId);
          socket.roomId = undefined;

          socket.emit('room-left', { success: true });
        }
      } catch (error) {
        console.error('Erro ao sair da sala:', error);
        socket.emit('error', { message: 'Erro ao sair da sala' });
      }
    });

    // ==========================================
    // EVENTOS GERAIS
    // ==========================================

    /**
     * Ping/Pong para manter conexão ativa
     */
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });

    /**
     * Solicitar estatísticas
     */
    socket.on('get-stats', () => {
      const stats = realTimeLocationService.getStats();
      socket.emit('stats', stats);
    });

    /**
     * Solicitar todas as localizações ativas
     */
    socket.on('get-all-locations', () => {
      const locations = realTimeLocationService.getAllActiveLocations();
      socket.emit('all-locations', {
        locations,
        count: locations.length,
        timestamp: new Date()
      });
    });

    // ==========================================
    // DESCONEXÃO
    // ==========================================

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Usuário ${socket.userId} desconectado: ${reason}`);

      // Sair da sala se estiver em uma
      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left-room', {
          userId: socket.userId,
          roomId: socket.roomId
        });
        realTimeLocationService.leaveRoom(socket.userId, socket.roomId);
      }

      // Remover do serviço de localização
      realTimeLocationService.removeUser(socket.userId);
    });
  });

  // ==========================================
  // LIMPEZA PERIÓDICA
  // ==========================================

  // Limpar usuários inativos a cada 10 minutos
  setInterval(() => {
    realTimeLocationService.cleanupInactiveUsers();
  }, 10 * 60 * 1000);

  console.log('🚀 Socket.IO handlers inicializados');
};

module.exports = socketHandlers;