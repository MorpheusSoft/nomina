import { Controller, Get, Post, Param, Req, UseGuards, Res } from '@nestjs/common';
import { AccountingJournalsService } from './accounting-journals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request, Response } from 'express';

@Controller('accounting-journals')
@UseGuards(JwtAuthGuard)
export class AccountingJournalsController {
  constructor(private readonly journalsService: AccountingJournalsService) {}

  @Post('generate/period/:periodId')
  generate(@Req() req: Request, @Param('periodId') periodId: string) {
    const tenantId = (req.user as any).tenantId;
    return this.journalsService.generateFromPayrollPeriod(tenantId, periodId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const tenantId = (req.user as any).tenantId;
    return this.journalsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req.user as any).tenantId;
    return this.journalsService.findOne(tenantId, id);
  }

  @Get(':id/export-csv')
  async exportCsv(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const tenantId = (req.user as any).tenantId;
    const csv = await this.journalsService.exportCsv(tenantId, id);
    res.header('Content-Type', 'text/csv');
    res.attachment(`asiento-${id}.csv`);
    return res.send(csv);
  }
}
