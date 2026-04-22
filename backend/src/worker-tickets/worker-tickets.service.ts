import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkerTicketDto } from './dto/create-worker-ticket.dto';
import { UpdateWorkerTicketDto } from './dto/update-worker-ticket.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createWorkerTicketDto: CreateWorkerTicketDto) {
    return this.prisma.workerTicket.create({
      data: {
        ...createWorkerTicketDto,
        tenantId,
      },
      include: {
        worker: {
          select: { firstName: true, lastName: true, primaryIdentityNumber: true }
        }
      }
    });
  }

  async findAll(tenantId: string, workerId?: string) {
    const whereClause: any = { tenantId };
    if (workerId) {
      whereClause.workerId = workerId;
    }

    return this.prisma.workerTicket.findMany({
      where: whereClause,
      include: {
        worker: {
          select: { firstName: true, lastName: true, primaryIdentityNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const ticket = await this.prisma.workerTicket.findUnique({
      where: { id, tenantId },
      include: {
        worker: true
      }
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }

  async update(id: string, tenantId: string, updateWorkerTicketDto: UpdateWorkerTicketDto) {
    await this.findOne(id, tenantId); // verify exists
    
    return this.prisma.workerTicket.update({
      where: { id },
      data: updateWorkerTicketDto,
    });
  }

  async addComment(id: string, tenantId: string, authorName: string, text: string) {
    const ticket = await this.findOne(id, tenantId);
    const metadata = ticket.jsonMetadata as any || {};
    if (!metadata.comments) metadata.comments = [];
    
    metadata.comments.push({
      id: Date.now() + '-' + Math.round(Math.random() * 1e9),
      text,
      authorType: 'ADMIN',
      authorName,
      createdAt: new Date().toISOString()
    });

    return this.prisma.workerTicket.update({
      where: { id },
      data: { jsonMetadata: metadata }
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // verify exists

    return this.prisma.workerTicket.delete({
      where: { id }
    });
  }
}
