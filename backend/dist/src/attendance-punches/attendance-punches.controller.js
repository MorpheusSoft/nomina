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
exports.AttendancePunchesController = void 0;
const common_1 = require("@nestjs/common");
const attendance_punches_service_1 = require("./attendance-punches.service");
const client_1 = require("@prisma/client");
let AttendancePunchesController = class AttendancePunchesController {
    punchesService;
    constructor(punchesService) {
        this.punchesService = punchesService;
    }
    create(data) {
        return this.punchesService.create(data);
    }
    createBulk(body) {
        return this.punchesService.createBulk(body.tenantId, body.punches);
    }
    findAll(tenantId, workerId) {
        return this.punchesService.findAll(tenantId, workerId);
    }
    remove(id, tenantId) {
        return this.punchesService.remove(id, tenantId);
    }
};
exports.AttendancePunchesController = AttendancePunchesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendancePunchesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendancePunchesController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AttendancePunchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AttendancePunchesController.prototype, "remove", null);
exports.AttendancePunchesController = AttendancePunchesController = __decorate([
    (0, common_1.Controller)('attendance-punches'),
    __metadata("design:paramtypes", [attendance_punches_service_1.AttendancePunchesService])
], AttendancePunchesController);
//# sourceMappingURL=attendance-punches.controller.js.map