import { Module } from '@nestjs/common';
import { CountryStatsService } from './country-stats.service';
import { CountryStatsController } from './country-stats.controller';

@Module({
  controllers: [CountryStatsController],
  providers: [CountryStatsService],
})
export class CountryStatsModule {}
