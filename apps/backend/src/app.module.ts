import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { CountryStatsModule } from './country-stats/country-stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    CountryStatsModule,
  ],
})
export class AppModule {}
