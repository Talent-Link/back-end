# API de Perfil do Candidato - TalentLink

## Visão Geral

A API de perfil do candidato permite que candidatos criem e gerenciem seus perfis completos, incluindo:

- ✅ **Número de Telefone**: Contato direto do candidato
- ✅ **Habilidades e Competências**: Lista de tecnologias e skills
- ✅ **Experiência Profissional**: Histórico de trabalhos anteriores
- ✅ **Formação Acadêmica**: Educação e cursos
- ✅ **Upload de Currículo**: Arquivo PDF do currículo

## Endpoints Disponíveis

### 🔐 Para Candidatos

#### 1. Obter Perfil Próprio
```http
GET /candidates/profile
Authorization: Bearer <token_jwt>
```

#### 2. Criar/Atualizar Perfil Completo
```http
PUT /candidates/profile
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "phoneNumber": "+55 (11) 99999-9999",
  "skills": [
    "React",
    "TypeScript", 
    "Node.js",
    "PostgreSQL",
    "Docker",
    "AWS"
  ],
  "resumeUrl": "https://example.com/resume.pdf",
  "experiences": [
    {
      "position": "Frontend Developer",
      "company": "Tech Solutions Inc.",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31",
      "description": "Developed and maintained React applications. Led a team of junior developers on multiple projects. Implemented new features and optimized existing code for better performance."
    },
    {
      "position": "UI Developer",
      "company": "WebDesign Co.",
      "startDate": "2018-06-01",
      "endDate": "2019-12-31",
      "description": "Designed and implemented user interfaces for web applications. Collaborated with designers and backend developers to create seamless user experiences."
    }
  ],
  "educations": [
    {
      "institution": "Universidade de São Paulo",
      "course": "Ciência da Computação",
      "degree": "Bacharel",
      "startYear": 2018,
      "endYear": 2022
    },
    {
      "institution": "Rocketseat",
      "course": "Ignite React",
      "degree": "Certificado",
      "startYear": 2023,
      "endYear": 2023
    }
  ]
}
```

#### 3. Upload de Currículo PDF
```http
POST /candidates/profile/resume
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "resumeUrl": "https://example.com/resume.pdf"
}
```

### 👔 Para RH

#### 4. Visualizar Perfil de Candidato
```http
GET /candidates/profile/{candidateId}
Authorization: Bearer <token_jwt_rh>
```

## Estrutura de Dados

### CandidateProfile
```json
{
  "id": "clxyz123456789",
  "userId": "clxyz987654321",
  "phoneNumber": "+55 (11) 99999-9999",
  "resumeUrl": "https://example.com/resume.pdf",
  "skills": ["React", "TypeScript", "Node.js"],
  "experiences": [
    {
      "id": "exp_123",
      "position": "Frontend Developer", 
      "company": "Tech Solutions Inc.",
      "startDate": "2020-01-01T00:00:00.000Z",
      "endDate": "2023-12-31T00:00:00.000Z",
      "description": "Desenvolveu aplicações React..."
    }
  ],
  "educations": [
    {
      "id": "edu_123",
      "institution": "Universidade de São Paulo",
      "course": "Ciência da Computação", 
      "degree": "Bacharel",
      "startYear": 2018,
      "endYear": 2022
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Fluxo de Uso

### 1. **Candidato faz login**
```http
POST /auth/google/CANDIDATO
```

### 2. **Candidato cria perfil inicial após login**
```http
PUT /candidates/profile
{
  "phoneNumber": "+55 (11) 98765-4321",
  "skills": ["JavaScript", "React"],
  "resumeUrl": null,
  "experiences": [],
  "educations": []
}
```

### 3. **Candidato adiciona experiências**
```http
PUT /candidates/profile
{
  "phoneNumber": "+55 (11) 98765-4321",
  "skills": ["JavaScript", "React", "TypeScript"],
  "experiences": [
    {
      "position": "Desenvolvedor Jr",
      "company": "StartupX",
      "startDate": "2023-01-01", 
      "endDate": null,
      "description": "Desenvolvimento de features..."
    }
  ]
}
```

### 4. **Candidato faz upload do currículo**
```http
POST /candidates/profile/resume
{
  "resumeUrl": "https://storage.com/curriculo.pdf"
}
```

### 5. **RH visualiza perfil do candidato**
```http
GET /candidates/profile/clxyz987654321
```

## Códigos de Status

- ✅ **200** - Sucesso
- ❌ **400** - Dados inválidos
- 🔒 **401** - Não autenticado  
- 🚫 **403** - Sem permissão (ex: RH tentando criar perfil)
- ❓ **404** - Perfil não encontrado
- 💥 **500** - Erro interno

## Validações

### Número de Telefone
- **phoneNumber**: Campo opcional
- Formato recomendado: "+55 (11) 99999-9999"
- Permite contato direto com o candidato

### Habilidades
- Array de strings
- Máximo recomendado: 20 skills

### Experiência Profissional
- **position**: Obrigatório
- **company**: Obrigatório  
- **startDate**: Obrigatório (formato: YYYY-MM-DD)
- **endDate**: Opcional (null = ainda trabalha)
- **description**: Opcional

### Formação Acadêmica
- **institution**: Obrigatório
- **course**: Obrigatório
- **startYear**: Obrigatório (formato: YYYY)
- **endYear**: Opcional (null = ainda cursando)
- **degree**: Opcional

### Currículo
- **resumeUrl**: URL válida para arquivo PDF
- Recomenda-se usar serviços como AWS S3, Cloudinary, etc.

## Casos de Uso Comuns

### ✅ Candidato Recém-Cadastrado
1. Login via Google OAuth
2. Adicionar número de telefone para contato
3. Criar perfil básico com skills principais
4. Adicionar experiência mais recente
5. Upload do currículo
6. Completar com educação

### ✅ RH Avaliando Candidatos  
1. Login como RH
2. Buscar candidatos no banco de talentos
3. Visualizar perfil completo de candidatos
4. Baixar currículo para análise
5. Enviar feedback através da API

### ✅ Candidato Atualizando Perfil
1. Atualização do número de telefone
2. Nova experiência profissional
3. Novas habilidades adquiridas  
4. Curso/certificação finalizada
5. Atualização do currículo

## Integração Frontend

```javascript
// Exemplo de integração React
const updateCandidateProfile = async (profileData) => {
  try {
    const response = await fetch('/candidates/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    if (response.ok) {
      const updatedProfile = await response.json();
      console.log('Perfil atualizado:', updatedProfile);
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
  }
};
```

## Segurança

- 🔐 **JWT Token obrigatório** em todas as rotas
- 🎯 **Role-based access**: Candidatos só acessam próprio perfil, RH acessa qualquer perfil
- 🛡️ **Validação de dados** em todos os inputs
- 🔍 **Logs de auditoria** para mudanças de perfil
