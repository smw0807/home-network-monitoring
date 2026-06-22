import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Get()
  findAll() {
    return this.devices.findAll();
  }

  @Patch(':mac')
  update(@Param('mac') mac: string, @Body() dto: UpdateDeviceDto) {
    const device = this.devices.update(mac, dto);
    if (!device) throw new NotFoundException(`Device ${mac} not found`);
    return device;
  }
}
