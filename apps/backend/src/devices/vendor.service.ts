import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class VendorService implements OnModuleInit {
  private readonly logger = new Logger(VendorService.name);
  private db: Record<string, string> = {};

  async onModuleInit() {
    try {
      // oui-data는 ESM JSON 패키지 — dynamic import로 로드
      const mod = await import('oui-data');
      this.db = (mod.default ?? mod) as Record<string, string>;
      this.logger.log(`OUI database loaded (${Object.keys(this.db).length} entries)`);
    } catch {
      this.logger.warn('OUI database load failed — vendor info unavailable');
    }
  }

  lookup(mac: string): string | undefined {
    const key = mac.replace(/[^0-9a-fA-F]/g, '').toUpperCase().substring(0, 6);
    return this.db[key] ?? undefined;
  }
}
