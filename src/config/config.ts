import { config as conf } from 'dotenv';

conf();

const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
};

export const config = Object.freeze(_config);
