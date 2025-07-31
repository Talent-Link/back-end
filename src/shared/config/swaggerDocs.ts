/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 'clxyz123456789'
 *         email:
 *           type: string
 *           format: email
 *           example: 'usuario@exemplo.com'
 *         name:
 *           type: string
 *           example: 'João Silva'
 *         userType:
 *           type: string
 *           enum: ['RH', 'CANDIDATO']
 *           example: 'CANDIDATO'
 *         emailConfirmed:
 *           type: boolean
 *           example: true
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           example: 'https://example.com/profile.jpg'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 'clxyz123456789'
 *         name:
 *           type: string
 *           example: 'TechCorp Ltda'
 *         description:
 *           type: string
 *           nullable: true
 *           example: 'Empresa de tecnologia inovadora'
 *         address:
 *           type: string
 *           example: 'Rua das Flores, 123 - São Paulo, SP'
 *         recruiterId:
 *           type: string
 *           example: 'clxyz987654321'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Opportunity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 'clxyz123456789'
 *         title:
 *           type: string
 *           example: 'Desenvolvedor Full Stack'
 *         description:
 *           type: string
 *           example: 'Vaga para desenvolvedor com experiência em React e Node.js'
 *         requirements:
 *           type: string
 *           nullable: true
 *           example: 'Experiência com JavaScript, React, Node.js'
 *         benefits:
 *           type: string
 *           nullable: true
 *           example: 'Vale alimentação, plano de saúde, home office'
 *         salaryRange:
 *           type: string
 *           nullable: true
 *           example: 'R$ 5.000 - R$ 8.000'
 *         location:
 *           type: string
 *           nullable: true
 *           example: 'São Paulo, SP'
 *         isActive:
 *           type: boolean
 *           example: true
 *         companyId:
 *           type: string
 *           example: 'clxyz987654321'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Form:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 'clxyz123456789'
 *         title:
 *           type: string
 *           example: 'Avaliação Técnica'
 *         description:
 *           type: string
 *           nullable: true
 *           example: 'Formulário para avaliação de conhecimentos técnicos'
 *         hrUserId:
 *           type: string
 *           example: 'clxyz987654321'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FormQuestion'
 *     FormQuestion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 'clxyz123456789'
 *         question:
 *           type: string
 *           example: 'Qual é sua experiência com JavaScript?'
 *         type:
 *           type: string
 *           enum: ['MULTIPLE_CHOICE', 'OPEN_TEXT']
 *           example: 'MULTIPLE_CHOICE'
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example: ['Iniciante', 'Intermediário', 'Avançado']
 *         formId:
 *           type: string
 *           example: 'clxyz987654321'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 'clxyz123456789'
 *         title:
 *           type: string
 *           example: 'Nova oportunidade disponível'
 *         message:
 *           type: string
 *           example: 'Uma nova vaga foi publicada que pode ser do seu interesse'
 *         type:
 *           type: string
 *           enum: ['FEEDBACK', 'NOTIFICATION']
 *           example: 'NOTIFICATION'
 *         status:
 *           type: string
 *           enum: ['PENDING', 'APPROVED', 'REJECTED']
 *           example: 'PENDING'
 *         score:
 *           type: number
 *           nullable: true
 *           example: 85
 *         recipientId:
 *           type: string
 *           example: 'clxyz987654321'
 *         opportunityId:
 *           type: string
 *           nullable: true
 *           example: 'clxyz111111111'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Response:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 'clxyz123456789'
 *         candidateId:
 *           type: string
 *           example: 'clxyz987654321'
 *         opportunityId:
 *           type: string
 *           example: 'clxyz111111111'
 *         answers:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           example:
 *             question1: 'Resposta 1'
 *             question2: 'Resposta 2'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: 'Erro interno do servidor'
 *         statusCode:
 *           type: integer
 *           example: 500
 */

/**
 * @swagger
 * /auth/google/RH:
 *   get:
 *     tags: [Authentication]
 *     summary: Inicia autenticação Google para RH
 *     description: Redireciona para o Google OAuth para autenticação como RH
 *     responses:
 *       302:
 *         description: Redirecionamento para Google OAuth
 */

