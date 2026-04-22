"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        const cleanEmail = email.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email: cleanEmail },
            include: {
                role: true,
                tenant: true,
                tenantAccesses: { include: { tenant: true, role: true } }
            }
        });
        if (user && user.isActive) {
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            if (isMatch) {
                if (user.tenant && user.email !== 'admin@nebulapayrolls.com') {
                    if (!user.tenant.isActive) {
                        throw new common_1.ForbiddenException('La cuenta de esta empresa se encuentra suspendida.');
                    }
                    if (user.tenant.serviceEndDate && new Date(user.tenant.serviceEndDate).getTime() < Date.now()) {
                        throw new common_1.ForbiddenException('La suscripción de esta empresa ha expirado.');
                    }
                }
                const { passwordHash, ...result } = user;
                return result;
            }
        }
        return null;
    }
    async login(email, pass) {
        const user = await this.validateUser(email, pass);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas o cuenta inactiva');
        }
        const payload = {
            email: user.email,
            sub: user.id,
            tenantId: user.tenantId,
            roleId: user.roleId,
            permissions: user.role.permissions
        };
        let availableTenants = [];
        if (user.email === 'admin@nebulapayrolls.com') {
            const allTenants = await this.prisma.tenant.findMany();
            availableTenants = allTenants.map(t => ({
                tenantId: t.id,
                tenantName: t.name,
                roleId: user.roleId,
                roleName: 'Súper Administrador'
            }));
        }
        else {
            availableTenants = user.tenantAccesses?.map((acc) => ({
                tenantId: acc.tenantId,
                tenantName: acc.tenant.name,
                roleId: acc.roleId,
                roleName: acc.role.name
            })) || [];
        }
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name,
                permissions: user.role.permissions,
                tenantId: user.tenantId,
                tenantName: user.tenant?.name,
                availableTenants
            }
        };
    }
    async register(data, currentUser) {
        if (currentUser?.email !== 'admin@nebulapayrolls.com') {
            throw new common_1.ForbiddenException('Acesso Denegado. Solo el Dueño de Plataforma puede dar de alta nuevos Clientes.');
        }
        const cleanEmail = data.email.trim().toLowerCase();
        if (data.password.length < 6) {
            throw new common_1.BadRequestException('La contraseña debe tener al menos 6 caracteres.');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existingUser) {
            throw new common_1.ConflictException('El correo electrónico ya está registrado.');
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: data.companyName,
                    taxId: data.taxId,
                    hasWorkerPortalAccess: data.hasWorkerPortalAccess ?? false,
                    logoUrl: data.logoUrl || null,
                    contactPhone: data.contactPhone || null,
                    serviceEndDate: data.serviceEndDate ? new Date(data.serviceEndDate) : null,
                }
            });
            const role = await tx.role.create({
                data: {
                    tenantId: tenant.id,
                    name: 'Super Administrador',
                    permissions: ['ALL_ACCESS']
                }
            });
            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    roleId: role.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: cleanEmail,
                    passwordHash,
                }
            });
            await tx.userTenantAccess.create({
                data: {
                    userId: user.id,
                    tenantId: tenant.id,
                    roleId: role.id
                }
            });
        });
        return this.login(data.email, data.password);
    }
    async switchTenant(userId, targetTenantId) {
        try {
            const godUser = await this.prisma.user.findUnique({ where: { id: userId } });
            let finalRoleId = '';
            if (godUser?.email === 'admin@nebulapayrolls.com') {
                let superRole = await this.prisma.role.findFirst({
                    where: { tenantId: targetTenantId, name: 'Super Administrador' }
                });
                if (!superRole) {
                    superRole = await this.prisma.role.create({
                        data: { tenantId: targetTenantId, name: 'Super Administrador', permissions: ['ALL_ACCESS'] }
                    });
                }
                finalRoleId = superRole.id;
            }
            else {
                const access = await this.prisma.userTenantAccess.findUnique({
                    where: { userId_tenantId: { userId, tenantId: targetTenantId } },
                    include: { role: true, tenant: true, user: true }
                });
                if (!access) {
                    throw new common_1.ForbiddenException('No tienes acceso a esta empresa o no existe.');
                }
                finalRoleId = access.roleId;
            }
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: { tenantId: targetTenantId, roleId: finalRoleId },
                include: { role: true, tenant: true, tenantAccesses: { include: { tenant: true, role: true } } }
            });
            const payload = {
                email: updatedUser.email,
                sub: updatedUser.id,
                tenantId: updatedUser.tenantId,
                roleId: updatedUser.roleId,
                permissions: updatedUser.role.permissions
            };
            let availableTenants = [];
            if (updatedUser.email === 'admin@nebulapayrolls.com') {
                const allTenants = await this.prisma.tenant.findMany();
                availableTenants = allTenants.map(t => ({
                    tenantId: t.id,
                    tenantName: t.name,
                    roleId: finalRoleId,
                    roleName: 'Súper Administrador'
                }));
            }
            else {
                availableTenants = updatedUser.tenantAccesses?.map((acc) => ({
                    tenantId: acc.tenantId,
                    tenantName: acc.tenant.name,
                    roleId: acc.roleId,
                    roleName: acc.role.name
                })) || [];
            }
            return {
                accessToken: this.jwtService.sign(payload),
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    role: updatedUser.role.name,
                    permissions: updatedUser.role.permissions,
                    tenantId: updatedUser.tenantId,
                    tenantName: updatedUser.tenant?.name,
                    availableTenants
                }
            };
        }
        catch (e) {
            console.error("SWITCH ERROR:", e);
            throw new common_1.BadRequestException('Error interno: ' + e.message);
        }
    }
    async returnToRoot(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { tenantId: true }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        return this.switchTenant(userId, user.tenantId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map