import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateTrustTransactionDto {
  @IsString()
  @MaxLength(30)
  type: string; // DEPOSIT, WITHDRAWAL, ADVANCE, INTEREST

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  referenceDate: string; // YYYY-MM-DD
}
