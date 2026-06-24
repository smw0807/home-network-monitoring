import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElasticService } from '../elastic/elastic.service';
import { SpeedtestResult } from './speedtest.types';

const CLOUDFLARE_DOWN = 'https://speed.cloudflare.com/__down';
const CLOUDFLARE_UP = 'https://speed.cloudflare.com/__up';
const CLOUDFLARE_PING = 'https://speed.cloudflare.com/__ping';

const DOWNLOAD_BYTES = 10_000_000; // 10 MB
const UPLOAD_BYTES = 5_000_000;   // 5 MB
const PING_ROUNDS = 3;

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
      const [ping, download, upload] = await Promise.all([
        this.measurePing(),
        this.measureDownload(),
        this.measureUpload(),
      ]);

      const result: SpeedtestResult = {
        timestamp: new Date(),
        download: Math.round((download / 1_000_000) * 100) / 100,  // bps → Mbps
        upload: Math.round((upload / 1_000_000) * 100) / 100,
        ping: Math.round(ping * 10) / 10,
      };

      this.logger.log(
        `Speed test done — DL: ${result.download} Mbps  UL: ${result.upload} Mbps  Ping: ${result.ping} ms`,
      );

      await this.elastic.indexSpeedtest(result);
      this.eventEmitter.emit('speedtest.result', result);
      return result;
    } finally {
      this.isRunning = false;
    }
  }

  private async measurePing(): Promise<number> {
    const latencies: number[] = [];
    for (let i = 0; i < PING_ROUNDS; i++) {
      const start = performance.now();
      await fetch(CLOUDFLARE_PING);
      latencies.push(performance.now() - start);
    }
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  private async measureDownload(): Promise<number> {
    const start = performance.now();
    const res = await fetch(`${CLOUDFLARE_DOWN}?bytes=${DOWNLOAD_BYTES}`);
    await res.arrayBuffer();
    const elapsed = (performance.now() - start) / 1000;
    return (DOWNLOAD_BYTES * 8) / elapsed;
  }

  private async measureUpload(): Promise<number> {
    const payload = Buffer.alloc(UPLOAD_BYTES);
    const start = performance.now();
    await fetch(CLOUDFLARE_UP, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    const elapsed = (performance.now() - start) / 1000;
    return (UPLOAD_BYTES * 8) / elapsed;
  }
}
