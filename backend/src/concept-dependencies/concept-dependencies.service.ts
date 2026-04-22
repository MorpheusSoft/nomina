import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConceptDependenciesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.conceptDependency.create({
      data: {
        parentConceptId: data.parentConceptId,
        childConceptId: data.childConceptId,
        executionSequence: parseInt(data.executionSequence.toString(), 10)
      },
      include: {
        childConcept: true
      }
    });
  }

  async findAll(parentConceptId?: string) {
    if (parentConceptId) {
      return this.prisma.conceptDependency.findMany({
        where: { parentConceptId },
        orderBy: { executionSequence: 'asc' },
        include: { childConcept: true }
      });
    }
    return this.prisma.conceptDependency.findMany({
      orderBy: { parentConceptId: 'asc' },
      include: { childConcept: true, parentConcept: true }
    });
  }

  async remove(id: string) {
    return this.prisma.conceptDependency.delete({
      where: { id }
    });
  }
}
