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
exports.VacationHistoriesController = void 0;
const common_1 = require("@nestjs/common");
const vacation_histories_service_1 = require("./vacation-histories.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let VacationHistoriesController = class VacationHistoriesController {
    vacationHistoriesService;
    constructor(vacationHistoriesService) {
        this.vacationHistoriesService = vacationHistoriesService;
    }
    create(user, createData) {
        return this.vacationHistoriesService.create(user.tenantId, createData);
    }
    findByEmploymentRecord(user, id) {
        return this.vacationHistoriesService.findByEmploymentRecord(user.tenantId, id);
    }
    findOne(user, id) {
        return this.vacationHistoriesService.findOne(user.tenantId, id);
    }
    update(user, id, updateData) {
        return this.vacationHistoriesService.update(user.tenantId, id, updateData);
    }
    remove(user, id) {
        return this.vacationHistoriesService.remove(user.tenantId, id);
    }
};
exports.VacationHistoriesController = VacationHistoriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VacationHistoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('by-employment/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VacationHistoriesController.prototype, "findByEmploymentRecord", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VacationHistoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], VacationHistoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VacationHistoriesController.prototype, "remove", null);
exports.VacationHistoriesController = VacationHistoriesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('vacation-histories'),
    __metadata("design:paramtypes", [vacation_histories_service_1.VacationHistoriesService])
], VacationHistoriesController);
//# sourceMappingURL=vacation-histories.controller.js.map