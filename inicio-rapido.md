# ⚡ INÍCIO RÁPIDO - Backend

## 🚀 Executar em 3 Passos

### 1️⃣ Instalar dependências
```bash
cd backend
npm install
```

### 2️⃣ Executar o servidor
```bash
npm run dev
```

### 3️⃣ Testar
Acesse: http://localhost:3000

---

## ✅ Pronto!

O servidor está rodando e o banco de dados foi criado automaticamente.

### 📡 Endpoints principais:

- **POST** `/api/auth/registro` - Criar conta
- **POST** `/api/auth/login` - Fazer login
- **GET** `/api/solicitacoes` - Listar solicitações
- **GET** `/api/voluntarios` - Listar voluntários
- **GET** `/api/abrigos` - Listar abrigos
- **GET** `/api/mapa` - Ver mapa com localizações

### 📚 Documentação completa:
- `README_INSTALACAO.md` - Guia completo de instalação
- `POSTMAN_EXAMPLES.md` - Exemplos de todas as requisições
- `http://localhost:3000/api/info` - Documentação da API (quando rodando)

---

## 🔑 Credenciais de Teste

Após registrar um usuário via `/api/auth/registro`, faça login com:
```json
{
  "email": "seu-email@email.com",
  "senha": "sua-senha"
}
```

Você receberá um token JWT. Use-o no header `Authorization: Bearer TOKEN` 
para todas as outras requisições.

---

## 🛡️ Segurança

✅ Senhas criptografadas (bcrypt)
✅ Autenticação JWT
✅ SQL Injection prevention
✅ CORS configurado
✅ Headers de segurança (Helmet)
✅ `.gitignore` protegendo dados sensíveis

**NADA sensível vai para o GitHub!**

---

## 📁 Arquivos Importantes

- `.env` - Configurações (NÃO VAI PRO GIT)
- `server.js` - Servidor principal
- `database.db` - Banco SQLite (criado automaticamente, NÃO VAI PRO GIT)

---

## 🎯 Próximos Passos

1. ✅ Backend funcionando
2. 🔜 Desenvolver Frontend React
3. 🔜 Integrar com Google Maps API
4. 🔜 Deploy em produção

---

**🌊 Sistema totalmente funcional! 🆘**
