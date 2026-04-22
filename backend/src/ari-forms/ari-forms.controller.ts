import { Controller, Get, Post, Body, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { AriFormsService } from './ari-forms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ari-forms')
export class AriFormsController {
  constructor(private readonly ariService: AriFormsService) {}

  @Get('floor/:workerId')
  async getFloor(@Param('workerId') workerId: string, @Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
       const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
       tenantId = w ? w.tenantId : '';
    }
    const record = await this.ariService['prisma'].employmentRecord.findFirst({
      where: { workerId, tenantId, isActive: true },
       orderBy: { createdAt: 'desc' }
    });
    if(!record) return { floor: 0 };
    const floor = await this.ariService.getProjectionFloor(record.id, tenantId);
    
    const existingForm = await this.ariService['prisma'].workerAriForm.findFirst({
      where: { employmentRecordId: record.id, fiscalYear: new Date().getFullYear() },
      orderBy: { month: 'desc' }
    });

    const currentMonth = new Date().getMonth() + 1;
    const isAllowedVariationMonth = [1, 3, 6, 9, 12].includes(currentMonth);
    const hasGeneratedInCurrentMonth = existingForm ? existingForm.month === currentMonth : false;
    const canGenerateVariation = isAllowedVariationMonth && !hasGeneratedInCurrentMonth;

    const familyLoadCount = await this.ariService['prisma'].familyMember.count({
      where: { workerId }
    });

    return { floor, defaultFamilyLoad: familyLoadCount, existingFormId: existingForm ? existingForm.id : null, canGenerateVariation };
  }

  @Post('employee')
  async submitVoluntary(@Body() data: any, @Headers('x-tenant-id') tenantId: string, @Headers('x-worker-id') workerId: string) {
    if (!tenantId) {
       const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
       tenantId = w ? w.tenantId : '';
    }
    return this.ariService.submitVoluntaryForm(tenantId, workerId, data);
  }

  @Post('simulate')
  async simulateTaxMath(@Body() data: any, @Headers('x-tenant-id') tenantId: string, @Headers('x-worker-id') workerId: string) {
    if (!tenantId) {
       const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
       tenantId = w ? w.tenantId : '';
    }
    const valUt = await this.ariService.getActiveTaxUnitValue(tenantId);
    
    const inc = data.estimatedRemuneration || 0;
    const type = data.deductionType || 'UNIQUE';
    const detBs = data.detailedDeductionsAmount || 0;
    const loads = data.familyLoadCount !== undefined ? data.familyLoadCount : 0;
    
    return this.ariService.simulateTaxMath(inc, type, detBs, loads, valUt);
  }

  @UseGuards(JwtAuthGuard)
  @Post('system/generate')
  async generateSystemForms(@Body('fiscalYear') fiscalYear: number, @CurrentUser() user: any) {
    return this.ariService.generateSystemForms(user.tenantId, Number(fiscalYear));
  }

  @UseGuards(JwtAuthGuard)
  @Get('statuses')
  async getStatuses(@Query('fiscalYear') fiscalYear: string, @CurrentUser() user: any) {
    return this.ariService.getStatuses(user.tenantId, Number(fiscalYear));
  }

  @Get('details/:id')
  async getPrintDetails(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string, @Headers('x-worker-id') workerId: string, @CurrentUser() user: any) {
     let tId = user?.tenantId || tenantId;
     if (!tId && workerId) {
        const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
        tId = w ? w.tenantId : '';
     }
     return this.ariService.getDetailForPrinting(tId, id);
  }
}
