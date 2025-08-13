// Script para testar se há dados de candidatos no banco
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCandidateData() {
  try {
    console.log('🔍 Verificando dados de candidatos no banco...\n');
    
    // Buscar todos os profiles de candidatos
    const profiles = await prisma.candidateProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        experiences: true,
        educations: true
      }
    });
    
    console.log(`📊 Total de perfis encontrados: ${profiles.length}\n`);
    
    profiles.forEach((profile, index) => {
      console.log(`👤 Candidato ${index + 1}:`);
      console.log(`   Nome: ${profile.user.name}`);
      console.log(`   Email: ${profile.user.email}`);
      console.log(`   Skills: ${profile.skills?.length || 0} habilidades`);
      console.log(`   Experiências: ${profile.experiences?.length || 0}`);
      console.log(`   Educação: ${profile.educations?.length || 0}`);
      console.log(`   User ID: ${profile.userId}`);
      console.log(''); // linha em branco
    });
    
    // Testar um específico se existe
    const specificProfile = await prisma.candidateProfile.findUnique({
      where: { userId: 'cmdre8nev0000q0k4m8q21nqs' },
      include: {
        user: true,
        experiences: true,
        educations: true
      }
    });
    
    if (specificProfile) {
      console.log('🎯 Perfil específico encontrado:');
      console.log(JSON.stringify(specificProfile, null, 2));
    } else {
      console.log('❌ Perfil específico não encontrado para ID: cmdre8nev0000q0k4m8q21nqs');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCandidateData();
