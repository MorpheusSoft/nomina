"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerTicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkerTicketsService = class WorkerTicketsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createWorkerTicketDto) {
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
    async findAll(tenantId, workerId) {
        const whereClause = { tenantId };
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
    async findOne(id, tenantId) {
        const ticket = await this.prisma.workerTicket.findUnique({
            where: { id, tenantId },
            include: {
                worker: true
            }
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        return ticket;
    }
    async update(id, tenantId, updateWorkerTicketDto) {
        await this.findOne(id, tenantId);
        return this.prisma.workerTicket.update({
            where: { id },
            data: updateWorkerTicketDto,
        });
    }
    async addComment(id, tenantId, authorName, text) {
        const ticket = await this.findOne(id, tenantId);
        const metadata = ticket.jsonMetadata || {};
        if (!metadata.comments)
            metadata.comments = [];
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
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.workerTicket.delete({
            where: { id }
        });
    }
};
exports.WorkerTicketsService = WorkerTicketsService;
exports.WorkerTicketsService = WorkerTicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerTicketsService);
//# sourceMappingURL=worker-tickets.service.js.map