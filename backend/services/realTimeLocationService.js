/**
 * Serviço de Localização em Tempo Real
 * Gerencia conexões Socket.IO para compartilhamento de localizações
 */

class RealTimeLocationService {
  constructor() {
    this.activeUsers = new Map(); // userId -> {socketId, location, lastUpdate, userInfo}
    this.rooms = new Map(); // roomId -> Set of userIds
  }

  /**
   * Adiciona ou atualiza localização de um usuário
   */
  updateUserLocation(userId, location, userInfo = {}) {
    const now = new Date();
    const userData = {
      socketId: null, // será definido quando conectar
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || null,
        timestamp: location.timestamp || now.getTime()
      },
      lastUpdate: now,
      userInfo: {
        nome: userInfo.nome || 'Usuário Anônimo',
        tipo: userInfo.tipo || 'usuario_final',
        status: userInfo.status || 'ativo',
        ...userInfo
      }
    };

    // Se já existe, preserva o socketId
    if (this.activeUsers.has(userId)) {
      const existing = this.activeUsers.get(userId);
      userData.socketId = existing.socketId;
    }

    this.activeUsers.set(userId, userData);

    console.log(`📍 Localização atualizada para usuário ${userId}: ${location.latitude}, ${location.longitude}`);

    return userData;
  }

  /**
   * Remove usuário ativo
   */
  removeUser(userId) {
    const userData = this.activeUsers.get(userId);
    if (userData) {
      this.activeUsers.delete(userId);
      console.log(`👋 Usuário ${userId} desconectado`);
    }
    return userData;
  }

  /**
   * Associa socketId a um usuário
   */
  setUserSocket(userId, socketId) {
    if (this.activeUsers.has(userId)) {
      this.activeUsers.get(userId).socketId = socketId;
    }
  }

  /**
   * Obtém localização de um usuário específico
   */
  getUserLocation(userId) {
    return this.activeUsers.get(userId) || null;
  }

  /**
   * Obtém todas as localizações ativas
   */
  getAllActiveLocations() {
    const locations = [];
    for (const [userId, userData] of this.activeUsers) {
      locations.push({
        userId,
        ...userData.location,
        userInfo: userData.userInfo,
        lastUpdate: userData.lastUpdate
      });
    }
    return locations;
  }

  /**
   * Obtém localizações próximas a uma coordenada
   */
  getNearbyLocations(latitude, longitude, radiusKm = 10) {
    const nearby = [];
    const radiusDegrees = radiusKm / 111.32; // Aproximação: 1 grau ≈ 111.32 km

    for (const [userId, userData] of this.activeUsers) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        userData.location.latitude,
        userData.location.longitude
      );

      if (distance <= radiusKm) {
        nearby.push({
          userId,
          distance,
          ...userData.location,
          userInfo: userData.userInfo,
          lastUpdate: userData.lastUpdate
        });
      }
    }

    return nearby.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calcula distância entre duas coordenadas (fórmula de Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converte graus para radianos
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Adiciona usuário a uma sala
   */
  joinRoom(userId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);
    console.log(`🏠 Usuário ${userId} entrou na sala ${roomId}`);
  }

  /**
   * Remove usuário de uma sala
   */
  leaveRoom(userId, roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(userId);
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
      console.log(`🏠 Usuário ${userId} saiu da sala ${roomId}`);
    }
  }

  /**
   * Obtém usuários em uma sala
   */
  getRoomUsers(roomId) {
    return this.rooms.get(roomId) || new Set();
  }

  /**
   * Limpa usuários inativos (mais de 30 minutos sem atualização)
   */
  cleanupInactiveUsers() {
    const now = new Date();
    const timeoutMs = 30 * 60 * 1000; // 30 minutos

    for (const [userId, userData] of this.activeUsers) {
      if (now - userData.lastUpdate > timeoutMs) {
        this.activeUsers.delete(userId);
        console.log(`🧹 Usuário ${userId} removido por inatividade`);
      }
    }
  }

  /**
   * Obtém estatísticas do serviço
   */
  getStats() {
    return {
      activeUsers: this.activeUsers.size,
      activeRooms: this.rooms.size,
      totalUsersInRooms: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.size, 0)
    };
  }
}

module.exports = new RealTimeLocationService();