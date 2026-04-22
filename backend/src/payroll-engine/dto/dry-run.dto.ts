import { IsUUID, IsNotEmpty } from 'class-validator';

export class DryRunDto {
  @IsUUID()
  @IsNotEmpty()
  payrollPeriodId: string;

  @IsUUID()
  @IsNotEmpty()
  employmentRecordId: string;
}
