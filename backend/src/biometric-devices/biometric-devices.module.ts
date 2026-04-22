import { Module } from '@nestjs/common';
import { BiometricDevicesService } from './biometric-devices.service';
import { BiometricDevicesController } from './biometric-devices.controller';

@Module({
  providers: [BiometricDevicesService],
  controllers: [BiometricDevicesController]
})
export class BiometricDevicesModule {}
