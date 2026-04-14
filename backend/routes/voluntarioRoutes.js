const express = require('express');
const router = express.Router();
const VoluntarioController = require('../controllers/VoluntarioController');
const { autenticar } = require('../middleware/auth');

/**
 * Rotas de Voluntários
 * Todas as rotas requerem autenticação
 */

// GET /api/voluntarios/meu-perfil - Buscar perfil do voluntário autenticado
router.get('/meu-perfil', autenticar, VoluntarioController.meuPerfil);

// GET /api/voluntarios - Listar todos os voluntários (com filtros)
router.get('/', autenticar, VoluntarioController.listar);

// GET /api/voluntarios/:id - Buscar voluntário por ID
router.get('/:id', autenticar, VoluntarioController.buscarPorId);

// PUT /api/voluntarios/:id - Atualizar dados do voluntário
router.put('/:id', autenticar, VoluntarioController.atualizar);

module.exports = router;
