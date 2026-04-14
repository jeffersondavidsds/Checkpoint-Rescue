const { runQuery, getOne, getAll } = require('../config/database');
const { calcularStatusLotacao } = require('../utils/helpers');

/**
 * Model para operações relacionadas a voluntários
 */
const VoluntarioModel = {
  /**
   * Cria um novo voluntário
   */
  criar: async (dadosVoluntario) => {
    const {
      usuario_id,
      tipo_voluntario,
      // Resgate
      tipo_transporte,
      capacidade_pessoas,
      // Ceder espaço
      tipo_espaco,
      quantidade_quartos,
      tamanho_quintal,
      capacidade_total,
      ocupacao_atual,
      // Doação
      itens_disponiveis,
      quantidade,
      validade
    } = dadosVoluntario;

    // Calcular status de lotação para tipo 'ceder_espaco'
    let status_lotacao = null;
    if (tipo_voluntario === 'ceder_espaco' && capacidade_total) {
      status_lotacao = calcularStatusLotacao(ocupacao_atual || 0, capacidade_total);
    }

    const sql = `
      INSERT INTO voluntarios (
        usuario_id, tipo_voluntario, tipo_transporte, capacidade_pessoas,
        tipo_espaco, quantidade_quartos, tamanho_quintal, capacidade_total,
        ocupacao_atual, status_lotacao, itens_disponiveis, quantidade, validade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const resultado = await runQuery(sql, [
      usuario_id,
      tipo_voluntario,
      tipo_transporte || null,
      capacidade_pessoas || null,
      tipo_espaco || null,
      quantidade_quartos || null,
      tamanho_quintal || null,
      capacidade_total || null,
      ocupacao_atual || 0,
      status_lotacao,
      itens_disponiveis || null,
      quantidade || null,
      validade || null
    ]);

    return resultado.id;
  },

  /**
   * Busca voluntário por ID
   */
  buscarPorId: async (id) => {
    const sql = `
      SELECT v.*, u.nome, u.email, u.telefone, u.endereco, u.latitude, u.longitude
      FROM voluntarios v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ? AND u.ativo = 1
    `;
    return await getOne(sql, [id]);
  },

  /**
   * Busca voluntário por usuario_id
   */
  buscarPorUsuarioId: async (usuario_id) => {
    const sql = `
      SELECT v.*, u.nome, u.email, u.telefone, u.endereco, u.latitude, u.longitude
      FROM voluntarios v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.usuario_id = ? AND u.ativo = 1
    `;
    return await getOne(sql, [usuario_id]);
  },

  /**
   * Lista todos os voluntários
   */
  listarTodos: async (filtros = {}) => {
    let sql = `
      SELECT v.*, u.nome, u.email, u.telefone, u.endereco, u.latitude, u.longitude
      FROM voluntarios v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE u.ativo = 1
    `;
    const params = [];

    // Filtro por tipo de voluntário
    if (filtros.tipo) {
      sql += ' AND v.tipo_voluntario = ?';
      params.push(filtros.tipo);
    }

    // Filtro por disponibilidade
    if (filtros.disponivel !== undefined) {
      sql += ' AND v.disponibilidade = ?';
      params.push(filtros.disponivel ? 'disponivel' : 'indisponivel');
    }

    // Filtro por status de lotação (para ceder_espaco)
    if (filtros.status_lotacao) {
      sql += ' AND v.status_lotacao = ?';
      params.push(filtros.status_lotacao);
    }

    sql += ' ORDER BY v.data_criacao DESC';

    return await getAll(sql, params);
  },

  /**
   * Lista voluntários de resgate disponíveis
   */
  listarResgateDisponiveis: async () => {
    const sql = `
      SELECT v.*, u.nome, u.email, u.telefone, u.endereco, u.latitude, u.longitude
      FROM voluntarios v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.tipo_voluntario = 'resgate' 
        AND v.disponibilidade = 'disponivel'
        AND u.ativo = 1
      ORDER BY v.capacidade_pessoas DESC
    `;
    return await getAll(sql);
  },

  /**
   * Lista voluntários que cedem espaço
   */
  listarCederEspaco: async (status = null) => {
    let sql = `
      SELECT v.*, u.nome, u.email, u.telefone, u.endereco, u.latitude, u.longitude
      FROM voluntarios v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.tipo_voluntario = 'ceder_espaco' AND u.ativo = 1
    `;
    const params = [];

    if (status) {
      sql += ' AND v.status_lotacao = ?';
      params.push(status);
    }

    sql += ' ORDER BY v.status_lotacao, v.ocupacao_atual';

    return await getAll(sql, params);
  },

  /**
   * Lista voluntários que fazem doações
   */
  listarDoadores: async () => {
    const sql = `
      SELECT v.*, u.nome, u.email, u.telefone, u.endereco
      FROM voluntarios v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.tipo_voluntario = 'doacao' 
        AND v.disponibilidade = 'disponivel'
        AND u.ativo = 1
      ORDER BY v.data_criacao DESC
    `;
    return await getAll(sql);
  },

  /**
   * Atualiza dados do voluntário
   */
  atualizar: async (id, dadosAtualizacao) => {
    const camposPermitidos = [
      'disponibilidade', 'tipo_transporte', 'capacidade_pessoas',
      'tipo_espaco', 'quantidade_quartos', 'tamanho_quintal',
      'capacidade_total', 'ocupacao_atual', 'itens_disponiveis',
      'quantidade', 'validade'
    ];
    
    const campos = [];
    const valores = [];

    Object.keys(dadosAtualizacao).forEach(campo => {
      if (camposPermitidos.includes(campo)) {
        campos.push(`${campo} = ?`);
        valores.push(dadosAtualizacao[campo]);
      }
    });

    // Recalcular status de lotação se ocupação mudou
    if (dadosAtualizacao.ocupacao_atual !== undefined || dadosAtualizacao.capacidade_total !== undefined) {
      // Buscar dados atuais para ter todos os valores
      const voluntarioAtual = await this.buscarPorId(id);
      
      const ocupacao = dadosAtualizacao.ocupacao_atual ?? voluntarioAtual.ocupacao_atual;
      const capacidade = dadosAtualizacao.capacidade_total ?? voluntarioAtual.capacidade_total;
      
      if (capacidade) {
        const novoStatus = calcularStatusLotacao(ocupacao, capacidade);
        campos.push('status_lotacao = ?');
        valores.push(novoStatus);
      }
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    valores.push(id);

    const sql = `UPDATE voluntarios SET ${campos.join(', ')} WHERE id = ?`;
    return await runQuery(sql, valores);
  },

  /**
   * Atualiza ocupação de voluntário que cede espaço
   */
  atualizarOcupacao: async (id, novaOcupacao) => {
    const voluntario = await this.buscarPorId(id);
    
    if (!voluntario) {
      throw new Error('Voluntário não encontrado');
    }

    if (voluntario.tipo_voluntario !== 'ceder_espaco') {
      throw new Error('Apenas voluntários do tipo "ceder_espaco" podem ter ocupação atualizada');
    }

    const novoStatus = calcularStatusLotacao(novaOcupacao, voluntario.capacidade_total);

    const sql = `
      UPDATE voluntarios 
      SET ocupacao_atual = ?, status_lotacao = ? 
      WHERE id = ?
    `;
    
    return await runQuery(sql, [novaOcupacao, novoStatus, id]);
  },

  /**
   * Deleta voluntário
   */
  deletar: async (id) => {
    const sql = 'DELETE FROM voluntarios WHERE id = ?';
    return await runQuery(sql, [id]);
  }
};

module.exports = VoluntarioModel;
