import { Module } from '@nestjs/common';
import { FamilyMembersService } from './family-members.service';
import { FamilyMembersController } from './family-members.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FamilyMembersController],
  providers: [FamilyMembersService],
})
export class FamilyMembersModule {}