/**
 * @swagger
 * /auth/google/CANDIDATO:
 *   get:
 *     tags: [Authentication]
 *     summary: Inicia autenticação Google para Candidato
 *     description: Redireciona para o Google OAuth para autenticação como Candidato
 *     responses:
 *       302:
 *         description: Redirecionamento para Google OAuth
 */

/**
 * @swagger
 * /auth/google/RH/callback:
 *   get:
 *     tags: [Authentication]
 *     summary: Callback da autenticação Google para RH
 *     description: Processa o retorno da autenticação Google para usuários RH
 *     responses:
 *       302:
 *         description: Redirecionamento após autenticação
 */

/**
 * @swagger
 * /auth/google/CANDIDATO/callback:
 *   get:
 *     tags: [Authentication]
 *     summary: Callback da autenticação Google para Candidato
 *     description: Processa o retorno da autenticação Google para candidatos
 *     responses:
 *       302:
 *         description: Redirecionamento após autenticação
 */

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     tags: [Authentication]
 *     summary: Realiza logout do usuário
 *     description: Encerra a sessão do usuário autenticado
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Logout realizado com sucesso"
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtém dados do usuário autenticado
 *     description: Retorna as informações do usuário atualmente autenticado
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Obter perfil do usuário autenticado
 *     description: Retorna os dados do perfil do usuário atualmente autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Atualizar perfil do usuário autenticado
 *     description: Atualiza os dados do perfil do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.silva@email.com"
 *               profilePicture:
 *                 type: string
 *                 nullable: true
 *                 example: "https://example.com/profile.jpg"
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/stats:
 *   get:
 *     tags: [Users]
 *     summary: Obter estatísticas do usuário
 *     description: Retorna estatísticas relacionadas ao usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalApplications:
 *                   type: number
 *                   example: 15
 *                 totalOpportunities:
 *                   type: number
 *                   example: 8
 *                 totalFeedbacks:
 *                   type: number
 *                   example: 3
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags: [Users]
 *     summary: Buscar usuários (apenas RH)
 *     description: Busca usuários por critérios específicos. Disponível apenas para usuários RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Termo de busca (nome ou email)
 *         example: "João"
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [RH, CANDIDATO]
 *         description: Tipo de usuário
 *         example: "CANDIDATO"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página da busca
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Limite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de usuários encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode buscar usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obter usuário específico por ID
 *     description: Retorna os dados de um usuário específico pelo seu ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /empresa:
 *   post:
 *     tags: [Companies]
 *     summary: Criar ou atualizar empresa
 *     description: Cria uma nova empresa ou atualiza a empresa existente do usuário RH
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechCorp Ltda"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: "Empresa de tecnologia inovadora"
 *               address:
 *                 type: string
 *                 example: "Rua das Flores, 123 - São Paulo, SP"
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       201:
 *         description: Empresa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode gerenciar empresas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /empresa:
 *   get:
 *     tags: [Companies]
 *     summary: Obter empresa do usuário RH
 *     description: Retorna as informações da empresa associada ao usuário RH autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações da empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode visualizar empresas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Nenhuma empresa encontrada para este usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /empresa/rh:
 *   get:
 *     tags: [Companies]
 *     summary: Listar empresas do RH
 *     description: Lista todas as empresas associadas ao usuário RH autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "clxyz123456789"
 *                   name:
 *                     type: string
 *                     example: "TechCorp Ltda"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode visualizar empresas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities:
 *   get:
 *     tags: [Opportunities]
 *     summary: Listar todas as oportunidades
 *     description: Retorna todas as oportunidades ativas disponíveis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de oportunidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/my-applications:
 *   get:
 *     tags: [Opportunities]
 *     summary: Minhas candidaturas
 *     description: Retorna todas as oportunidades que o candidato se candidatou
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de candidaturas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/search:
 *   post:
 *     tags: [Opportunities]
 *     summary: Buscar oportunidades
 *     description: Busca oportunidades por critérios específicos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: "desenvolvedor"
 *               location:
 *                 type: string
 *                 example: "São Paulo"
 *               salaryRange:
 *                 type: string
 *                 example: "5000-8000"
 *     responses:
 *       200:
 *         description: Lista de oportunidades encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities:
 *   post:
 *     tags: [Opportunities]
 *     summary: Criar nova oportunidade
 *     description: Cria uma nova oportunidade de trabalho. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - companyId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Desenvolvedor Full Stack"
 *               description:
 *                 type: string
 *                 example: "Vaga para desenvolvedor com experiência em React e Node.js"
 *               requirements:
 *                 type: string
 *                 example: "Experiência com JavaScript, React, Node.js"
 *               benefits:
 *                 type: string
 *                 example: "Vale alimentação, plano de saúde, home office"
 *               salaryRange:
 *                 type: string
 *                 example: "R$ 5.000 - R$ 8.000"
 *               location:
 *                 type: string
 *                 example: "São Paulo, SP"
 *               companyId:
 *                 type: string
 *                 example: "clxyz123456789"
 *     responses:
 *       201:
 *         description: Oportunidade criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode criar oportunidades
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/{id}:
 *   get:
 *     tags: [Opportunities]
 *     summary: Obter oportunidade por ID
 *     description: Retorna os detalhes de uma oportunidade específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Detalhes da oportunidade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Oportunidade não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/{id}/responses:
 *   get:
 *     tags: [Opportunities]
 *     summary: Listar respostas de uma oportunidade
 *     description: Retorna todas as respostas/candidaturas para uma oportunidade específica. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Lista de respostas da oportunidade
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Response'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode ver respostas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/{responseId}/withdraw:
 *   delete:
 *     tags: [Opportunities]
 *     summary: Retirar candidatura
 *     description: Remove a candidatura do usuário para uma oportunidade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da resposta/candidatura
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Candidatura retirada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Candidatura retirada com sucesso"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidatura não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/{id}:
 *   delete:
 *     tags: [Opportunities]
 *     summary: Deletar oportunidade
 *     description: Remove uma oportunidade permanentemente. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Oportunidade deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Oportunidade deletada com sucesso"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode deletar oportunidades
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Oportunidade não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/{id}/activate:
 *   patch:
 *     tags: [Opportunities]
 *     summary: Ativar oportunidade
 *     description: Ativa uma oportunidade desativada. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Oportunidade ativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode ativar oportunidades
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Oportunidade não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/{id}/deactivate:
 *   patch:
 *     tags: [Opportunities]
 *     summary: Desativar oportunidade
 *     description: Desativa uma oportunidade ativa. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Oportunidade desativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode desativar oportunidades
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Oportunidade não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/rh:
 *   get:
 *     tags: [Opportunities]
 *     summary: Listar oportunidades do RH
 *     description: Retorna todas as oportunidades criadas pelo RH autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de oportunidades do RH
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Opportunity'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode ver suas oportunidades
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /opportunities/{id}/candidates-count:
 *   get:
 *     tags: [Opportunities]
 *     summary: Contar candidatos da oportunidade
 *     description: Retorna o número total de candidatos que se candidataram para a oportunidade. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Número de candidatos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 15
 *                 opportunityId:
 *                   type: string
 *                   example: "clxyz123456789"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode ver contagem de candidatos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Oportunidade não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/email/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registro com email e senha
 *     description: Registra um novo usuário com email e senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - userType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "senha123"
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               userType:
 *                 type: string
 *                 enum: [RH, CANDIDATO]
 *                 example: "CANDIDATO"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário registrado com sucesso. Verifique seu email para confirmar."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos ou usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/email/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login com email e senha
 *     description: Autentica um usuário com email e senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login realizado com sucesso"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/email/confirm:
 *   get:
 *     tags: [Authentication]
 *     summary: Confirmar email
 *     description: Confirma o email do usuário através do token enviado por email
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de confirmação enviado por email
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Email confirmado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email confirmado com sucesso"
 *       400:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /forms:
 *   post:
 *     tags: [Forms]
 *     summary: Criar novo formulário
 *     description: Cria um novo formulário. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Avaliação Técnica - Desenvolvedor"
 *               description:
 *                 type: string
 *                 example: "Formulário para avaliação de conhecimentos técnicos"
 *     responses:
 *       201:
 *         description: Formulário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode criar formulários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /forms:
 *   get:
 *     tags: [Forms]
 *     summary: Listar formulários do RH
 *     description: Retorna todos os formulários criados pelo RH autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de formulários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Form'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode listar formulários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /forms/{id}:
 *   get:
 *     tags: [Forms]
 *     summary: Obter formulário por ID
 *     description: Retorna os detalhes de um formulário específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do formulário
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Detalhes do formulário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode ver formulários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Formulário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /forms/{id}:
 *   put:
 *     tags: [Forms]
 *     summary: Atualizar formulário
 *     description: Atualiza um formulário existente. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do formulário
 *         example: "clxyz123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Avaliação Técnica - Desenvolvedor Senior"
 *               description:
 *                 type: string
 *                 example: "Formulário atualizado para avaliação de conhecimentos técnicos"
 *     responses:
 *       200:
 *         description: Formulário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode atualizar formulários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Formulário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /forms/{id}:
 *   delete:
 *     tags: [Forms]
 *     summary: Deletar formulário
 *     description: Remove um formulário permanentemente. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do formulário
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Formulário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Formulário deletado com sucesso"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode deletar formulários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Formulário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /forms/generate-local-question:
 *   post:
 *     tags: [Forms]
 *     summary: Gerar pergunta local
 *     description: Gera uma pergunta com base nas perguntas locais (sem salvar no banco). Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [MULTIPLE_CHOICE, OPEN_TEXT]
 *                 example: "MULTIPLE_CHOICE"
 *               topic:
 *                 type: string
 *                 example: "JavaScript"
 *     responses:
 *       200:
 *         description: Pergunta gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FormQuestion'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode gerar perguntas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /candidate/responses:
 *   post:
 *     tags: [Forms]
 *     summary: Submeter resposta do formulário
 *     description: Permite que um candidato submeta suas respostas para um formulário de uma oportunidade
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opportunityId
 *               - answers
 *             properties:
 *               opportunityId:
 *                 type: string
 *                 example: "clxyz123456789"
 *               answers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 example:
 *                   question1: "Resposta para pergunta 1"
 *                   question2: "Resposta para pergunta 2"
 *     responses:
 *       201:
 *         description: Resposta submetida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       400:
 *         description: Dados inválidos ou candidato já respondeu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /candidate/responses/{formId}:
 *   get:
 *     tags: [Forms]
 *     summary: Obter respostas do formulário
 *     description: Retorna todas as respostas de um formulário específico. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do formulário
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Lista de respostas do formulário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Response'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode ver respostas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /candidate/{id}/responded:
 *   get:
 *     tags: [Forms]
 *     summary: Verificar se candidato respondeu
 *     description: Verifica se o candidato já respondeu ao formulário de uma oportunidade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Status da resposta do candidato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasResponded:
 *                   type: boolean
 *                   example: true
 *                 responseId:
 *                   type: string
 *                   nullable: true
 *                   example: "clxyz987654321"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     tags: [Notifications]
 *     summary: Enviar notificação
 *     description: Envia uma notificação para um usuário específico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - recipientId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Nova oportunidade disponível"
 *               message:
 *                 type: string
 *                 example: "Uma nova vaga foi publicada que pode ser do seu interesse"
 *               recipientId:
 *                 type: string
 *                 example: "clxyz123456789"
 *               opportunityId:
 *                 type: string
 *                 nullable: true
 *                 example: "clxyz987654321"
 *     responses:
 *       201:
 *         description: Notificação enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Obter notificações do usuário
 *     description: Retorna todas as notificações do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /notifications/feedbacks/send:
 *   post:
 *     tags: [Notifications]
 *     summary: Enviar feedback
 *     description: Envia um feedback para um candidato sobre sua candidatura
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - opportunityId
 *               - status
 *             properties:
 *               candidateId:
 *                 type: string
 *                 example: "clxyz123456789"
 *               opportunityId:
 *                 type: string
 *                 example: "clxyz987654321"
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *                 example: "APPROVED"
 *               score:
 *                 type: number
 *                 nullable: true
 *                 example: 85
 *               message:
 *                 type: string
 *                 nullable: true
 *                 example: "Parabéns! Você foi aprovado para a próxima etapa."
 *     responses:
 *       201:
 *         description: Feedback enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /notifications/feedbacks:
 *   get:
 *     tags: [Notifications]
 *     summary: Obter feedbacks do usuário
 *     description: Retorna todos os feedbacks recebidos pelo usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /talents/candidates:
 *   get:
 *     tags: [Talents]
 *     summary: Listar todos os candidatos
 *     description: Retorna uma lista de todos os candidatos cadastrados
 *     responses:
 *       200:
 *         description: Lista de candidatos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /talents/candidates/{id}:
 *   get:
 *     tags: [Talents]
 *     summary: Obter candidato por ID
 *     description: Retorna os detalhes de um candidato específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Detalhes do candidato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Candidato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /bank-talents:
 *   get:
 *     tags: [Talents]
 *     summary: Obter banco de talentos
 *     description: Retorna o banco de talentos com candidatos e seus favoritos. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banco de talentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 talents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 favorites:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["clxyz123456789", "clxyz987654321"]
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode ver banco de talentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /bank-talents/favorite/{candidateId}:
 *   post:
 *     tags: [Talents]
 *     summary: Favoritar candidato
 *     description: Adiciona um candidato aos favoritos do RH
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *         example: "clxyz123456789"
 *     responses:
 *       201:
 *         description: Candidato favoritado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Candidato favoritado com sucesso"
 *       400:
 *         description: Candidato já está nos favoritos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode favoritar candidatos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /bank-talents/unfavorite/{candidateId}:
 *   delete:
 *     tags: [Talents]
 *     summary: Desfavoritar candidato
 *     description: Remove um candidato dos favoritos do RH
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Candidato removido dos favoritos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Candidato removido dos favoritos"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode desfavoritar candidatos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidato não encontrado nos favoritos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /reports/{candidateId}/{opportunityId}:
 *   get:
 *     tags: [Reports]
 *     summary: Gerar relatório do candidato
 *     description: Gera um relatório detalhado sobre o desempenho de um candidato em uma oportunidade específica. Disponível apenas para RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *         example: "clxyz123456789"
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oportunidade
 *         example: "clxyz987654321"
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 candidate:
 *                   $ref: '#/components/schemas/User'
 *                 opportunity:
 *                   $ref: '#/components/schemas/Opportunity'
 *                 report:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: string
 *                       example: "Candidato com bom desempenho técnico"
 *                     score:
 *                       type: number
 *                       example: 85
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Recomendado para próxima etapa", "Forte em JavaScript"]
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas RH pode gerar relatórios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidato ou oportunidade não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardMetrics:
 *       type: object
 *       properties:
 *         metrics:
 *           type: object
 *           properties:
 *             totalCandidaturas:
 *               type: object
 *               properties:
 *                 value:
 *                   type: number
 *                   example: 245
 *                 change:
 *                   type: string
 *                   example: "+12%"
 *                 period:
 *                   type: string
 *                   example: "from last period"
 *             candidatosQualificados:
 *               type: object
 *               properties:
 *                 value:
 *                   type: number
 *                   example: 89
 *                 change:
 *                   type: string
 *                   example: "+8%"
 *                 period:
 *                   type: string
 *                   example: "from last period"
 *             taxaAprovacao:
 *               type: object
 *               properties:
 *                 value:
 *                   type: number
 *                   example: 36
 *                 change:
 *                   type: string
 *                   example: "+5%"
 *                 period:
 *                   type: string
 *                   example: "from last period"
 *             vagasAtivas:
 *               type: object
 *               properties:
 *                 value:
 *                   type: number
 *                   example: 12
 *                 change:
 *                   type: string
 *                   example: "+3%"
 *                 period:
 *                   type: string
 *                   example: "from last period"
 *         charts:
 *           type: object
 *           properties:
 *             candidaturasMensais:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: string
 *                     example: "Jan"
 *                   applications:
 *                     type: number
 *                     example: 35
 *             statusCandidatos:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: ['Aceitos', 'Rejeitados', 'Em Progresso']
 *                     example: "Aceitos"
 *                   count:
 *                     type: number
 *                     example: 24
 *                   color:
 *                     type: string
 *                     example: "#4CAF50"
 *                     description: "Cor hexadecimal para o gráfico de pizza"
 *     CandidatoQualificado:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clxyz123456789"
 *         candidateId:
 *           type: string
 *           example: "clxyz987654321"
 *         answers:
 *           type: object
 *           example: {"experiencia": "5 anos", "skills": ["JavaScript", "React"]}
 *         createdAt:
 *           type: string
 *           format: date-time
 *         opportunityId:
 *           type: string
 *           example: "clxyz456789123"
 *         candidate:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "clxyz987654321"
 *             name:
 *               type: string
 *               example: "Maria Silva"
 *             email:
 *               type: string
 *               example: "maria@exemplo.com"
 *             photoUrl:
 *               type: string
 *               nullable: true
 *               example: "https://example.com/photo.jpg"
 *         opportunity:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "clxyz456789123"
 *             title:
 *               type: string
 *               example: "Desenvolvedor Frontend"
 *             description:
 *               type: string
 *               example: "Vaga para desenvolvedor React experiente"
 */

