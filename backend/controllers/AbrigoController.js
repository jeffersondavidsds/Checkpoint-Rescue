const AbrigoModel = require('../models/AbrigoModel');
const { formatarErro, formatarSucesso } = require('../utils/helpers');

/**
 * Controller de Abrigos
 */
const AbrigoController = {
  /**
   * Lista todos os abrigos (com filtros opcionais)
   * GET /api/abrigos
   */
  listar: async (req, res) => {
    try {
      const { status, com_vagas } = req.query;

      const abrigos = await AbrigoModel.listarTodos({
        status,
        com_vagas: com_vagas === 'true'
      });

      return res.status(200).json(
        formatarSucesso('Abrigos listados com sucesso', { abrigos })
      );

    } catch (error) {
      console.error('Erro ao listar abrigos:', error);
      return res.status(500).json(
        formatarErro('Erro ao listar abrigos: ' + error.message, 500)
      );
    }
  },

  /**
   * Busca um abrigo por ID
   * GET /api/abrigos/:id
   */
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const abrigo = await AbrigoModel.buscarPorId(id);

      if (!abrigo) {
        return res.status(404).json(
          formatarErro('Abrigo não encontrado')
        );
      }

      return res.status(200).json(
        formatarSucesso('Abrigo encontrado', { abrigo })
      );

    } catch (error) {
      console.error('Erro ao buscar abrigo:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar abrigo: ' + error.message, 500)
      );
    }
  },

  /**
   * Busca abrigo do usuário autenticado
   * GET /api/abrigos/meu-perfil
   */
  meuPerfil: async (req, res) => {
    try {
      const usuario_id = req.usuario.id;

      const abrigo = await AbrigoModel.buscarPorUsuarioId(usuario_id);

      if (!abrigo) {
        return res.status(404).json(
          formatarErro('Perfil de abrigo não encontrado')
        );
      }

      return res.status(200).json(
        formatarSucesso('Perfil encontrado', { abrigo })
      );

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar perfil: ' + error.message, 500)
      );
    }
  },

  /**
   * Atualiza dados do abrigo
   * PUT /api/abrigos/:id
   */
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const abrigo = await AbrigoModel.buscarPorId(id);

      if (!abrigo) {
        return res.status(404).json(
          formatarErro('Abrigo não encontrado')
        );
      }

      // Verificar se é o próprio abrigo
      if (abrigo.usuario_id !== req.usuario.id) {
        return res.status(403).json(
          formatarErro('Você só pode editar seu próprio perfil')
        );
      }

      await AbrigoModel.atualizar(id, dadosAtualizacao);

      const abrigoAtualizado = await AbrigoModel.buscarPorId(id);

      return res.status(200).json(
        formatarSucesso('Abrigo atualizado com sucesso', { 
          abrigo: abrigoAtualizado 
        })
      );

    } catch (error) {
      console.error('Erro ao atualizar abrigo:', error);
      return res.status(500).json(
        formatarErro('Erro ao atualizar abrigo: ' + error.message, 500)
      );
    }
  },

  /**
   * Obtém estatísticas gerais dos abrigos
   * GET /api/abrigos/estatisticas
   */
  estatisticas: async (req, res) => {
    try {
      const stats = await AbrigoModel.obterEstatisticas();

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

module.exports = AbrigoController;
