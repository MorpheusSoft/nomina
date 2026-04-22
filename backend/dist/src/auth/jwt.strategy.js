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
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    constructor(prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'nebulapay_super_secret_key_2026',
        });
        this.prisma = prisma;
    }
    async validate(payload) {
        if (payload.tenantId) {
            const tenant = await this.prisma.tenant.findUnique({ where: { id: payload.tenantId } });
            if (!tenant)
                throw new common_1.UnauthorizedException('Empresa no existente.');
            if (payload.email !== 'admin@nebulapayrolls.com') {
                if (!tenant.isActive)
                    throw new common_1.UnauthorizedException('La empresa se encuentra suspendida.');
                if (tenant.serviceEndDate && new Date(tenant.serviceEndDate).getTime() < Date.now()) {
                    throw new common_1.UnauthorizedException('La suscripción de la empresa ha expirado.');
                }
            }
        }
        return {
            userId: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            roleId: payload.roleId,
            permissions: payload.permissions || [],
            canViewConfidential: payload.permissions?.includes('ALL_ACCESS') || payload.permissions?.includes('CONFIDENTIAL_VIEW') || payload.permissions?.includes('access:confidential_payroll') || false,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map