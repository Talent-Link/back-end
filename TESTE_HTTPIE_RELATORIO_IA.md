# 🧪 Teste do Endpoint de Relatório IA com HTTPie

## 📋 Pré-requisitos
1. **HTTPie instalado:** `pip install httpie` ou `brew install httpie`
2. **Token JWT válido** de usuário RH
3. **IDs válidos** de candidato e oportunidade

---

## 🔑 Obter Token JWT (se necessário)

### Login com Email/Senha:
```bash
http POST https://talentlink-wd88.onrender.com/auth/email/login \
  email="seu_rh@email.com" \
  password="sua_senha"
```

### Login com Google OAuth:
Acesse no navegador: `https://talentlink-wd88.onrender.com/auth/google/RH`

---

## 🧪 Comandos de Teste

### 1. Teste Básico (sem autenticação - deve retornar 401)
```bash
http GET https://talentlink-wd88.onrender.com/reports/CANDIDATE_ID/OPPORTUNITY_ID
```

### 2. Teste com Token JWT
```bash
http GET https://talentlink-wd88.onrender.com/reports/CANDIDATE_ID/OPPORTUNITY_ID \
  Authorization:"Bearer SEU_TOKEN_JWT"
```

### 3. Exemplo com IDs Reais (substitua pelos IDs corretos)
```bash
http GET https://talentlink-wd88.onrender.com/reports/cmdre8nev0000q0k4m8q21nqs/cm123abc456def789 \
  Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Teste Local (se servidor rodando localmente)
```bash
http GET localhost:4000/reports/CANDIDATE_ID/OPPORTUNITY_ID \
  Authorization:"Bearer SEU_TOKEN_JWT"
```

---

## 📊 Verificar Rota Disponível

### Primeiro, vamos verificar se a rota está registrada:
```bash
# Teste de rota inexistente (deve retornar HTML 404)
http GET https://talentlink-wd88.onrender.com/reports/teste

# Teste de rota base dos relatórios
http GET https://talentlink-wd88.onrender.com/reports
```

---

## 🔍 Debugging - Verificar Dados Necessários

### 1. Listar Oportunidades (para pegar IDs)
```bash
http GET https://talentlink-wd88.onrender.com/opportunities \
  Authorization:"Bearer SEU_TOKEN_JWT"
```

### 2. Listar Candidatos de uma Oportunidade
```bash
http GET https://talentlink-wd88.onrender.com/opportunities/OPPORTUNITY_ID/candidates \
  Authorization:"Bearer SEU_TOKEN_JWT"
```

### 3. Verificar Perfil de um Candidato
```bash
http GET https://talentlink-wd88.onrender.com/users/profile/CANDIDATE_ID \
  Authorization:"Bearer SEU_TOKEN_JWT"
```

---

## 📋 Respostas Esperadas

### ✅ Sucesso (200):
```json
{
  "message": "Relatório gerado com sucesso.",
  "report": {
    "resumo": "João Silva é um desenvolvedor full-stack com 5 anos de experiência...",
    "pontos_fortes": "- Experiência relevante de 5 anos em desenvolvimento web...",
    "pontos_fracos": "- Sem experiência documentada em liderança de equipe...",
    "adequacao_vaga": "Candidato altamente adequado para a vaga...",
    "proximos_passos": "1. Entrevista técnica focada em arquitetura...",
    "informacoes_adicionais": "Seria valioso conhecer: experiência com Docker..."
  }
}
```

### ❌ Erro 401 (sem token):
```json
{
  "error": "Token não fornecido"
}
```

### ❌ Erro 403 (usuário não é RH):
```json
{
  "error": "Acesso restrito a RH"
}
```

### ❌ Erro 404 (candidato/oportunidade não encontrados):
```json
{
  "error": "Candidato não encontrado ou não é um candidato válido."
}
```

### ❌ Erro 400 (parâmetros inválidos):
```json
{
  "error": "Parâmetros inválidos. Certifique-se de fornecer candidateId e opportunityId."
}
```

---

## 🎯 Exemplo Completo de Teste

### Passo a Passo:

#### 1. Fazer login e obter token:
```bash
http POST https://talentlink-wd88.onrender.com/auth/email/login \
  email="rh@empresa.com" \
  password="senha123"

# Copiar o token da resposta
```

#### 2. Listar suas oportunidades:
```bash
http GET https://talentlink-wd88.onrender.com/opportunities/rh \
  Authorization:"Bearer eyJhbGciOiJIUzI1NiIs..."

# Copiar um opportunity_id da resposta
```

#### 3. Ver candidatos de uma oportunidade:
```bash
http GET https://talentlink-wd88.onrender.com/opportunities/cm123abc456/candidates \
  Authorization:"Bearer eyJhbGciOiJIUzI1NiIs..."

# Copiar um candidate_id da resposta
```

#### 4. Gerar relatório IA:
```bash
http GET https://talentlink-wd88.onrender.com/reports/cmdre8nev0000/cm123abc456 \
  Authorization:"Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 🚨 Possíveis Problemas e Soluções

### 1. **404 - Cannot GET /reports/candidate/...**
**Causa:** Rota não está registrada no app.ts  
**Solução:** Verificar se `reportRoutes` está importado e registrado

### 2. **401 - Token não fornecido**
**Causa:** Header Authorization ausente ou malformado  
**Solução:** Usar formato `Authorization:"Bearer TOKEN_AQUI"`

### 3. **403 - Acesso restrito a RH**
**Causa:** Token é de usuário candidato, não RH  
**Solução:** Fazer login com conta RH

### 4. **404 - Candidato não encontrado**
**Causa:** ID do candidato incorreto ou inexistente  
**Solução:** Usar ID real de candidato que se candidatou

### 5. **500 - Erro interno**
**Causa:** Problema na API Gemini ou dados malformados  
**Solução:** Verificar logs do servidor

---

## 📝 Template de Comando Rápido

```bash
# Substitua pelos valores corretos:
export TOKEN="SEU_TOKEN_JWT_AQUI"
export CANDIDATE_ID="ID_DO_CANDIDATO"
export OPPORTUNITY_ID="ID_DA_OPORTUNIDADE"

# Comando de teste:
http GET https://talentlink-wd88.onrender.com/reports/$CANDIDATE_ID/$OPPORTUNITY_ID \
  Authorization:"Bearer $TOKEN"
```

---

## 💡 Dicas para Teste

1. **Use dados reais:** IDs de candidatos/oportunidades que existem no sistema
2. **Verifique permissões:** Só funciona com token de usuário RH
3. **Teste localmente primeiro:** Se possível, teste em localhost:4000
4. **Monitore logs:** Acompanhe console do servidor para debug
5. **Verifique rate limits:** API Gemini pode ter limites de uso

Agora você pode testar o endpoint completo! 🚀
