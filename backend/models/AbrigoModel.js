const { runQuery, getOne, getAll } = require('../config/database');
const { calcularStatusLotacao } = require('../utils/helpers');

/**
 * Model para operações relacionadas a abrigos
 */
const AbrigoModel = {
  /**
   * Cria um novo abrigo
   */
  criar: async (dadosAbrigo) => {
    const {
      usuario_id,
      nome_organizacao,
      recursos_disponiveis,
      capacidade_total,
      ocupacao_atual,
      endereco_completo,
      latitude,
      longitude
    } = dadosAbrigo;

    // Calcular status de lotação
    const status_lotacao = calcularStatusLotacao(ocupacao_atual || 0, capacidade_total);

    const sql = `
      INSERT INTO abrigos (
        usuario_id, nome_organizacao, recursos_disponiveis,
        capacidade_total, ocupacao_atual, status_lotacao,
        endereco_completo, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const resultado = await runQuery(sql, [
      usuario_id,
      nome_organizacao,
      recursos_disponiveis || null,
      capacidade_total,
      ocupacao_atual || 0,
      status_lotacao,
      endereco_completo,
      latitude,
      longitude
    ]);

    return resultado.id;
  },

  /**
   * Busca abrigo por ID
   */
  buscarPorId: async (id) => {
    const sql = `
      SELECT a.*, u.nome, u.email, u.telefone
      FROM abrigos a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = ? AND a.ativo = 1 AND u.ativo = 1
    `;
    return await getOne(sql, [id]);
  },

  /**
   * Busca abrigo por usuario_id
   */
  buscarPorUsuarioId: async (usuario_id) => {
    const sql = `
      SELECT a.*, u.nome, u.email, u.telefone
      FROM abrigos a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.usuario_id = ? AND a.ativo = 1 AND u.ativo = 1
    `;
    return await getOne(sql, [usuario_id]);
  },

  /**
   * Lista todos os abrigos
   */
  listarTodos: async (filtros = {}) => {
    let sql = `
      SELECT a.*, u.nome, u.email, u.telefone
      FROM abrigos a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.ativo = 1 AND u.ativo = 1
    `;
    const params = [];

    // Filtro por status de lotação
    if (filtros.status) {
      sql += ' AND a.status_lotacao = ?';
      params.push(filtros.status);
    }

    // Filtro para apenas abrigos com vagas
    if (filtros.com_vagas) {
      sql += ' AND a.ocupacao_atual < a.capacidade_total';
    }

    sql += ' ORDER BY a.status_lotacao, a.ocupacao_atual';

    return await getAll(sql, params);
  },

  /**
   * Lista abrigos disponíveis (não lotados)
   */
  listarDisponiveis: async () => {
    const sql = `
      SELECT a.*, u.nome, u.email, u.telefone
      FROM abrigos a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.ocupacao_atual < a.capacidade_total 
        AND a.ativo = 1 
        AND u.ativo = 1
      ORDER BY a.status_lotacao, a.ocupacao_atual
    `;
    return await getAll(sql);
  },

  /**
   * Busca abrigos próximos a uma coordenada
   * (Nota: Para produção, considere usar extensões espaciais do SQLite)
   */
  buscarProximos: async (latitude, longitude, raioKm = 10) => {
    // Esta é uma aproximação simples. Para melhor precisão, use PostGIS ou similar
    const sql = `
      SELECT a.*, u.nome, u.email, u.telefone,
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(a.latitude)) *
            cos(radians(a.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(a.latitude))
          )
        ) AS distancia_km
      FROM abrigos a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.ativo = 1 AND u.ativo = 1
      HAVING distancia_km <= ?
      ORDER BY distancia_km
    `;
    
    return await getAll(sql, [latitude, longitude, latitude, raioKm]);
  },

  /**
   * Atualiza dados do abrigo
   */
  atualizar: async (id, dadosAtualizacao) => {
    const camposPermitidos = [
      'nome_organizacao', 'recursos_disponiveis', 'capacidade_total',
      'ocupacao_atual', 'endereco_completo', 'latitude', 'longitude'
    ];
    
    const campos = [];
    const valores = [];

    Object.keys(dadosAtualizacao).forEach(campo => {
      if (camposPermitidos.includes(campo)) {
        campos.push(`${campo} = ?`);
        valores.push(dadosAtualizacao[campo]);
      }
    });

    // Recalcular status de lotação se ocupação ou capacidade mudaram
    if (dadosAtualizacao.ocupacao_atual !== undefined || dadosAtualizacao.capacidade_total !== undefined) {
      const abrigoAtual = await this.buscarPorId(id);
      
      const ocupacao = dadosAtualizacao.ocupacao_atual ?? abrigoAtual.ocupacao_atual;
      const capacidade = dadosAtualizacao.capacidade_total ?? abrigoAtual.capacidade_total;
      
      const novoStatus = calcularStatusLotacao(ocupacao, capacidade);
      campos.push('status_lotacao = ?');
      valores.push(novoStatus);
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    valores.push(id);

    const sql = `UPDATE abrigos SET ${campos.join(', ')} WHERE id = ?`;
    return await runQuery(sql, valores);
  },

  /**
   * Atualiza ocupação do abrigo
   */
  atualizarOcupacao: async (id, novaOcupacao) => {
    const abrigo = await this.buscarPorId(id);
    
    if (!abrigo) {
      throw new Error('Abrigo não encontrado');
    }

    if (novaOcupacao > abrigo.capacidade_total) {
      throw new Error('Ocupação não pode exceder a capacidade total');
    }

    const novoStatus = calcularStatusLotacao(novaOcupacao, abrigo.capacidade_total);

    const sql = `
      UPDATE abrigos 
      SET ocupacao_atual = ?, status_lotacao = ? 
      WHERE id = ?
    `;
    
    return await runQuery(sql, [novaOcupacao, novoStatus, id]);
  },

  /**
   * Incrementa ocupação do abrigo
   */
  incrementarOcupacao: async (id, quantidade = 1) => {
    const abrigo = await this.buscarPorId(id);
    
    if (!abrigo) {
      throw new Error('Abrigo não encontrado');
    }

    const novaOcupacao = abrigo.ocupacao_atual + quantidade;

    if (novaOcupacao > abrigo.capacidade_total) {
      throw new Error('Abrigo não tem capacidade suficiente');
    }

    return await this.atualizarOcupacao(id, novaOcupacao);
  },

  /**
   * Decrementa ocupação do abrigo
   */
  decrementarOcupacao: async (id, quantidade = 1) => {
    const abrigo = await this.buscarPorId(id);
    
    if (!abrigo) {
      throw new Error('Abrigo não encontrado');
    }

    const novaOcupacao = Math.max(0, abrigo.ocupacao_atual - quantidade);
    
    return await this.atualizarOcupacao(id, novaOcupacao);
  },

  /**
   * Desativa abrigo (soft delete)
   */
  desativar: async (id) => {
    const sql = 'UPDATE abrigos SET ativo = 0 WHERE id = ?';
    return await runQuery(sql, [id]);
  },

  /**
   * Deleta abrigo permanentemente
   */
  deletar: async (id) => {
    const sql = 'DELETE FROM abrigos WHERE id = ?';
    return await runQuery(sql, [id]);
  },

  /**
   * Obtém estatísticas gerais dos abrigos
   */
  obterEstatisticas: async () => {
    const sql = `
      SELECT 
        COUNT(*) as total_abrigos,
        SUM(capacidade_total) as capacidade_total,
        SUM(ocupacao_atual) as ocupacao_total,
        SUM(capacidade_total - ocupacao_atual) as vagas_disponiveis,
        COUNT(CASE WHEN status_lotacao = 'verde' THEN 1 END) as abrigos_verdes,
        COUNT(CASE WHEN status_lotacao = 'azul' THEN 1 END) as abrigos_azuis,
        COUNT(CASE WHEN status_lotacao = 'amarelo' THEN 1 END) as abrigos_amarelos,
        COUNT(CASE WHEN status_lotacao = 'vermelho' THEN 1 END) as abrigos_vermelhos
      FROM abrigos
      WHERE ativo = 1
    `;
    
    return await getOne(sql);
  }
};

module.exports = AbrigoModel;
