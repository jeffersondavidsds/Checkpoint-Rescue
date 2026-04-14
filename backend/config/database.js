const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database.db');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados SQLite');
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Executa uma query e retorna uma Promise
 * @param {string} sql - Query SQL
 * @param {array} params - Parâmetros da query
 * @returns {Promise}
 */
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

/**
 * Busca um único registro
 * @param {string} sql - Query SQL
 * @param {array} params - Parâmetros da query
 * @returns {Promise}
 */
const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Busca múltiplos registros
 * @param {string} sql - Query SQL
 * @param {array} params - Parâmetros da query
 * @returns {Promise}
 */
const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  runQuery,
  getOne,
  getAll
};
