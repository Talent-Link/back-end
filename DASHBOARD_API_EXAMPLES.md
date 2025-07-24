# 📊 Dashboard API - Exemplos de Teste

## 🔐 Autenticação Necessária
Todas as rotas de dashboard requerem autenticação JWT. Primeiro, faça login:

```bash
# 1. Login com Google (substitua por seu método de autenticação)
curl -X GET "http://localhost:4000/auth/google/RH" \
  -H "Content-Type: application/json"

# 2. Use o token JWT retornado nas próximas requisições
```

## 📈 Métricas do Dashboard

### GET /dashboard/metrics
Retorna métricas completas do dashboard RH:

```bash
curl -X GET "http://localhost:4000/dashboard/metrics" \
  -H "Authorization: Bearer SEU_JWT_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "metrics": {
    "totalCandidaturas": {
      "value": 245,
      "change": "+12%",
      "period": "from last period"
    },
    "candidatosQualificados": {
      "value": 89,
      "change": "+8%", 
      "period": "from last period"
    },
    "taxaAprovacao": {
      "value": 36,
      "change": "+5%",
      "period": "from last period"
    },
    "vagasAtivas": {
      "value": 12,
      "change": "+3%",
      "period": "from last period"
    }
  },
  "charts": {
    "candidaturasMensais": [
      {"month": "Jan", "applications": 35},
      {"month": "Feb", "applications": 42},
      {"month": "Mar", "applications": 28}
    ],
    "statusCandidatos": [
      {"status": "Approved", "count": 24},
      {"status": "Rejected", "count": 15},
      {"status": "Pending", "count": 8}
    ]
  }
}
```

## 👥 Candidatos Qualificados

### GET /dashboard/candidatos
Lista os últimos 20 candidatos qualificados:

```bash
curl -X GET "http://localhost:4000/dashboard/candidatos" \
  -H "Authorization: Bearer SEU_JWT_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
[
  {
    "id": "clxyz123456789",
    "candidateId": "clxyz987654321", 
    "answers": {
      "experiencia": "5 anos",
      "skills": ["JavaScript", "React"]
    },
    "createdAt": "2025-07-24T10:30:00Z",
    "opportunityId": "clxyz456789123",
    "candidate": {
      "id": "clxyz987654321",
      "name": "Maria Silva",
      "email": "maria@exemplo.com",
      "photoUrl": "https://example.com/photo.jpg"
    },
    "opportunity": {
      "id": "clxyz456789123", 
      "title": "Desenvolvedor Frontend",
      "description": "Vaga para desenvolvedor React experiente"
    }
  }
]
```

## 📋 Detalhes de Vaga

### GET /dashboard/vaga/{vagaId}
Retorna detalhes completos de uma vaga específica:

```bash
curl -X GET "http://localhost:4000/dashboard/vaga/clxyz123456789" \
  -H "Authorization: Bearer SEU_JWT_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "id": "clxyz123456789",
  "title": "Desenvolvedor Frontend",
  "description": "Vaga para desenvolvedor React experiente",
  "location": "São Paulo, SP",
  "isActive": true,
  "createdAt": "2025-07-20T14:00:00Z",
  "responses": [
    {
      "id": "clxyz987654321",
      "candidateId": "clxyz111222333",
      "answers": {"experiencia": "3 anos"},
      "createdAt": "2025-07-24T10:30:00Z",
      "candidate": {
        "id": "clxyz111222333",
        "name": "João Santos",
        "email": "joao@exemplo.com",
        "photoUrl": null
      }
    }
  ],
  "estatisticas": {
    "totalCandidatos": 15,
    "ultimaCandidatura": "2025-07-24T10:30:00Z"
  }
}
```

## 🚨 Códigos de Erro

### 401 - Token inválido
```json
{
  "error": "Token JWT inválido ou expirado"
}
```

### 403 - Acesso negado
```json
{
  "error": "Acesso negado. Apenas usuários RH podem acessar estas métricas."
}
```

### 404 - Empresa não encontrada
```json
{
  "error": "Empresa não encontrada para este usuário RH."
}
```

### 404 - Vaga não encontrada
```json
{
  "error": "Vaga não encontrada."
}
```

## 🧪 Testando no Swagger

1. Acesse: `http://localhost:4000/api-docs`
2. Procure pela seção **Dashboard**
3. Clique em "Authorize" e cole seu JWT token
4. Teste as rotas diretamente na interface

## 📝 Notas Importantes

- **Apenas usuários RH** podem acessar estas rotas
- Todas as métricas são **baseadas na empresa** do usuário RH logado
- Os dados de **candidaturas mensais** mostram os últimos 6 meses
- Os **status dos candidatos** são baseados nas notificações do sistema
