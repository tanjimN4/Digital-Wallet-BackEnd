import dotenv from "dotenv";

dotenv.config()
interface EnvConfig {
    PORT: string;
    MONGODB_URL: string;
    NODE_ENV: string;
    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRE: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_EXPIRE: string,
    BCRYPT_SALT_ROUND: string,
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = ['PORT', 'MONGODB_URL', 'NODE_ENV', 'JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRE', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRE', 'BCRYPT_SALT_ROUND'];

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing env variable ${key}`)
        }
    })
    return {
        PORT: process.env.PORT as string,
        MONGODB_URL: process.env.MONGODB_URL as string,
        NODE_ENV: process.env.NODE_ENV as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE as string,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string
    }
}

export const envVars = loadEnvVariables();