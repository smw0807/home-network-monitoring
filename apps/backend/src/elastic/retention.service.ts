import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ElasticService } from './elastic.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly elastic: ElasticService,
    private readonly settings: SettingsService,
  ) {}

  // 매일 새벽 3시 실행
  @Cron('0 3 * * *')
  async purgeOldData() {
    const { dataRetentionDays } = this.settings.get();
    const cutoff = `now-${dataRetentionDays}d`;

    const indices = ['traffic-logs', 'device-logs', 'speedtest-results'];
    for (const index of indices) {
      try {
        const res = await this.elastic.client.deleteByQuery({
          index,
          query: { range: { timestamp: { lt: cutoff } } },
        });
        this.logger.log(`[${index}] deleted ${res.deleted ?? 0} docs older than ${dataRetentionDays}d`);
      } catch (err) {
        this.logger.error(`[${index}] retention purge failed`, err);
      }
    }
  }
}
