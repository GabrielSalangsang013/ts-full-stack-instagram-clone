declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "DEVELOPMENT" | "PRODUCTION";
            
            PORT: string;

            NODE_VERSION: string;

            REACT_URL: string;

            REDIS_PASSWORD: string;
            REDIS_SOCKET_HOST: string;
            REDIS_SOCKET_PORT: string;
            
            MONGO_DB_URI: string;
            MONGO_DB_URI_LIMITER: string;

            AUTHENTICATION_TOKEN_SECRET: string;
            ACCOUNT_ACTIVATION_TOKEN_SECRET: string;
            ACCOUNT_RECOVERY_RESET_PASSWORD_TOKEN_SECRET: string;
            ACCOUNT_RECOVERY_RESET_PASSWORD_CSRF_TOKEN_SECRET: string;
            MFA_TOKEN_SECRET: string;
            PUBLIC_CSRF_TOKEN_SECRET: string;

            SMTP_HOST: string;
            SMTP_PORT: string;
            SMTP_USER: string;
            SMTP_PASSWORD: string;
            EMAIL_FROM: string;
            
            GOOGLE_AUTHENTICATOR_NAME: string;

            GOOGLE_IDENITY_SERVICES_CLIENT_ID: string;

            CLOUDINARY_URL: string;
        }
    }
}

declare module "*.json" {
    const value: any;
    export default value;
}

export {}