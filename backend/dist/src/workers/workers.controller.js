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
exports.WorkersController = void 0;
const common_1 = require("@nestjs/common");
const workers_service_1 = require("./workers.service");
const create_worker_dto_1 = require("./dto/create-worker.dto");
const update_worker_dto_1 = require("./dto/update-worker.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let WorkersController = class WorkersController {
    workersService;
    constructor(workersService) {
        this.workersService = workersService;
    }
    create(createWorkerDto, user) {
        return this.workersService.create(user.tenantId, createWorkerDto);
    }
    findAll(user) {
        const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
        return this.workersService.findAll(user.tenantId, canViewConfidential);
    }
    findOne(id, user) {
        const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
        return this.workersService.findOne(user.tenantId, id, canViewConfidential);
    }
    update(id, updateWorkerDto, user) {
        const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
        return this.workersService.update(user.tenantId, id, updateWorkerDto, canViewConfidential);
    }
    remove(id, user) {
        const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
        return this.workersService.remove(user.tenantId, id, canViewConfidential);
    }
};
exports.WorkersController = WorkersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_worker_dto_1.CreateWorkerDto, Object]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_worker_dto_1.UpdateWorkerDto, Object]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkersController.prototype, "remove", null);
exports.WorkersController = WorkersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('workers'),
    __metadata("design:paramtypes", [workers_service_1.WorkersService])
], WorkersController);
//# sourceMappingURL=workers.controller.js.map