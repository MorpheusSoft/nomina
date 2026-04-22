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
exports.CrewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CrewsService = class CrewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        const dept = await this.prisma.department.findFirst({
            where: { id: data.departmentId, costCenter: { tenantId } }
        });
        if (!dept)
            throw new common_1.NotFoundException('Departamento no encontrado o no autorizado');
        return this.prisma.crew.create({
            data: {
                name: data.name,
                departmentId: data.departmentId,
                shiftPatternId: data.shiftPatternId || null,
                patternAnchor: data.patternAnchor ? new Date(data.patternAnchor) : null,
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.crew.findMany({
            where: { department: { costCenter: { tenantId } } },
            include: {
                department: { include: { costCenter: true } },
                shiftPattern: true
            }
        });
    }
    async findOne(tenantId, id) {
        const crew = await this.prisma.crew.findFirst({
            where: { id, department: { costCenter: { tenantId } } },
            include: {
                department: { include: { costCenter: true } },
                shiftPattern: true
            }
        });
        if (!crew)
            throw new common_1.NotFoundException('Cuadrilla no encontrada o no autorizada');
        return crew;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id);
        return this.prisma.crew.update({
            where: { id },
            data: {
                name: data.name,
                shiftPatternId: data.shiftPatternId || null,
                patternAnchor: data.patternAnchor ? new Date(data.patternAnchor) : null,
            },
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.crew.delete({
            where: { id },
        });
    }
};
exports.CrewsService = CrewsService;
exports.CrewsService = CrewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrewsService);
//# sourceMappingURL=crews.service.js.map