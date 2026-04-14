const { runQuery, getOne, getAll } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Model para operações relacionadas a usuários
 */
const UsuarioModel = {
  /**
   * Cria um novo usuário
   */
  criar: async (dadosUsuario) => {
    const {
      tipo_usuario,
      nome,
      email,
      senha,
      telefone,
      endereco,
      latitude,
      longitude
    } = dadosUsuario;

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    const sql = `
      INSERT INTO usuarios (
        tipo_usuario, nome, email, senha, telefone, 
        endereco, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const resultado = await runQuery(sql, [
      tipo_usuario,
      nome,
      email,
      senhaHash,
      telefone || null,
      endereco || null,
      latitude || null,
      longitude || null
    ]);

    return resultado.id;
  },

  /**
   * Busca usuário por email
   */
  buscarPorEmail: async (email) => {
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND ativo = 1';
    return await getOne(sql, [email]);
  },

  /**
   * Busca usuário por ID
   */
  buscarPorId: async (id) => {
    const sql = 'SELECT * FROM usuarios WHERE id = ? AND ativo = 1';
    return await getOne(sql, [id]);
  },

  /**
   * Busca usuário por ID (sem retornar a senha)
   */
  buscarPorIdSemSenha: async (id) => {
    const sql = `
      SELECT id, tipo_usuario, nome, email, telefone, 
             endereco, latitude, longitude, data_criacao, ativo
      FROM usuarios 
      WHERE id = ? AND ativo = 1
    `;
    return await getOne(sql, [id]);
  },

  /**
   * Lista todos os usuários (sem senhas)
   */
  listarTodos: async () => {
    const sql = `
      SELECT id, tipo_usuario, nome, email, telefone, 
             endereco, latitude, longitude, data_criacao
      FROM usuarios 
      WHERE ativo = 1
      ORDER BY data_criacao DESC
    `;
    return await getAll(sql);
  },

  /**
   * Lista usuários por tipo
   */
  listarPorTipo: async (tipo) => {
    const sql = `
      SELECT id, tipo_usuario, nome, email, telefone, 
             endereco, latitude, longitude, data_criacao
      FROM usuarios 
      WHERE tipo_usuario = ? AND ativo = 1
      ORDER BY data_criacao DESC
    `;
    return await getAll(sql, [tipo]);
  },

  /**
   * Atualiza dados do usuário
   */
  atualizar: async (id, dadosAtualizacao) => {
    const camposPermitidos = ['nome', 'telefone', 'endereco', 'latitude', 'longitude'];
    const campos = [];
    const valores = [];

    // Construir query dinamicamente apenas com campos fornecidos
    Object.keys(dadosAtualizacao).forEach(campo => {
      if (camposPermitidos.includes(campo)) {
        campos.push(`${campo} = ?`);
        valores.push(dadosAtualizacao[campo]);
      }
    });

    if (campos.length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    valores.push(id);

    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
    return await runQuery(sql, valores);
  },

  /**
   * Atualiza a senha do usuário
   */
  atualizarSenha: async (id, novaSenha) => {
    const senhaHash = await bcrypt.hash(novaSenha, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const sql = 'UPDATE usuarios SET senha = ? WHERE id = ?';
    return await runQuery(sql, [senhaHash, id]);
  },

  /**
   * Desativa usuário (soft delete)
   */
  desativar: async (id) => {
    const sql = 'UPDATE usuarios SET ativo = 0 WHERE id = ?';
    return await runQuery(sql, [id]);
  },

  /**
   * Deleta usuário permanentemente
   */
  deletar: async (id) => {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    return await runQuery(sql, [id]);
  },

  /**
   * Verifica se a senha está correta
   */
  verificarSenha: async (senhaFornecida, senhaHash) => {
    return await bcrypt.compare(senhaFornecida, senhaHash);
  },

  /**
   * Verifica se email já existe
   */
  emailExiste: async (email) => {
    const sql = 'SELECT id FROM usuarios WHERE email = ?';
    const resultado = await getOne(sql, [email]);
    return !!resultado;
  }
};

module.exports = UsuarioModel;
