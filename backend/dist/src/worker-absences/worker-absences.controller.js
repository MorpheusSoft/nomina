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
exports.WorkerAbsencesController = void 0;
const common_1 = require("@nestjs/common");
const worker_absences_service_1 = require("./worker-absences.service");
const create_worker_absence_dto_1 = require("./dto/create-worker-absence.dto");
const update_worker_absence_dto_1 = require("./dto/update-worker-absence.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WorkerAbsencesController = class WorkerAbsencesController {
    workerAbsencesService;
    constructor(workerAbsencesService) {
        this.workerAbsencesService = workerAbsencesService;
    }
    create(req, createWorkerAbsenceDto) {
        const tenantId = req.user.tenantId;
        return this.workerAbsencesService.create(tenantId, createWorkerAbsenceDto);
    }
    findAll(req) {
        const tenantId = req.user.tenantId;
        return this.workerAbsencesService.findAll(tenantId);
    }
    findOne(req, id) {
        const tenantId = req.user.tenantId;
        return this.workerAbsencesService.findOne(id, tenantId);
    }
    update(req, id, updateWorkerAbsenceDto) {
        const tenantId = req.user.tenantId;
        return this.workerAbsencesService.update(id, tenantId, updateWorkerAbsenceDto);
    }
    remove(req, id) {
        const tenantId = req.user.tenantId;
        return this.workerAbsencesService.remove(id, tenantId);
    }
    updateStatus(req, id, body) {
        const tenantId = req.user.tenantId;
        return this.workerAbsencesService.updateStatus(id, tenantId, body.status, body.isJustified, body.isPaid);
    }
};
exports.WorkerAbsencesController = WorkerAbsencesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_worker_absence_dto_1.CreateWorkerAbsenceDto]),
    __metadata("design:returntype", void 0)
], WorkerAbsencesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkerAbsencesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerAbsencesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_worker_absence_dto_1.UpdateWorkerAbsenceDto]),
    __metadata("design:returntype", void 0)
], WorkerAbsencesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerAbsencesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WorkerAbsencesController.prototype, "updateStatus", null);
exports.WorkerAbsencesController = WorkerAbsencesController = __decorate([
    (0, common_1.Controller)('worker-absences'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [worker_absences_service_1.WorkerAbsencesService])
], WorkerAbsencesController);
//# sourceMappingURL=worker-absences.controller.js.map