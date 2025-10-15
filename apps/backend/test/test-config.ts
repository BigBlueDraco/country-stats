import { ConfigService } from '@nestjs/config';

export const getTestConfig = (): Record<string, any> => ({
  NODE_ENV: 'test',
  PORT: 3001,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_DB: 1,
  FRONT_URL: 'http://localhost:3000',
  BASE_URL: 'http://localhost:3001',
});

export class TestConfigService extends ConfigService {
  constructor() {
    super(getTestConfig());
  }
}
