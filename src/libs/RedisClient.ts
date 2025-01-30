'use server';

import Redis from 'ioredis';

let redisClient: Redis | null = null;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 3 * 60 * 1000; // 3 minúty v milisekundách

// Funkcia na vytvorenie Redis klienta
function createRedisClient() {
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
        return null; // Ukončíme pokusy o pripojenie
      }
      console.warn(`⚠️ Redis: Pokus o pripojenie #${times}, skúšam znova...`);
      return Math.min(times * 200, 2000); // Exponenciálne čakanie (max 2 sekundy)
    },
    maxRetriesPerRequest: 3, // Ak požiadavka zlyhá 3x, vráti chybu
  });

  client.on('error', (err) => {
    console.error('❌ Redis error:', err);
    if (++retryCount >= MAX_RETRIES) {
      redisClient = null; // Deaktivujeme Redis
      console.log(
        `⏳ Opätovný pokus o pripojenie k Redis prebehne o 3 minúty.`
      );
      setTimeout(() => reconnectRedis(), RETRY_INTERVAL);
    }
  });

  client.on('connect', () => {
    console.log('✅ Connected to Redis');
    retryCount = 0; // Resetujeme počet pokusov
  });

  return client;
}

// Prvý pokus o pripojenie
try {
  redisClient = createRedisClient();
} catch (error) {
  console.error('❌ Nepodarilo sa pripojiť k Redisu:', error);
  redisClient = null;
}

// Funkcia na opätovný pokus o pripojenie po 3 minútach
function reconnectRedis() {
  if (!redisClient) {
    console.log('🔄 Opätovne sa pokúšam pripojiť k Redis...');
    redisClient = createRedisClient();
  }
}

// Funkcie pre Redis s fallbackom
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
  }
}

export async function getCache(key: string): Promise<string | null> {
  if (!redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error('❌ Redis getCache error:', err);
    return null;
  }
}

export async function delCache(key: string): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error('❌ Redis delCache error:', err);
    }
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
  }
}
