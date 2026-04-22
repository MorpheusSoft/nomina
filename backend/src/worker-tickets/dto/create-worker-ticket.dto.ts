import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { TicketType, TicketStatus } from '@prisma/client';

export class CreateWorkerTicketDto {
  @IsString()
  @IsNotEmpty()
  workerId: string;

  @IsEnum(TicketType)
  type: TicketType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsObject()
  @IsOptional()
  jsonMetadata?: any;
}
