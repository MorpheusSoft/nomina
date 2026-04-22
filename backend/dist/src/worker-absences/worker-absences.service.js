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
exports.WorkerAbsencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkerAbsencesService = class WorkerAbsencesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createWorkerAbsenceDto) {
        return this.prisma.workerAbsence.create({
            data: {
                ...createWorkerAbsenceDto,
                tenantId,
                startDate: new Date(createWorkerAbsenceDto.startDate),
                endDate: new Date(createWorkerAbsenceDto.endDate),
            },
            include: {
                worker: true
            }
        });
    }
    async findAll(tenantId) {
        return this.prisma.workerAbsence.findMany({
            where: { tenantId },
            include: {
                worker: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id, tenantId) {
        const absence = await this.prisma.workerAbsence.findFirst({
            where: { id, tenantId },
            include: { worker: true }
        });
        if (!absence)
            throw new common_1.NotFoundException(`Ausencia no encontrada`);
        return absence;
    }
    async update(id, tenantId, updateWorkerAbsenceDto) {
        await this.findOne(id, tenantId);
        const dataToUpdate = { ...updateWorkerAbsenceDto };
        if (updateWorkerAbsenceDto.startDate)
            dataToUpdate.startDate = new Date(updateWorkerAbsenceDto.startDate);
        if (updateWorkerAbsenceDto.endDate)
            dataToUpdate.endDate = new Date(updateWorkerAbsenceDto.endDate);
        return this.prisma.workerAbsence.update({
            where: { id },
            data: dataToUpdate,
            include: { worker: true }
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.workerAbsence.delete({
            where: { id }
        });
    }
    async updateStatus(id, tenantId, status, isJustified, isPaid) {
        await this.findOne(id, tenantId);
        const dataToUpdate = { status };
        if (isJustified !== undefined)
            dataToUpdate.isJustified = isJustified;
        if (isPaid !== undefined)
            dataToUpdate.isPaid = isPaid;
        return this.prisma.workerAbsence.update({
            where: { id },
            data: dataToUpdate,
            include: { worker: true }
        });
    }
};
exports.WorkerAbsencesService = WorkerAbsencesService;
exports.WorkerAbsencesService = WorkerAbsencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerAbsencesService);
//# sourceMappingURL=worker-absences.service.js.map