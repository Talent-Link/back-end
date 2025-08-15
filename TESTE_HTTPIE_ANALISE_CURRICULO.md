# 🧪 Testes HTTPie - Análise de Currículo com IA

## 📋 Pré-requisitos
- HTTPie instalado (`pip install httpie`)
- Token JWT de um candidato autenticado
- API rodando em produção: `https://talentlink-wd88.onrender.com`

## 🔑 Obter Token JWT (Se necessário)

### 1. Login com Email/Senha:
```bash
http POST https://talentlink-wd88.onrender.com/auth/email/login \
  email="seu-email@exemplo.com" \
  password="sua-senha"
```

### 2. Copiar o token da resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

---

## 🧪 Testes dos Endpoints

### **1. Testar Status do Serviço IA**
```bash
http GET https://talentlink-wd88.onrender.com/resume-analysis/test \
  Authorization:"Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200 OK):**
```json
{
  "message": "Serviço de análise operacional",
  "status": "online",
  "provider": "Groq API", 
  "model": "llama-3.3-70b-versatile",
  "tested_at": "2025-08-15T10:30:00.000Z"
}
```

---

### **2. Obter Dicas Gerais de Currículo**
```bash
http GET https://talentlink-wd88.onrender.com/resume-analysis/tips \
  Authorization:"Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200 OK):**
```json
{
  "message": "Dicas de melhoria de currículo",
  "data": {
    "structure": [
      "Use um formato limpo e profissional",
      "Mantenha o currículo em 1-2 páginas máximo"
    ],
    "content": [...],
    "skills": [...],
    "common_mistakes": [...]
  }
}
```

---

### **3. Analisar Currículo (Principal)**
```bash
http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer SEU_TOKEN_AQUI" \
  Content-Type:"application/json"
```

**Resposta esperada (200 OK):**
```json
{
  "message": "Análise do currículo realizada com sucesso",
  "data": {
    "candidate": {
      "id": "clxyz123456789",
      "name": "Nome do Candidato",
      "email": "email@exemplo.com"
    },
    "analysis": {
      "overall_score": 75,
      "summary": "Análise detalhada do perfil...",
      "strengths": [
        "Ponto forte 1",
        "Ponto forte 2"
      ],
      "suggestions": [
        "Sugestão específica 1",
        "Sugestão específica 2"
      ],
      "improvements": [
        "Área de melhoria 1",
        "Área de melhoria 2"
      ]
    },
    "profile_stats": {
      "total_skills": 5,
      "total_experiences": 2,
      "total_educations": 1,
      "has_resume": true
    },
    "analyzed_at": "2025-08-15T10:30:00.000Z"
  }
}
```

---

## ⚠️ Testes de Cenários de Erro

### **4. Teste sem Token (401 Unauthorized)**
```bash
http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze
```
**Resposta esperada:**
```json
{
  "message": "Token de acesso requerido"
}
```

### **5. Teste com Token de RH (403 Forbidden)**
```bash
# Use um token de usuário RH para testar
http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer TOKEN_DE_RH_AQUI"
```
**Resposta esperada:**
```json
{
  "message": "Acesso negado. Apenas candidatos podem acessar este recurso."
}
```

### **6. Teste com Perfil Incompleto (400 Bad Request)**
```bash
# Com um candidato que não tem skills/experiências/educação cadastradas
http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer TOKEN_CANDIDATO_PERFIL_VAZIO"
```
**Resposta esperada:**
```json
{
  "message": "Dados insuficientes para análise",
  "details": "Para receber uma análise completa, adicione pelo menos algumas habilidades, experiências ou formação acadêmica ao seu perfil",
  "suggestions": [
    "Adicione suas principais habilidades técnicas",
    "Inclua suas experiências profissionais anteriores",
    "Complete informações sobre sua formação acadêmica"
  ]
}
```

---

## 🚀 Testes Avançados

### **7. Teste com Verbose (Ver Headers)**
```bash
http --verbose POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer SEU_TOKEN_AQUI"
```

### **8. Teste de Timeout (Simulação)**
```bash
# O endpoint tem timeout de 30s, este comando mostra o tempo de resposta
time http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer SEU_TOKEN_AQUI"
```

### **9. Teste de Performance (Múltiplas Requisições)**
```bash
# Testar rate limiting (cuidado para não sobrecarregar)
for i in {1..3}; do
  echo "Teste #$i"
  http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
    Authorization:"Bearer SEU_TOKEN_AQUI"
  sleep 2
done
```

---

## 📊 Script de Teste Completo

### **Crie um arquivo `test-resume-analysis.sh`:**
```bash
#!/bin/bash

# Configurações
BASE_URL="https://talentlink-wd88.onrender.com"
TOKEN="SEU_TOKEN_AQUI"  # Substitua pelo seu token

echo "🧪 Iniciando testes da Análise de Currículo IA..."
echo "======================================================"

echo "📋 1. Testando status do serviço..."
http GET $BASE_URL/resume-analysis/test Authorization:"Bearer $TOKEN"

echo -e "\n📚 2. Obtendo dicas gerais..."
http GET $BASE_URL/resume-analysis/tips Authorization:"Bearer $TOKEN"

echo -e "\n🤖 3. Executando análise do currículo..."
http POST $BASE_URL/resume-analysis/analyze Authorization:"Bearer $TOKEN"

echo -e "\n✅ Testes concluídos!"
```

### **Execute o script:**
```bash
chmod +x test-resume-analysis.sh
./test-resume-analysis.sh
```

---

## 🔍 Validações Importantes

### ✅ **Checklist de Teste:**
- [ ] Endpoint `/test` retorna status "online"
- [ ] Endpoint `/tips` retorna dicas estruturadas
- [ ] Endpoint `/analyze` retorna análise com score 0-100
- [ ] Análise inclui `strengths`, `suggestions`, `improvements`
- [ ] `profile_stats` mostra contadores corretos
- [ ] Tempo de resposta < 30 segundos
- [ ] Erros 401/403/400 funcionam corretamente

### 🐛 **Se algo falhar:**
1. **503 Service Unavailable**: Serviço Groq offline, aguardar
2. **Timeout**: Problema de rede, tentar novamente  
3. **400 Bad Request**: Completar perfil do candidato
4. **401 Unauthorized**: Verificar/renovar token JWT
5. **403 Forbidden**: Usar token de candidato, não RH

---

## 💡 Dicas HTTPie

### **Salvar resposta em arquivo:**
```bash
http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer $TOKEN" \
  --output=analise-resultado.json
```

### **Mostrar apenas o corpo da resposta:**
```bash
http --body POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer $TOKEN"
```

### **Formato JSON mais legível:**
```bash
http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer $TOKEN" | jq .
```

---

## 🎯 Exemplo de Teste Real

```bash
# Substitua TOKEN_REAL pelo seu token JWT
export TOKEN_REAL="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Teste rápido
http POST https://talentlink-wd88.onrender.com/resume-analysis/analyze \
  Authorization:"Bearer $TOKEN_REAL" \
  --json
```

**Agora você pode testar toda a funcionalidade de análise de currículo com IA usando HTTPie! 🚀**
