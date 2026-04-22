import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerLoanDto } from './create-worker-loan.dto';

export class UpdateWorkerLoanDto extends PartialType(CreateWorkerLoanDto) {}
