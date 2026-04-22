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
exports.AriFormsController = void 0;
const common_1 = require("@nestjs/common");
const ari_forms_service_1 = require("./ari-forms.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let AriFormsController = class AriFormsController {
    ariService;
    constructor(ariService) {
        this.ariService = ariService;
    }
    async getFloor(workerId, tenantId) {
        if (!tenantId) {
            const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
            tenantId = w ? w.tenantId : '';
        }
        const record = await this.ariService['prisma'].employmentRecord.findFirst({
            where: { workerId, tenantId, isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        if (!record)
            return { floor: 0 };
        const floor = await this.ariService.getProjectionFloor(record.id, tenantId);
        const existingForm = await this.ariService['prisma'].workerAriForm.findFirst({
            where: { employmentRecordId: record.id, fiscalYear: new Date().getFullYear() },
            orderBy: { month: 'desc' }
        });
        const currentMonth = new Date().getMonth() + 1;
        const isAllowedVariationMonth = [1, 3, 6, 9, 12].includes(currentMonth);
        const hasGeneratedInCurrentMonth = existingForm ? existingForm.month === currentMonth : false;
        const canGenerateVariation = isAllowedVariationMonth && !hasGeneratedInCurrentMonth;
        const familyLoadCount = await this.ariService['prisma'].familyMember.count({
            where: { workerId }
        });
        return { floor, defaultFamilyLoad: familyLoadCount, existingFormId: existingForm ? existingForm.id : null, canGenerateVariation };
    }
    async submitVoluntary(data, tenantId, workerId) {
        if (!tenantId) {
            const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
            tenantId = w ? w.tenantId : '';
        }
        return this.ariService.submitVoluntaryForm(tenantId, workerId, data);
    }
    async simulateTaxMath(data, tenantId, workerId) {
        if (!tenantId) {
            const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
            tenantId = w ? w.tenantId : '';
        }
        const valUt = await this.ariService.getActiveTaxUnitValue(tenantId);
        const inc = data.estimatedRemuneration || 0;
        const type = data.deductionType || 'UNIQUE';
        const detBs = data.detailedDeductionsAmount || 0;
        const loads = data.familyLoadCount !== undefined ? data.familyLoadCount : 0;
        return this.ariService.simulateTaxMath(inc, type, detBs, loads, valUt);
    }
    async generateSystemForms(fiscalYear, user) {
        return this.ariService.generateSystemForms(user.tenantId, Number(fiscalYear));
    }
    async getStatuses(fiscalYear, user) {
        return this.ariService.getStatuses(user.tenantId, Number(fiscalYear));
    }
    async getPrintDetails(id, tenantId, workerId, user) {
        let tId = user?.tenantId || tenantId;
        if (!tId && workerId) {
            const w = await this.ariService['prisma'].employmentRecord.findFirst({ where: { workerId, isActive: true }, orderBy: { createdAt: 'desc' } });
            tId = w ? w.tenantId : '';
        }
        return this.ariService.getDetailForPrinting(tId, id);
    }
};
exports.AriFormsController = AriFormsController;
__decorate([
    (0, common_1.Get)('floor/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AriFormsController.prototype, "getFloor", null);
__decorate([
    (0, common_1.Post)('employee'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-worker-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AriFormsController.prototype, "submitVoluntary", null);
__decorate([
    (0, common_1.Post)('simulate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-worker-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AriFormsController.prototype, "simulateTaxMath", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('system/generate'),
    __param(0, (0, common_1.Body)('fiscalYear')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AriFormsController.prototype, "generateSystemForms", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('statuses'),
    __param(0, (0, common_1.Query)('fiscalYear')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AriFormsController.prototype, "getStatuses", null);
__decorate([
    (0, common_1.Get)('details/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Headers)('x-worker-id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AriFormsController.prototype, "getPrintDetails", null);
exports.AriFormsController = AriFormsController = __decorate([
    (0, common_1.Controller)('ari-forms'),
    __metadata("design:paramtypes", [ari_forms_service_1.AriFormsService])
], AriFormsController);
//# sourceMappingURL=ari-forms.controller.js.map