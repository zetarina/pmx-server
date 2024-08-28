import dotenv from 'dotenv';

dotenv.config();

interface Config {
    mongodbUri: string;
    port: number;

    baseUrl: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    clientId: string;
    clientSecret: string;
}

export const config: Config = {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pmx',
    port: parseInt(process.env.PORT || '5000', 10),
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
    clientId: process.env.CLIENT_ID || 'your_client_id',
    clientSecret: process.env.CLIENT_SECRET || 'your_client_secret'
};
