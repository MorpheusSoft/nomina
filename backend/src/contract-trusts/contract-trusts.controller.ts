import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ContractTrustsService } from './contract-trusts.service';
import { CreateTrustTransactionDto } from './dto/create-trust-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('contract-trusts')
export class ContractTrustsController {
  constructor(private readonly contractTrustsService: ContractTrustsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.contractTrustsService.findAll(user.tenantId);
  }

  @Get('by-employment/:employmentRecordId')
  findByEmploymentRecord(
    @CurrentUser() user: any,
    @Param('employmentRecordId', ParseUUIDPipe) employmentRecordId: string,
  ) {
    return this.contractTrustsService.findByEmploymentRecord(user.tenantId, employmentRecordId);
  }

  @Post('by-employment/:employmentRecordId/transactions')
  addTransaction(
    @CurrentUser() user: any,
    @Param('employmentRecordId', ParseUUIDPipe) employmentRecordId: string,
    @Body() dto: CreateTrustTransactionDto,
  ) {
    return this.contractTrustsService.addTransaction(user.tenantId, employmentRecordId, dto);
  }
}
