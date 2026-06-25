import { Module } from '@nestjs/common';
import { ElasticService } from './elastic.service';
import { RetentionService } from './retention.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [ElasticService, RetentionService],
  exports: [ElasticService],
})
export class ElasticModule {}
