import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HolidaysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const createData = { ...data };
    if (data.date) createData.date = new Date(data.date);
    return this.prisma.holiday.create({ data: createData });
  }

  async findAll() {
    return this.prisma.holiday.findMany({
      orderBy: { date: 'desc' }
    });
  }

  async findOne(id: string) {
    const holiday = await this.prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new NotFoundException('Holiday not found');
    return holiday;
  }

  async update(id: string, data: any) {
    const updateData = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    return this.prisma.holiday.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: string) {
    return this.prisma.holiday.delete({ where: { id } });
  }

  // --- Algoritmo Dinámico de Feriados ---

  private getEasterDate(year: number): Date {
    const a = year % 19;
    const b = year % 4;
    const c = year % 7;
    const k = Math.floor(year / 100);
    const p = Math.floor((13 + 8 * k) / 25);
    const q = Math.floor(k / 4);
    const M = (15 - p + k - q) % 30;
    const N = (4 + k - q) % 7;
    const d = (19 * a + M) % 30;
    const e = (2 * b + 4 * c + 6 * d + N) % 7;

    if (d + e < 10) {
      return new Date(Date.UTC(year, 2, 22 + d + e)); // Marzo (0-indexed = 2)
    } else {
      let day = d + e - 9;
      if (d === 29 && e === 6) day = 19;
      if (d === 28 && e === 6 && (11 * M + 11) % 30 < 19) day = 18;
      return new Date(Date.UTC(year, 3, day)); // Abril (0-indexed = 3)
    }
  }

  private addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  async generateDynamicHolidaysForYear(tenantId: string, year: number) {
    const easter = this.getEasterDate(year);
    
    const dynamicHolidays = [
      { name: 'Lunes de Carnaval', date: this.addDays(easter, -48), isAnnual: false },
      { name: 'Martes de Carnaval', date: this.addDays(easter, -47), isAnnual: false },
      { name: 'Jueves Santo', date: this.addDays(easter, -3), isAnnual: false },
      { name: 'Viernes Santo', date: this.addDays(easter, -2), isAnnual: false }
    ];

    let createdCount = 0;
    for (const dh of dynamicHolidays) {
      // Check list to avoid duplicates
      const exists = await this.prisma.holiday.findFirst({
        where: { tenantId, name: dh.name, date: dh.date }
      });
      if (!exists) {
        await this.prisma.holiday.create({
          data: { tenantId, name: dh.name, date: dh.date, isAnnual: false }
        });
        createdCount++;
      }
    }
    
    // Also inject some basic fixed ones if they don't exist for the tenant generically (isAnnual=true)
    const fixedHolidays = [
      { name: 'Año Nuevo', month: 0, day: 1 },
      { name: 'Día del Trabajador', month: 4, day: 1 },
      { name: 'Navidad', month: 11, day: 25 },
    ];

    for (const fh of fixedHolidays) {
      const fixedDate = new Date(Date.UTC(2000, fh.month, fh.day)); // Year 2000 just as placeholder anchor
      const exists = await this.prisma.holiday.findFirst({
         where: { tenantId, name: fh.name, isAnnual: true }
      });
      if (!exists) {
        await this.prisma.holiday.create({
          data: { tenantId, name: fh.name, date: fixedDate, isAnnual: true }
        });
        createdCount++;
      }
    }

    return { generated: createdCount };
  }
}
