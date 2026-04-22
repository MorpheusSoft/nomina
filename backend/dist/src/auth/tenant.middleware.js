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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantMiddleware = class TenantMiddleware {
    jwtService;
    prisma;
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async use(req, res, next) {
        if (req.originalUrl.includes('/auth/login') || req.originalUrl.includes('/auth/register') || req.originalUrl.includes('/portal') || req.originalUrl.includes('/ari-forms/floor') || req.originalUrl.includes('/ari-forms/employee') || req.originalUrl.includes('/ari-forms/simulate') || req.originalUrl.includes('/ari-forms/details') || req.originalUrl.includes('/uploads')) {
            return next();
        }
        if (req.method === 'OPTIONS') {
            return next();
        }
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token de acceso requerido por seguridad.');
        }
        const token = authHeader.split(' ')[1];
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET || 'nebulapay_super_secret_key_2026'
            });
            if (payload.tenantId) {
                const tenant = await this.prisma.tenant.findUnique({ where: { id: payload.tenantId } });
                if (!tenant)
                    throw new common_1.UnauthorizedException('Inquilino no existente.');
                if (payload.email !== 'admin@nebulapayrolls.com') {
                    if (!tenant.isActive)
                        throw new common_1.UnauthorizedException('Tu empresa ha sido suspendida.');
                    if (tenant.serviceEndDate && new Date(tenant.serviceEndDate).getTime() < Date.now()) {
                        throw new common_1.UnauthorizedException('La suscripción SaaS ha expirado.');
                    }
                }
            }
            if (req.body && typeof req.body === 'object') {
                req.body.tenantId = payload.tenantId;
            }
            if (req.query) {
                req.query.tenantId = payload.tenantId;
            }
            req['user'] = payload;
            next();
        }
        catch (e) {
            if (e instanceof common_1.UnauthorizedException)
                throw e;
            throw new common_1.UnauthorizedException('Token inválido o expirado. Inicia sesión nuevamente.');
        }
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map