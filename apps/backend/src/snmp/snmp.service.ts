/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// net-snmp has no TypeScript types — unsafe rules disabled for this file
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as snmp from 'net-snmp';
import { TrafficRate, TrafficSnapshot } from './snmp.types';

const OID_IF_IN_OCTETS = '1.3.6.1.2.1.2.2.1.10';
const OID_IF_OUT_OCTETS = '1.3.6.1.2.1.2.2.1.16';
const COUNTER32_MAX = 0xffffffff;

@Injectable()
export class SnmpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SnmpService.name);
  private session: snmp.Session | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private previous: TrafficSnapshot | null = null;
  private cumulativeIn = 0;
  private cumulativeOut = 0;

  constructor(
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    const ip = this.config.get<string>('router.ip')!;
    const community = this.config.get<string>('router.snmpCommunity')!;
    this.session = snmp.createSession(ip, community);
    this.startPolling();
    this.logger.log(`SNMP polling started → ${ip}`);
  }

  onModuleDestroy() {
    this.stopPolling();
    this.session?.close();
  }

  private startPolling(): void {
    const intervalMs = this.config.get<number>('router.pollIntervalMs')!;
    this.pollTimer = setInterval(() => this.poll(), intervalMs);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private poll(): void {
    const ifIndex = this.config.get<number>('router.snmpIfIndex')!;
    const oids = [`${OID_IF_IN_OCTETS}.${ifIndex}`, `${OID_IF_OUT_OCTETS}.${ifIndex}`];

    this.session!.get(oids, (error: Error | null, varbinds: snmp.Varbind[]) => {
      if (error) {
        this.logger.error(`SNMP poll failed: ${error.message}`);
        this.eventEmitter.emit('snmp.error', { message: error.message });
        return;
      }

      const inOctets = varbinds[0].value as number;
      const outOctets = varbinds[1].value as number;
      const now = new Date();
      const snapshot: TrafficSnapshot = { timestamp: now, inOctets, outOctets };

      if (this.previous) {
        const rate = this.calculateRate(this.previous, snapshot);
        this.eventEmitter.emit('traffic.rate', rate);
      }

      this.previous = snapshot;
    });
  }

  private calculateRate(prev: TrafficSnapshot, curr: TrafficSnapshot): TrafficRate {
    const elapsedSec = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;

    // 32bit counter rollover handling
    const inDelta =
      curr.inOctets >= prev.inOctets
        ? curr.inOctets - prev.inOctets
        : COUNTER32_MAX - prev.inOctets + curr.inOctets;

    const outDelta =
      curr.outOctets >= prev.outOctets
        ? curr.outOctets - prev.outOctets
        : COUNTER32_MAX - prev.outOctets + curr.outOctets;

    this.cumulativeIn += inDelta;
    this.cumulativeOut += outDelta;

    return {
      timestamp: curr.timestamp,
      inBps: Math.round(inDelta / elapsedSec),
      outBps: Math.round(outDelta / elapsedSec),
      totalIn: this.cumulativeIn,
      totalOut: this.cumulativeOut,
    };
  }
}
