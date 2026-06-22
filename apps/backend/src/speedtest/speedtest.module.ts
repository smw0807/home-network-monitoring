import { Module } from '@nestjs/common';
import { SpeedtestService } from './speedtest.service';
import { SpeedtestController } from './speedtest.controller';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [ElasticModule],
  providers: [SpeedtestService],
  controllers: [SpeedtestController],
  exports: [SpeedtestService],
})
export class SpeedtestModule {}