/**
 * @swagger
 * /dashboard/metrics:
 *   get:
 *     summary: Obter métricas do dashboard RH
 *     description: Retorna métricas completas do dashboard para usuários RH, incluindo total de candidaturas, taxa de aprovação, vagas ativas e gráficos
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas do dashboard retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardMetrics'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas usuários RH podem acessar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Empresa não encontrada para o usuário RH
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/candidatos:
 *   get:
 *     summary: Listar candidatos qualificados
 *     description: Retorna uma lista dos últimos 20 candidatos qualificados para as vagas da empresa do RH
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de candidatos qualificados retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CandidatoQualificado'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas usuários RH podem acessar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Empresa não encontrada para o usuário RH
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/vaga/{vagaId}:
 *   get:
 *     summary: Obter detalhes de uma vaga específica
 *     description: Retorna detalhes completos de uma vaga, incluindo estatísticas e candidatos
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vagaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da vaga
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Detalhes da vaga retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clxyz123456789"
 *                 title:
 *                   type: string
 *                   example: "Desenvolvedor Frontend"
 *                 description:
 *                   type: string
 *                   example: "Vaga para desenvolvedor React experiente"
 *                 location:
 *                   type: string
 *                   example: "São Paulo, SP"
 *                 isActive:
 *                   type: boolean
 *                   example: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 responses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CandidatoQualificado'
 *                 estatisticas:
 *                   type: object
 *                   properties:
 *                     totalCandidatos:
 *                       type: number
 *                       example: 15
 *                     ultimaCandidatura:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas usuários RH podem acessar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vaga não encontrada ou não pertence ao usuário RH
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /candidates/profile:
 *   get:
 *     tags: [Users]
 *     summary: Obter perfil completo do candidato
 *     description: Retorna o perfil completo do candidato autenticado, incluindo habilidades, experiências e educação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do candidato retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateProfile'
 *       404:
 *         description: Perfil não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /candidates/profile:
 *   put:
 *     tags: [Users]
 *     summary: Criar ou atualizar perfil do candidato
 *     description: Cria ou atualiza o perfil completo do candidato, incluindo telefone, habilidades, experiências e educação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 nullable: true
 *                 example: "+55 (11) 99999-9999"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "TypeScript", "Node.js", "PostgreSQL"]
 *               resumeUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "https://example.com/resume.pdf"
 *               experiences:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ProfessionalExperienceInput'
 *               educations:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/EducationInput'
 *     responses:
 *       200:
 *         description: Perfil criado ou atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateProfile'
 *       403:
 *         description: Apenas candidatos podem criar perfis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /candidates/profile/resume:
 *   post:
 *     tags: [Users]
 *     summary: Upload de currículo PDF
 *     description: Faz upload do currículo em PDF do candidato
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeUrl
 *             properties:
 *               resumeUrl:
 *                 type: string
 *                 example: "https://example.com/resume.pdf"
 *     responses:
 *       200:
 *         description: Currículo enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Currículo enviado com sucesso"
 *                 resumeUrl:
 *                   type: string
 *                   example: "https://example.com/resume.pdf"
 *       400:
 *         description: URL do currículo é obrigatória
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /candidates/profile/{candidateId}:
 *   get:
 *     tags: [Users]
 *     summary: Obter perfil de candidato por ID (RH)
 *     description: Retorna o perfil completo de um candidato específico. Disponível apenas para usuários RH.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do candidato
 *         example: "clxyz123456789"
 *     responses:
 *       200:
 *         description: Perfil do candidato retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CandidateProfile'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Perfil de candidato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas usuários RH podem acessar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export {};
