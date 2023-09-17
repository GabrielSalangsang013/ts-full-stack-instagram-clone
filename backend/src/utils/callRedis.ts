import { createClient } from 'redis';

export default async function callRedis() {
    let client = createClient({
        url: process.env.REDIS_URL as string
    });

    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();

    return client;
}