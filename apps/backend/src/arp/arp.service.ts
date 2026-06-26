/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// net-snmp has no TypeScript types — unsafe rules disabled for this file
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
      session.subtree(
        OID_ARP_TABLE,
        20,
        (varbinds) => {
          for (const vb of varbinds) {
            if (snmp.isVarbindError(vb)) continue;
            const oidParts = vb.oid.split('.');
            // OID: 1.3.6.1.2.1.4.22.1.{col}.{ifIndex}.{ip1}.{ip2}.{ip3}.{ip4}
            //      0 1 2 3 4 5 6  7  8   9      10      11   12   13   14
            if (oidParts.length < 15) continue;
            const col = oidParts[9];
            // col=2 = ipNetToMediaPhysAddress (MAC, OctetString 6바이트)
            if (col !== '2') continue;
            const macBytes = vb.value as Buffer;
            if (!Buffer.isBuffer(macBytes) || macBytes.length < 6) continue;
            const mac = Array.from(macBytes)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join(':');
            const ifIndex = parseInt(oidParts[10], 10);
            const ip = oidParts.slice(11).join('.');
            entries.push({ ip, mac, ifIndex });
          }
        },
        (error) => {
          if (error) {
            this.logger.error(`ARP scan failed: ${error.message}`);
          }
          session.close();
          resolve(entries);
        },
      );
    });
  }
}
