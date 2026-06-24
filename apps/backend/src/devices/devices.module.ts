import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { ArpModule } from '../arp/arp.module';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [ArpModule, ElasticModule],
  providers: [DevicesService],
  controllers: [DevicesController],
  exports: [DevicesService],
})
export class DevicesModule {}
