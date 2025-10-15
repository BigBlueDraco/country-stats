import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export class TestModuleUtils {
  static createMockRedisClient(): jest.Mocked<Redis> {
    return {
      get: jest.fn(),
      set: jest.fn(),
      flushdb: jest.fn(),
      disconnect: jest.fn(),
      quit: jest.fn(),
    } as unknown as jest.Mocked<Redis>;
  }

  static createMockConfigService(
    config: Record<string, any> = {},
  ): jest.Mocked<ConfigService> {
    const mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockConfigService.get.mockImplementation((key: string) => {
      return config[key] || process.env[key];
    });

    return mockConfigService;
  }

  static async createTestModule(): Promise<TestingModule> {
    const moduleBuilder = Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useValue: TestModuleUtils.createMockRedisClient(),
        },
      ],
      controllers: [],
    });

    return moduleBuilder.compile();
  }

  static setupTestEnvironment(config: Record<string, string> = {}) {
    const originalEnv = { ...process.env };

    const testConfig = {
      NODE_ENV: 'test',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: undefined,
      FRONT_URL: 'http://localhost:3000',
      ...config,
    };

    Object.keys(testConfig).forEach((key) => {
      if (testConfig[key] !== undefined) {
        process.env[key] = String(testConfig[key]);
      }
    });

    return () => {
      process.env = originalEnv;
    };
  }

  static createTestCountryData(overrides: Record<string, number> = {}) {
    return {
      us: 15,
      gb: 10,
      de: 8,
      fr: 5,
      ca: 3,
      jp: 2,
      ...overrides,
    };
  }

  static createMockGeoResponse(
    country?: string,
    overrides: Record<string, unknown> = {},
  ) {
    if (!country) {
      return null;
    }

    return {
      country: country.toUpperCase(),
      region: 'XX',
      city: 'Test City',
      ll: [0, 0],
      metro: 0,
      zip: 0,
      ...overrides,
    };
  }

  static getTestIPs() {
    return {
      US: '8.8.8.8',
      GB: '8.8.4.4',
      DE: '9.9.9.9',
      FR: '1.1.1.1',
      CA: '208.67.222.222',
      UNKNOWN: '127.0.0.1',
      PRIVATE: '192.168.1.1',
      IPv6: '2001:4860:4860::8888',
    };
  }

  static async flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
  }

  static createSpyObject<T>(
    baseName: string,
    methodNames: (keyof T)[],
  ): jest.Mocked<T> {
    const obj: Record<string, jest.Mock> = {};
    methodNames.forEach((methodName) => {
      obj[String(methodName)] = jest
        .fn()
        .mockName(`${baseName}.${String(methodName)}`);
    });
    return obj as jest.Mocked<T>;
  }

  static validateRequiredProperties<T>(
    obj: T,
    requiredProps: (keyof T)[],
  ): void {
    requiredProps.forEach((prop) => {
      if (obj[prop] === undefined || obj[prop] === null) {
        throw new Error(`Missing required property: ${String(prop)}`);
      }
    });
  }

  static createPartialMock<T>(implementations: Partial<T>): jest.Mocked<T> {
    return implementations as jest.Mocked<T>;
  }

  static async measureExecutionTime<T>(
    operation: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    return { result, duration };
  }

  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 100,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  static generateRealisticCountryStats(totalVisitors: number = 1000) {
    const countries = [
      'us',
      'gb',
      'de',
      'fr',
      'ca',
      'jp',
      'au',
      'br',
      'in',
      'cn',
    ];
    const weights = [0.25, 0.15, 0.12, 0.1, 0.08, 0.06, 0.05, 0.05, 0.07, 0.07];

    const result: Record<string, number> = {};
    let remaining = totalVisitors;

    countries.forEach((country, index) => {
      if (index === countries.length - 1) {
        result[country] = remaining;
      } else {
        const count = Math.floor(totalVisitors * weights[index]);
        result[country] = count;
        remaining -= count;
      }
    });

    return result;
  }
}
