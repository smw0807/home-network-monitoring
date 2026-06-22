import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './config/configuration';
import { ElasticModule } from './elastic/elastic.module';
import { SnmpModule } from './snmp/snmp.module';
import { ArpModule } from './arp/arp.module';
import { WsModule } from './ws/ws.module';
import { TrafficModule } from './traffic/traffic.module';
import { DevicesModule } from './devices/devices.module';
import { EventsModule } from './events/events.module';
import { SettingsModule } from './settings/settings.module';
import { SpeedtestModule } from './speedtest/speedtest.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ElasticModule,
    SnmpModule,
    ArpModule,
    WsModule,
    TrafficModule,
    DevicesModule,
    EventsModule,
    SettingsModule,
    SpeedtestModule,
  ],
})
export class AppModule {}
