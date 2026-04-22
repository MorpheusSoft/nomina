import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards } from '@nestjs/common';
import { EmploymentRecordsService } from './employment-records.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('employment-records')
@UseGuards(JwtAuthGuard)
export class EmploymentRecordsController {
  constructor(private readonly employmentRecordsService: EmploymentRecordsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.employmentRecordsService.create(createDto);
  }

  @Get()
  findAll(@Query('workerId') workerId: string) {
    return this.employmentRecordsService.findAllByWorker(workerId);
  }

  @Post(':id/salary')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('SALARY_EDIT')
  updateSalary(@Param('id') id: string, @Body() data: { amount: number, currency: string, validFrom: string }) {
    return this.employmentRecordsService.updateSalary(id, data.amount, data.currency, data.validFrom);
  }

  @Patch(':id/transfer')
  transferWorker(@Param('id') id: string, @Body() data: { position: string, costCenterId: string, departmentId: string, crewId: string }) {
    return this.employmentRecordsService.transferWorker(id, data);
  }

  @Patch(':id/confidentiality')
  toggleConfidentiality(@Param('id') id: string, @Body() data: { isConfidential: boolean }) {
    return this.employmentRecordsService.toggleConfidentiality(id, data.isConfidential);
  }
}
