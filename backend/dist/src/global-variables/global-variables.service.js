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
exports.GlobalVariablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GlobalVariablesService = class GlobalVariablesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        return this.prisma.globalVariable.create({
            data: { ...data, tenantId },
        });
    }
    async findAll(tenantId) {
        return this.prisma.globalVariable.findMany({
            where: { tenantId },
            orderBy: { code: 'asc' },
        });
    }
    async findOne(tenantId, id) {
        const v = await this.prisma.globalVariable.findFirst({ where: { id, tenantId } });
        if (!v)
            throw new common_1.NotFoundException('Variable not found or unauthorized');
        return v;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id);
        return this.prisma.globalVariable.updateMany({
            where: { id, tenantId },
            data,
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.globalVariable.deleteMany({ where: { id, tenantId } });
    }
    async importFromRoot(targetTenantId) {
        const adminUser = await this.prisma.user.findUnique({ where: { email: 'admin@nebulapayrolls.com' } });
        if (!adminUser)
            throw new common_1.NotFoundException('Nodo maestro inaccesible.');
        if (adminUser.tenantId === targetTenantId)
            throw new Error('Ya estás en el nodo maestro.');
        const rootVars = await this.prisma.globalVariable.findMany({ where: { tenantId: adminUser.tenantId } });
        let importedCount = 0;
        for (const v of rootVars) {
            const exists = await this.prisma.globalVariable.findFirst({
                where: { tenantId: targetTenantId, code: v.code }
            });
            if (!exists) {
                const { id, tenantId, ...cleanVar } = v;
                await this.prisma.globalVariable.create({
                    data: {
                        ...cleanVar,
                        tenantId: targetTenantId
                    }
                });
                importedCount++;
            }
        }
        return { importedCount };
    }
};
exports.GlobalVariablesService = GlobalVariablesService;
exports.GlobalVariablesService = GlobalVariablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GlobalVariablesService);
//# sourceMappingURL=global-variables.service.js.map