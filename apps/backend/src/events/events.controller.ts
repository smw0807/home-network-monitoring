import { Controller, Get, Query } from '@nestjs/common';
import { ElasticService } from '../elastic/elastic.service';

@Controller('events')
export class EventsController {
  constructor(private readonly elastic: ElasticService) {}

  @Get()
  async findAll(@Query('from') from: string = 'now-7d', @Query('to') to: string = 'now') {
    const result = await this.elastic.client.search({
      index: 'device-logs',
      sort: [{ timestamp: { order: 'desc' } }],
      query: {
        bool: {
          must: [{ term: { isNew: true } }, { range: { timestamp: { gte: from, lte: to } } }],
        },
      },
    });
    return result.hits.hits.map((h) => h._source);
  }
}
