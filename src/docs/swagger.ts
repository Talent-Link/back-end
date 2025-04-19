// src/docs/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "TalentLink API",
    version: "1.0.0",
    description: "Documentação da API do TalentLink",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Caminhos onde as anotações Swagger estarão
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
