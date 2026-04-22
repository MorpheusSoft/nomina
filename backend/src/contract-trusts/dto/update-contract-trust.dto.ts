import { PartialType } from '@nestjs/mapped-types';
import { CreateContractTrustDto } from './create-contract-trust.dto';

export class UpdateContractTrustDto extends PartialType(CreateContractTrustDto) {}
