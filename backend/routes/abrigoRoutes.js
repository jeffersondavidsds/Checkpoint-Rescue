const express = require('express');
const router = express.Router();
const AbrigoController = require('../controllers/AbrigoController');
const { autenticar } = require('../middleware/auth');

/**
 * Rotas de Abrigos
 * Todas as rotas requerem autenticação
 */

// GET /api/abrigos/estatisticas - Obter estatísticas gerais
router.get('/estatisticas', autenticar, AbrigoController.estatisticas);

// GET /api/abrigos/meu-perfil - Buscar perfil do abrigo autenticado
router.get('/meu-perfil', autenticar, AbrigoController.meuPerfil);

// GET /api/abrigos - Listar todos os abrigos (com filtros)
router.get('/', autenticar, AbrigoController.listar);

// GET /api/abrigos/:id - Buscar abrigo por ID
router.get('/:id', autenticar, AbrigoController.buscarPorId);

// PUT /api/abrigos/:id - Atualizar dados do abrigo
router.put('/:id', autenticar, AbrigoController.atualizar);

module.exports = router;
