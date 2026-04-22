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
exports.GeneralCatalogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GeneralCatalogsService = class GeneralCatalogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByCategory(tenantId, category) {
        if (!category) {
            return this.prisma.generalCatalog.findMany({ where: { tenantId } });
        }
        return this.prisma.generalCatalog.findMany({
            where: { tenantId, category },
            orderBy: { value: 'asc' }
        });
    }
    async create(tenantId, category, value) {
        if (!category || !value) {
            throw new common_1.BadRequestException('Category and Value are required');
        }
        try {
            return await this.prisma.generalCatalog.create({
                data: {
                    tenantId,
                    category: category.toUpperCase(),
                    value
                }
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`El valor "${value}" ya existe en el catálogo "${category}".`);
        }
    }
    async remove(id, tenantId) {
        return this.prisma.generalCatalog.delete({
            where: { id, tenantId }
        });
    }
};
exports.GeneralCatalogsService = GeneralCatalogsService;
exports.GeneralCatalogsService = GeneralCatalogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GeneralCatalogsService);
//# sourceMappingURL=general-catalogs.service.js.map