# 🚀 Instalação e Execução do Backend

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** (geralmente vem com o Node.js)

Para verificar se já tem instalado:
```bash
node --version
npm --version
```

---

## ⚙️ Instalação

### 1️⃣ Navegue até a pasta do backend
```bash
cd backend
```

### 2️⃣ Instale as dependências
```bash
npm install
```

Esta ação irá instalar todos os pacotes necessários:
- express
- sqlite3
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- helmet
- express-validator
- nodemon (dev)

---

## 🔧 Configuração

### Variáveis de Ambiente

O arquivo `.env` já está criado com valores padrão para desenvolvimento.

**⚠️ IMPORTANTE PARA PRODUÇÃO:**
- Altere o `JWT_SECRET` para uma chave forte e única
- Use `NODE_ENV=production`
- Configure adequadamente o `FRONTEND_URL`

**Gerar uma chave JWT segura:**
```bash
# No Linux/Mac
openssl rand -base64 32

# No Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Google Maps API (Opcional)

Se você quiser usar geocodificação no backend, obtenha uma chave da API do Google Maps:

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto
3. Ative a API "Maps JavaScript API"
4. Crie uma credencial (API Key)
5. Adicione a chave no arquivo `.env`:
```
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

**Nota:** O frontend também precisará de sua própria chave do Google Maps.

---

## ▶️ Execução

### Modo Desenvolvimento (com auto-reload)
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

O servidor estará disponível em: **http://localhost:3000**

---

## 🗄️ Banco de Dados

O banco de dados SQLite será criado **automaticamente** na primeira execução do servidor.

**Localização:** `backend/database.db`

### Inicializar manualmente (opcional)
```bash
npm run init-db
```

### Estrutura das Tabelas

O banco contém 4 tabelas principais:

1. **usuarios** - Dados básicos e autenticação
2. **voluntarios** - Informações específicas de voluntários
3. **abrigos** - Dados de abrigos e instituições
4. **solicitacoes** - Pedidos de ajuda (resgate, abrigo, doação)

---

## 📡 Testando a API

### Usando o Navegador

Acesse: http://localhost:3000

Você verá informações sobre a API.

Para documentação completa: http://localhost:3000/api/info

### Usando Postman

1. Importe a collection (se houver)
2. Configure a URL base: `http://localhost:3000`

### Exemplos de Requisições

#### 1. Registrar um usuário
```http
POST http://localhost:3000/api/auth/registro
Content-Type: application/json

{
  "tipo_usuario": "usuario_final",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "senha123",
  "telefone": "21 98765-4321",
  "endereco": "Rua das Flores, 123",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

#### 2. Fazer login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "maria@email.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "dados": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": { ... }
  }
}
```

#### 3. Criar uma solicitação (requer autenticação)
```http
POST http://localhost:3000/api/solicitacoes
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "tipo_solicitacao": "resgate",
  "descricao": "Família de 4 pessoas ilhada",
  "prioridade": "Urgente",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

---

## 🔒 Segurança

### O que está protegido:

✅ **Senhas criptografadas** - Usando bcrypt
✅ **Autenticação JWT** - Tokens seguros
✅ **SQL Injection Prevention** - Prepared statements
✅ **CORS configurado** - Apenas frontend autorizado
✅ **Helmet** - Headers de segurança
✅ **Validação de dados** - Inputs sanitizados

### O que NÃO vai para o GitHub:

❌ Arquivo `.env` (contém segredos)
❌ Banco de dados `database.db` (contém dados de usuários)
❌ Pasta `node_modules`
❌ Logs e backups

**Tudo está protegido pelo `.gitignore`!**

---

## 📂 Estrutura de Pastas

```
backend/
├── config/           # Configurações (database)
├── controllers/      # Lógica de negócio
├── middleware/       # Middlewares (autenticação, etc)
├── models/           # Models do banco de dados
├── routes/           # Definição de rotas
├── utils/            # Funções auxiliares
├── .env              # Variáveis de ambiente (NÃO VAI PRO GIT)
├── .env.example      # Template de .env
├── .gitignore        # Arquivos ignorados pelo Git
├── package.json      # Dependências e scripts
├── server.js         # Arquivo principal
└── database.db       # Banco SQLite (NÃO VAI PRO GIT)
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "EADDRINUSE" (porta em uso)
```bash
# Mude a porta no .env
PORT=3001
```

### Erro: "JWT_SECRET is not defined"
```bash
# Certifique-se de que o arquivo .env existe
# e contém a variável JWT_SECRET
```

### Banco de dados corrompido
```bash
# Delete o banco e recrie
rm database.db
npm run init-db
```

---

## 📊 Monitoramento

### Logs

Em modo desenvolvimento, todas as requisições são logadas no console.

### Health Check

Verifique se a API está online:
```bash
curl http://localhost:3000/health
```

---

## 🚀 Deploy

### Preparação para Produção

1. **Gere uma chave JWT segura**
```bash
openssl rand -base64 32
```

2. **Atualize o .env**
```
NODE_ENV=production
JWT_SECRET=sua_chave_super_segura
FRONTEND_URL=https://seu-frontend.com
```

3. **Configure HTTPS**
- Use um proxy reverso (Nginx)
- Ou um serviço como Heroku, Vercel, Railway

4. **Backup do Banco de Dados**
- Configure backups automáticos do `database.db`

### Plataformas Recomendadas

- **Heroku** (fácil)
- **Railway** (moderno)
- **DigitalOcean** (mais controle)
- **AWS/Azure** (enterprise)

---

## 💡 Dicas

1. **Use Postman** para testar a API
2. **Mantenha o .env atualizado** mas nunca faça commit dele
3. **Faça backups regulares** do banco de dados
4. **Em produção**, use HTTPS sempre
5. **Monitore os logs** para identificar problemas

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no console
2. Confira se todas as dependências foram instaladas
3. Certifique-se de que o arquivo `.env` está configurado
4. Teste os endpoints com Postman

---

**🌊 Sistema pronto para uso! 🆘**

Agora você pode iniciar o desenvolvimento do frontend que consumirá esta API.
