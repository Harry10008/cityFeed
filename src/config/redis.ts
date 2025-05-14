import Redis from 'ioredis';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (error: Error) => console.error('Redis Client Error:', error));
redisClient.on('connect', () => console.log('Redis Client Connected')); 