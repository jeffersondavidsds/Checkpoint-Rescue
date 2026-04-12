# 🌊 Checkpoint Rescue ( Gerenciamento de Crises ) 🆘

## 📌 Sobre o Projeto

O **Sistema de Gerenciamento de Crises** é uma plataforma completa para conectar pessoas em situação de risco durante enchentes e futuramente outras crises com voluntários e abrigos. O sistema permite o gerenciamento eficiente de:

- **Resgates de emergência**
- **Abrigos e locais disponíveis**
- **Doações de alimentos e mantimentos**
- **Voluntários dispostos a ajudar**
- **Visualização em tempo real através de mapas**

O sistema possui **3 tipos de acesso distintos**: Voluntário, Abrigo e Usuário Final.

Mas vocês devem estar se perguntando oque me motivou, como cheguei a essas conclusões e necessidades.

Eu apenas olhei para fora de casa em um dia de chuva, rua alagada com uma chuva leve e quase sem força, no meio disso me peguei pensando e se acontecesse uma chuva igual a do "Rio Grande do Sul, como poderiamos agir, resolver os problemas e ajudar as pessoas?" nesse pensamento percebi que não existe um app ou site que mostra os abrigos ou voluntários em tempo real, então decidi criar um onde será necessário ter um cadastro bem rápido ( pois estaremos em alerta ou ja no meio da confusão ), onde vocai poder ver locais lotados, meia lotação ou livres para acomodações e voluntários, lugares para doações, tanto recepção de alimentos, quanto a própria doação para quem necessita,  logo abaixo neste mesmo README tem toda a descrição do que esse app fará, viabilizará e principalmente MOBILIZARÁ AS PESSOAS, em breve teremos meios de comunicação dentro do próprio app/site que permitira mais dinamismo e urgência nos atendimentos e deslocamentos principalmente, um pouco mais para o final também consta as melhorias futuras pensando não somente nas enchentes, mas em um todo, espero que gostem e obrigado pela preferência e não se preocupem, todos seus dados estão seguros e bem guardados!!!

---

## 🎯 Objetivo

Facilitar a comunicação e coordenação durante enchentes, conectando:
- Pessoas que precisam de ajuda
- Voluntários dispostos a resgatar, abrigar ou doar
- Abrigos e instituições com disponibilidade de espaço e recursos

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **SQLite3** - Banco de dados relacional leve
- **CORS** - Habilitação de requisições cross-origin
- **Postman** - Testes de API

### Frontend
- **React** - Biblioteca JavaScript para interfaces
- **useState** - Gerenciamento de estado
- **useEffect** - Efeitos colaterais e ciclo de vida
- **Google Maps API** - Visualização de mapas e localização

### Conceitos Aplicados
- **CRUD** (Create, Read, Update, Delete)
- **Consumo de API REST**
- **Autenticação e controle de acesso**
- **Verbos HTTP** (GET, POST, PUT, DELETE)

---

## 📦 Instalação

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## ▶️ Como Executar

### Backend
```bash
cd backend
npm run dev
```
Servidor disponível em: `http://localhost:3000`

### Frontend
```bash
cd frontend
npm start
```
Aplicação disponível em: `http://localhost:3001`

---

## 🗄️ Banco de Dados

O banco de dados SQLite é criado automaticamente ao iniciar o projeto.

### 🧾 Tabelas

#### **Tabela: usuarios**
| Campo              | Tipo    | Descrição                                    |
|--------------------|---------|----------------------------------------------|
| id                 | INTEGER | Identificador único (PRIMARY KEY)            |
| tipo_usuario       | TEXT    | 'voluntario', 'abrigo' ou 'usuario_final'   |
| nome               | TEXT    | Nome completo                                |
| email              | TEXT    | E-mail (UNIQUE)                              |
| senha              | TEXT    | Senha criptografada                          |
| telefone           | TEXT    | Telefone para contato                        |
| endereco           | TEXT    | Endereço completo                            |
| latitude           | REAL    | Latitude da localização                      |
| longitude          | REAL    | Longitude da localização                     |
| data_criacao       | TEXT    | Data de criação da conta                     |

---

#### **Tabela: voluntarios**
| Campo                  | Tipo    | Descrição                                        |
|------------------------|---------|--------------------------------------------------|
| id                     | INTEGER | Identificador único (PRIMARY KEY)                |
| usuario_id             | INTEGER | Referência ao usuário (FOREIGN KEY)              |
| tipo_voluntario        | TEXT    | 'resgate', 'ceder_espaco' ou 'doacao'           |
| disponibilidade        | TEXT    | Status de disponibilidade                        |

