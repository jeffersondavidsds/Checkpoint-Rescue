const SolicitacaoModel = require('../models/SolicitacaoModel');
const { 
  validarCoordenadas,
  formatarErro,
  formatarSucesso 
} = require('../utils/helpers');

/**
 * Controller de Solicitações
 */
const SolicitacaoController = {
  /**
   * Cria uma nova solicitação
   * POST /api/solicitacoes
   */
  criar: async (req, res) => {
    try {
      const {
        tipo_solicitacao,
        descricao,
        prioridade,
        latitude,
        longitude
      } = req.body;

      const usuario_id = req.usuario.id;

      // Validações
      if (!tipo_solicitacao || !descricao || !latitude || !longitude) {
        return res.status(400).json(
          formatarErro('Campos obrigatórios: tipo_solicitacao, descricao, latitude, longitude')
        );
      }

      const tiposValidos = ['resgate', 'abrigo', 'doacao'];
      if (!tiposValidos.includes(tipo_solicitacao)) {
        return res.status(400).json(
          formatarErro('Tipo de solicitação inválido. Deve ser: resgate, abrigo ou doacao')
        );
      }

      if (!validarCoordenadas(latitude, longitude)) {
        return res.status(400).json(
          formatarErro('Coordenadas inválidas')
        );
      }

      // Criar solicitação
      const id = await SolicitacaoModel.criar({
        usuario_id,
        tipo_solicitacao,
        descricao,
        prioridade,
        latitude,
        longitude
      });

      const solicitacao = await SolicitacaoModel.buscarPorId(id);

      return res.status(201).json(
        formatarSucesso('Solicitação criada com sucesso', { solicitacao })
      );

    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      return res.status(500).json(
        formatarErro('Erro ao criar solicitação: ' + error.message, 500)
      );
    }
  },

  /**
   * Lista todas as solicitações (com filtros opcionais)
   * GET /api/solicitacoes
   */
  listar: async (req, res) => {
    try {
      const { tipo, status, prioridade, usuario_id } = req.query;

      const solicitacoes = await SolicitacaoModel.listarTodas({
        tipo,
        status,
        prioridade,
        usuario_id
      });

      return res.status(200).json(
        formatarSucesso('Solicitações listadas com sucesso', { solicitacoes })
      );

    } catch (error) {
      console.error('Erro ao listar solicitações:', error);
      return res.status(500).json(
        formatarErro('Erro ao listar solicitações: ' + error.message, 500)
      );
    }
  },

  /**
   * Busca uma solicitação por ID
   * GET /api/solicitacoes/:id
   */
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const solicitacao = await SolicitacaoModel.buscarPorId(id);

      if (!solicitacao) {
        return res.status(404).json(
          formatarErro('Solicitação não encontrada')
        );
      }

      return res.status(200).json(
        formatarSucesso('Solicitação encontrada', { solicitacao })
      );

    } catch (error) {
      console.error('Erro ao buscar solicitação:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar solicitação: ' + error.message, 500)
      );
    }
  },

  /**
   * Lista solicitações do usuário autenticado
   * GET /api/solicitacoes/minhas
   */
  listarMinhas: async (req, res) => {
    try {
      const usuario_id = req.usuario.id;

      const solicitacoes = await SolicitacaoModel.listarPorUsuario(usuario_id);

      return res.status(200).json(
        formatarSucesso('Suas solicitações', { solicitacoes })
      );

    } catch (error) {
      console.error('Erro ao listar solicitações:', error);
      return res.status(500).json(
        formatarErro('Erro ao listar solicitações: ' + error.message, 500)
      );
    }
  },

  /**
   * Atualiza uma solicitação
   * PUT /api/solicitacoes/:id
   */
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const solicitacao = await SolicitacaoModel.buscarPorId(id);

      if (!solicitacao) {
        return res.status(404).json(
          formatarErro('Solicitação não encontrada')
        );
      }

      // Verificar se o usuário tem permissão
      const tipo_usuario = req.usuario.tipo_usuario;
      const usuario_id = req.usuario.id;

      // Usuário final só pode editar suas próprias solicitações
      if (tipo_usuario === 'usuario_final' && solicitacao.usuario_id !== usuario_id) {
        return res.status(403).json(
          formatarErro('Você só pode editar suas próprias solicitações')
        );
      }

      await SolicitacaoModel.atualizar(id, dadosAtualizacao);

      const solicitacaoAtualizada = await SolicitacaoModel.buscarPorId(id);

      return res.status(200).json(
        formatarSucesso('Solicitação atualizada com sucesso', { 
          solicitacao: solicitacaoAtualizada 
        })
      );

    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      return res.status(500).json(
        formatarErro('Erro ao atualizar solicitação: ' + error.message, 500)
      );
    }
  },

  /**
   * Atribui um voluntário a uma solicitação
   * POST /api/solicitacoes/:id/atribuir
   */
  atribuirVoluntario: async (req, res) => {
    try {
      const { id } = req.params;
      const voluntario_id = req.usuario.id;

      const solicitacao = await SolicitacaoModel.buscarPorId(id);

      if (!solicitacao) {
        return res.status(404).json(
          formatarErro('Solicitação não encontrada')
        );
      }

      if (solicitacao.status !== 'Pendente') {
        return res.status(400).json(
          formatarErro('Esta solicitação já está sendo atendida ou foi concluída')
        );
      }

      await SolicitacaoModel.atribuirVoluntario(id, voluntario_id);

      const solicitacaoAtualizada = await SolicitacaoModel.buscarPorId(id);

      return res.status(200).json(
        formatarSucesso('Solicitação atribuída com sucesso', { 
          solicitacao: solicitacaoAtualizada 
        })
      );

    } catch (error) {
      console.error('Erro ao atribuir voluntário:', error);
      return res.status(500).json(
        formatarErro('Erro ao atribuir voluntário: ' + error.message, 500)
      );
    }
  },

  /**
   * Deleta uma solicitação
   * DELETE /api/solicitacoes/:id
   */
  deletar: async (req, res) => {
    try {
      const { id } = req.params;

      const solicitacao = await SolicitacaoModel.buscarPorId(id);

      if (!solicitacao) {
        return res.status(404).json(
          formatarErro('Solicitação não encontrada')
        );
      }

      // Verificar se o usuário tem permissão
      const tipo_usuario = req.usuario.tipo_usuario;
      const usuario_id = req.usuario.id;

      if (tipo_usuario === 'usuario_final' && solicitacao.usuario_id !== usuario_id) {
        return res.status(403).json(
          formatarErro('Você só pode deletar suas próprias solicitações')
        );
      }

      await SolicitacaoModel.deletar(id);

      return res.status(200).json(
        formatarSucesso('Solicitação deletada com sucesso')
      );

    } catch (error) {
      console.error('Erro ao deletar solicitação:', error);
      return res.status(500).json(
        formatarErro('Erro ao deletar solicitação: ' + error.message, 500)
      );
    }
  },

  /**
   * Obtém estatísticas gerais
   * GET /api/solicitacoes/estatisticas
   */
  estatisticas: async (req, res) => {
    try {
      const stats = await SolicitacaoModel.obterEstatisticas();

      return res.status(200).json(
        formatarSucesso('Estatísticas obtidas com sucesso', { estatisticas: stats })
      );

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return res.status(500).json(
        formatarErro('Erro ao obter estatísticas: ' + error.message, 500)
      );
    }
  }
};

module.exports = SolicitacaoController;
