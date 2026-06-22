import { Controller, Get, Query } from '@nestjs/common';
import { ElasticService } from '../elastic/elastic.service';

@Controller('traffic')
export class TrafficController {
  constructor(private readonly elastic: ElasticService) {}

  @Get('history')
  async getHistory(
    @Query('from') from: string = 'now-1h',
    @Query('to') to: string = 'now',
    @Query('interval') interval: string = '1m',
  ) {
    return this.elastic.queryTrafficHistory(from, to, interval);
  }
}
