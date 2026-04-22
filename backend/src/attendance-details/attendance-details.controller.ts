import { Controller, Post, Body, Param } from '@nestjs/common';
import { AttendanceDetailsService } from './attendance-details.service';

@Controller('attendance-details')
export class AttendanceDetailsController {
  constructor(private readonly attendanceDetailsService: AttendanceDetailsService) {}

  @Post('import/:periodId')
  async importBiometric(
    @Param('periodId') periodId: string,
    @Body() data: { records: { identity: string; datetimeIn: string; datetimeOut: string }[] }
  ) {
    return this.attendanceDetailsService.importBiometric(periodId, data.records);
  }
}
