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
exports.PayrollGroupVariablesController = void 0;
const common_1 = require("@nestjs/common");
const payroll_group_variables_service_1 = require("./payroll-group-variables.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let PayrollGroupVariablesController = class PayrollGroupVariablesController {
    variablesService;
    constructor(variablesService) {
        this.variablesService = variablesService;
    }
    findAll(payrollGroupId, user) {
        if (payrollGroupId) {
            return this.variablesService.findAll(payrollGroupId);
        }
        return this.variablesService.findAllByTenant(user.tenantId);
    }
    create(createDto) {
        return this.variablesService.create(createDto);
    }
    update(id, updateDto) {
        return this.variablesService.update(id, updateDto);
    }
    remove(id) {
        return this.variablesService.remove(id);
    }
};
exports.PayrollGroupVariablesController = PayrollGroupVariablesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('payrollGroupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollGroupVariablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollGroupVariablesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollGroupVariablesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollGroupVariablesController.prototype, "remove", null);
exports.PayrollGroupVariablesController = PayrollGroupVariablesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payroll-group-variables'),
    __metadata("design:paramtypes", [payroll_group_variables_service_1.PayrollGroupVariablesService])
], PayrollGroupVariablesController);
//# sourceMappingURL=payroll-group-variables.controller.js.map