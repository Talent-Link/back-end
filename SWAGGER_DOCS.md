# 📚 Documentação da API TalentLink

## Acesso à Documentação

A documentação completa da API está disponível através do Swagger UI:

- **URL Local**: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)
- **URL Produção**: [https://talentlink-wd88.onrender.com/api-docs](https://talentlink-wd88.onrender.com/api-docs)

## Estrutura da Documentação

### 📁 Arquivo Principal
- **Localização**: `src/shared/config/swaggerDocs.ts`
- **Conteúdo**: Todas as definições de endpoints, schemas e documentação centralizada

### 🛠️ Configuração
- **Arquivo**: `src/shared/config/swagger.ts`
- **Responsabilidade**: Configuração do Swagger UI e integração com Express

## Domínios Documentados

### 🔐 Autenticação
- **Tag**: `Autenticação`
- **Endpoints**: 
  - `GET /auth/google/RH` - Login Google para RH
  - `GET /auth/google/CANDIDATO` - Login Google para Candidatos
  - `GET /auth/google/*/callback` - Callbacks de autenticação
  - `GET /auth/logout` - Logout
  - `GET /auth/me` - Usuário atual

### 👥 Usuários
- **Tag**: `Usuários`
- **Endpoints**:
  - `GET /users/profile` - Perfil do usuário
  - `PUT /users/profile` - Atualizar perfil
  - `GET /users/stats` - Estatísticas do usuário
  - `GET /users/search` - Buscar usuários (RH)
  - `GET /users/{id}` - Usuário por ID

### 🏢 Empresas
- **Tag**: `Empresas`
- **Endpoints**:
  - `POST /empresa` - Criar/atualizar empresa
  - `GET /empresa` - Obter empresa
  - `GET /empresa/rh` - Listar empresas do RH

### 💼 Oportunidades
- **Tag**: `Oportunidades`
- **Endpoints**:
  - `GET /opportunities` - Listar oportunidades
  - `POST /opportunities` - Criar oportunidade
  - `GET /opportunities/{id}` - Obter oportunidade
  - `GET /opportunities/my-applications` - Minhas candidaturas
  - `POST /opportunities/search` - Buscar oportunidades
  - `GET /opportunities/{id}/responses` - Respostas da oportunidade
  - `DELETE /opportunities/{responseId}/withdraw` - Retirar candidatura
  - `DELETE /opportunities/{id}` - Deletar oportunidade
  - `PATCH /opportunities/{id}/activate` - Ativar oportunidade
  - `PATCH /opportunities/{id}/deactivate` - Desativar oportunidade
  - `GET /opportunities/rh` - Oportunidades do RH
  - `GET /opportunities/{id}/candidates-count` - Contar candidatos

## Schemas de Dados

### 🎨 Modelos Principais
- **User**: Dados do usuário
- **Company**: Dados da empresa
- **Opportunity**: Dados da oportunidade
- **Form**: Dados do formulário
- **FormQuestion**: Perguntas do formulário
- **Notification**: Notificações
- **Response**: Respostas dos candidatos
- **Error**: Modelo de erro padrão

## Autenticação

### 🔑 Tipo de Autenticação

1. **Bearer Token (JWT)**
   ```yaml
   bearerAuth:
     type: http
     scheme: bearer
     bearerFormat: JWT
   ```

<!-- 2. **Session Cookie**
   ```yaml
   sessionAuth:
     type: apiKey
     in: cookie
     name: connect.sid
   ``` -->

## Recursos Adicionais

### 🎯 Funcionalidades do Swagger UI
- **Exploração interativa**: Teste endpoints diretamente na interface
- **Documentação detalhada**: Descrições, exemplos e códigos de resposta
- **Filtros por tag**: Organização por domínios
- **Validação de dados**: Schemas detalhados com validações

### 📝 Vantagens da Centralização
- **Manutenibilidade**: Toda documentação em um único arquivo
- **Código limpo**: Rotas sem poluição de comentários
- **Consistência**: Padrões uniformes de documentação
- **Facilidade de atualização**: Mudanças centralizadas

## Como Usar

### 📖 Para Desenvolvedores
1. Acesse `/api-docs` no navegador
2. Explore os endpoints por categoria
3. Teste as requisições diretamente na interface
4. Use os exemplos fornecidos como base

### 🔧 Para Manutenção
1. Edite apenas o arquivo `swaggerDocs.ts`
2. Mantenha a consistência nos schemas
3. Atualize a documentação junto com mudanças na API
4. Valide os exemplos fornecidos

## Exemplo de Teste

Para testar um endpoint através do Swagger UI:

1. Clique no endpoint desejado
2. Clique em "Try it out"
3. Preencha os parâmetros necessários
4. Clique em "Execute"
5. Veja a resposta detalhada

---

**📌 Nota**: Esta documentação é automaticamente sincronizada com o código e sempre reflete o estado atual da API.
