const VoluntarioModel = require('../models/VoluntarioModel');
const { formatarErro, formatarSucesso } = require('../utils/helpers');

/**
 * Controller de Voluntários
 */
const VoluntarioController = {
  /**
   * Lista todos os voluntários (com filtros opcionais)
   * GET /api/voluntarios
   */
  listar: async (req, res) => {
    try {
      const { tipo, disponivel, status_lotacao } = req.query;

      const voluntarios = await VoluntarioModel.listarTodos({
        tipo,
        disponivel: disponivel === 'true',
        status_lotacao
      });

      return res.status(200).json(
        formatarSucesso('Voluntários listados com sucesso', { voluntarios })
      );

    } catch (error) {
      console.error('Erro ao listar voluntários:', error);
      return res.status(500).json(
        formatarErro('Erro ao listar voluntários: ' + error.message, 500)
      );
    }
  },

  /**
   * Busca um voluntário por ID
   * GET /api/voluntarios/:id
   */
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const voluntario = await VoluntarioModel.buscarPorId(id);

      if (!voluntario) {
        return res.status(404).json(
          formatarErro('Voluntário não encontrado')
        );
      }

      return res.status(200).json(
        formatarSucesso('Voluntário encontrado', { voluntario })
      );

    } catch (error) {
      console.error('Erro ao buscar voluntário:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar voluntário: ' + error.message, 500)
      );
    }
  },

  /**
   * Busca voluntário do usuário autenticado
   * GET /api/voluntarios/meu-perfil
   */
  meuPerfil: async (req, res) => {
    try {
      const usuario_id = req.usuario.id;

      const voluntario = await VoluntarioModel.buscarPorUsuarioId(usuario_id);

      if (!voluntario) {
        return res.status(404).json(
          formatarErro('Perfil de voluntário não encontrado')
        );
      }

      return res.status(200).json(
        formatarSucesso('Perfil encontrado', { voluntario })
      );

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json(
        formatarErro('Erro ao buscar perfil: ' + error.message, 500)
      );
    }
  },

  /**
   * Atualiza dados do voluntário
   * PUT /api/voluntarios/:id
   */
  atualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const voluntario = await VoluntarioModel.buscarPorId(id);

      if (!voluntario) {
        return res.status(404).json(
          formatarErro('Voluntário não encontrado')
        );
      }

      // Verificar se é o próprio voluntário
      if (voluntario.usuario_id !== req.usuario.id) {
        return res.status(403).json(
          formatarErro('Você só pode editar seu próprio perfil')
        );
      }

      await VoluntarioModel.atualizar(id, dadosAtualizacao);

      const voluntarioAtualizado = await VoluntarioModel.buscarPorId(id);

      return res.status(200).json(
        formatarSucesso('Voluntário atualizado com sucesso', { 
          voluntario: voluntarioAtualizado 
        })
      );

    } catch (error) {
      console.error('Erro ao atualizar voluntário:', error);
      return res.status(500).json(
        formatarErro('Erro ao atualizar voluntário: ' + error.message, 500)
      );
    }
  }
};

module.exports = VoluntarioController;
