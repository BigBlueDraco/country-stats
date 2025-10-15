import { Controller, Get, Ip, Post } from '@nestjs/common';
import * as geoip from 'geoip-lite';
import { CountryStatsService } from './country-stats.service';
import { faker } from '@faker-js/faker';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('country-stats')
export class CountryStatsController {
  constructor(private readonly countryStatsService: CountryStatsService) {}
  @Post()
  @ApiCreatedResponse({
    description: 'Country statistics',
    schema: {
      type: 'object',
      example: {
        status: 'ok',
        country: 'ua',
      },
    },
  })
  async updateCountry(@Ip() ip: string) {
    const geo = geoip.lookup(ip);
    const countryCode = geo?.country?.toLowerCase() || 'unknown';
    await this.countryStatsService.incrementCountryCount(countryCode);
    return { status: 'ok', country: countryCode };
  }
  @Get()
  @ApiOkResponse({
    description: 'Country statistics',
    schema: {
      type: 'object',
      additionalProperties: { type: 'number' },
      example: {
        us: 150,
        gb: 72,
        de: 65,
      },
    },
  })
  async getAll() {
    return this.countryStatsService.getValue();
  }
  @Post('mock')
  private async mock() {
    for (let i = 0; i < 100; i++) {
      const ip = faker.internet.ip();
      const geo = geoip.lookup(ip);
      const countryCode = geo?.country?.toLowerCase() || 'unknown';
      await this.countryStatsService.incrementCountryCount(countryCode);
    }
  }
}
