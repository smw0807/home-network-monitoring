import { Module } from '@nestjs/common';
import { TrafficController } from './traffic.controller';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [ElasticModule],
  controllers: [TrafficController],
})
export class TrafficModule {}
