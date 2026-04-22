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
exports.EmploymentRecordsController = void 0;
const common_1 = require("@nestjs/common");
const employment_records_service_1 = require("./employment-records.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const require_permissions_decorator_1 = require("../auth/require-permissions.decorator");
let EmploymentRecordsController = class EmploymentRecordsController {
    employmentRecordsService;
    constructor(employmentRecordsService) {
        this.employmentRecordsService = employmentRecordsService;
    }
    create(createDto) {
        return this.employmentRecordsService.create(createDto);
    }
    findAll(workerId) {
        return this.employmentRecordsService.findAllByWorker(workerId);
    }
    updateSalary(id, data) {
        return this.employmentRecordsService.updateSalary(id, data.amount, data.currency, data.validFrom);
    }
    transferWorker(id, data) {
        return this.employmentRecordsService.transferWorker(id, data);
    }
    toggleConfidentiality(id, data) {
        return this.employmentRecordsService.toggleConfidentiality(id, data.isConfidential);
    }
};
exports.EmploymentRecordsController = EmploymentRecordsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmploymentRecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmploymentRecordsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/salary'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('SALARY_EDIT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EmploymentRecordsController.prototype, "updateSalary", null);
__decorate([
    (0, common_1.Patch)(':id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EmploymentRecordsController.prototype, "transferWorker", null);
__decorate([
    (0, common_1.Patch)(':id/confidentiality'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EmploymentRecordsController.prototype, "toggleConfidentiality", null);
exports.EmploymentRecordsController = EmploymentRecordsController = __decorate([
    (0, common_1.Controller)('employment-records'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [employment_records_service_1.EmploymentRecordsService])
], EmploymentRecordsController);
//# sourceMappingURL=employment-records.controller.js.map