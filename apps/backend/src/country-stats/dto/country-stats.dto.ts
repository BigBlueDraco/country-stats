import { CountryStats } from '../type/country-stats.type';

export class CountryStatsDto implements CountryStats {
  [countryCode: string]: number;
}
