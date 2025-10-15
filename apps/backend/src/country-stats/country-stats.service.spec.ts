import { Test, TestingModule } from '@nestjs/testing';
import { CountryStatsService } from './country-stats.service';
import Redis from 'ioredis';
import { CountryStats } from './type/country-stats.type';

describe('CountryStatsService', () => {
  let service: CountryStatsService;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryStatsService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<CountryStatsService>(CountryStatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getValue', () => {
    it('should return null when no data exists in Redis', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.getValue();

      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
    });

    it('should return parsed data when data exists in Redis', async () => {
      const mockData: CountryStats = { us: 5, ca: 3, gb: 2 };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockData));

      const result = await service.getValue();

      expect(result).toEqual(mockData);
      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
    });

    it('should handle empty object from Redis', async () => {
      mockRedis.get.mockResolvedValue('{}');

      const result = await service.getValue();

      expect(result).toEqual({});
      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
    });

    it('should handle malformed JSON gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid json');

      await expect(service.getValue()).rejects.toThrow();
    });
  });

  describe('incrementCountryCount', () => {
    it('should create new country stats when none exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('us');

      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ us: 1 }),
      );
    });

    it('should increment existing country count', async () => {
      const existingData = { us: 5, ca: 2 };
      mockRedis.get.mockResolvedValue(JSON.stringify(existingData));
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('us');

      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ us: 6, ca: 2 }),
      );
    });

    it('should add new country to existing stats', async () => {
      const existingData = { us: 3 };
      mockRedis.get.mockResolvedValue(JSON.stringify(existingData));
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('gb');

      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ us: 3, gb: 1 }),
      );
    });

    it('should handle empty object from Redis', async () => {
      mockRedis.get.mockResolvedValue('{}');
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('de');

      expect(mockRedis.get).toHaveBeenCalledWith('CountryStats');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ de: 1 }),
      );
    });

    it('should handle country codes with special characters', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('unknown');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ unknown: 1 }),
      );
    });

    it('should handle Redis set errors', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockRejectedValue(new Error('Redis connection failed'));

      await expect(service.incrementCountryCount('us')).rejects.toThrow(
        'Redis connection failed',
      );
    });

    it('should handle Redis get errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis read failed'));

      await expect(service.incrementCountryCount('us')).rejects.toThrow(
        'Redis read failed',
      );
    });
  });

  describe('private setValue method (indirectly tested)', () => {
    it('should properly serialize country stats to JSON', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('fr');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        expect.stringMatching(/"fr":1/),
      );
    });

    it('should maintain data integrity with multiple countries', async () => {
      const initialData = { us: 10, gb: 5, de: 3 };
      mockRedis.get.mockResolvedValue(JSON.stringify(initialData));
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('ca');

      const expectedData = { us: 10, gb: 5, de: 3, ca: 1 };
      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify(expectedData),
      );
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple increments for same country', async () => {
      const initialData = { us: 1 };
      mockRedis.get.mockResolvedValue(JSON.stringify(initialData));
      mockRedis.set.mockResolvedValue('OK');
      const promises = [
        service.incrementCountryCount('us'),
        service.incrementCountryCount('us'),
        service.incrementCountryCount('us'),
      ];

      await Promise.all(promises);
      expect(mockRedis.set).toHaveBeenCalledTimes(3);
    });

    it('should handle increments for different countries', async () => {
      mockRedis.get.mockResolvedValue('{}');
      mockRedis.set.mockResolvedValue('OK');

      const promises = [
        service.incrementCountryCount('us'),
        service.incrementCountryCount('gb'),
        service.incrementCountryCount('de'),
      ];

      await Promise.all(promises);

      expect(mockRedis.set).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', async () => {
      const largeData = { us: 999999999 };
      mockRedis.get.mockResolvedValue(JSON.stringify(largeData));
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('us');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ us: 1000000000 }),
      );
    });

    it('should handle empty string country code', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ '': 1 }),
      );
    });

    it('should handle whitespace in country code', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await service.incrementCountryCount('  us  ');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'CountryStats',
        JSON.stringify({ '  us  ': 1 }),
      );
    });
  });
});
