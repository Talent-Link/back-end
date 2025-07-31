import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TalentLink API',
      version: '1.0.0',
      description: 'API completa para plataforma de gestão de talentos e oportunidades',
    
      servers: [
        {
          url: 'http://localhost:4000',
          description: 'Servidor de desenvolvimento'
        },
        {
          url: 'https://talentlink-wd88.onrender.com',
          description: 'Servidor de produção'
        }
      ]
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Autenticação e autorização de usuários'
      },
      {
        name: 'Users',
        description: 'Gerenciamento de usuários'
      },
      {
        name: 'Companies',
        description: 'Gerenciamento de empresas'
      },
      {
        name: 'Opportunities',
        description: 'Gerenciamento de vagas e oportunidades'
      },
      {
        name: 'Forms',
        description: 'Formulários e respostas'
      },
      {
        name: 'Talents',
        description: 'Banco de talentos'
      },
      {
        name: 'Reports',
        description: 'Relatórios e análises'
      },
      {
        name: 'Dashboard',
        description: 'Métricas e dashboard para RH'
      },
      {
        name: 'Notifications',
        description: 'Notificações e feedbacks'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@exemplo.com'
            },
            name: {
              type: 'string',
              example: 'João Silva'
            },
            userType: {
              type: 'string',
              enum: ['RH', 'CANDIDATO'],
              example: 'CANDIDATO'
            },
            emailConfirmed: {
              type: 'boolean',
              example: true
            },
            profilePicture: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/profile.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            name: {
              type: 'string',
              example: 'TechCorp Ltda'
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Empresa de tecnologia inovadora'
            },
            address: {
              type: 'string',
              example: 'Rua das Flores, 123 - São Paulo, SP'
            },
            recruiterId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Opportunity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            title: {
              type: 'string',
              example: 'Desenvolvedor Full Stack'
            },
            description: {
              type: 'string',
              example: 'Vaga para desenvolvedor com experiência em React e Node.js'
            },
            requirements: {
              type: 'string',
              nullable: true,
              example: 'Experiência com JavaScript, React, Node.js'
            },
            benefits: {
              type: 'string',
              nullable: true,
              example: 'Vale alimentação, plano de saúde, home office'
            },
            salaryRange: {
              type: 'string',
              nullable: true,
              example: 'R$ 5.000 - R$ 8.000'
            },
            location: {
              type: 'string',
              nullable: true,
              example: 'São Paulo, SP'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            companyId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Form: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            title: {
              type: 'string',
              example: 'Avaliação Técnica - Desenvolvedor'
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Formulário para avaliação de conhecimentos técnicos'
            },
            companyId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        FormQuestion: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            text: {
              type: 'string',
              example: 'Qual sua experiência com React?'
            },
            type: {
              type: 'string',
              enum: ['MULTIPLE_CHOICE', 'OPEN_TEXT'],
              example: 'MULTIPLE_CHOICE'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Iniciante', 'Intermediário', 'Avançado']
            },
            formId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            title: {
              type: 'string',
              example: 'Nova oportunidade disponível'
            },
            message: {
              type: 'string',
              example: 'Uma nova vaga foi publicada que pode ser do seu interesse'
            },
            type: {
              type: 'string',
              enum: ['FEEDBACK', 'NOTIFICATION'],
              example: 'NOTIFICATION'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              example: 'PENDING'
            },
            score: {
              type: 'number',
              nullable: true,
              example: 85
            },
            recipientId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            opportunityId: {
              type: 'string',
              nullable: true,
              example: 'clxyz111111111'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Response: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            candidateId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            opportunityId: {
              type: 'string',
              example: 'clxyz111111111'
            },
            answers: {
              type: 'object',
              additionalProperties: {
                type: 'string'
              },
              example: {
                'question1': 'Resposta 1',
                'question2': 'Resposta 2'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erro interno do servidor'
            },
            statusCode: {
              type: 'integer',
              example: 500
            }
          }
        },
        CandidateProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            userId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            phoneNumber: {
              type: 'string',
              nullable: true,
              example: '+55 (11) 99999-9999'
            },
            resumeUrl: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/resume.pdf'
            },
            skills: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
            },
            experiences: {
              type: 'array',
              items: {
                '$ref': '#/components/schemas/ProfessionalExperience'
              }
            },
            educations: {
              type: 'array',
              items: {
                '$ref': '#/components/schemas/Education'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ProfessionalExperience: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            profileId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            position: {
              type: 'string',
              example: 'Frontend Developer'
            },
            company: {
              type: 'string',
              example: 'Tech Solutions Inc.'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              example: '2020-01-01T00:00:00.000Z'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2023-12-31T00:00:00.000Z'
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Developed and maintained React applications. Led a team of junior developers on multiple projects.'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ProfessionalExperienceInput: {
          type: 'object',
          required: ['position', 'company', 'startDate'],
          properties: {
            position: {
              type: 'string',
              example: 'Frontend Developer'
            },
            company: {
              type: 'string',
              example: 'Tech Solutions Inc.'
            },
            startDate: {
              type: 'string',
              format: 'date',
              example: '2020-01-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              example: '2023-12-31'
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Developed and maintained React applications. Led a team of junior developers on multiple projects.'
            }
          }
        },
        Education: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789'
            },
            profileId: {
              type: 'string',
              example: 'clxyz987654321'
            },
            institution: {
              type: 'string',
              example: 'Universidade de São Paulo'
            },
            course: {
              type: 'string',
              example: 'Ciência da Computação'
            },
            degree: {
              type: 'string',
              nullable: true,
              example: 'Bacharel'
            },
            startYear: {
              type: 'integer',
              example: 2018
            },
            endYear: {
              type: 'integer',
              nullable: true,
              example: 2022
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        EducationInput: {
          type: 'object',
          required: ['institution', 'course', 'startYear'],
          properties: {
            institution: {
              type: 'string',
              example: 'Universidade de São Paulo'
            },
            course: {
              type: 'string',
              example: 'Ciência da Computação'
            },
            degree: {
              type: 'string',
              nullable: true,
              example: 'Bacharel'
            },
            startYear: {
              type: 'integer',
              example: 2018
            },
            endYear: {
              type: 'integer',
              nullable: true,
              example: 2022
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        sessionAuth: []
      }
    ]
  },
  apis: [
    './src/shared/config/swaggerDocs.ts'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TalentLink API Documentation'
  }));
};

export { swaggerSpec };
