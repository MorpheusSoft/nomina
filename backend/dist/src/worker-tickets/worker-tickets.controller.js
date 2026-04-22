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
exports.WorkerTicketsController = void 0;
const common_1 = require("@nestjs/common");
const worker_tickets_service_1 = require("./worker-tickets.service");
const create_worker_ticket_dto_1 = require("./dto/create-worker-ticket.dto");
const update_worker_ticket_dto_1 = require("./dto/update-worker-ticket.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let WorkerTicketsController = class WorkerTicketsController {
    workerTicketsService;
    constructor(workerTicketsService) {
        this.workerTicketsService = workerTicketsService;
    }
    create(user, createWorkerTicketDto) {
        return this.workerTicketsService.create(user.tenantId, createWorkerTicketDto);
    }
    findAll(user, workerId) {
        return this.workerTicketsService.findAll(user.tenantId, workerId);
    }
    findOne(user, id) {
        return this.workerTicketsService.findOne(id, user.tenantId);
    }
    update(user, id, updateWorkerTicketDto) {
        return this.workerTicketsService.update(id, user.tenantId, updateWorkerTicketDto);
    }
    addComment(user, id, body) {
        const authorName = user?.firstName ? `${user.firstName} ${user.lastName}` : 'Analista de RRHH';
        return this.workerTicketsService.addComment(id, user.tenantId, authorName, body.text);
    }
    remove(user, id) {
        return this.workerTicketsService.remove(id, user.tenantId);
    }
};
exports.WorkerTicketsController = WorkerTicketsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_worker_ticket_dto_1.CreateWorkerTicketDto]),
    __metadata("design:returntype", void 0)
], WorkerTicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerTicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerTicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_worker_ticket_dto_1.UpdateWorkerTicketDto]),
    __metadata("design:returntype", void 0)
], WorkerTicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WorkerTicketsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkerTicketsController.prototype, "remove", null);
exports.WorkerTicketsController = WorkerTicketsController = __decorate([
    (0, common_1.Controller)('worker-tickets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [worker_tickets_service_1.WorkerTicketsService])
], WorkerTicketsController);
//# sourceMappingURL=worker-tickets.controller.js.map