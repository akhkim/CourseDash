import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const DB_CONFIG = {
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    cluster: process.env.MONGO_CLUSTER,
    options: process.env.MONGO_OPTIONS || 'retryWrites=true&w=majority',
    appName: process.env.MONGO_APP_NAME || 'Cluster0',
    dbName: process.env.MONGO_DB_NAME || 'Prod',
    defaultConnectionString: 'mongodb+srv://bhavyajain364:uoftinder@cluster0.5nodi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
} as const;

export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000',
    endpoints: {
        chat: '/api/chat',
        users: '/api/users'
    }
} as const; 