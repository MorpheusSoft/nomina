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
exports.VacationHistoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VacationHistoriesService = class VacationHistoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        const { employmentRecordId, ...rest } = data;
        const contract = await this.prisma.employmentRecord.findFirst({
            where: { id: employmentRecordId, tenantId },
        });
        if (!contract)
            throw new common_1.NotFoundException('Employment Record not found');
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
    async findByEmploymentRecord(tenantId, employmentRecordId) {
        return this.prisma.vacationHistory.findMany({
            where: { tenantId, employmentRecordId },
            orderBy: { serviceYear: 'desc' },
            include: {
                payrollReceipt: true
            }
        });
    }
    async findOne(tenantId, id) {
        const record = await this.prisma.vacationHistory.findFirst({
            where: { id, tenantId },
        });
        if (!record)
            throw new common_1.NotFoundException('Vacation History not found');
        return record;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id);
        const updateData = { ...data };
        if (data.startDate)
            updateData.startDate = new Date(data.startDate);
        if (data.endDate)
            updateData.endDate = new Date(data.endDate);
        return this.prisma.vacationHistory.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.vacationHistory.delete({
            where: { id },
        });
    }
};
exports.VacationHistoriesService = VacationHistoriesService;
exports.VacationHistoriesService = VacationHistoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VacationHistoriesService);
//# sourceMappingURL=vacation-histories.service.js.map