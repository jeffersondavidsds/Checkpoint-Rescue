/**
 * Calcula o status de lotação baseado na ocupação atual e capacidade total
 * 
 * @param {number} ocupacaoAtual - Número de pessoas atualmente no local
 * @param {number} capacidadeTotal - Capacidade total do local
 * @returns {string} - Status: 'verde', 'azul', 'amarelo' ou 'vermelho'
 * 
 * Regras:
 * - Verde: 0% ocupado (completamente livre)
 * - Azul: 1% a 49% ocupado
 * - Amarelo: 50% a 79% ocupado
 * - Vermelho: 80% a 100% ocupado
 */
const calcularStatusLotacao = (ocupacaoAtual, capacidadeTotal) => {
  if (!capacidadeTotal || capacidadeTotal <= 0) {
    return 'verde';
  }

  const percentualOcupacao = (ocupacaoAtual / capacidadeTotal) * 100;

  if (percentualOcupacao === 0) {
    return 'verde';
  } else if (percentualOcupacao < 50) {
    return 'azul';
  } else if (percentualOcupacao < 80) {
    return 'amarelo';
  } else {
    return 'vermelho';
  }
};

/**
 * Valida se as coordenadas de latitude e longitude são válidas
 * 
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} - true se válidas, false caso contrário
 */
const validarCoordenadas = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }

  // Latitude: -90 a 90
  // Longitude: -180 a 180
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Valida formato de email
 * 
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida força da senha
 * Requisitos mínimos: 6 caracteres
 * 
 * @param {string} senha - Senha a ser validada
 * @returns {object} - { valida: boolean, mensagem: string }
 */
const validarSenha = (senha) => {
  if (!senha || senha.length < 6) {
    return {
      valida: false,
      mensagem: 'A senha deve ter no mínimo 6 caracteres'
    };
  }

  return {
    valida: true,
    mensagem: 'Senha válida'
  };
};

/**
 * Sanitiza string removendo caracteres perigosos
 * 
 * @param {string} str - String a ser sanitizada
 * @returns {string} - String sanitizada
 */
const sanitizarString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Formata data para o padrão brasileiro
 * 
 * @param {string|Date} data - Data a ser formatada
 * @returns {string} - Data formatada (DD/MM/YYYY HH:mm)
 */
const formatarData = (data) => {
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
};

/**
 * Calcula a distância entre duas coordenadas (em km)
 * Usando a fórmula de Haversine
 * 
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} - Distância em quilômetros
 */
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  
  return Math.round(distancia * 100) / 100; // Arredonda para 2 casas decimais
};

/**
 * Gera resposta de erro padronizada
 * 
 * @param {string} mensagem - Mensagem de erro
 * @param {number} status - Código HTTP de status
 * @returns {object} - Objeto de erro formatado
 */
const formatarErro = (mensagem, status = 400) => {
  return {
    erro: true,
    mensagem,
    status
  };
};

/**
 * Gera resposta de sucesso padronizada
 * 
 * @param {string} mensagem - Mensagem de sucesso
 * @param {object} dados - Dados a serem retornados
 * @returns {object} - Objeto de sucesso formatado
 */
const formatarSucesso = (mensagem, dados = null) => {
  const resposta = {
    sucesso: true,
    mensagem
  };

  if (dados) {
    resposta.dados = dados;
  }

  return resposta;
};

module.exports = {
  calcularStatusLotacao,
  validarCoordenadas,
  validarEmail,
  validarSenha,
  sanitizarString,
  formatarData,
  calcularDistancia,
  formatarErro,
  formatarSucesso
};
