require('dotenv').config();
const { db } = require('../config/database');

/**
 * Inicializa o banco de dados criando todas as tabelas necessárias
 */
const initDatabase = () => {
  console.log('🔧 Inicializando banco de dados...');

  // SQL para criar todas as tabelas
  const createTableQueries = [
    // Tabela de usuários
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_usuario TEXT NOT NULL CHECK(tipo_usuario IN ('voluntario', 'abrigo', 'usuario_final')),
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      telefone TEXT,
      endereco TEXT,
      latitude REAL,
      longitude REAL,
      data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
      ativo INTEGER DEFAULT 1
    )`,

    // Índices para a tabela usuarios
    `CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`,
    `CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario)`,

    // Tabela de voluntários
    `CREATE TABLE IF NOT EXISTS voluntarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE,
      tipo_voluntario TEXT NOT NULL CHECK(tipo_voluntario IN ('resgate', 'ceder_espaco', 'doacao')),
      disponibilidade TEXT DEFAULT 'disponivel',
      
      -- Campos para tipo 'resgate'
      tipo_transporte TEXT CHECK(tipo_transporte IN ('carro', 'barco', 'jetski', 'a_pe', NULL)),
      capacidade_pessoas INTEGER,
      
      -- Campos para tipo 'ceder_espaco'
      tipo_espaco TEXT CHECK(tipo_espaco IN ('quarto', 'quintal', NULL)),
      quantidade_quartos INTEGER,
      tamanho_quintal TEXT,
      capacidade_total INTEGER,
      ocupacao_atual INTEGER DEFAULT 0,
      status_lotacao TEXT CHECK(status_lotacao IN ('verde', 'azul', 'amarelo', 'vermelho', NULL)),
      
      -- Campos para tipo 'doacao'
      itens_disponiveis TEXT,
      quantidade TEXT,
      validade TEXT,
      
      data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`,

    // Índices para a tabela voluntarios
    `CREATE INDEX IF NOT EXISTS idx_voluntarios_usuario ON voluntarios(usuario_id)`,
    `CREATE INDEX IF NOT EXISTS idx_voluntarios_tipo ON voluntarios(tipo_voluntario)`,
    `CREATE INDEX IF NOT EXISTS idx_voluntarios_disponibilidade ON voluntarios(disponibilidade)`,

    // Tabela de abrigos
    `CREATE TABLE IF NOT EXISTS abrigos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE,
      nome_organizacao TEXT NOT NULL,
      recursos_disponiveis TEXT,
      capacidade_total INTEGER NOT NULL,
      ocupacao_atual INTEGER DEFAULT 0,
      status_lotacao TEXT DEFAULT 'verde' CHECK(status_lotacao IN ('verde', 'azul', 'amarelo', 'vermelho')),
      endereco_completo TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
      ativo INTEGER DEFAULT 1,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`,

    // Índices para a tabela abrigos
    `CREATE INDEX IF NOT EXISTS idx_abrigos_usuario ON abrigos(usuario_id)`,
    `CREATE INDEX IF NOT EXISTS idx_abrigos_status ON abrigos(status_lotacao)`,
    `CREATE INDEX IF NOT EXISTS idx_abrigos_localizacao ON abrigos(latitude, longitude)`,

    // Tabela de solicitações
    `CREATE TABLE IF NOT EXISTS solicitacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo_solicitacao TEXT NOT NULL CHECK(tipo_solicitacao IN ('resgate', 'abrigo', 'doacao')),
      descricao TEXT NOT NULL,
      prioridade TEXT DEFAULT 'Media' CHECK(prioridade IN ('Baixa', 'Media', 'Alta', 'Urgente')),
      status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Em andamento', 'Concluida', 'Cancelada')),
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      data_solicitacao TEXT DEFAULT CURRENT_TIMESTAMP,
      voluntario_responsavel INTEGER,
      data_conclusao TEXT,
      observacoes TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (voluntario_responsavel) REFERENCES usuarios(id) ON DELETE SET NULL
    )`,

    // Índices para a tabela solicitacoes
    `CREATE INDEX IF NOT EXISTS idx_solicitacoes_usuario ON solicitacoes(usuario_id)`,
    `CREATE INDEX IF NOT EXISTS idx_solicitacoes_tipo ON solicitacoes(tipo_solicitacao)`,
    `CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status)`,
    `CREATE INDEX IF NOT EXISTS idx_solicitacoes_prioridade ON solicitacoes(prioridade)`,
    `CREATE INDEX IF NOT EXISTS idx_solicitacoes_localizacao ON solicitacoes(latitude, longitude)`
  ];

  // Executar todas as queries em sequência
  const executeQueries = (queries, index = 0) => {
    if (index >= queries.length) {
      console.log('✅ Banco de dados inicializado com sucesso!');
      console.log('📊 Tabelas criadas:');
      console.log('   - usuarios');
      console.log('   - voluntarios');
      console.log('   - abrigos');
      console.log('   - solicitacoes');
      
      // Fechar conexão se executado diretamente
      if (require.main === module) {
        db.close();
      }
      return;
    }

    db.run(queries[index], (err) => {
      if (err) {
        console.error(`❌ Erro ao executar query ${index + 1}:`, err.message);
        process.exit(1);
      }
      executeQueries(queries, index + 1);
    });
  };

  executeQueries(createTableQueries);
};

// Se executado diretamente
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
