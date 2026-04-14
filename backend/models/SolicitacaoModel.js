const { runQuery, getOne, getAll } = require('../config/database');

/**
 * Model para operações relacionadas a solicitações
 */
const SolicitacaoModel = {
  /**
   * Cria uma nova solicitação
   */
  criar: async (dadosSolicitacao) => {
    const {
      usuario_id,
      tipo_solicitacao,
      descricao,
      prioridade,
      latitude,
      longitude
    } = dadosSolicitacao;

    const sql = `
      INSERT INTO solicitacoes (
        usuario_id, tipo_solicitacao, descricao, 
        prioridade, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const resultado = await runQuery(sql, [
      usuario_id,
      tipo_solicitacao,
      descricao,
      prioridade || 'Media',
      latitude,
      longitude
    ]);

    return resultado.id;
  },

  /**
   * Busca solicitação por ID
   */
  buscarPorId: async (id) => {
    const sql = `
      SELECT s.*, 
        u.nome as solicitante_nome,
        u.email as solicitante_email,
        u.telefone as solicitante_telefone,
        v.nome as voluntario_nome
      FROM solicitacoes s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios v ON s.voluntario_responsavel = v.id
      WHERE s.id = ?
    `;
    return await getOne(sql, [id]);
  },

  /**
   * Lista todas as solicitações
   */
  listarTodas: async (filtros = {}) => {
    let sql = `
      SELECT s.*, 
        u.nome as solicitante_nome,
        u.email as solicitante_email,
        u.telefone as solicitante_telefone,
        v.nome as voluntario_nome
      FROM solicitacoes s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios v ON s.voluntario_responsavel = v.id
      WHERE 1=1
    `;
    const params = [];

    // Filtro por tipo
    if (filtros.tipo) {
      sql += ' AND s.tipo_solicitacao = ?';
      params.push(filtros.tipo);
    }

    // Filtro por status
    if (filtros.status) {
      sql += ' AND s.status = ?';
      params.push(filtros.status);
    }

    // Filtro por prioridade
    if (filtros.prioridade) {
      sql += ' AND s.prioridade = ?';
      params.push(filtros.prioridade);
    }

    // Filtro por usuário
    if (filtros.usuario_id) {
      sql += ' AND s.usuario_id = ?';
      params.push(filtros.usuario_id);
    }

    // Ordenação por prioridade e data
    sql += ` 
      ORDER BY 
        CASE s.prioridade
          WHEN 'Urgente' THEN 1
          WHEN 'Alta' THEN 2
          WHEN 'Media' THEN 3
          WHEN 'Baixa' THEN 4
        END,
        s.data_solicitacao DESC
    `;

    return await getAll(sql, params);
  },

  /**
   * Lista solicitações pendentes
   */
  listarPendentes: async () => {
    const sql = `
      SELECT s.*, 
        u.nome as solicitante_nome,
        u.email as solicitante_email,
        u.telefone as solicitante_telefone
      FROM solicitacoes s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.status = 'Pendente'
      ORDER BY 
        CASE s.prioridade
          WHEN 'Urgente' THEN 1
          WHEN 'Alta' THEN 2
          WHEN 'Media' THEN 3
          WHEN 'Baixa' THEN 4
        END,
        s.data_solicitacao DESC
    `;
    return await getAll(sql);
  },

  /**
   * Lista solicitações por tipo
   */
  listarPorTipo: async (tipo) => {
    const sql = `
      SELECT s.*, 
        u.nome as solicitante_nome,
        u.email as solicitante_email,
        u.telefone as solicitante_telefone,
        v.nome as voluntario_nome
      FROM solicitacoes s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios v ON s.voluntario_responsavel = v.id
      WHERE s.tipo_solicitacao = ?
      ORDER BY s.data_solicitacao DESC
    `;
    return await getAll(sql, [tipo]);
  },

  /**
   * Lista solicitações de um usuário específico
   */
  listarPorUsuario: async (usuario_id) => {
    const sql = `
      SELECT s.*, 
        v.nome as voluntario_nome
      FROM solicitacoes s
      LEFT JOIN usuarios v ON s.voluntario_responsavel = v.id
      WHERE s.usuario_id = ?
      ORDER BY s.data_solicitacao DESC
    `;
    return await getAll(sql, [usuario_id]);
  },

  /**
   * Lista solicitações atribuídas a um voluntário
   */
  listarPorVoluntario: async (voluntario_id) => {
    const sql = `
      SELECT s.*, 
        u.nome as solicitante_nome,
        u.email as solicitante_email,
        u.telefone as solicitante_telefone
      FROM solicitacoes s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.voluntario_responsavel = ?
      ORDER BY s.data_solicitacao DESC
    `;
    return await getAll(sql, [voluntario_id]);
  },

  /**
   * Busca solicitações próximas a uma coordenada
   */
  buscarProximas: async (latitude, longitude, raioKm = 10) => {
    const sql = `
      SELECT s.*, 
        u.nome as solicitante_nome,
        u.email as solicitante_email,
        u.telefone as solicitante_telefone,
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(s.latitude))
          )
        ) AS distancia_km
      FROM solicitacoes s
      INNER JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.status = 'Pendente'
      HAVING distancia_km <= ?
      ORDER BY 
        CASE s.prioridade
          WHEN 'Urgente' THEN 1
          WHEN 'Alta' THEN 2
          WHEN 'Media' THEN 3
          WHEN 'Baixa' THEN 4
        END,
        distancia_km
    `;
    
    return await getAll(sql, [latitude, longitude, latitude, raioKm]);
  },

  /**
   * Atualiza status da solicitação
   */
  atualizarStatus: async (id, novoStatus, voluntario_id = null) => {
    let sql = 'UPDATE solicitacoes SET status = ?';
    const params = [novoStatus];

    if (voluntario_id) {
      sql += ', voluntario_responsavel = ?';
      params.push(voluntario_id);
    }

    if (novoStatus === 'Concluida') {
      sql += ', data_conclusao = CURRENT_TIMESTAMP';
    }

    sql += ' WHERE id = ?';
    params.push(id);

    return await runQuery(sql, params);
  },

  /**
   * Atribui voluntário à solicitação
   */
  atribuirVoluntario: async (id, voluntario_id) => {
    const sql = `
      UPDATE solicitacoes 
      SET voluntario_responsavel = ?, status = 'Em andamento' 
      WHERE id = ?
    `;
    return await runQuery(sql, [voluntario_id, id]);
  },

  /**
   * Atualiza dados da solicitação
   */
  atualizar: async (id, dadosAtualizacao) => {
    const camposPermitidos = [
      'descricao', 'prioridade', 'status', 
      'voluntario_responsavel', 'observacoes'
    ];
    
    const campos = [];
    const valores = [];

    Object.keys(dadosAtualizacao).forEach(campo => {
      if (camposPermitidos.includes(campo)) {
        campos.push(`${campo} = ?`);
        valores.push(dadosAtualizacao[campo]);
      }
    });

    // Se mudou para Concluída, adicionar data de conclusão
    if (dadosAtualizacao.status === 'Concluida') {
      campos.push('data_conclusao = CURRENT_TIMESTAMP');
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    valores.push(id);

    const sql = `UPDATE solicitacoes SET ${campos.join(', ')} WHERE id = ?`;
    return await runQuery(sql, valores);
  },

  /**
   * Cancela solicitação
   */
  cancelar: async (id) => {
    const sql = `UPDATE solicitacoes SET status = 'Cancelada' WHERE id = ?`;
    return await runQuery(sql, [id]);
  },

  /**
   * Deleta solicitação
   */
  deletar: async (id) => {
    const sql = 'DELETE FROM solicitacoes WHERE id = ?';
    return await runQuery(sql, [id]);
  },

  /**
   * Obtém estatísticas gerais
   */
  obterEstatisticas: async () => {
    const sql = `
      SELECT 
        COUNT(*) as total_solicitacoes,
        COUNT(CASE WHEN status = 'Pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'Em andamento' THEN 1 END) as em_andamento,
        COUNT(CASE WHEN status = 'Concluida' THEN 1 END) as concluidas,
        COUNT(CASE WHEN tipo_solicitacao = 'resgate' THEN 1 END) as resgates,
        COUNT(CASE WHEN tipo_solicitacao = 'abrigo' THEN 1 END) as abrigos,
        COUNT(CASE WHEN tipo_solicitacao = 'doacao' THEN 1 END) as doacoes,
        COUNT(CASE WHEN prioridade = 'Urgente' THEN 1 END) as urgentes
      FROM solicitacoes
    `;
    
    return await getOne(sql);
  }
};

module.exports = SolicitacaoModel;
