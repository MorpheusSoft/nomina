import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

@Injectable()
export class FamilyMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFamilyMemberDto: CreateFamilyMemberDto) {
    const data: any = { ...createFamilyMemberDto };
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate);
    }
    return this.prisma.familyMember.create({ data });
  }

  async findAll(workerId?: string) {
    if (workerId) {
      return this.prisma.familyMember.findMany({ where: { workerId } });
    }
    return this.prisma.familyMember.findMany();
  }

  async findOne(id: string) {
    const member = await this.prisma.familyMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Family member not found');
    return member;
  }

  async update(id: string, updateFamilyMemberDto: UpdateFamilyMemberDto) {
    await this.findOne(id);
    const data: any = { ...updateFamilyMemberDto };
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate);
    }
    return this.prisma.familyMember.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.familyMember.delete({ where: { id } });
  }
}
