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
exports.WorkerNoveltiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkerNoveltiesService = class WorkerNoveltiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        return this.prisma.workerNovelty.create({
            data: {
                ...data,
                tenantId,
            },
            include: {
                concept: true,
                employmentRecord: {
                    include: { owner: true }
                }
            }
        });
    }
    findAll(tenantId, payrollPeriodId, workerId) {
        const where = { tenantId };
        if (payrollPeriodId)
            where.payrollPeriodId = payrollPeriodId;
        if (workerId) {
            where.employmentRecord = { workerId };
        }
        return this.prisma.workerNovelty.findMany({
            where,
            include: {
                concept: true,
                employmentRecord: {
                    include: { owner: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    findOne(tenantId, id) {
        return this.prisma.workerNovelty.findFirst({
            where: { id, tenantId },
            include: { concept: true }
        });
    }
    async update(tenantId, id, data) {
        const novelty = await this.findOne(tenantId, id);
        if (!novelty)
            throw new common_1.NotFoundException('Novedad no encontrada');
        if (novelty.payrollPeriodId) {
            const period = await this.prisma.payrollPeriod.findUnique({
                where: { id: novelty.payrollPeriodId }
            });
            if (period && period.status !== 'DRAFT') {
                throw new common_1.BadRequestException('No se puede modificar una Novedad que ya fue inyectada y cerrada en una nómina');
            }
        }
        return this.prisma.workerNovelty.update({
            where: { id },
            data
        });
    }
    async remove(tenantId, id) {
        const novelty = await this.findOne(tenantId, id);
        if (!novelty)
            throw new common_1.NotFoundException('Novedad no encontrada');
        if (novelty.payrollPeriodId) {
            const period = await this.prisma.payrollPeriod.findUnique({
                where: { id: novelty.payrollPeriodId }
            });
            if (period && period.status !== 'DRAFT') {
                throw new common_1.BadRequestException('No se puede eliminar una Novedad que ya fue inyectada y cerrada en una nómina');
            }
        }
        return this.prisma.workerNovelty.delete({
            where: { id }
        });
    }
};
exports.WorkerNoveltiesService = WorkerNoveltiesService;
exports.WorkerNoveltiesService = WorkerNoveltiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerNoveltiesService);
//# sourceMappingURL=worker-novelties.service.js.map