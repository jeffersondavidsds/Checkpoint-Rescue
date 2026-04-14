const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const VoluntarioModel = require('../models/VoluntarioModel');
const AbrigoModel = require('../models/AbrigoModel');
const { 
  validarEmail, 
  validarSenha, 
  validarCoordenadas,
  formatarErro,
  formatarSucesso 
} = require('../utils/helpers');

/**
 * Controller de Autenticação
 */
const AuthController = {
  /**
   * Registra um novo usuário no sistema
   * POST /api/auth/registro
   */
  registro: async (req, res) => {
    try {
      const {
        tipo_usuario,
        nome,
        email,
        senha,
        telefone,
        endereco,
        latitude,
        longitude,
        // Dados específicos de voluntário
        tipo_voluntario,
        tipo_transporte,
        capacidade_pessoas,
        tipo_espaco,
        quantidade_quartos,
        tamanho_quintal,
        capacidade_total,
        ocupacao_atual,
        itens_disponiveis,
        quantidade,
        validade,
        // Dados específicos de abrigo
        nome_organizacao,
        recursos_disponiveis,
        endereco_completo
      } = req.body;

      // Validações básicas
      if (!tipo_usuario || !nome || !email || !senha) {
        return res.status(400).json(
          formatarErro('Campos obrigatórios: tipo_usuario, nome, email, senha')
        );
      }

      // Validar tipo de usuário
      const tiposValidos = ['voluntario', 'abrigo', 'usuario_final'];
      if (!tiposValidos.includes(tipo_usuario)) {
        return res.status(400).json(
          formatarErro('Tipo de usuário inválido. Deve ser: voluntario, abrigo ou usuario_final')
        );
      }

      // Validar email
      if (!validarEmail(email)) {
        return res.status(400).json(
          formatarErro('Email inválido')
        );
      }

      // Validar senha
      const validacaoSenha = validarSenha(senha);
      if (!validacaoSenha.valida) {
        return res.status(400).json(
          formatarErro(validacaoSenha.mensagem)
        );
      }

      // Verificar se email já existe
      const emailExiste = await UsuarioModel.emailExiste(email);
      if (emailExiste) {
        return res.status(409).json(
          formatarErro('Este email já está cadastrado')
        );
      }

      // Validar coordenadas se fornecidas
      if (latitude && longitude) {
        if (!validarCoordenadas(latitude, longitude)) {
          return res.status(400).json(
            formatarErro('Coordenadas inválidas')
          );
        }
      }

      // Criar usuário
      const usuario_id = await UsuarioModel.criar({
        tipo_usuario,
        nome,
        email,
        senha,
        telefone,
        endereco,
        latitude,
        longitude
      });

      // Criar registro específico baseado no tipo de usuário
      if (tipo_usuario === 'voluntario') {
        if (!tipo_voluntario) {
          // Reverter criação do usuário
          await UsuarioModel.deletar(usuario_id);
          return res.status(400).json(
            formatarErro('Campo obrigatório para voluntários: tipo_voluntario (resgate, ceder_espaco ou doacao)')
          );
        }

        await VoluntarioModel.criar({
          usuario_id,
          tipo_voluntario,
          tipo_transporte,
          capacidade_pessoas,
          tipo_espaco,
          quantidade_quartos,
          tamanho_quintal,
          capacidade_total,
          ocupacao_atual,
          itens_disponiveis,
          quantidade,
          validade
        });
      } else if (tipo_usuario === 'abrigo') {
        if (!nome_organizacao || !capacidade_total || !latitude || !longitude) {
          // Reverter criação do usuário
          await UsuarioModel.deletar(usuario_id);
          return res.status(400).json(
            formatarErro('Campos obrigatórios para abrigos: nome_organizacao, capacidade_total, latitude, longitude')
          );
        }

        await AbrigoModel.criar({
          usuario_id,
          nome_organizacao,
          recursos_disponiveis,
          capacidade_total,
          ocupacao_atual: ocupacao_atual || 0,
          endereco_completo: endereco_completo || endereco,
          latitude,
          longitude
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario_id, email, tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Buscar dados completos do usuário (sem senha)
      const usuario = await UsuarioModel.buscarPorIdSemSenha(usuario_id);

      return res.status(201).json(
        formatarSucesso('Usuário registrado com sucesso', {
          token,
          usuario
        })
      );

    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json(
        formatarErro('Erro ao registrar usuário: ' + error.message, 500)
      );
    }
  },

  /**
   * Realiza login do usuário
   * POST /api/auth/login
   */
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json(
          formatarErro('Email e senha são obrigatórios')
        );
      }

      // Buscar usuário por email
      const usuario = await UsuarioModel.buscarPorEmail(email);

      if (!usuario) {
        return res.status(401).json(
          formatarErro('Email ou senha incorretos')
        );
      }

      // Verificar senha
      const senhaValida = await UsuarioModel.verificarSenha(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json(
          formatarErro('Email ou senha incorretos')
        );
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipo_usuario: usuario.tipo_usuario 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remover senha do objeto de resposta
      delete usuario.senha;

      return res.status(200).json(
        formatarSucesso('Login realizado com sucesso', {
          token,
          usuario
        })
      );

    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json(
        formatarErro('Erro ao realizar login: ' + error.message, 500)
      );
    }
  },

  /**
   * Verifica se o token é válido e retorna dados do usuário
   * GET /api/auth/verificar
   */
  verificarToken: async (req, res) => {
    try {
      // O middleware já validou o token e adicionou req.usuario
      const usuario = await UsuarioModel.buscarPorIdSemSenha(req.usuario.id);

      if (!usuario) {
        return res.status(404).json(
          formatarErro('Usuário não encontrado')
        );
      }

      return res.status(200).json(
        formatarSucesso('Token válido', { usuario })
      );

    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(500).json(
        formatarErro('Erro ao verificar token: ' + error.message, 500)
      );
    }
  }
};

module.exports = AuthController;
