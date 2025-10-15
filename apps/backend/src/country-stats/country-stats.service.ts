import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { CountryStats } from './type/country-stats.type';

@Injectable()
export class CountryStatsService {
  private redisKey = 'CountryStats';
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private async setValue(value: CountryStats) {
    await this.redis.set(this.redisKey, JSON.stringify(value));
  }

  async getValue(): Promise<CountryStats | null> {
    const val = await this.redis.get(this.redisKey);
    return val ? (JSON.parse(val) as CountryStats) : null;
  }

  async incrementCountryCount(code: string) {
    let value = await this.getValue();
    if (!value) {
      value = {};
    }
    if (!value[code]) {
      value[code] = 0;
    }
    value[code] = value[code] + 1;
    await this.setValue(value);
  }
}
