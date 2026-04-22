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
exports.WorkersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkersService = class WorkersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createWorkerDto) {
        const existing = await this.prisma.worker.findUnique({
            where: {
                tenantId_primaryIdentityNumber: {
                    tenantId,
                    primaryIdentityNumber: createWorkerDto.primaryIdentityNumber,
                }
            }
        });
        if (existing) {
            throw new common_1.ConflictException(`Worker with Identity Number ${createWorkerDto.primaryIdentityNumber} already exists in this Tenant`);
        }
        return this.prisma.worker.create({
            data: {
                ...createWorkerDto,
                tenantId,
                birthDate: new Date(createWorkerDto.birthDate),
            }
        });
    }
    async findAll(tenantId, canViewConfidential = false) {
        const today = new Date();
        const includePosition = {
            employmentRecords: {
                where: { isActive: true },
                select: {
                    id: true,
                    isActive: true,
                    position: true,
                    costCenterId: true,
                    departmentId: true,
                    crewId: true,
                    costCenter: true,
                    department: true,
                    crew: true,
                    vacationHistories: {
                        where: {
                            startDate: { lte: today },
                            endDate: { gte: today }
                        }
                    }
                }
            },
            workerAbsences: {
                where: {
                    startDate: { lte: today },
                    endDate: { gte: today }
                }
            }
        };
        const employmentRecordFilter = canViewConfidential
            ? undefined
            : { none: { isConfidential: true } };
        const workers = await this.prisma.worker.findMany({
            where: {
                tenantId,
                deletedAt: null,
                ...(employmentRecordFilter && { employmentRecords: employmentRecordFilter })
            },
            include: includePosition
        });
        return workers.map((w) => {
            let state = 'Inactivo';
            if (w.employmentRecords && w.employmentRecords.length > 0) {
                state = 'Activo';
                if (w.workerAbsences && w.workerAbsences.length > 0) {
                    state = 'Suspendido';
                }
                else {
                    const hasVacation = w.employmentRecords.some((er) => er.vacationHistories?.length > 0);
                    if (hasVacation)
                        state = 'Vacaciones';
                }
            }
            return { ...w, computedState: state };
        });
    }
    async findOne(tenantId, id, canViewConfidential = false) {
        const employmentRecordFilter = canViewConfidential
            ? undefined
            : { none: { isConfidential: true } };
        const worker = await this.prisma.worker.findFirst({
            where: {
                id,
                tenantId,
                deletedAt: null,
                ...(employmentRecordFilter && { employmentRecords: employmentRecordFilter })
            }
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found or belongs to another tenant');
        return worker;
    }
    async update(tenantId, id, updateWorkerDto, canViewConfidential = false) {
        await this.findOne(tenantId, id, canViewConfidential);
        const dataToUpdate = { ...updateWorkerDto };
        if (updateWorkerDto.birthDate) {
            dataToUpdate.birthDate = new Date(updateWorkerDto.birthDate);
        }
        return this.prisma.worker.updateMany({
            where: { id, tenantId },
            data: dataToUpdate,
        });
    }
    async remove(tenantId, id, canViewConfidential = false) {
        await this.findOne(tenantId, id, canViewConfidential);
        return this.prisma.worker.updateMany({
            where: { id, tenantId },
            data: { deletedAt: new Date() }
        });
    }
};
exports.WorkersService = WorkersService;
exports.WorkersService = WorkersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkersService);
//# sourceMappingURL=workers.service.js.map