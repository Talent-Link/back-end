# Teste do Endpoint PUT /opportunities/{id} com HTTPie

## Pré-requisitos
1. Instalar HTTPie: `pip install httpie` ou `brew install httpie`
2. Servidor rodando em: http://localhost:4000
3. Token JWT válido para usuário RH

## Comandos de Teste

### 1. Teste Básico (sem autenticação - deve retornar 401)
```bash
http PUT localhost:4000/opportunities/teste-id title="Vaga Atualizada" description="Nova descrição"
```

### 2. Teste com Token JWT (substitua SEU_TOKEN_JWT pelo token real)
```bash
http PUT localhost:4000/opportunities/123 \
  Authorization:"Bearer SEU_TOKEN_JWT" \
  title="Desenvolvedor Full Stack Sênior" \
  description="Vaga para desenvolvedor com experiência em Node.js e React" \
  requirements="Experiência mínima de 5 anos" \
  benefits="Vale alimentação, plano de saúde" \
  salary:=75000 \
  is_active:=true
```

### 3. Teste com JSON completo
```bash
http PUT localhost:4000/opportunities/456 \
  Authorization:"Bearer SEU_TOKEN_JWT" \
  Content-Type:application/json \
  title="Product Manager" \
  description="Gerenciar produtos digitais" \
  requirements="MBA em gestão" \
  benefits="Home office, flexibilidade" \
  salary:=90000 \
  is_active:=true \
  company_id:=1
```

### 4. Teste com dados inválidos (para testar validação)
```bash
http PUT localhost:4000/opportunities/789 \
  Authorization:"Bearer SEU_TOKEN_JWT" \
  title="" \
  salary:=-1000
```

## Para obter um token JWT válido:

### 1. Primeiro faça login para obter o token:
```bash
# Se você tiver as credenciais de um usuário RH
http POST localhost:4000/auth/login \
  email="rh@empresa.com" \
  password="sua_senha"
```

### 2. Ou use o endpoint do Google OAuth (abra no navegador):
```
http://localhost:4000/auth/google/RH
```

## Respostas Esperadas:

### Sucesso (200):
```json
{
  "id": 123,
  "title": "Desenvolvedor Full Stack Sênior",
  "description": "Vaga para desenvolvedor com experiência em Node.js e React",
  "requirements": "Experiência mínima de 5 anos",
  "benefits": "Vale alimentação, plano de saúde",
  "salary": 75000,
  "is_active": true,
  "company_id": 1,
  "created_at": "2025-08-12T10:00:00.000Z",
  "updated_at": "2025-08-12T13:15:00.000Z"
}
```

### Erro 401 (sem token):
```json
{
  "error": "Token não fornecido"
}
```

### Erro 403 (usuário não é RH):
```json
{
  "error": "Acesso negado: apenas usuários RH podem realizar esta ação"
}
```

### Erro 404 (oportunidade não encontrada):
```json
{
  "error": "Oportunidade não encontrada"
}
```

### Erro 400 (dados inválidos):
```json
{
  "error": "Dados inválidos",
  "details": ["Title is required", "Salary must be positive"]
}
```

## Comandos Adicionais Úteis:

### Listar todas as oportunidades:
```bash
http GET localhost:4000/opportunities Authorization:"Bearer SEU_TOKEN_JWT"
```

### Obter uma oportunidade específica:
```bash
http GET localhost:4000/opportunities/123 Authorization:"Bearer SEU_TOKEN_JWT"
```

### Criar nova oportunidade:
```bash
http POST localhost:4000/opportunities \
  Authorization:"Bearer SEU_TOKEN_JWT" \
  title="Nova Vaga" \
  description="Descrição da vaga" \
  company_id:=1
```
