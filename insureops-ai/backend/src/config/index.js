const config = {
    // Server
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Database
    database: {
        url: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/insureops',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        name: process.env.DB_NAME || 'insureops',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        }
    },

    // LLM API Keys
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openrouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',

    // WebSocket
    wsPort: parseInt(process.env.WS_PORT, 10) || 5000
};

module.exports = config;