**Campos específicos para Resgate:**
| Campo                  | Tipo    | Descrição                                        |
|------------------------|---------|--------------------------------------------------|
| tipo_transporte        | TEXT    | 'carro', 'barco', 'jetski' ou 'a_pe'            |
| capacidade_pessoas     | INTEGER | Quantas pessoas cabem no transporte              |

**Campos específicos para Ceder Espaço:**
| Campo                  | Tipo    | Descrição                                        |
|------------------------|---------|--------------------------------------------------|
| tipo_espaco            | TEXT    | 'quarto' ou 'quintal'                            |
| quantidade_quartos     | INTEGER | Número de quartos disponíveis                    |
| tamanho_quintal        | TEXT    | Tamanho do quintal (em m²)                       |
| capacidade_total       | INTEGER | Total de pessoas que pode abrigar               |
| ocupacao_atual         | INTEGER | Pessoas atualmente abrigadas                     |
| status_lotacao         | TEXT    | 'verde', 'azul', 'amarelo' ou 'vermelho'        |

**Campos específicos para Doação:**
| Campo                  | Tipo    | Descrição                                        |
|------------------------|---------|--------------------------------------------------|
| itens_disponiveis      | TEXT    | Descrição dos itens disponíveis                  |
| quantidade             | TEXT    | Quantidade de cada item                          |
| validade               | TEXT    | Data de validade dos alimentos                   |

---

#### **Tabela: abrigos**
| Campo                  | Tipo    | Descrição                                        |
|------------------------|---------|--------------------------------------------------|
| id                     | INTEGER | Identificador único (PRIMARY KEY)                |
| usuario_id             | INTEGER | Referência ao usuário (FOREIGN KEY)              |
| nome_organizacao       | TEXT    | Nome da organização/instituição                  |
| recursos_disponiveis   | TEXT    | Lista de recursos (comida, camas, roupas, etc)   |
| capacidade_total       | INTEGER | Limite de pessoas comportadas                    |
| ocupacao_atual         | INTEGER | Número de pessoas atualmente no abrigo           |
| status_lotacao         | TEXT    | 'verde', 'azul', 'amarelo' ou 'vermelho'        |
| endereco_completo      | TEXT    | Endereço completo do abrigo                      |
| latitude               | REAL    | Latitude para mapa                               |
| longitude              | REAL    | Longitude para mapa                              |

---

#### **Tabela: solicitacoes**
| Campo                  | Tipo    | Descrição                                        |
|------------------------|---------|--------------------------------------------------|
| id                     | INTEGER | Identificador único (PRIMARY KEY)                |
| usuario_id             | INTEGER | ID do usuário que fez a solicitação              |
| tipo_solicitacao       | TEXT    | 'resgate', 'abrigo' ou 'doacao'                 |
| descricao              | TEXT    | Descrição da necessidade                         |
| prioridade             | TEXT    | 'Baixa', 'Média', 'Alta' ou 'Urgente'           |
| status                 | TEXT    | 'Pendente', 'Em andamento' ou 'Concluída'       |
| latitude               | REAL    | Localização da solicitação                       |
| longitude              | REAL    | Localização da solicitação                       |
| data_solicitacao       | TEXT    | Data e hora da solicitação                       |
| voluntario_responsavel | INTEGER | ID do voluntário que atendeu (se aplicável)      |

---

## 🗺️ Sistema de Status Visual (Mapa)

### Cores de Indicação de Capacidade

| Cor      | Status          | Condição                                    |
|----------|-----------------|---------------------------------------------|
| 🟢 Verde | Livre           | Ocupação: 0% (completamente disponível)     |
| 🔵 Azul  | Disponível      | Ocupação: 1% a 49%                          |
| 🟡 Amarelo| Enchendo       | Ocupação: 50% a 79%                         |
| 🔴 Vermelho| Lotado        | Ocupação: 80% a 100%                        |

**Aplicável para:**
- Abrigos
- Voluntários que cedem espaço

---

## 🔗 Endpoints da API

### 🔐 Autenticação

#### Criar Conta (Cadastro)
```http
POST /api/auth/registro
```

