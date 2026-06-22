import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as snmp from 'net-snmp';
import { ArpEntry } from './arp.types';

const OID_ARP_TABLE = '1.3.6.1.2.1.4.22.1';

@Injectable()
export class ArpService {
  private readonly logger = new Logger(ArpService.name);

  constructor(private readonly config: ConfigService) {}

  async scanArpTable(): Promise<ArpEntry[]> {
    const ip = this.config.get<string>('router.ip')!;
    const community = this.config.get<string>('router.snmpCommunity')!;
    const session = snmp.createSession(ip, community);
    const entries: ArpEntry[] = [];

    return new Promise((resolve) => {
      session.subtree(OID_ARP_TABLE, 20, (varbinds) => {
        for (const vb of varbinds) {
          if (snmp.isVarbindError(vb)) continue;
          const oidParts = vb.oid.split('.');
          // OID structure: 1.3.6.1.2.1.4.22.1.{col}.{ifIndex}.{ip}
          if (oidParts.length >= 13) {
            const col = oidParts[9];
            // col 2 = ifIndex, col 3 = ip
            if (col === '2') {
              const ifIndex = vb.value as number;
              const ipAddr = oidParts.slice(10).join('.');
              entries.push({ ip: ipAddr, mac: '', ifIndex });
            }
            if (col === '3') {
              const macBytes = vb.value as Buffer;
              const mac = Array.from(macBytes)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join(':');
              const ipAddr = oidParts.slice(10).join('.');
              const existing = entries.find((e) => e.ip === ipAddr);
              if (existing) {
                existing.mac = mac;
              } else {
                entries.push({ ip: ipAddr, mac, ifIndex: 0 });
              }
            }
          }
        }
      }, (error) => {
        if (error) {
          this.logger.error(`ARP scan failed: ${error.message}`);
        }
        session.close();
        resolve(entries.filter((e) => e.mac !== ''));
      });
    });
  }
}
