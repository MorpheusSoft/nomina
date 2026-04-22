import { Module } from '@nestjs/common';
import { ShiftPatternsService } from './shift-patterns.service';
import { ShiftPatternsController } from './shift-patterns.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShiftPatternsController],
  providers: [ShiftPatternsService],
})
export class ShiftPatternsModule {}
