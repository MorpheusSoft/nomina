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
exports.WorkLocationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkLocationsService = class WorkLocationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.workLocation.create({
            data,
        });
    }
    async findAll(tenantId) {
        return this.prisma.workLocation.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }
    async getSyncData(id, tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { hasGeofencingAccess: true }
        });
        if (!tenant?.hasGeofencingAccess) {
            throw new common_1.UnauthorizedException('Su empresa no tiene habilitado el módulo premium de Asistencia Geolocalizada.');
        }
        const location = await this.findOne(id, tenantId);
        const costCenters = await this.prisma.costCenter.findMany({
            where: { workLocationId: id, tenantId },
            include: {
                departments: {
                    include: {
                        crews: {
                            include: {
                                employmentRecords: {
                                    where: { isActive: true },
                                    include: {
                                        owner: {
                                            select: { id: true, firstName: true, lastName: true, primaryIdentityNumber: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const mappedCrews = [];
        costCenters.forEach(cc => {
            cc.departments.forEach(dept => {
                dept.crews.forEach(crew => {
                    if (crew.employmentRecords.length > 0) {
                        mappedCrews.push({
                            id: crew.id,
                            costCenterId: cc.id,
                            costCenterName: `${cc.name} - ${crew.name}`,
                            workers: crew.employmentRecords.map(er => ({
                                id: er.owner.id,
                                name: `${er.owner.firstName} ${er.owner.lastName}`,
                                identity: er.owner.primaryIdentityNumber,
                                status: 'PENDING'
                            }))
                        });
                    }
                });
            });
        });
        return {
            location: {
                id: location.id,
                name: location.name,
                latitude: location.latitude,
                longitude: location.longitude,
                allowedRadius: location.allowedRadius
            },
            crews: mappedCrews
        };
    }
    async findOne(id, tenantId) {
        const workLocation = await this.prisma.workLocation.findFirst({
            where: { id, tenantId },
        });
        if (!workLocation) {
            throw new common_1.BadRequestException('WorkLocation not found or access denied');
        }
        return workLocation;
    }
    async update(id, tenantId, data) {
        await this.findOne(id, tenantId);
        return this.prisma.workLocation.update({
            where: { id },
            data,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        const costCenters = await this.prisma.costCenter.count({
            where: { workLocationId: id }
        });
        if (costCenters > 0) {
            throw new common_1.BadRequestException('No se puede eliminar la locación porque está asignada a uno o más Centros de Costo.');
        }
        return this.prisma.workLocation.delete({
            where: { id },
        });
    }
};
exports.WorkLocationsService = WorkLocationsService;
exports.WorkLocationsService = WorkLocationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkLocationsService);
//# sourceMappingURL=work-locations.service.js.map