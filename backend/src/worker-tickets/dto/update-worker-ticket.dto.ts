import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerTicketDto } from './create-worker-ticket.dto';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateWorkerTicketDto extends PartialType(CreateWorkerTicketDto) {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsString()
  @IsOptional()
  hrNotes?: string;
}
