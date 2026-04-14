const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { autenticar } = require('../middleware/auth');

/**
 * Rotas de Autenticação
 */

// POST /api/auth/registro - Registrar novo usuário
router.post('/registro', AuthController.registro);

// POST /api/auth/login - Fazer login
router.post('/login', AuthController.login);

// GET /api/auth/verificar - Verificar se o token é válido (requer autenticação)
router.get('/verificar', autenticar, AuthController.verificarToken);

module.exports = router;
