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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceSummariesController = void 0;
const common_1 = require("@nestjs/common");
const attendance_summaries_service_1 = require("./attendance-summaries.service");
let AttendanceSummariesController = class AttendanceSummariesController {
    attendanceSummariesService;
    constructor(attendanceSummariesService) {
        this.attendanceSummariesService = attendanceSummariesService;
    }
    async upsert(data) {
        try {
            return await this.attendanceSummariesService.upsertSummary(data);
        }
        catch (e) {
            throw new common_1.HttpException(e.message, 500);
        }
    }
    async upsertBulk(data) {
        try {
            return await this.attendanceSummariesService.upsertBulk(data);
        }
        catch (e) {
            throw new common_1.HttpException(e.message, 500);
        }
    }
    async generateFromDaily(periodId, type) {
        try {
            if (type === 'VIRTUAL') {
                return await this.attendanceSummariesService.generateVirtualAttendance(periodId);
            }
            return await this.attendanceSummariesService.generateFromDailyAttendance(periodId);
        }
        catch (e) {
            throw new common_1.HttpException(e.message, 500);
        }
    }
    findByPeriod(periodId) {
        return this.attendanceSummariesService.findByPeriod(periodId);
    }
    async generateAuditTrail(tenantId, workerId, payrollPeriodId) {
        try {
            return await this.attendanceSummariesService.generateAuditTrail(tenantId, workerId, payrollPeriodId);
        }
        catch (e) {
            throw new common_1.HttpException(e.message, 500);
        }
    }
    remove(id) {
        return this.attendanceSummariesService.remove(id);
    }
};
exports.AttendanceSummariesController = AttendanceSummariesController;
__decorate([
    (0, common_1.Post)('upsert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceSummariesController.prototype, "upsert", null);
__decorate([
    (0, common_1.Post)('upsert-bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AttendanceSummariesController.prototype, "upsertBulk", null);
__decorate([
    (0, common_1.Post)('generate/:periodId'),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceSummariesController.prototype, "generateFromDaily", null);
__decorate([
    (0, common_1.Get)('period/:periodId'),
    __param(0, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceSummariesController.prototype, "findByPeriod", null);
__decorate([
    (0, common_1.Get)('audit/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)('workerId')),
    __param(2, (0, common_1.Query)('payrollPeriodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceSummariesController.prototype, "generateAuditTrail", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceSummariesController.prototype, "remove", null);
exports.AttendanceSummariesController = AttendanceSummariesController = __decorate([
    (0, common_1.Controller)('attendance-summaries'),
    __metadata("design:paramtypes", [attendance_summaries_service_1.AttendanceSummariesService])
], AttendanceSummariesController);
//# sourceMappingURL=attendance-summaries.controller.js.map