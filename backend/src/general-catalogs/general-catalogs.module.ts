import { Module } from '@nestjs/common';
import { GeneralCatalogsController } from './general-catalogs.controller';
import { GeneralCatalogsService } from './general-catalogs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GeneralCatalogsController],
  providers: [GeneralCatalogsService],
})
export class GeneralCatalogsModule {}
