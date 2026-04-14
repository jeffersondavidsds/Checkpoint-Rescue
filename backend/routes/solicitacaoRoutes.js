const express = require('express');
const router = express.Router();
const SolicitacaoController = require('../controllers/SolicitacaoController');
const { autenticar } = require('../middleware/auth');

/**
 * Rotas de Solicitações
 * Todas as rotas requerem autenticação
 */

// GET /api/solicitacoes/estatisticas - Obter estatísticas
router.get('/estatisticas', autenticar, SolicitacaoController.estatisticas);

// GET /api/solicitacoes/minhas - Listar minhas solicitações
router.get('/minhas', autenticar, SolicitacaoController.listarMinhas);

// GET /api/solicitacoes - Listar todas as solicitações (com filtros)
router.get('/', autenticar, SolicitacaoController.listar);

// GET /api/solicitacoes/:id - Buscar solicitação por ID
router.get('/:id', autenticar, SolicitacaoController.buscarPorId);

// POST /api/solicitacoes - Criar nova solicitação
router.post('/', autenticar, SolicitacaoController.criar);

// POST /api/solicitacoes/:id/atribuir - Atribuir voluntário a uma solicitação
router.post('/:id/atribuir', autenticar, SolicitacaoController.atribuirVoluntario);

// PUT /api/solicitacoes/:id - Atualizar solicitação
router.put('/:id', autenticar, SolicitacaoController.atualizar);

// DELETE /api/solicitacoes/:id - Deletar solicitação
router.delete('/:id', autenticar, SolicitacaoController.deletar);

module.exports = router;
