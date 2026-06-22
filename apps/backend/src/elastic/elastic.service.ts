import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { TrafficRate } from '../snmp/snmp.types';
import { SpeedtestResult } from '../speedtest/speedtest.types';
import { Device } from '../arp/arp.types';

const INDEX_TRAFFIC = 'traffic-logs';
const INDEX_DEVICES = 'device-logs';
const INDEX_SPEEDTEST = 'speedtest-results';

@Injectable()
export class ElasticService implements OnModuleInit {
  private readonly logger = new Logger(ElasticService.name);
  readonly client: Client;

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      node: this.config.get<string>('elasticsearch.node')!,
      auth: {
        username: this.config.get<string>('elasticsearch.username')!,
        password: this.config.get<string>('elasticsearch.password')!,
      },
      // self-signed 인증서 허용 (홈 네트워크 내부용)
      tls: { rejectUnauthorized: false },
    });
  }

  async onModuleInit() {
    await this.ensureIndices();
  }

  private async ensureIndices() {
    await this.createIndexIfAbsent(INDEX_TRAFFIC, {
      timestamp: { type: 'date' },
      inBps: { type: 'long' },
      outBps: { type: 'long' },
      totalIn: { type: 'long' },
      totalOut: { type: 'long' },
    });

    await this.createIndexIfAbsent(INDEX_DEVICES, {
      timestamp: { type: 'date' },
      mac: { type: 'keyword' },
      ip: { type: 'ip' },
      alias: { type: 'keyword' },
      vendor: { type: 'keyword' },
      isNew: { type: 'boolean' },
    });

    await this.createIndexIfAbsent(INDEX_SPEEDTEST, {
      timestamp: { type: 'date' },
      download: { type: 'float' },
      upload: { type: 'float' },
      ping: { type: 'float' },
    });
  }

  private async createIndexIfAbsent(index: string, properties: Record<string, object>) {
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.client.indices.create({ index, mappings: { properties } } as any);
      this.logger.log(`Created index: ${index}`);
    }
  }

  async indexTraffic(rate: TrafficRate): Promise<void> {
    await this.client.index({
      index: INDEX_TRAFFIC,
      document: { ...rate, timestamp: rate.timestamp.toISOString() },
    });
  }

  async indexDevice(device: Partial<Device> & { isNew: boolean }): Promise<void> {
    await this.client.index({
      index: INDEX_DEVICES,
      document: { ...device, timestamp: new Date().toISOString() },
    });
  }

  async indexSpeedtest(result: SpeedtestResult): Promise<void> {
    await this.client.index({
      index: INDEX_SPEEDTEST,
      document: { ...result, timestamp: result.timestamp.toISOString() },
    });
  }

  async queryTrafficHistory(from: string, to: string, interval: string) {
    const result = await this.client.search({
      index: INDEX_TRAFFIC,
      size: 0,
      query: { range: { timestamp: { gte: from, lte: to } } },
      aggs: {
        traffic_over_time: {
          date_histogram: {
            field: 'timestamp',
            fixed_interval: interval,
          },
          aggs: {
            avg_in: { avg: { field: 'inBps' } },
            avg_out: { avg: { field: 'outBps' } },
          },
        },
      },
    });
    return result.aggregations;
  }

  async querySpeedtestHistory(from: string, to: string) {
    const result = await this.client.search({
      index: INDEX_SPEEDTEST,
      sort: [{ timestamp: { order: 'desc' } }],
      query: { range: { timestamp: { gte: from, lte: to } } },
    });
    return result.hits.hits.map((h) => h._source);
  }
}
