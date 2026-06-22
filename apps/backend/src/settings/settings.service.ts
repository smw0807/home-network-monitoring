import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppSettings } from './settings.types';

@Injectable()
export class SettingsService {
  private settings: AppSettings;

  constructor(private readonly config: ConfigService) {
    this.settings = {
      routerIp: this.config.get<string>('router.ip')!,
      snmpCommunity: this.config.get<string>('router.snmpCommunity')!,
      snmpIfIndex: this.config.get<number>('router.snmpIfIndex')!,
      pollIntervalMs: this.config.get<number>('router.pollIntervalMs')!,
      dataRetentionDays: 30,
      speedtestSchedule: '0 0 * * *',
      trafficThresholdMbps: 100,
    };
  }

  get(): AppSettings {
    return this.settings;
  }

  update(partial: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...partial };
    return this.settings;
  }
}
