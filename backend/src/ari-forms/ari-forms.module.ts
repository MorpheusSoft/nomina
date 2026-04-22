import { Module } from '@nestjs/common';
import { AriFormsService } from './ari-forms.service';
import { AriFormsController } from './ari-forms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AriFormsController],
  providers: [AriFormsService],
  exports: [AriFormsService],
})
export class AriFormsModule {}
