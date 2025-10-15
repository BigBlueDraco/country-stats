import { Test, TestingModule } from '@nestjs/testing';
import { CountryStatsController } from './country-stats.controller';
import { CountryStatsService } from './country-stats.service';
import * as geoip from 'geoip-lite';
import { faker } from '@faker-js/faker';
jest.mock('geoip-lite');
const mockGeoip = geoip as jest.Mocked<typeof geoip>;
jest.mock('@faker-js/faker');
const mockFaker = faker as jest.Mocked<typeof faker>;

describe('CountryStatsController', () => {
  let controller: CountryStatsController;
  let service: jest.Mocked<CountryStatsService>;

  beforeEach(async () => {
    const mockService = {
      incrementCountryCount: jest.fn(),
      getValue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryStatsController],
      providers: [
        {
          provide: CountryStatsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CountryStatsController>(CountryStatsController);
    service = module.get(CountryStatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCountry', () => {
    it('should update country stats for valid IP with known location', async () => {
      const mockIp = '8.8.8.8';
      const mockGeoData = {
        country: 'US',
        region: 'CA',
        city: 'Mountain View',
        ll: [37.386, -122.084],
        metro: 807,
        zip: 94043,
      };

      mockGeoip.lookup.mockReturnValue(mockGeoData);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(mockIp);

      expect(mockGeoip.lookup).toHaveBeenCalledWith(mockIp);
      expect(service.incrementCountryCount).toHaveBeenCalledWith('us');
      expect(result).toEqual({
        status: 'ok',
        country: 'us',
      });
    });

    it('should handle IP with unknown location', async () => {
      const mockIp = '127.0.0.1';

      mockGeoip.lookup.mockReturnValue(null);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(mockIp);

      expect(mockGeoip.lookup).toHaveBeenCalledWith(mockIp);
      expect(service.incrementCountryCount).toHaveBeenCalledWith('unknown');
      expect(result).toEqual({
        status: 'ok',
        country: 'unknown',
      });
    });

    it('should handle IP with null country in geo data', async () => {
      const mockIp = '192.168.1.1';
      const mockGeoData = {
        country: null,
        region: null,
        city: null,
        ll: null,
        metro: null,
        zip: null,
      };

      mockGeoip.lookup.mockReturnValue(mockGeoData as any);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(mockIp);

      expect(service.incrementCountryCount).toHaveBeenCalledWith('unknown');
      expect(result).toEqual({
        status: 'ok',
        country: 'unknown',
      });
    });

    it('should handle IP with undefined country in geo data', async () => {
      const mockIp = '10.0.0.1';
      const mockGeoData = {
        region: 'XX',
        city: 'Unknown',
        ll: [0, 0],
        metro: 0,
        zip: 0,
      };

      mockGeoip.lookup.mockReturnValue(mockGeoData as any);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(mockIp);

      expect(service.incrementCountryCount).toHaveBeenCalledWith('unknown');
      expect(result).toEqual({
        status: 'ok',
        country: 'unknown',
      });
    });

    it('should convert country code to lowercase', async () => {
      const mockIp = '1.1.1.1';
      const mockGeoData = {
        country: 'GB',
        region: 'ENG',
        city: 'London',
        ll: [51.5074, -0.1278],
        metro: 0,
        zip: 0,
      };

      mockGeoip.lookup.mockReturnValue(mockGeoData);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(mockIp);

      expect(service.incrementCountryCount).toHaveBeenCalledWith('gb');
      expect(result).toEqual({
        status: 'ok',
        country: 'gb',
      });
    });

    it('should handle service errors gracefully', async () => {
      const mockIp = '8.8.8.8';
      const mockGeoData = { country: 'US' };

      mockGeoip.lookup.mockReturnValue(mockGeoData as any);
      service.incrementCountryCount.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(controller.updateCountry(mockIp)).rejects.toThrow(
        'Redis connection failed',
      );
      expect(service.incrementCountryCount).toHaveBeenCalledWith('us');
    });

    it('should handle empty IP string', async () => {
      const mockIp = '';

      mockGeoip.lookup.mockReturnValue(null);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(mockIp);

      expect(mockGeoip.lookup).toHaveBeenCalledWith('');
      expect(service.incrementCountryCount).toHaveBeenCalledWith('unknown');
      expect(result).toEqual({
        status: 'ok',
        country: 'unknown',
      });
    });

    it('should handle various country codes correctly', async () => {
      const testCases = [
        { ip: '8.8.8.8', country: 'US', expected: 'us' },
        { ip: '8.8.4.4', country: 'GB', expected: 'gb' },
        { ip: '1.1.1.1', country: 'AU', expected: 'au' },
        { ip: '208.67.222.222', country: 'CA', expected: 'ca' },
      ];

      for (const testCase of testCases) {
        mockGeoip.lookup.mockReturnValue({ country: testCase.country } as any);
        service.incrementCountryCount.mockResolvedValue();

        const result = await controller.updateCountry(testCase.ip);

        expect(service.incrementCountryCount).toHaveBeenCalledWith(
          testCase.expected,
        );
        expect(result.country).toBe(testCase.expected);

        jest.clearAllMocks();
      }
    });
  });

  describe('getAll', () => {
    it('should return country statistics from service', async () => {
      const mockStats = {
        us: 15,
        gb: 8,
        de: 5,
        fr: 3,
      };

      service.getValue.mockResolvedValue(mockStats);

      const result = await controller.getAll();

      expect(service.getValue).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it('should return null when no statistics exist', async () => {
      service.getValue.mockResolvedValue(null);

      const result = await controller.getAll();

      expect(service.getValue).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return empty object when statistics are empty', async () => {
      service.getValue.mockResolvedValue({});

      const result = await controller.getAll();

      expect(service.getValue).toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should handle service errors', async () => {
      service.getValue.mockRejectedValue(new Error('Database error'));

      await expect(controller.getAll()).rejects.toThrow('Database error');
      expect(service.getValue).toHaveBeenCalled();
    });
  });

  describe('mock endpoint', () => {
    it('should generate mock data with faker', async () => {
      const mockIPs = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '8.8.8.8'];
      mockFaker.internet.ip
        .mockReturnValueOnce(mockIPs[0])
        .mockReturnValueOnce(mockIPs[1])
        .mockReturnValueOnce(mockIPs[2])
        .mockReturnValueOnce(mockIPs[3]);
      mockGeoip.lookup
        .mockReturnValueOnce({ country: 'US' } as any)
        .mockReturnValueOnce({ country: 'GB' } as any)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({ country: 'DE' } as any);

      service.incrementCountryCount.mockResolvedValue();
      await (controller as any).mock();
      expect(mockFaker.internet.ip).toHaveBeenCalledTimes(100);
      expect(mockGeoip.lookup).toHaveBeenCalledTimes(100);
      expect(service.incrementCountryCount).toHaveBeenCalledTimes(100);
    });

    it('should handle mixed geo responses in mock', async () => {
      const responses = [
        { country: 'US' },
        null,
        { country: 'GB' },
        { country: null },
        { country: 'DE' },
      ];

      mockFaker.internet.ip.mockReturnValue('192.168.1.1');
      responses.forEach((response) => {
        mockGeoip.lookup.mockReturnValueOnce(response as any);
      });

      service.incrementCountryCount.mockResolvedValue();
      (controller as any).mock = async () => {
        for (let i = 0; i < 5; i++) {
          const ip = faker.internet.ip();
          const geo = geoip.lookup(ip);
          const countryCode = geo?.country?.toLowerCase() || 'unknown';
          await service.incrementCountryCount(countryCode);
        }
      };

      await (controller as any).mock();

      expect(service.incrementCountryCount).toHaveBeenCalledTimes(5);
      const calls = service.incrementCountryCount.mock.calls;
      expect(calls[0][0]).toBe('us');
      expect(calls[1][0]).toBe('unknown');
      expect(calls[2][0]).toBe('gb');
      expect(calls[3][0]).toBe('unknown');
      expect(calls[4][0]).toBe('de');
    });

    it('should handle service errors during mock generation', async () => {
      mockFaker.internet.ip.mockReturnValue('8.8.8.8');
      mockGeoip.lookup.mockReturnValue({ country: 'US' } as any);
      service.incrementCountryCount.mockRejectedValue(
        new Error('Service unavailable'),
      );
      await expect((controller as any).mock()).rejects.toThrow(
        'Service unavailable',
      );
    });
  });

  describe('IP edge cases', () => {
    it('should handle IPv6 addresses', async () => {
      const ipv6 = '2001:4860:4860::8888';

      mockGeoip.lookup.mockReturnValue({ country: 'US' } as any);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(ipv6);

      expect(mockGeoip.lookup).toHaveBeenCalledWith(ipv6);
      expect(result).toEqual({
        status: 'ok',
        country: 'us',
      });
    });

    it('should handle malformed IP addresses', async () => {
      const malformedIp = 'not-an-ip';

      mockGeoip.lookup.mockReturnValue(null);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(malformedIp);

      expect(mockGeoip.lookup).toHaveBeenCalledWith(malformedIp);
      expect(result).toEqual({
        status: 'ok',
        country: 'unknown',
      });
    });

    it('should handle null IP', async () => {
      mockGeoip.lookup.mockReturnValue(null);
      service.incrementCountryCount.mockResolvedValue();

      const result = await controller.updateCountry(null as any);

      expect(result).toEqual({
        status: 'ok',
        country: 'unknown',
      });
    });
  });
});
