import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [ElasticModule],
  controllers: [EventsController],
})
export class EventsModule {}
