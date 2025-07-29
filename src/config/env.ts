import dotenv from "dotenv";

dotenv.config()
interface EnvConfig {
    PORT: string;
    MONGODB_URL: string;
    NODE_ENV: string;
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables : string[] = ['PORT', 'MONGODB_URL', 'NODE_ENV'];

    requiredEnvVariables.forEach(key=>{
        if(!process.env[key]){
            throw new Error(`Missing env variable ${key}`)
        }
    })
    return {
        PORT: process.env.PORT as string,
        MONGODB_URL: process.env.MONGODB_URL as string,
        NODE_ENV: process.env.NODE_ENV as string
    }
}

export const envVars = loadEnvVariables();