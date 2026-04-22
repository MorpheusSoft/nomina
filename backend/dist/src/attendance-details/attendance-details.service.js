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
exports.AttendanceDetailsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceDetailsService = class AttendanceDetailsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importBiometric(payrollPeriodId, records) {
        const tenantId = '11111111-1111-1111-1111-111111111111';
        const workers = await this.prisma.worker.findMany({ where: { tenantId } });
        const identityMap = new Map(workers.map(w => [w.primaryIdentityNumber, w.id]));
        const aggregations = new Map();
        for (const rec of records) {
            const workerId = identityMap.get(String(rec.identity).trim());
            if (!workerId)
                continue;
            const dIn = new Date(rec.datetimeIn);
            const dOut = new Date(rec.datetimeOut);
            const hoursDiff = (dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60);
            if (hoursDiff <= 0 || isNaN(hoursDiff))
                continue;
            if (!aggregations.has(workerId)) {
                aggregations.set(workerId, { daysWorked: new Set(), totalHours: 0 });
            }
            const agg = aggregations.get(workerId);
            const dayKey = dIn.toISOString().split('T')[0];
            agg.daysWorked.add(dayKey);
            agg.totalHours += hoursDiff;
        }
        const upsertOps = [];
        for (const [workerId, agg] of aggregations.entries()) {
            const shiftBaseHours = 8;
            const daysWorked = agg.daysWorked.size;
            const ordinaryHours = daysWorked * shiftBaseHours;
            const extraDayHours = Math.max(0, agg.totalHours - ordinaryHours);
            upsertOps.push(this.prisma.attendanceSummary.upsert({
                where: { payrollPeriodId_workerId: { payrollPeriodId, workerId } },
                create: {
                    tenantId, payrollPeriodId, workerId,
                    shiftBaseHours, shiftType: 'DIURNA',
                    daysWorked, ordinaryHours, extraDayHours, extraNightHours: 0
                },
                update: {
                    daysWorked, ordinaryHours, extraDayHours
                }
            }));
        }
        await this.prisma.$transaction(upsertOps);
        return { message: "Biometric Data Processed Successfully", processedWorkers: aggregations.size };
    }
};
exports.AttendanceDetailsService = AttendanceDetailsService;
exports.AttendanceDetailsService = AttendanceDetailsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceDetailsService);
//# sourceMappingURL=attendance-details.service.js.map