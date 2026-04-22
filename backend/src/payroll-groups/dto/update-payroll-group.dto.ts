import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollGroupDto } from './create-payroll-group.dto';

export class UpdatePayrollGroupDto extends PartialType(CreatePayrollGroupDto) {}
