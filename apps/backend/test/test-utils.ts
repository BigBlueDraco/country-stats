import Redis from 'ioredis';

export class TestUtils {
  static async clearRedisTestData(redis: Redis): Promise<void> {
    await redis.flushdb();
  }

  static async setTestCountryData(
    redis: Redis,
    data: Record<string, number>,
  ): Promise<void> {
    await redis.set('CountryStats', JSON.stringify(data));
  }

  static async getTestCountryData(
    redis: Redis,
  ): Promise<Record<string, number> | null> {
    const data = await redis.get('CountryStats');
    return data ? (JSON.parse(data) as Record<string, number>) : null;
  }

  static getKnownIPs() {
    return {
      US: '8.8.8.8',
      GB: '8.8.4.4',
      LOCALHOST: '127.0.0.1',
      PRIVATE: '192.168.1.1',
    };
  }

  static createRedisTestClient(): Redis {
    return new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '1'),
    });
  }
}

export const MOCK_COUNTRY_DATA = {
  us: 15,
  gb: 8,
  de: 5,
  fr: 3,
  ca: 2,
  jp: 1,
};

export const EXPECTED_RESPONSE_SCHEMA = {
  POST_SUCCESS: {
    status: 'ok',
    country: 'string',
  },
} as const;
