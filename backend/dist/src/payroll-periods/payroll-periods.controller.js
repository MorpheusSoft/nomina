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
exports.PayrollPeriodsController = void 0;
const common_1 = require("@nestjs/common");
const payroll_periods_service_1 = require("./payroll-periods.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let PayrollPeriodsController = class PayrollPeriodsController {
    payrollPeriodsService;
    constructor(payrollPeriodsService) {
        this.payrollPeriodsService = payrollPeriodsService;
    }
    create(data, user) {
        return this.payrollPeriodsService.create(user.tenantId, data);
    }
    findAll(user) {
        return this.payrollPeriodsService.findAll(user.tenantId);
    }
    findOne(id, user) {
        return this.payrollPeriodsService.findOne(user.tenantId, id);
    }
    getBudgetAnalysis(id, user) {
        return this.payrollPeriodsService.getBudgetAnalysis(user.tenantId, id);
    }
    update(id, data, user) {
        return this.payrollPeriodsService.update(user, id, data);
    }
    remove(id, user) {
        return this.payrollPeriodsService.remove(user.tenantId, id);
    }
};
exports.PayrollPeriodsController = PayrollPeriodsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollPeriodsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollPeriodsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollPeriodsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/budget-analysis'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollPeriodsController.prototype, "getBudgetAnalysis", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollPeriodsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollPeriodsController.prototype, "remove", null);
exports.PayrollPeriodsController = PayrollPeriodsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payroll-periods'),
    __metadata("design:paramtypes", [payroll_periods_service_1.PayrollPeriodsService])
], PayrollPeriodsController);
//# sourceMappingURL=payroll-periods.controller.js.map