import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElasticService } from '../elastic/elastic.service';
import { SpeedtestResult } from './speedtest.types';

@Injectable()
export class SpeedtestService {
  private readonly logger = new Logger(SpeedtestService.name);
  private isRunning = false;

  constructor(
    private readonly elastic: ElasticService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron('0 0 * * *')
  async scheduledRun() {
    await this.run();
  }

  async run(): Promise<SpeedtestResult> {
    if (this.isRunning) {
      throw new Error('Speed test already in progress');
    }
    this.isRunning = true;
    this.logger.log('Speed test started');

    try {
      // TODO: integrate speedtest-net or custom measurement server
      const result: SpeedtestResult = {
        timestamp: new Date(),
        download: 0,
        upload: 0,
        ping: 0,
      };

      await this.elastic.indexSpeedtest(result);
      this.eventEmitter.emit('speedtest.result', result);
      return result;
    } finally {
      this.isRunning = false;
    }
  }
}
