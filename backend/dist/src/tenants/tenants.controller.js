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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
let TenantsController = class TenantsController {
    tenantsService;
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async getMyStatus(user) {
        if (!user?.tenantId)
            return null;
        return this.tenantsService.findOne(user.tenantId);
    }
    findAll(user) {
        if (user?.email !== 'admin@nebulapayrolls.com')
            throw new common_1.ForbiddenException('Acesso Denegado');
        return this.tenantsService.findAll();
    }
    findOne(id, user) {
        if (user?.email !== 'admin@nebulapayrolls.com')
            throw new common_1.ForbiddenException('Acesso Denegado');
        return this.tenantsService.findOne(id);
    }
    update(id, data, user) {
        console.log('PATCH received for id:', id, 'data:', data);
        if (user?.email !== 'admin@nebulapayrolls.com')
            throw new common_1.ForbiddenException('Acesso Denegado');
        return this.tenantsService.update(id, data);
    }
    uploadLogo(id, file, user) {
        if (user?.email !== 'admin@nebulapayrolls.com')
            throw new common_1.ForbiddenException('Acesso Denegado');
        if (!file) {
            throw new common_1.BadRequestException('No se adjuntó el archivo o superó el límite permitido.');
        }
        const logoUrl = `/uploads/logos/${file.filename}`;
        return this.tenantsService.update(id, { logoUrl });
    }
    assignConsultant(targetTenantId, consultantUserId, user) {
        if (user?.email !== 'admin@nebulapayrolls.com')
            throw new common_1.ForbiddenException('Acesso Denegado');
        if (!consultantUserId)
            throw new common_1.BadRequestException('Falta ID del consultor');
        return this.tenantsService.assignConsultant(targetTenantId, consultantUserId);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)('my-status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getMyStatus", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_dto_1.UpdateTenantDto, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${req.params.id}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new common_1.BadRequestException('Solo se permiten imágenes JPG o PNG'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 2 * 1024 * 1024 }
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Post)(':id/consultants/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('consultantUserId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "assignConsultant", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map