'use server';

import Redis from 'ioredis';

let redisClient: Redis | null = null;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 3 * 60 * 1000; // 3 minúty v milisekundách

// Interná záložná cache
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

function isRedisEnabled(): boolean {
  return process.env.REDIS_ON?.toLowerCase() === 'true';
}

function createRedisClient() {
  if (!isRedisEnabled()) {
    console.log('ℹ️ Redis je vypnutý (REDIS_ON nie je nastavené na "true")');
    return null;
  }

  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryStrategy(times) {
      if (times >= MAX_RETRIES) {
        console.error(
          '❌ Redis: Presiahol maximálny počet pokusov o pripojenie.'
        );
        return null;
      }
      console.warn(`⚠️ Redis: Pokus o pripojenie #${times}, skúšam znova...`);
      return Math.min(times * 200, 2000);
    },
    maxRetriesPerRequest: 3,
  });

  client.on('error', (err) => {
    console.error('❌ Redis error:', err);
    if (++retryCount >= MAX_RETRIES) {
      redisClient = null;
      console.log(
        `⏳ Opätovný pokus o pripojenie k Redis prebehne o 3 minúty.`
      );
      setTimeout(reconnectRedis, RETRY_INTERVAL);
    }
  });

  client.on('connect', () => {
    console.log('✅ Connected to Redis');
    retryCount = 0;
  });

  return client;
}

try {
  redisClient = createRedisClient();
} catch (error) {
  console.error('❌ Nepodarilo sa pripojiť k Redisu:', error);
  redisClient = null;
}

function reconnectRedis() {
  if (!redisClient && isRedisEnabled()) {
    console.log('🔄 Opätovne sa pokúšam pripojiť k Redis...');
    redisClient = createRedisClient();
  }
}

export async function setCache(
  key: string,
  value: string,
  ttl?: number
): Promise<void> {
  if (redisClient) {
    try {
      if (ttl) {
        await redisClient.set(key, value, 'EX', ttl);
      } else {
        await redisClient.set(key, value);
      }
    } catch (err) {
      console.error('❌ Redis setCache error:', err);
    }
  } else {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : Number.MAX_SAFE_INTEGER;
    memoryCache.set(key, { value, expiresAt });
  }
}

export async function getCache(key: string): Promise<string | null> {
  if (redisClient) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.error('❌ Redis getCache error:', err);
    }
  } else {
    const entry = memoryCache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    } else {
      memoryCache.delete(key);
    }
  }
  return null;
}

export async function delCache(key: string): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error('❌ Redis delCache error:', err);
    }
  } else {
    memoryCache.delete(key);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
  }
}
