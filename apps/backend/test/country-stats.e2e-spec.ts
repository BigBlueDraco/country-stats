import { ConfigModule } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { CountryStatsController } from '../src/country-stats/country-stats.controller';
import { CountryStatsService } from '../src/country-stats/country-stats.service';
import request from 'supertest';
import { getTestConfig } from './test-config';
import { MOCK_COUNTRY_DATA } from './test-utils';

jest.mock('ioredis');

describe('CountryStatsController (e2e)', () => {
  let app: NestFastifyApplication;
  let mockRedis: jest.Mocked<Redis>;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      flushdb: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => getTestConfig()],
        }),
      ],
      controllers: [CountryStatsController],
      providers: [
        CountryStatsService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedis,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.enableCors();

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.flushdb.mockResolvedValue('OK');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/country-stats (GET)', () => {
    it('should return empty object when no data exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/country-stats')
        .expect(200);

      expect(response.body).toBeNull();
    });

    it('should return country statistics when data exists', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(MOCK_COUNTRY_DATA));

      const response = await request(app.getHttpServer())
        .get('/country-stats')
        .expect(200);

      expect(response.body).toEqual(MOCK_COUNTRY_DATA);
    });

    it('should return updated statistics after multiple requests', async () => {
      const initialData = { us: 1, ca: 2 };
      mockRedis.get.mockResolvedValue(JSON.stringify(initialData));

      let response = await request(app.getHttpServer())
        .get('/country-stats')
        .expect(200);

      expect(response.body).toEqual(initialData);

      const updatedData = { us: 5, ca: 3, fr: 1 };
      mockRedis.get.mockResolvedValue(JSON.stringify(updatedData));

      response = await request(app.getHttpServer())
        .get('/country-stats')
        .expect(200);

      expect(response.body).toEqual(updatedData);
    });
  });

  describe('/country-stats (POST)', () => {
    it('should increment country count for valid IP', async () => {
      const response = await request(app.getHttpServer())
        .post('/country-stats')
        .set('X-Forwarded-For', '8.8.8.8')
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'ok',
          country: expect.any(String),
        }),
      );

      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should increment existing country count', async () => {
      const existingData = { us: 3 };
      mockRedis.get.mockResolvedValue(JSON.stringify(existingData));

      const response = await request(app.getHttpServer())
        .post('/country-stats')
        .set('X-Forwarded-For', '8.8.8.8')
        .expect(201);

      expect(response.body.status).toBe('ok');
      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should handle unknown IP addresses', async () => {
      const response = await request(app.getHttpServer())
        .post('/country-stats')
        .set('X-Forwarded-For', '127.0.0.1')
        .expect(201);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('country');
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should handle multiple requests from different countries', async () => {
      await request(app.getHttpServer())
        .post('/country-stats')
        .set('X-Forwarded-For', '8.8.8.8')
        .expect(201);

      await request(app.getHttpServer())
        .post('/country-stats')
        .set('X-Forwarded-For', '8.8.4.4')
        .expect(201);

      await request(app.getHttpServer())
        .post('/country-stats')
        .set('X-Forwarded-For', '8.8.8.8')
        .expect(201);

      expect(mockRedis.set).toHaveBeenCalledTimes(3);
    });

    it('should handle missing IP header gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/country-stats')
        .expect(201);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('country');
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });
});