**Body (JSON) - Usuário Final:**
```json
{
  "tipo_usuario": "usuario_final",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "senha123",
  "telefone": "21 98765-4321",
  "endereco": "Rua das Flores, 123, Centro, Rio de Janeiro - RJ",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

**Body (JSON) - Voluntário (Resgate):**
```json
{
  "tipo_usuario": "voluntario",
  "nome": "João Resgatista",
  "email": "joao@email.com",
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

**Body (JSON) - Voluntário (Ceder Espaço):**
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

**Body (JSON) - Voluntário (Doação):**
```json
{
  "tipo_usuario": "voluntario",
  "nome": "Carlos Doador",
  "email": "carlos@email.com",
  "senha": "senha123",
  "telefone": "21 97777-6666",
  "endereco": "Rua Generosa, 321, Copacabana, Rio de Janeiro - RJ",
  "tipo_voluntario": "doacao",
  "itens_disponiveis": "Arroz, feijão, água mineral, roupas",
  "quantidade": "50kg arroz, 30kg feijão, 100 garrafas água, 200 peças roupas",
  "validade": "31/12/2026"
}
```

**Body (JSON) - Abrigo:**
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

#### Login
```http
POST /api/auth/login
```

**Body (JSON):**
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "tipo_usuario": "voluntario",
    "nome": "João Resgatista",
    "email": "joao@email.com"
  }
}
```

---

### 👥 Usuários

#### Listar Todos os Usuários (Admin)
```http
GET /api/usuarios
```

#### Buscar Usuário por ID
```http
GET /api/usuarios/:id
```

#### Atualizar Dados do Usuário
```http
PUT /api/usuarios/:id
```

#### Deletar Usuário
```http
DELETE /api/usuarios/:id
```

---

### 🚨 Solicitações de Ajuda

#### Criar Solicitação
```http
POST /api/solicitacoes
```

**Body (JSON) - Solicitação de Resgate:**
```json
{
  "tipo_solicitacao": "resgate",
  "descricao": "Casa alagada, família de 4 pessoas no segundo andar",
  "prioridade": "Urgente",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

**Body (JSON) - Solicitação de Abrigo:**
```json
{
  "tipo_solicitacao": "abrigo",
  "descricao": "Família de 5 pessoas precisa de abrigo temporário",
  "prioridade": "Alta",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

**Body (JSON) - Solicitação de Doação:**
```json
{
  "tipo_solicitacao": "doacao",
  "descricao": "Precisando de alimentos básicos e roupas para 3 pessoas",
  "prioridade": "Média",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

---

#### Listar Todas as Solicitações
```http
GET /api/solicitacoes
```

**Query Parameters:**
- `?status=Pendente` - Filtrar por status
- `?tipo=resgate` - Filtrar por tipo
- `?prioridade=Urgente` - Filtrar por prioridade

---

#### Buscar Solicitação por ID
```http
GET /api/solicitacoes/:id
```

---

#### Atualizar Solicitação (Mudar Status)
```http
PUT /api/solicitacoes/:id
```

**Body (JSON):**
```json
{
  "status": "Em andamento",
  "voluntario_responsavel": 5
}
```

---

#### Deletar Solicitação
```http
DELETE /api/solicitacoes/:id
```

---

### 🙋 Voluntários

#### Listar Todos os Voluntários
```http
GET /api/voluntarios
```

**Query Parameters:**
- `?tipo=resgate` - Filtrar por tipo de voluntário
- `?disponivel=true` - Apenas disponíveis

---

#### Buscar Voluntário por ID
```http
GET /api/voluntarios/:id
```

---

#### Atualizar Dados do Voluntário
```http
PUT /api/voluntarios/:id
```

**Body (JSON) - Atualizar ocupação (ceder espaço):**
```json
{
  "ocupacao_atual": 4,
  "status_lotacao": "azul"
}
```

---

### 🏠 Abrigos

#### Listar Todos os Abrigos
```http
GET /api/abrigos
```

**Query Parameters:**
- `?status=verde` - Filtrar por status de lotação

---

#### Buscar Abrigo por ID
```http
GET /api/abrigos/:id
```

---

#### Atualizar Dados do Abrigo
```http
PUT /api/abrigos/:id
```

**Body (JSON):**
```json
{
  "ocupacao_atual": 75,
  "status_lotacao": "amarelo",
  "recursos_disponiveis": "50 camas, cozinha completa, alimentos para 3 dias"
}
```

---

### 🗺️ Mapa

#### Obter Todas as Localizações para Mapa
```http
GET /api/mapa
```

**Response:**
```json
{
  "abrigos": [
    {
      "id": 1,
      "nome": "Abrigo São José",
      "latitude": -22.9249,
      "longitude": -43.2300,
      "status_lotacao": "azul",
      "capacidade_total": 100,
      "ocupacao_atual": 25
    }
  ],
  "voluntarios_espaco": [
    {
      "id": 2,
      "nome": "Ana Acolhedora",
      "latitude": -22.9519,
      "longitude": -43.1838,
      "status_lotacao": "verde",
      "capacidade_total": 6,
      "ocupacao_atual": 0
    }
  ],
  "solicitacoes_pendentes": [
    {
      "id": 3,
      "tipo": "resgate",
      "latitude": -22.9068,
      "longitude": -43.1729,
      "prioridade": "Urgente"
    }
  ]
}
```

---

## 🔐 Segurança

### SQL Injection Prevention
Todas as queries utilizam **prepared statements** com `?`:
```sql
SELECT * FROM usuarios WHERE id = ?
```

### Autenticação
- Senhas criptografadas com **bcrypt**
- Tokens JWT para sessões
- Middleware de verificação de autenticação

### CORS
Configurado para permitir requisições do frontend:
```javascript
app.use(cors({
  origin: 'http://localhost:3001'
}));
```

---

## 📚 Conceitos Aplicados

### Backend
- **CRUD Completo** - Create, Read, Update, Delete
- **REST API** - Arquitetura de API RESTful
- **Verbos HTTP**:
  - `GET` - Buscar dados
  - `POST` - Criar novos registros
  - `PUT` - Atualizar registros existentes
  - `DELETE` - Remover registros
- **Middleware** - Autenticação e validação
- **Relacionamento de Tabelas** - Foreign Keys

### Frontend
- **React Hooks**:
  - `useState` - Gerenciamento de estado local
  - `useEffect` - Requisições à API e efeitos colaterais
- **Consumo de API** - Fetch/Axios para requisições HTTP
- **Renderização Dinâmica** - `map()` para listas
- **Google Maps Integration** - Visualização de localizações
- **Formulários Controlados** - Inputs com estado

---

## 💡 Funcionalidades Principais

### ✅ Para Usuários Finais
- Criar solicitações de resgate
- Buscar abrigos disponíveis no mapa
- Solicitar doações
- Acompanhar status das solicitações

### ✅ Para Voluntários
- **Resgate**: Aceitar solicitações de resgate
- **Ceder Espaço**: Registrar disponibilidade e ocupação
- **Doação**: Listar itens disponíveis para doação

### ✅ Para Abrigos
- Registrar capacidade e recursos
- Atualizar ocupação em tempo real
- Visualização no mapa com status de lotação

### ✅ Sistema de Mapa
- Visualização de todos os abrigos
- Marcadores coloridos por status de lotação
- Localização de solicitações pendentes
- Filtros por tipo e disponibilidade

---

## 🎨 Interface do Usuário

### Páginas Principais
1. **Landing Page** - Apresentação do sistema
2. **Login/Cadastro** - Autenticação de usuários
3. **Dashboard** - Visão geral personalizada por tipo de usuário
4. **Mapa Interativo** - Visualização de abrigos e solicitações
5. **Gerenciamento de Solicitações** - CRUD de solicitações
6. **Perfil** - Atualização de dados do usuário

---

## 🚀 Melhorias Futuras

- [ ] Notificações em tempo real (WebSocket)
- [ ] Chat entre voluntários e solicitantes
- [ ] Sistema de avaliação de voluntários
- [ ] Geração de relatórios e estatísticas
- [ ] Aplicativo mobile nativo (React Native)
- [ ] Sistema de rotas otimizadas para resgate
- [ ] Integração com redes sociais
- [ ] Multilíngue (i18n)

---

## ⚠️ Observações Importantes

- O banco de dados é criado automaticamente na primeira execução
- Dados de exemplo são inseridos apenas se o banco estiver vazio
- É necessária uma chave de API do Google Maps válida
- Recomenda-se uso de HTTPS em produção
- Backup regular do banco de dados é essencial

---

## 📱 Compatibilidade

- ✅ Desktop (navegadores modernos)
- ✅ Tablet (responsivo)
- ✅ Mobile (responsivo)

---

## 🎓 Projeto Educacional

Este projeto foi desenvolvido para fins educacionais, demonstrando:
- Desenvolvimento Full Stack (Node.js + React)
- Integração com APIs externas (Google Maps)
- Banco de dados relacional
- Autenticação e autorização
- Boas práticas de desenvolvimento
- Sistema CRUD completo

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir um Pull Request

---

## 👨‍💻 Autor

Jefferson David
Linkedin: [https://www.linkedin.com/in/jeffersonsilvadev/]
Github: [https://github.com/jeffersondavidsds]
Site: [www.jotadev.pro]

---

**🤝 Juntos somos mais fortes! 🆘**