# 🔧 Diagnóstico e Solução - Erro de Conexão com Banco de Dados

## ❌ **Problema Identificado:**

```
Can't reach database server at `ep-fancy-hill-a5ww9gan-pooler.us-east-2.aws.neon.tech:5432`
```

**Causa:** Perda de conexão com o banco de dados Neon PostgreSQL

---

## 🔍 **Possíveis Causas:**

### 1. **Banco de Dados Hibernado (Neon.tech)**
- Bancos gratuitos hibernam após inatividade
- Requer "acordar" o banco

### 2. **Problemas de Conectividade**
- Internet instável
- Firewall bloqueando conexão
- DNS temporariamente indisponível

### 3. **Configuração Incorreta**
- Variável `DATABASE_URL` incorreta
- Credenciais expiradas

---

## 🔧 **Soluções:**

### **Solução 1: Verificar Status do Banco Neon**

#### Acesse o Console Neon:
1. Vá para [console.neon.tech](https://console.neon.tech)
2. Faça login na sua conta
3. Verifique se o projeto está **ativo**
4. Se estiver hibernado, clique em **"Wake up"** ou **"Start"**

### **Solução 2: Testar Conexão Diretamente**

```bash
# Teste de conectividade com o host
ping ep-fancy-hill-a5ww9gan-pooler.us-east-2.aws.neon.tech

# Teste de porta específica
telnet ep-fancy-hill-a5ww9gan-pooler.us-east-2.aws.neon.tech 5432
```

### **Solução 3: Verificar Variáveis de Ambiente**

```bash
# No terminal do projeto
cd "c:\programação\TalentLink_back_2\back-end"

# Verificar se DATABASE_URL está definida
echo $DATABASE_URL

# Ou no Windows
echo %DATABASE_URL%
```

### **Solução 4: Atualizar Connection String**

Se necessário, atualize a `DATABASE_URL` no `.env`:

```env
# Formato típico do Neon
DATABASE_URL="postgresql://username:password@ep-fancy-hill-a5ww9gan-pooler.us-east-2.aws.neon.tech:5432/dbname?sslmode=require"
```

---

## 🧪 **Comandos de Teste:**

### **1. Testar Conexão Prisma:**
```bash
# No diretório do backend
npx prisma db pull
```

### **2. Verificar Status da Conexão:**
```bash
npx prisma studio
```

### **3. Reiniciar Servidor de Desenvolvimento:**
```bash
npm run dev
```

---

## 🆘 **Soluções Rápidas:**

### **Opção A: Reativar Banco Neon**
```bash
# 1. Acesse https://console.neon.tech
# 2. Selecione seu projeto
# 3. Clique em "Wake up" se estiver hibernado
# 4. Aguarde 30-60 segundos
# 5. Teste novamente o endpoint
```

### **Opção B: Usar Banco Local (Desenvolvimento)**
```bash
# 1. Instale PostgreSQL localmente
# 2. Crie um banco de desenvolvimento
# 3. Atualize DATABASE_URL no .env para apontar para localhost
# 4. Execute as migrações: npx prisma migrate dev
```

### **Opção C: Reconnect Database**
```bash
# No console Neon, vá em Settings > Connection pooling
# Clique em "Reset connection" se disponível
```

---

## 📋 **Verificações Pré-Teste:**

### **1. Status do Banco:**
- [ ] Banco Neon ativo (não hibernado)
- [ ] Connection string válida
- [ ] Credenciais corretas

### **2. Conectividade:**
- [ ] Internet estável
- [ ] Firewall não bloqueando porta 5432
- [ ] DNS resolvendo o hostname

### **3. Configuração Local:**
- [ ] `.env` com DATABASE_URL correta
- [ ] Prisma schema sincronizado
- [ ] Dependências instaladas

---

## 🧪 **Testar Após Correção:**

### **1. Verificar Conexão:**
```bash
npx prisma db pull
```

### **2. Testar Endpoint Novamente:**
```bash
http GET https://talentlink-wd88.onrender.com/reports/cmdre8nev0000q0k4m8q21nqs/cmdrmgopj0003lm3mouadf4gj \
  Authorization:"Bearer SEU_TOKEN_JWT"
```

### **3. Monitorar Logs:**
```
[generateCandidateReportService] Start - candidateId: ..., opportunityId: ...
[generateCandidateReportService] Fetching opportunity to get formId ✅
[generateCandidateReportService] Found formId: ... ✅
```

---

## 💡 **Dicas de Prevenção:**

### **1. Configurar Pool de Conexões:**
```javascript
// No arquivo prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **2. Implementar Reconnect:**
```javascript
// Adicionar timeout e retry na conexão
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error'],
})
```

### **3. Health Check Regular:**
```javascript
// Endpoint de health check
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});
```

---

## 🚨 **Se Nada Funcionar:**

### **1. Backup Plan - Novo Database:**
- Criar novo projeto no Neon
- Migrar dados se necessário
- Atualizar connection string

### **2. Alternative - Supabase:**
- Criar projeto gratuito no Supabase
- Usar PostgreSQL deles como alternativa
- Importar schema via Prisma

### **3. Local Development:**
- PostgreSQL via Docker
- Database local para desenvolvimento
- Neon só para produção

---

## ✅ **Próximo Passo:**

**1. Acesse [console.neon.tech](https://console.neon.tech)**  
**2. Verifique se o banco está ativo**  
**3. Clique em "Wake up" se hibernado**  
**4. Aguarde 1-2 minutos**  
**5. Teste o endpoint novamente**

Muito provavelmente é só o banco hibernado - problema comum em contas gratuitas do Neon! 😊
