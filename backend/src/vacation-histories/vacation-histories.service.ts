import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VacationHistoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    const { employmentRecordId, ...rest } = data;
    
    // Verify Contract ownership
    const contract = await this.prisma.employmentRecord.findFirst({
      where: { id: employmentRecordId, tenantId },
    });
    if (!contract) throw new NotFoundException('Employment Record not found');

    return this.prisma.vacationHistory.create({
      data: {
        ...rest,
        tenantId,
        employmentRecordId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async findByEmploymentRecord(tenantId: string, employmentRecordId: string) {
    return this.prisma.vacationHistory.findMany({
      where: { tenantId, employmentRecordId },
      orderBy: { serviceYear: 'desc' },
      include: {
        payrollReceipt: true
      }
    });
  }

  async findOne(tenantId: string, id: string) {
    const record = await this.prisma.vacationHistory.findFirst({
      where: { id, tenantId },
    });
    if (!record) throw new NotFoundException('Vacation History not found');
    return record;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id); // Verify ownership

    const updateData = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return this.prisma.vacationHistory.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id); // Verify ownership

    return this.prisma.vacationHistory.delete({
      where: { id },
    });
  }
}
