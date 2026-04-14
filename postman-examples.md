# 📮 Exemplos de Requisições para Postman

Abaixo estão exemplos de todas as requisições da API para você testar no Postman.

---

## 🔐 Autenticação

### 1. Registrar Usuário Final
```
POST http://localhost:3000/api/auth/registro
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_usuario": "usuario_final",
  "nome": "João da Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "21 98765-4321",
  "endereco": "Rua das Flores, 123, Centro, Rio de Janeiro - RJ",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

---

### 2. Registrar Voluntário (Resgate)
```
POST http://localhost:3000/api/auth/registro
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_usuario": "voluntario",
  "nome": "Carlos Resgatista",
  "email": "carlos@email.com",
  "senha": "senha123",
  "telefone": "21 91234-5678",
  "endereco": "Av. Brasil, 456, Zona Norte, Rio de Janeiro - RJ",
  "latitude": -22.8808,
  "longitude": -43.3059,
  "tipo_voluntario": "resgate",
  "tipo_transporte": "barco",
  "capacidade_pessoas": 8
}
```

---

### 3. Registrar Voluntário (Ceder Espaço)
```
POST http://localhost:3000/api/auth/registro
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_usuario": "voluntario",
  "nome": "Ana Acolhedora",
  "email": "ana@email.com",
  "senha": "senha123",
  "telefone": "21 99999-8888",
  "endereco": "Rua Tranquila, 789, Botafogo, Rio de Janeiro - RJ",
  "latitude": -22.9519,
  "longitude": -43.1838,
  "tipo_voluntario": "ceder_espaco",
  "tipo_espaco": "quarto",
  "quantidade_quartos": 2,
  "capacidade_total": 6,
  "ocupacao_atual": 0
}
```

---

### 4. Registrar Voluntário (Doação)
```
POST http://localhost:3000/api/auth/registro
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_usuario": "voluntario",
  "nome": "Pedro Doador",
  "email": "pedro@email.com",
  "senha": "senha123",
  "telefone": "21 97777-6666",
  "tipo_voluntario": "doacao",
  "itens_disponiveis": "Arroz, feijão, água mineral, cobertores",
  "quantidade": "50kg arroz, 30kg feijão, 100 garrafas água, 50 cobertores",
  "validade": "31/12/2026"
}
```

---

### 5. Registrar Abrigo
```
POST http://localhost:3000/api/auth/registro
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_usuario": "abrigo",
  "nome": "Responsável Abrigo",
  "email": "abrigo@email.com",
  "senha": "senha123",
  "telefone": "21 95555-4444",
  "nome_organizacao": "Abrigo São José",
  "recursos_disponiveis": "100 camas, cozinha completa, banheiros, roupas, cobertores, alimentos básicos",
  "capacidade_total": 100,
  "ocupacao_atual": 25,
  "endereco_completo": "Rua do Abrigo, 999, Tijuca, Rio de Janeiro - RJ",
  "latitude": -22.9249,
  "longitude": -43.2300
}
```

---

### 6. Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response (copie o token):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "dados": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "tipo_usuario": "usuario_final",
      "nome": "João da Silva",
      "email": "joao@email.com"
    }
  }
}
```

---

### 7. Verificar Token
```
GET http://localhost:3000/api/auth/verificar
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🚨 Solicitações

**⚠️ Todas as rotas abaixo requerem autenticação (Bearer Token)**

### 8. Criar Solicitação de Resgate
```
POST http://localhost:3000/api/solicitacoes
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_solicitacao": "resgate",
  "descricao": "Casa alagada, família de 4 pessoas no segundo andar",
  "prioridade": "Urgente",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

---

### 9. Criar Solicitação de Abrigo
```
POST http://localhost:3000/api/solicitacoes
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_solicitacao": "abrigo",
  "descricao": "Família de 5 pessoas precisa de abrigo temporário",
  "prioridade": "Alta",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

---

### 10. Listar Todas as Solicitações
```
GET http://localhost:3000/api/solicitacoes
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 11. Listar Solicitações com Filtros
```
GET http://localhost:3000/api/solicitacoes?status=Pendente&tipo=resgate
Authorization: Bearer SEU_TOKEN_AQUI
```

