const express = require('express');
const router = express.Router();
const MapaController = require('../controllers/MapaController');
const { autenticar } = require('../middleware/auth');

/**
 * Rotas do Mapa
 * Todas as rotas requerem autenticação
 */

// GET /api/mapa - Obter todas as localizações para o mapa
router.get('/', autenticar, MapaController.obterLocalizacoes);

// GET /api/mapa/proximos - Buscar localizações próximas a uma coordenada
router.get('/proximos', autenticar, MapaController.obterProximos);

// GET /api/mapa/geocode - Geocodificar um endereço para lat/lng
router.get('/geocode', autenticar, MapaController.geocodeAddress);

// GET /api/mapa/reverse-geocode - Converter coordenadas em endereço
router.get('/reverse-geocode', autenticar, MapaController.reverseGeocode);

// GET /api/mapa/places - Buscar lugares próximos via Google Maps Places
router.get('/places', autenticar, MapaController.buscarLugaresProximos);

// GET /api/mapa/realtime - Obter todas as localizações ativas em tempo real
router.get('/realtime', autenticar, MapaController.obterLocalizacoesRealtime);

// GET /api/mapa/realtime/stats - Obter estatísticas do serviço em tempo real
router.get('/realtime/stats', autenticar, MapaController.obterStatsRealtime);

// GET /api/mapa/realtime/proximos - Buscar localizações próximas em tempo real
router.get('/realtime/proximos', autenticar, MapaController.obterProximosRealtime);

// GET /api/mapa/tiles/:z/:x/:y - Proxy para tiles OpenStreetMap
router.get('/tiles/:z/:x/:y', MapaController.obterTileOpenStreetMap);

module.exports = router;
