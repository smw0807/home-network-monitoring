import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ElasticService } from '../elastic/elastic.service';
import type { TrafficRate } from '../snmp/snmp.types';

@Injectable()
export class TrafficService {
  private readonly logger = new Logger(TrafficService.name);

  constructor(private readonly elastic: ElasticService) {}

  @OnEvent('traffic.rate')
  async handleTrafficRate(rate: TrafficRate): Promise<void> {
    try {
      await this.elastic.indexTraffic(rate);
    } catch (err) {
      this.logger.error('Failed to index traffic', err);
    }
  }
}
