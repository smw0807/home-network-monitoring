import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ArpService } from '../arp/arp.service';
import { Device } from '../arp/arp.types';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);
  // In-memory store — will be backed by Elasticsearch in Phase 3
  private readonly devices = new Map<string, Device>();

  constructor(
    private readonly arp: ArpService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async refresh() {
    const entries = await this.arp.scanArpTable();

    for (const entry of entries) {
      const existing = this.devices.get(entry.mac);
      const now = new Date();

      if (!existing) {
        const device: Device = {
          mac: entry.mac,
          ip: entry.ip,
          isWhitelisted: false,
          firstSeen: now,
          lastSeen: now,
        };
        this.devices.set(entry.mac, device);
        this.eventEmitter.emit('device.new', { ...device, detectedAt: now });
        this.logger.log(`New device detected: ${entry.mac} (${entry.ip})`);
      } else {
        existing.ip = entry.ip;
        existing.lastSeen = now;
      }
    }

    this.eventEmitter.emit('devices.updated', this.findAll());
  }

  findAll(): Device[] {
    return Array.from(this.devices.values());
  }

  update(mac: string, dto: UpdateDeviceDto): Device | null {
    const device = this.devices.get(mac);
    if (!device) return null;
    if (dto.alias !== undefined) device.alias = dto.alias;
    if (dto.isWhitelisted !== undefined) device.isWhitelisted = dto.isWhitelisted;
    return device;
  }
}
