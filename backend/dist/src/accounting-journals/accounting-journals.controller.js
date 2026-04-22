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
exports.AccountingJournalsController = void 0;
const common_1 = require("@nestjs/common");
const accounting_journals_service_1 = require("./accounting-journals.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AccountingJournalsController = class AccountingJournalsController {
    journalsService;
    constructor(journalsService) {
        this.journalsService = journalsService;
    }
    generate(req, periodId) {
        const tenantId = req.user.tenantId;
        return this.journalsService.generateFromPayrollPeriod(tenantId, periodId);
    }
    findAll(req) {
        const tenantId = req.user.tenantId;
        return this.journalsService.findAll(tenantId);
    }
    findOne(req, id) {
        const tenantId = req.user.tenantId;
        return this.journalsService.findOne(tenantId, id);
    }
    async exportCsv(req, id, res) {
        const tenantId = req.user.tenantId;
        const csv = await this.journalsService.exportCsv(tenantId, id);
        res.header('Content-Type', 'text/csv');
        res.attachment(`asiento-${id}.csv`);
        return res.send(csv);
    }
};
exports.AccountingJournalsController = AccountingJournalsController;
__decorate([
    (0, common_1.Post)('generate/period/:periodId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AccountingJournalsController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountingJournalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AccountingJournalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/export-csv'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AccountingJournalsController.prototype, "exportCsv", null);
exports.AccountingJournalsController = AccountingJournalsController = __decorate([
    (0, common_1.Controller)('accounting-journals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [accounting_journals_service_1.AccountingJournalsService])
], AccountingJournalsController);
//# sourceMappingURL=accounting-journals.controller.js.map