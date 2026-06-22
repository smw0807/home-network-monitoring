import { Controller, Get, Post, Query } from '@nestjs/common';
import { SpeedtestService } from './speedtest.service';
import { ElasticService } from '../elastic/elastic.service';

@Controller('speedtest')
export class SpeedtestController {
  constructor(
    private readonly speedtest: SpeedtestService,
    private readonly elastic: ElasticService,
  ) {}

  @Post('run')
  async run() {
    return this.speedtest.run();
  }

  @Get('history')
  async getHistory(
    @Query('from') from: string = 'now-30d',
    @Query('to') to: string = 'now',
  ) {
    return this.elastic.querySpeedtestHistory(from, to);
  }
}
