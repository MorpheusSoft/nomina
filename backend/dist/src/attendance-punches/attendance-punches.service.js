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
exports.AttendancePunchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendancePunchesService = class AttendancePunchesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: data.workerId },
        });
        if (!worker || worker.tenantId !== data.tenantId) {
            throw new common_1.BadRequestException('Worker does not exist or does not belong to the tenant');
        }
        return this.prisma.attendancePunch.create({
            data,
        });
    }
    async createBulk(tenantId, punches) {
        const workers = await this.prisma.worker.findMany({
            where: {
                tenantId
            }
        });
        const workerMap = new Map(workers.map(w => [w.primaryIdentityNumber.trim().toUpperCase(), w.id]));
        const dataToInsert = punches.map(p => {
            const normId = p.identityNumber.trim().toUpperCase();
            const workerId = workerMap.get(normId);
            if (!workerId) {
                throw new common_1.BadRequestException(`Cédula no encontrada en el sistema: ${p.identityNumber}`);
            }
            const parsedDate = new Date(p.timestamp);
            if (isNaN(parsedDate.getTime())) {
                throw new common_1.BadRequestException(`Fecha u hora inválida en el registro de la cédula: ${p.identityNumber}`);
            }
            return {
                tenantId,
                workerId,
                timestamp: parsedDate,
                type: p.type,
                source: p.source,
                deviceId: p.deviceId || null,
                isProcessed: false,
            };
        });
        const result = await this.prisma.attendancePunch.createMany({
            data: dataToInsert,
            skipDuplicates: true,
        });
        return { count: result.count };
    }
    async findAll(tenantId, workerId) {
        return this.prisma.attendancePunch.findMany({
            where: {
                tenantId,
                ...(workerId ? { workerId } : {}),
            },
            orderBy: { timestamp: 'desc' },
            include: {
                worker: {
                    select: { firstName: true, lastName: true, primaryIdentityNumber: true }
                },
                device: {
                    select: { name: true }
                }
            },
            take: 1000
        });
    }
    async remove(id, tenantId) {
        const punch = await this.prisma.attendancePunch.findUnique({ where: { id } });
        if (!punch || punch.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Punch not found');
        }
        return this.prisma.attendancePunch.delete({ where: { id } });
    }
};
exports.AttendancePunchesService = AttendancePunchesService;
exports.AttendancePunchesService = AttendancePunchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendancePunchesService);
//# sourceMappingURL=attendance-punches.service.js.map