import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, WebSocket } from 'ws';
import type { TrafficRate } from '../snmp/snmp.types';
import type { Device } from '../arp/arp.types';
import type { SpeedtestResult } from '../speedtest/speedtest.types';

@WebSocketGateway({ path: '/ws' })
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WsGateway.name);

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection() {
    this.logger.debug('Client connected');
  }

  handleDisconnect() {
    this.logger.debug('Client disconnected');
  }

  @OnEvent('traffic.rate')
  handleTrafficRate(rate: TrafficRate) {
    this.broadcast('traffic', rate);
  }

  @OnEvent('devices.updated')
  handleDevicesUpdated(devices: Device[]) {
    this.broadcast('devices', { devices });
  }

  @OnEvent('device.new')
  handleNewDevice(device: Partial<Device> & { detectedAt: Date }) {
    this.broadcast('new_device', device);
  }

  @OnEvent('speedtest.result')
  handleSpeedtestResult(result: SpeedtestResult) {
    this.broadcast('speedtest_result', result);
  }

  @OnEvent('snmp.error')
  handleSnmpError(payload: { message: string }) {
    this.broadcast('error', payload);
  }

  private broadcast(event: string, data: unknown): void {
    if (!this.server?.clients) return;
    const message = JSON.stringify({ event, data });
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