**Filtros disponíveis:**
- `?status=Pendente` ou `Em andamento` ou `Concluida`
- `?tipo=resgate` ou `abrigo` ou `doacao`
- `?prioridade=Urgente` ou `Alta` ou `Media` ou `Baixa`

---

### 12. Buscar Solicitação por ID
```
GET http://localhost:3000/api/solicitacoes/1
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 13. Minhas Solicitações
```
GET http://localhost:3000/api/solicitacoes/minhas
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 14. Atualizar Solicitação
```
PUT http://localhost:3000/api/solicitacoes/1
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

**Body:**
```json
{
  "status": "Em andamento",
  "observacoes": "Voluntário a caminho"
}
```

---

### 15. Atribuir Voluntário à Solicitação
```
POST http://localhost:3000/api/solicitacoes/1/atribuir
Authorization: Bearer SEU_TOKEN_AQUI (do voluntário)
```

---

### 16. Deletar Solicitação
```
DELETE http://localhost:3000/api/solicitacoes/1
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 17. Estatísticas de Solicitações
```
GET http://localhost:3000/api/solicitacoes/estatisticas
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🙋 Voluntários

### 18. Listar Todos os Voluntários
```
GET http://localhost:3000/api/voluntarios
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 19. Listar Voluntários com Filtros
```
GET http://localhost:3000/api/voluntarios?tipo=resgate&disponivel=true
Authorization: Bearer SEU_TOKEN_AQUI
```

**Filtros:**
- `?tipo=resgate` ou `ceder_espaco` ou `doacao`
- `?disponivel=true` ou `false`
- `?status_lotacao=verde` (apenas para ceder_espaco)

---

### 20. Buscar Voluntário por ID
```
GET http://localhost:3000/api/voluntarios/1
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 21. Meu Perfil de Voluntário
```
GET http://localhost:3000/api/voluntarios/meu-perfil
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 22. Atualizar Dados do Voluntário
```
PUT http://localhost:3000/api/voluntarios/1
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

**Body (exemplo para ceder_espaco):**
```json
{
  "ocupacao_atual": 4,
  "disponibilidade": "disponivel"
}
```

---

## 🏠 Abrigos

### 23. Listar Todos os Abrigos
```
GET http://localhost:3000/api/abrigos
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 24. Listar Abrigos com Filtros
```
GET http://localhost:3000/api/abrigos?status=verde&com_vagas=true
Authorization: Bearer SEU_TOKEN_AQUI
```

**Filtros:**
- `?status=verde` ou `azul` ou `amarelo` ou `vermelho`
- `?com_vagas=true`

---

### 25. Buscar Abrigo por ID
```
GET http://localhost:3000/api/abrigos/1
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 26. Meu Perfil de Abrigo
```
GET http://localhost:3000/api/abrigos/meu-perfil
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 27. Atualizar Dados do Abrigo
```
PUT http://localhost:3000/api/abrigos/1
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

**Body:**
```json
{
  "ocupacao_atual": 75,
  "recursos_disponiveis": "50 camas disponíveis, alimentos para 3 dias"
}
```

---

### 28. Estatísticas de Abrigos
```
GET http://localhost:3000/api/abrigos/estatisticas
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🗺️ Mapa

### 29. Obter Todas as Localizações
```
GET http://localhost:3000/api/mapa
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 30. Buscar Localizações Próximas
```
GET http://localhost:3000/api/mapa/proximos?lat=-22.9068&lng=-43.1729&raio=10
Authorization: Bearer SEU_TOKEN_AQUI
```

**Parâmetros:**
- `lat` - Latitude (obrigatório)
- `lng` - Longitude (obrigatório)
- `raio` - Raio em km (opcional, padrão: 10)

---

## 📊 Informações da API

### 31. Rota Raiz
```
GET http://localhost:3000/
```

---

### 32. Documentação da API
```
GET http://localhost:3000/api/info
```

---

### 33. Health Check
```
GET http://localhost:3000/health
```

---

## 💡 Dicas para Postman

1. **Configure uma variável de ambiente para o token:**
   - Crie uma variável chamada `token`
   - Após o login, copie o token da resposta
   - Use `{{token}}` no header Authorization

2. **Salve as requisições em uma Collection**

3. **Use Pre-request Scripts para automatizar o login**

4. **Configure testes automáticos nas requisições**

---

**✅ API totalmente funcional e pronta para testes!**
