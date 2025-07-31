# 🔧 Guia de Debug - Problema de Sincronização

## ✅ Status Atual do Backend

**Backend está funcionando perfeitamente:**
- ✅ API online em `http://localhost:4000`
- ✅ CORS configurado para `https://talentlink-wd88.onrender.com`
- ✅ Endpoint `/candidates/profile` protegido e funcionando
- ✅ Funções de upload e exclusão de currículo implementadas

## 🚨 Possíveis Causas do Problema

### 1. **URL da API no Frontend**
**Verificar se a URL está correta:**
```javascript
const API_BASE_URL = 'https://talentlink-wd88.onrender.com';
```

**Teste no navegador:**
```javascript
// Cole no console do navegador:
fetch('https://talentlink-wd88.onrender.com/')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```

### 2. **Token de Autenticação**
**Verificar se o token está sendo enviado:**
```javascript
// No console do navegador:
console.log('Token:', localStorage.getItem('authToken'));
```

**Se o token não existir:**
- Fazer login novamente
- Verificar se o login está salvando o token corretamente

### 3. **Deploy da API no Render**
**A API pode não estar atualizada no Render:**

**Opção A: Fazer deploy manual**
1. Commit e push das alterações
2. Trigger manual do deploy no Render
3. Aguardar deploy completo

**Opção B: Verificar logs do Render**
1. Acessar dashboard do Render
2. Ver logs da aplicação
3. Procurar por erros

### 4. **Teste da API em Produção**
```javascript
// Teste no console do navegador:
fetch('https://talentlink-wd88.onrender.com/candidates/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

## 🔍 Debug Passo a Passo

### Passo 1: Verificar se API está online
```bash
curl https://talentlink-wd88.onrender.com/
```
**Esperado:** "🚀 TalentLink API rodando com sucesso!"

### Passo 2: Verificar CORS
```bash
curl -X OPTIONS https://talentlink-wd88.onrender.com/candidates/profile \
  -H "Origin: https://seu-frontend.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

### Passo 3: Testar autenticação
**No console do navegador:**
```javascript
const token = localStorage.getItem('authToken');
fetch('https://talentlink-wd88.onrender.com/candidates/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Passo 4: Testar upload de currículo
```javascript
const token = localStorage.getItem('authToken');
fetch('https://talentlink-wd88.onrender.com/candidates/profile/resume', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resumeUrl: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKCg=='
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 🛠️ Soluções por Problema

### Se API não responde:
1. **Verificar deploy no Render**
2. **Aguardar alguns minutos (cold start)**
3. **Verificar logs de erro**

### Se CORS está bloqueando:
1. **Verificar domínio do frontend**
2. **Confirmar se deploy foi feito**
3. **Testar com DevTools → Network**

### Se token é inválido:
1. **Fazer logout/login**
2. **Verificar expiração do token**
3. **Debugar processo de autenticação**

### Se upload falha:
1. **Verificar tamanho do arquivo**
2. **Confirmar formato base64**
3. **Testar com arquivo menor**

## 📋 Checklist Final

- [ ] API está online em produção
- [ ] CORS está configurado corretamente
- [ ] Token de autenticação válido
- [ ] URL da API está correta no frontend
- [ ] Deploy foi feito com as últimas alterações
- [ ] Logs não mostram erros
- [ ] Teste manual funciona

## 🚀 Próximos Passos

1. **Executar os testes acima**
2. **Identificar onde está falhando**
3. **Aplicar a solução correspondente**
4. **Testar novamente**

Se ainda não funcionar, verifique:
- **Versão do Node.js no Render**
- **Variáveis de ambiente**
- **Dependências atualizadas**
- **Build do frontend atualizado**
