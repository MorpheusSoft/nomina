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
exports.ContractTrustsController = void 0;
const common_1 = require("@nestjs/common");
const contract_trusts_service_1 = require("./contract-trusts.service");
const create_trust_transaction_dto_1 = require("./dto/create-trust-transaction.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let ContractTrustsController = class ContractTrustsController {
    contractTrustsService;
    constructor(contractTrustsService) {
        this.contractTrustsService = contractTrustsService;
    }
    findAll(user) {
        return this.contractTrustsService.findAll(user.tenantId);
    }
    findByEmploymentRecord(user, employmentRecordId) {
        return this.contractTrustsService.findByEmploymentRecord(user.tenantId, employmentRecordId);
    }
    addTransaction(user, employmentRecordId, dto) {
        return this.contractTrustsService.addTransaction(user.tenantId, employmentRecordId, dto);
    }
};
exports.ContractTrustsController = ContractTrustsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractTrustsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-employment/:employmentRecordId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('employmentRecordId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ContractTrustsController.prototype, "findByEmploymentRecord", null);
__decorate([
    (0, common_1.Post)('by-employment/:employmentRecordId/transactions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('employmentRecordId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_trust_transaction_dto_1.CreateTrustTransactionDto]),
    __metadata("design:returntype", void 0)
], ContractTrustsController.prototype, "addTransaction", null);
exports.ContractTrustsController = ContractTrustsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('contract-trusts'),
    __metadata("design:paramtypes", [contract_trusts_service_1.ContractTrustsService])
], ContractTrustsController);
//# sourceMappingURL=contract-trusts.controller.js.map