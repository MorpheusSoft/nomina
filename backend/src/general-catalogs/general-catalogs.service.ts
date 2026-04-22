import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeneralCatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByCategory(tenantId: string, category: string) {
    if (!category) {
       return this.prisma.generalCatalog.findMany({ where: { tenantId } });
    }
    return this.prisma.generalCatalog.findMany({
      where: { tenantId, category },
      orderBy: { value: 'asc' }
    });
  }

  async create(tenantId: string, category: string, value: string) {
    if (!category || !value) {
      throw new BadRequestException('Category and Value are required');
    }

    try {
      return await this.prisma.generalCatalog.create({
        data: {
          tenantId,
          category: category.toUpperCase(),
          value
        }
      });
    } catch (error) {
      // Unique constraint failed probably
      throw new BadRequestException(`El valor "${value}" ya existe en el catálogo "${category}".`);
    }
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.generalCatalog.delete({
      where: { id, tenantId }
    });
  }
}
