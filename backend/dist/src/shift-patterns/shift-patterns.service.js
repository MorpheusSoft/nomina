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
exports.ShiftPatternsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ShiftPatternsService = class ShiftPatternsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createShiftPatternDto) {
        return this.prisma.shiftPattern.create({
            data: {
                tenantId,
                name: createShiftPatternDto.name,
                sequence: createShiftPatternDto.sequence,
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.shiftPattern.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { crews: true }
                }
            }
        });
    }
    async findOne(tenantId, id) {
        const pattern = await this.prisma.shiftPattern.findUnique({
            where: { id, tenantId },
            include: { crews: true }
        });
        if (!pattern)
            throw new common_1.NotFoundException('Shift Pattern not found');
        return pattern;
    }
    async update(tenantId, id, updateShiftPatternDto) {
        const pattern = await this.findOne(tenantId, id);
        return this.prisma.shiftPattern.update({
            where: { id: pattern.id },
            data: {
                name: updateShiftPatternDto.name,
                sequence: updateShiftPatternDto.sequence !== undefined ? updateShiftPatternDto.sequence : undefined,
            },
        });
    }
    async remove(tenantId, id) {
        const pattern = await this.findOne(tenantId, id);
        return this.prisma.shiftPattern.delete({
            where: { id: pattern.id },
        });
    }
};
exports.ShiftPatternsService = ShiftPatternsService;
exports.ShiftPatternsService = ShiftPatternsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShiftPatternsService);
//# sourceMappingURL=shift-patterns.service.js.map