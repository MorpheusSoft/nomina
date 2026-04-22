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
exports.ShiftPatternsController = void 0;
const common_1 = require("@nestjs/common");
const shift_patterns_service_1 = require("./shift-patterns.service");
const create_shift_pattern_dto_1 = require("./dto/create-shift-pattern.dto");
const update_shift_pattern_dto_1 = require("./dto/update-shift-pattern.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ShiftPatternsController = class ShiftPatternsController {
    shiftPatternsService;
    constructor(shiftPatternsService) {
        this.shiftPatternsService = shiftPatternsService;
    }
    create(req, createShiftPatternDto) {
        return this.shiftPatternsService.create(req.user.tenantId, createShiftPatternDto);
    }
    findAll(req) {
        return this.shiftPatternsService.findAll(req.user.tenantId);
    }
    findOne(req, id) {
        return this.shiftPatternsService.findOne(req.user.tenantId, id);
    }
    update(req, id, updateShiftPatternDto) {
        return this.shiftPatternsService.update(req.user.tenantId, id, updateShiftPatternDto);
    }
    remove(req, id) {
        return this.shiftPatternsService.remove(req.user.tenantId, id);
    }
};
exports.ShiftPatternsController = ShiftPatternsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_shift_pattern_dto_1.CreateShiftPatternDto]),
    __metadata("design:returntype", void 0)
], ShiftPatternsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShiftPatternsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShiftPatternsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_shift_pattern_dto_1.UpdateShiftPatternDto]),
    __metadata("design:returntype", void 0)
], ShiftPatternsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShiftPatternsController.prototype, "remove", null);
exports.ShiftPatternsController = ShiftPatternsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('shift-patterns'),
    __metadata("design:paramtypes", [shift_patterns_service_1.ShiftPatternsService])
], ShiftPatternsController);
//# sourceMappingURL=shift-patterns.controller.js.map