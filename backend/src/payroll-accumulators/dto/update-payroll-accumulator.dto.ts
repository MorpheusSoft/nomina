import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollAccumulatorDto } from './create-payroll-accumulator.dto';

export class UpdatePayrollAccumulatorDto extends PartialType(CreatePayrollAccumulatorDto) {}
