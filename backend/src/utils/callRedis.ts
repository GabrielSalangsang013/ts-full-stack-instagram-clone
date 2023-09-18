import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export default async function callRedis() {
    const client = createClient({
        password: process.env.REDIS_PASSWORD as string,
        socket: {
            host: process.env.REDIS_SOCKET_HOST as string,
            port: Number(process.env.REDIS_SOCKET_PORT) as number
        }
    });

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();

    return client;
}