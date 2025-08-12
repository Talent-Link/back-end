// Teste da API de Edição de Oportunidades
// Execute este arquivo para testar se o endpoint PUT está funcionando

const API_BASE = 'https://talentlink-wd88.onrender.com';
// const API_BASE = 'http://localhost:4000'; // Para teste local

async function testUpdateOpportunity() {
  console.log('🧪 Testando API de Edição de Oportunidades\n');

  // Dados de teste
  const opportunityId = 'cmdrmgopj0003lm3mouadf4gj'; // ID do exemplo
  const token = 'SEU_TOKEN_AQUI'; // Substitua pelo token real
  
  const updateData = {
    title: "Desenvolvedor Full Stack Sênior - ATUALIZADO",
    description: "Desenvolver aplicações web usando React e Node.js - DESCRIÇÃO ATUALIZADA",
    location: "São Paulo, SP - Híbrido",
    requirements: "5+ anos React\nTypeScript obrigatório\nTestes automatizados",
    benefits: "Plano de saúde\nVale refeição R$ 1000\nHome office flexível"
  };

  console.log('📋 Dados de teste:');
  console.log('- ID:', opportunityId);
  console.log('- Endpoint:', `${API_BASE}/opportunities/${opportunityId}`);
  console.log('- Método: PUT');
  console.log('- Headers:', {
    'Authorization': `Bearer ${token.substring(0, 20)}...`,
    'Content-Type': 'application/json'
  });
  console.log('- Body:', JSON.stringify(updateData, null, 2));
  console.log('\n');

  try {
    console.log('🔍 Verificando se a oportunidade existe (GET)...');
    
    // Primeiro, verifica se a oportunidade existe
    const getResponse = await fetch(`${API_BASE}/opportunities/${opportunityId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status GET: ${getResponse.status} ${getResponse.statusText}`);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('❌ Erro no GET:', errorText.substring(0, 200));
      return;
    }

    const existingData = await getResponse.json();
    console.log('✅ Oportunidade encontrada:');
    console.log(`- Título atual: "${existingData.title}"`);
    console.log(`- Descrição atual: "${existingData.description.substring(0, 50)}..."`);
    console.log(`- Status: ${existingData.isActive ? 'Ativa' : 'Inativa'}`);
    console.log('\n');

    // Agora testa o PUT
    console.log('🔄 Testando atualização (PUT)...');
    
    const putResponse = await fetch(`${API_BASE}/opportunities/${opportunityId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...updateData,
        companyId: existingData.companyId, // Inclui o companyId original
        formId: existingData.formId || null // Inclui o formId original
      })
    });

    console.log(`Status PUT: ${putResponse.status} ${putResponse.statusText}`);
    console.log('Headers da resposta:', Object.fromEntries(putResponse.headers.entries()));

    if (putResponse.ok) {
      const updatedData = await putResponse.json();
      console.log('\n🎉 SUCESSO! Oportunidade atualizada:');
      console.log(`- ID: ${updatedData.id}`);
      console.log(`- Título: "${updatedData.title}"`);
      console.log(`- Descrição: "${updatedData.description}"`);
      console.log(`- Localização: "${updatedData.location}"`);
      console.log(`- Requirements (${Array.isArray(updatedData.requirements) ? 'array' : 'string'}):`, 
        Array.isArray(updatedData.requirements) ? updatedData.requirements : [updatedData.requirements]);
      console.log(`- Benefits (${Array.isArray(updatedData.benefits) ? 'array' : 'string'}):`, 
        Array.isArray(updatedData.benefits) ? updatedData.benefits : [updatedData.benefits]);
      console.log(`- Atualizado em: ${updatedData.updatedAt}`);
      
      if (updatedData.company) {
        console.log(`- Empresa: ${updatedData.company.name}`);
      }
    } else {
      const errorText = await putResponse.text();
      console.log('\n❌ ERRO na atualização:');
      console.log('Resposta completa:', errorText);
      
      // Verifica se é HTML (erro de rota)
      if (errorText.includes('<!DOCTYPE html>')) {
        console.log('\n🚨 DIAGNÓSTICO: Resposta em HTML indica que a rota não foi encontrada!');
        console.log('Possíveis causas:');
        console.log('1. Servidor não está rodando');
        console.log('2. Rota PUT não está configurada corretamente');
        console.log('3. Middleware de roteamento com problema');
        console.log('4. Ordem das rotas incorreta');
      }
    }

  } catch (error) {
    console.error('\n💥 ERRO na requisição:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('\n🚨 DIAGNÓSTICO: Erro de rede/CORS');
      console.log('Possíveis soluções:');
      console.log('1. Verificar se o servidor está rodando');
      console.log('2. Verificar configuração de CORS');
      console.log('3. Testar com Postman/Insomnia primeiro');
    }
  }
}

// Função para testar localmente
async function testLocalUpdate() {
  console.log('🏠 Testando API local (localhost:4000)\n');
  
  const localUpdateData = {
    title: "Teste Local - Desenvolvedor React",
    description: "Teste de atualização via localhost",
    location: "Remoto",
    requirements: "React\nTypeScript",
    benefits: "Flexibilidade\nHome office"
  };

  try {
    const response = await fetch('http://localhost:4000/opportunities/teste-id', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer token-fake-para-teste',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localUpdateData)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 401) {
      console.log('✅ Rota encontrada! (Erro 401 é esperado sem token válido)');
    } else if (response.status === 404) {
      const text = await response.text();
      if (text.includes('Cannot PUT')) {
        console.log('❌ Rota PUT não encontrada');
      } else {
        console.log('❌ Oportunidade não encontrada (mas rota OK)');
      }
    } else {
      console.log(`📝 Resposta: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Comandos para teste manual
console.log('='.repeat(60));
console.log('📝 COMANDOS PARA TESTE MANUAL:');
console.log('='.repeat(60));
console.log('\n🔧 cURL:');
console.log(`curl -X PUT "${API_BASE}/opportunities/SEU_ID_AQUI" \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Título Atualizado",
    "description": "Nova descrição",
    "location": "Nova localização",
    "requirements": "Requisito 1\\nRequisito 2",
    "benefits": "Benefício 1\\nBenefício 2"
  }'`);

console.log('\n🌐 HTTPie:');
console.log(`http PUT ${API_BASE}/opportunities/SEU_ID_AQUI \\
  Authorization:"Bearer SEU_TOKEN" \\
  title="Título Atualizado" \\
  description="Nova descrição" \\
  location="Nova localização"`);

console.log('\n🧪 Para executar os testes:');
console.log('1. Substitua o token na variável "token"');
console.log('2. Substitua o opportunityId por um ID válido');
console.log('3. Execute: node teste-update-api.mjs');
console.log('\n='.repeat(60));

// Descomente para executar automaticamente:
// testUpdateOpportunity();
// testLocalUpdate();
