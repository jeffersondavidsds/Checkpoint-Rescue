const jwt = require('jsonwebtoken');
const { formatarErro } = require('../utils/helpers');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona os dados do usuário à requisição
 */
const autenticar = (req, res, next) => {
  try {
    // Buscar token no header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json(
        formatarErro('Token de autenticação não fornecido', 401)
      );
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json(
        formatarErro('Formato de token inválido', 401)
      );
    }

    const token = parts[1];

    // Verificar e decodificar o token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json(
          formatarErro('Token inválido ou expirado', 401)
        );
      }

      // Adicionar dados do usuário à requisição
      req.usuario = {
        id: decoded.id,
        email: decoded.email,
        tipo_usuario: decoded.tipo_usuario
      };

      next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json(
      formatarErro('Erro ao processar autenticação', 500)
    );
  }
};

/**
 * Middleware que verifica se o usuário é de um tipo específico
 * @param {...string} tiposPermitidos - Tipos de usuário permitidos
 */
const verificarTipoUsuario = (...tiposPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json(
        formatarErro('Usuário não autenticado', 401)
      );
    }

    if (!tiposPermitidos.includes(req.usuario.tipo_usuario)) {
      return res.status(403).json(
        formatarErro('Você não tem permissão para acessar este recurso', 403)
      );
    }

    next();
  };
};

/**
 * Middleware que verifica se o usuário está acessando seus próprios dados
 */
const verificarProprioUsuario = (req, res, next) => {
  const idRequisicao = parseInt(req.params.id);
  const idUsuarioAutenticado = req.usuario.id;

  if (idRequisicao !== idUsuarioAutenticado) {
    return res.status(403).json(
      formatarErro('Você só pode acessar seus próprios dados', 403)
    );
  }

  next();
};

module.exports = {
  autenticar,
  verificarTipoUsuario,
  verificarProprioUsuario
};
