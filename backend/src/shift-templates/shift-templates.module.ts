import { Module } from '@nestjs/common';
import { ShiftTemplatesService } from './shift-templates.service';
import { ShiftTemplatesController } from './shift-templates.controller';

@Module({
  providers: [ShiftTemplatesService],
  controllers: [ShiftTemplatesController]
})
export class ShiftTemplatesModule {}
