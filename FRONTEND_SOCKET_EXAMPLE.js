/**
 * EXEMPLO DE USO DO SOCKET.IO NO FRONTEND
 *
 * Este arquivo mostra como o frontend deve se conectar ao backend
 * para localização em tempo real usando Socket.IO
 *
 * Tecnologias: Socket.IO Client, navigator.geolocation
 */

// ==========================================
// INSTALAÇÃO NECESSÁRIA
// ==========================================
/*
npm install socket.io-client
*/

// ==========================================
// EXEMPLO DE IMPLEMENTAÇÃO NO FRONTEND
// ==========================================

/*
import io from 'socket.io-client';

// Classe para gerenciar localização em tempo real
class RealTimeLocationManager {
  constructor() {
    this.socket = null;
    this.userToken = localStorage.getItem('authToken'); // Token JWT
    this.isConnected = false;
    this.currentLocation = null;
    this.locationWatchId = null;
  }

  // Conectar ao servidor Socket.IO
  connect() {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000', {
      auth: {
        token: this.userToken
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  // Configurar listeners de eventos
  setupEventListeners() {
    // Conexão estabelecida
    this.socket.on('connect', () => {
      console.log('🔌 Conectado ao servidor em tempo real');
      this.isConnected = true;
      this.emit('connected');
    });

    // Erro de conexão
    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão:', error.message);
      this.isConnected = false;
      this.emit('connection-error', error);
    });

    // Localização atualizada com sucesso
    this.socket.on('location-updated', (data) => {
      console.log('📍 Localização atualizada:', data);
      this.currentLocation = data.location;
      this.emit('location-updated', data);
    });

    // Outro usuário atualizou localização
    this.socket.on('user-location-updated', (data) => {
      console.log('👤 Localização de usuário atualizada:', data);
      this.emit('user-location-updated', data);
    });

    // Receber localizações próximas
    this.socket.on('nearby-locations', (data) => {
      console.log('📍 Localizações próximas:', data);
      this.emit('nearby-locations', data);
    });

    // Receber todas as localizações ativas
    this.socket.on('all-locations', (data) => {
      console.log('🌍 Todas as localizações:', data);
      this.emit('all-locations', data);
    });

    // Localização compartilhada
    this.socket.on('location-shared', (data) => {
      console.log('📤 Localização compartilhada recebida:', data);
      this.emit('location-shared', data);
    });

    // Confirmação de compartilhamento
    this.socket.on('location-shared-success', (data) => {
      console.log('✅ Localização compartilhada com sucesso:', data);
      this.emit('location-shared-success', data);
    });

    // Entrada em sala
    this.socket.on('room-joined', (data) => {
      console.log('🏠 Entrou na sala:', data);
      this.emit('room-joined', data);
    });

    // Saída de sala
    this.socket.on('room-left', (data) => {
      console.log('🏠 Saiu da sala:', data);
      this.emit('room-left', data);
    });

    // Usuário entrou na sala
    this.socket.on('user-joined-room', (data) => {
      console.log('👥 Usuário entrou na sala:', data);
      this.emit('user-joined-room', data);
    });

    // Usuário saiu da sala
    this.socket.on('user-left-room', (data) => {
      console.log('👥 Usuário saiu da sala:', data);
      this.emit('user-left-room', data);
    });

    // Estatísticas
    this.socket.on('stats', (data) => {
      console.log('📊 Estatísticas:', data);
      this.emit('stats', data);
    });

    // Ping/Pong
    this.socket.on('pong', (data) => {
      console.log('🏓 Pong:', data);
    });

    // Erros
    this.socket.on('error', (error) => {
      console.error('❌ Erro do servidor:', error);
      this.emit('error', error);
    });

    // Desconexão
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });
  }

  // ==========================================
  // MÉTODOS PÚBLICOS
  // ==========================================

  // Iniciar monitoramento de GPS
  startLocationTracking(options = {}) {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation não suportada neste navegador');
      return false;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    const watchOptions = { ...defaultOptions, ...options };

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        // Enviar para o servidor
        this.updateLocation(locationData);
      },
      (error) => {
        console.error('❌ Erro ao obter localização:', error);
        this.emit('geolocation-error', error);
      },
      watchOptions
    );

    console.log('📍 Monitoramento de GPS iniciado');
    return true;
  }

  // Parar monitoramento de GPS
  stopLocationTracking() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
      console.log('📍 Monitoramento de GPS parado');
    }
  }

  // Atualizar localização manualmente
  updateLocation(locationData) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket não conectado');
      return;
    }

    this.socket.emit('location-update', locationData);
  }

  // Solicitar localizações próximas
  requestNearbyLocations(latitude, longitude, radiusKm = 10) {
    if (!this.socket?.connected) return;

    this.socket.emit('request-nearby-locations', {
      latitude,
      longitude,
      radiusKm
    });
  }

  // Compartilhar localização com usuário específico
  shareLocation(targetUserId, locationData) {
    if (!this.socket?.connected) return;

    this.socket.emit('share-location', {
      targetUserId,
      location: locationData
    });
  }

  // Entrar em uma sala
  joinRoom(roomId) {
    if (!this.socket?.connected) return;

    this.socket.emit('join-room', roomId);
  }

  // Sair da sala
  leaveRoom() {
    if (!this.socket?.connected) return;

    this.socket.emit('leave-room');
  }

  // Solicitar todas as localizações
  getAllLocations() {
    if (!this.socket?.connected) return;

    this.socket.emit('get-all-locations');
  }

  // Solicitar estatísticas
  getStats() {
    if (!this.socket?.connected) return;

    this.socket.emit('get-stats');
  }

  // Ping para manter conexão
  ping() {
    if (!this.socket?.connected) return;

    this.socket.emit('ping');
  }

  // Desconectar
  disconnect() {
    this.stopLocationTracking();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // ==========================================
  // SISTEMA DE EVENTOS
  // ==========================================

  eventListeners = {};

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Erro no callback do evento:', event, error);
        }
      });
    }
  }
}

// ==========================================
// EXEMPLO DE USO COM LEAFLET
// ==========================================

/*
import L from 'leaflet';

// Inicializar mapa
const map = L.map('map').setView([-22.9068, -43.1729], 13);

// Usar tiles do backend (OpenStreetMap)
L.tileLayer('/api/mapa/tiles/{z}/{x}/{y}', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Inicializar gerenciador de localização
const locationManager = new RealTimeLocationManager();

// Conectar ao servidor
locationManager.connect();

// Iniciar monitoramento de GPS
locationManager.startLocationTracking();

// Adicionar marcadores para localizações em tempo real
locationManager.on('all-locations', (data) => {
  // Limpar marcadores existentes
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Adicionar marcadores para cada localização
  data.locations.forEach(location => {
    const marker = L.marker([location.latitude, location.longitude])
      .addTo(map)
      .bindPopup(`${location.userInfo.nome}<br>Tipo: ${location.userInfo.tipo}`);

    // Adicionar ícone personalizado baseado no tipo
    const iconUrl = location.userInfo.tipo === 'voluntario'
      ? '/icons/voluntario.png'
      : '/icons/usuario.png';

    marker.setIcon(L.icon({
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    }));
  });
});

// Atualizar mapa quando localização do usuário mudar
locationManager.on('location-updated', (data) => {
  map.setView([data.location.latitude, data.location.longitude], 15);
});

// Solicitar localizações a cada 30 segundos
setInterval(() => {
  locationManager.getAllLocations();
}, 30000);

// Cleanup ao fechar página
window.addEventListener('beforeunload', () => {
  locationManager.disconnect();
});
*/

export default RealTimeLocationManager;