import { Module } from '@nestjs/common';
import { TrafficController } from './traffic.controller';
import { TrafficService } from './traffic.service';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [ElasticModule],
  controllers: [TrafficController],
  providers: [TrafficService],
})
export class TrafficModule {}
