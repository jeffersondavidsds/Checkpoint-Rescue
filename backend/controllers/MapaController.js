const AbrigoModel = require('../models/AbrigoModel');
const VoluntarioModel = require('../models/VoluntarioModel');
const SolicitacaoModel = require('../models/SolicitacaoModel');
const { formatarErro, formatarSucesso } = require('../utils/helpers');
const GoogleMapsService = require('../services/googleMapsService');
const realTimeLocationService = require('../services/realTimeLocationService');

/**
 * Controller do Mapa
 * Retorna dados de localização para visualização no mapa
 */
const MapaController = {
  /**
   * Retorna todas as localizações para exibir no mapa
   * GET /api/mapa
   */
  obterLocalizacoes: async (req, res) => {
    try {
      // Buscar todos os abrigos ativos
      const abrigos = await AbrigoModel.listarTodos();

      // Buscar voluntários que cedem espaço
      const voluntariosEspaco = await VoluntarioModel.listarCederEspaco();

      // Buscar solicitações pendentes
      const solicitacoesPendentes = await SolicitacaoModel.listarPendentes();

      // Formatar dados dos abrigos para o mapa
      const abrigosFormatados = abrigos.map(abrigo => ({
        id: abrigo.id,
        tipo: 'abrigo',
        nome: abrigo.nome_organizacao,
        latitude: abrigo.latitude,
        longitude: abrigo.longitude,
        endereco: abrigo.endereco_completo,
        status_lotacao: abrigo.status_lotacao,
        capacidade_total: abrigo.capacidade_total,
        ocupacao_atual: abrigo.ocupacao_atual,
        vagas_disponiveis: abrigo.capacidade_total - abrigo.ocupacao_atual,
        recursos: abrigo.recursos_disponiveis,
        contato: abrigo.telefone
      }));

      // Formatar dados dos voluntários que cedem espaço para o mapa
      const voluntariosFormatados = voluntariosEspaco.map(vol => ({
        id: vol.id,
        tipo: 'voluntario_espaco',
        nome: vol.nome,
        latitude: vol.latitude,
        longitude: vol.longitude,
        endereco: vol.endereco,
        status_lotacao: vol.status_lotacao,
        capacidade_total: vol.capacidade_total,
        ocupacao_atual: vol.ocupacao_atual,
        vagas_disponiveis: vol.capacidade_total - vol.ocupacao_atual,
        tipo_espaco: vol.tipo_espaco,
        contato: vol.telefone
      }));

      // Formatar solicitações pendentes para o mapa
      const solicitacoesFormatadas = solicitacoesPendentes.map(sol => ({
        id: sol.id,
        tipo: 'solicitacao',
        tipo_solicitacao: sol.tipo_solicitacao,
        latitude: sol.latitude,
        longitude: sol.longitude,
        prioridade: sol.prioridade,
        descricao: sol.descricao,
        solicitante: sol.solicitante_nome,
        contato: sol.solicitante_telefone,
        data: sol.data_solicitacao
      }));

      // Retornar todas as localizações
      return res.status(200).json(
        formatarSucesso('Localizações obtidas com sucesso', {
          abrigos: abrigosFormatados,
          voluntarios_espaco: voluntariosFormatados,
          solicitacoes_pendentes: solicitacoesFormatadas,
          resumo: {
            total_abrigos: abrigosFormatados.length,
            total_voluntarios_espaco: voluntariosFormatados.length,
            total_solicitacoes_pendentes: solicitacoesFormatadas.length
          }
        })
      );

    } catch (error) {
      console.error('Erro ao obter localizações:', error);
      return res.status(500).json(
        formatarErro('Erro ao obter localizações: ' + error.message, 500)
      );
    }
  },

  /**
   * Retorna localizações próximas a uma coordenada
   * GET /api/mapa/proximos?lat=-22.9068&lng=-43.1729&raio=10
   */
  obterProximos: async (req, res) => {
    try {
      const { lat, lng, raio } = req.query;

      if (!lat || !lng) {
        return res.status(400).json(
          formatarErro('Parâmetros obrigatórios: lat, lng')
        );
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const raioKm = raio ? parseFloat(raio) : 10;

      // Buscar abrigos próximos
      const abrigosProximos = await AbrigoModel.buscarProximos(latitude, longitude, raioKm);

      // Buscar solicitações próximas
      const solicitacoesProximas = await SolicitacaoModel.buscarProximas(latitude, longitude, raioKm);

      return res.status(200).json(
        formatarSucesso('Localizações próximas encontradas', {
          abrigos: abrigosProximos,
          solicitacoes: solicitacoesProximas,
          parametros: {
            latitude,
            longitude,
            raio_km: raioKm
          }
        })
      );

    } catch (error) {
      console.error('Erro ao buscar localizações próximas:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar localizações próximas: ' + error.message, 500)
      );
    }
  },

  geocodeAddress: async (req, res) => {
    try {
      const { address } = req.query;
      if (!address) {
        return res.status(400).json(formatarErro('Parâmetro obrigatório: address'));
      }

      const resultado = await GoogleMapsService.geocodeAddress(address);
      return res.status(200).json(
        formatarSucesso('Geocodificação realizada com sucesso', resultado)
      );
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error);
      return res.status(500).json(
        formatarErro('Erro ao geocodificar endereço: ' + error.message, 500)
      );
    }
  },

  reverseGeocode: async (req, res) => {
    try {
      const { lat, lng } = req.query;
      if (!lat || !lng) {
        return res.status(400).json(formatarErro('Parâmetros obrigatórios: lat, lng'));
      }

      const resultado = await GoogleMapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));
      return res.status(200).json(
        formatarSucesso('Reverse geocoding realizado com sucesso', resultado)
      );
    } catch (error) {
      console.error('Erro ao fazer reverse geocoding:', error);
      return res.status(500).json(
        formatarErro('Erro ao fazer reverse geocoding: ' + error.message, 500)
      );
    }
  },

  buscarLugaresProximos: async (req, res) => {
    try {
      const { lat, lng, raio, tipo } = req.query;
      if (!lat || !lng) {
        return res.status(400).json(formatarErro('Parâmetros obrigatórios: lat, lng'));
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const raioMetros = raio ? parseInt(raio, 10) : 1000;
      const resultado = await GoogleMapsService.buscarLugaresProximos(latitude, longitude, raioMetros, tipo);

      return res.status(200).json(
        formatarSucesso('Lugares próximos obtidos com sucesso', {
          lugares: resultado.results,
          status: resultado.status,
          next_page_token: resultado.next_page_token,
          parametros: {
            latitude,
            longitude,
            raio: raioMetros,
            tipo: tipo || 'shelter'
          }
        })
      );
    } catch (error) {
      console.error('Erro ao buscar lugares próximos:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar lugares próximos: ' + error.message, 500)
      );
    }
  },

  /**
   * Obtém todas as localizações ativas em tempo real
   * GET /api/mapa/realtime
   */
  obterLocalizacoesRealtime: async (req, res) => {
    try {
      const locations = realTimeLocationService.getAllActiveLocations();

      return res.status(200).json(
        formatarSucesso('Localizações em tempo real obtidas com sucesso', {
          locations,
          count: locations.length,
          timestamp: new Date()
        })
      );

    } catch (error) {
      console.error('Erro ao obter localizações em tempo real:', error);
      return res.status(500).json(
        formatarErro('Erro ao obter localizações em tempo real: ' + error.message, 500)
      );
    }
  },

  /**
   * Obtém estatísticas do serviço de localização em tempo real
   * GET /api/mapa/realtime/stats
   */
  obterStatsRealtime: async (req, res) => {
    try {
      const stats = realTimeLocationService.getStats();

      return res.status(200).json(
        formatarSucesso('Estatísticas obtidas com sucesso', {
          stats,
          timestamp: new Date()
        })
      );

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return res.status(500).json(
        formatarErro('Erro ao obter estatísticas: ' + error.message, 500)
      );
    }
  },

  /**
   * Obtém localizações próximas em tempo real
   * GET /api/mapa/realtime/proximos?lat=-22.9068&lng=-43.1729&raio=10
   */
  obterProximosRealtime: async (req, res) => {
    try {
      const { lat, lng, raio } = req.query;

      if (!lat || !lng) {
        return res.status(400).json(
          formatarErro('Parâmetros obrigatórios: lat, lng')
        );
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const raioKm = raio ? parseFloat(raio) : 10;

      const nearbyLocations = realTimeLocationService.getNearbyLocations(latitude, longitude, raioKm);

      return res.status(200).json(
        formatarSucesso('Localizações próximas em tempo real encontradas', {
          locations: nearbyLocations,
          center: { latitude, longitude },
          radiusKm,
          count: nearbyLocations.length,
          timestamp: new Date()
        })
      );

    } catch (error) {
      console.error('Erro ao buscar localizações próximas em tempo real:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar localizações próximas em tempo real: ' + error.message, 500)
      );
    }
  },

  /**
   * Proxy para tiles do OpenStreetMap
   * GET /api/mapa/tiles/:z/:x/:y
   */
  obterTileOpenStreetMap: async (req, res) => {
    try {
      const { z, x, y } = req.params;

      // Validar parâmetros
      if (!z || !x || !y) {
        return res.status(400).json(formatarErro('Parâmetros z, x, y são obrigatórios'));
      }

      // Validar formato dos parâmetros (devem ser números)
      const zoom = parseInt(z, 10);
      const tileX = parseInt(x, 10);
      const tileY = parseInt(y, 10);

      if (isNaN(zoom) || isNaN(tileX) || isNaN(tileY)) {
        return res.status(400).json(formatarErro('Parâmetros devem ser números'));
      }

      // Validar limites do zoom (0-19 para OpenStreetMap)
      if (zoom < 0 || zoom > 19) {
        return res.status(400).json(formatarErro('Zoom deve estar entre 0 e 19'));
      }

      // URL do tile do OpenStreetMap
      const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;

      // Fazer proxy da requisição
      const axios = require('axios');
      const response = await axios.get(tileUrl, {
        responseType: 'stream',
        timeout: 10000,
        headers: {
          'User-Agent': 'Checkpoint-Rescue-API/1.0'
        }
      });

      // Configurar headers de resposta
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Pipe do stream para a resposta
      response.data.pipe(res);

    } catch (error) {
      console.error('Erro ao obter tile OpenStreetMap:', error.message);

      if (error.response && error.response.status === 404) {
        return res.status(404).json(formatarErro('Tile não encontrado'));
      }

      return res.status(500).json(
        formatarErro('Erro ao obter tile: ' + error.message, 500)
      );
    }
  }
};

module.exports = MapaController;
