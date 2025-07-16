// Exporta todas as rotas do domínio de autenticação
export { default as authRoutes } from "./routes/authRoutes";
export { default as emailAuthRouter } from "./routes/emailAuthRouter";

// Exporta todos os controllers do domínio de autenticação  
export * from "./controllers/authController";
export * from "./controllers/emailAuthController";
