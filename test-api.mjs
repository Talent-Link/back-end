import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🧪 Testando API do TalentLink...\n');

  // Teste 1: Verificar se a API está online
  try {
    console.log('1. Testando se API está online...');
    const response = await fetch(`${API_BASE_URL}/`);
    const text = await response.text();
    console.log('✅ API está online:', text);
  } catch (error) {
    console.log('❌ API não está respondendo:', error.message);
    return;
  }

  // Teste 2: Verificar se endpoint de candidatos existe
  try {
    console.log('\n2. Testando endpoint de candidatos sem autenticação...');
    const response = await fetch(`${API_BASE_URL}/candidates/profile`);
    console.log('Status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Endpoint existe e está protegido (401 esperado)');
    } else {
      const text = await response.text();
      console.log('Resposta:', text);
    }
  } catch (error) {
    console.log('❌ Erro ao testar endpoint:', error.message);
  }

  // Teste 3: Verificar CORS
  try {
    console.log('\n3. Testando CORS...');
    const response = await fetch(`${API_BASE_URL}/candidates/profile`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://talentlink-wd88.onrender.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization,Content-Type'
      }
    });
    
    console.log('Status CORS:', response.status);
    console.log('Headers CORS:');
    response.headers.forEach((value, key) => {
      if (key.includes('access-control')) {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    if (response.status === 200) {
      console.log('✅ CORS configurado corretamente');
    }
  } catch (error) {
    console.log('❌ Erro no teste de CORS:', error.message);
  }

  console.log('\n🏁 Testes concluídos!');
}

testAPI();
