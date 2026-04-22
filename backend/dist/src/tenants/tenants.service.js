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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.tenant.findMany({
            include: {
                _count: {
                    select: { workers: true }
                },
                users: {
                    take: 5,
                    select: { firstName: true, lastName: true, email: true, role: { select: { name: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.tenant.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { workers: true }
                },
                users: {
                    take: 5,
                    select: { firstName: true, lastName: true, email: true, role: { select: { name: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }
    async update(id, data) {
        return this.prisma.tenant.update({
            where: { id },
            data: {
                maxActiveWorkers: data.maxActiveWorkers ? parseInt(data.maxActiveWorkers.toString(), 10) : undefined,
                isActive: data.isActive,
                hasWorkerPortalAccess: data.hasWorkerPortalAccess,
                hasOracleAccess: data.hasOracleAccess,
                logoUrl: data.logoUrl,
                contactPhone: data.contactPhone,
                serviceEndDate: data.serviceEndDate !== undefined ? (data.serviceEndDate ? new Date(data.serviceEndDate) : null) : undefined
            }
        });
    }
    async assignConsultant(targetTenantId, consultantUserId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: targetTenantId } });
        if (!tenant)
            throw new Error('Cliente no encontrado');
        let supportRole = await this.prisma.role.findFirst({
            where: { tenantId: targetTenantId, name: 'Consultor de Soporte' }
        });
        if (!supportRole) {
            supportRole = await this.prisma.role.create({
                data: {
                    tenantId: targetTenantId,
                    name: 'Consultor de Soporte',
                    permissions: ['VIEW_CONCEPTS', 'MANAGE_CONCEPTS', 'VIEW_WORKERS', 'VIEW_PAYROLLS']
                }
            });
        }
        return this.prisma.userTenantAccess.upsert({
            where: { userId_tenantId: { userId: consultantUserId, tenantId: targetTenantId } },
            update: { roleId: supportRole.id },
            create: {
                userId: consultantUserId,
                tenantId: targetTenantId,
                roleId: supportRole.id
            }
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map