import { Module } from '@nestjs/common';
import { ArpService } from './arp.service';

@Module({
  providers: [ArpService],
  exports: [ArpService],
})
export class ArpModule {}
