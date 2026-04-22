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
exports.OracleController = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("./oracle.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let OracleController = class OracleController {
    oracleService;
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async generateConcept(body, user) {
        if (!body.prompt || body.prompt.trim() === '') {
            throw new common_1.HttpException('El prompt natural es requerido.', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.oracleService.generateConcept(user.tenantId, body.prompt, body.context, body.history);
    }
};
exports.OracleController = OracleController;
__decorate([
    (0, common_1.Post)('generate-concept'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OracleController.prototype, "generateConcept", null);
exports.OracleController = OracleController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('oracle'),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], OracleController);
//# sourceMappingURL=oracle.controller.js.map