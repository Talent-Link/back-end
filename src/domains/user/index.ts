// Exporta todas as rotas do domínio de usuário
export { default as userRoutes } from "./routes/userRoutes";
export { default as candidateProfileRoutes } from "./routes/candidateProfileRoutes";
export { default as resumeAnalysisRoutes } from "./routes/resumeAnalysisRoutes";

// Exporta todos os controllers do domínio de usuário
export * from "./controllers/userController";
export * from "./controllers/candidateProfileController";
export * from "./controllers/resumeAnalysisController";
