import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PayrollAccumulatorsService } from './payroll-accumulators.service';
import { CreatePayrollAccumulatorDto } from './dto/create-payroll-accumulator.dto';
import { UpdatePayrollAccumulatorDto } from './dto/update-payroll-accumulator.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('payroll-accumulators')
export class PayrollAccumulatorsController {
  constructor(private readonly payrollAccumulatorsService: PayrollAccumulatorsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createPayrollAccumulatorDto: CreatePayrollAccumulatorDto,
  ) {
    return this.payrollAccumulatorsService.create(user.tenantId, createPayrollAccumulatorDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.payrollAccumulatorsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollAccumulatorsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePayrollAccumulatorDto: UpdatePayrollAccumulatorDto,
  ) {
    return this.payrollAccumulatorsService.update(
      user.tenantId,
      id,
      updatePayrollAccumulatorDto,
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollAccumulatorsService.remove(user.tenantId, id);
  }
}
