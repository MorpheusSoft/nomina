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
exports.WorkerFixedConceptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkerFixedConceptsService = class WorkerFixedConceptsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        try {
            return await this.prisma.workerFixedConcept.create({
                data: {
                    ...data,
                    validFrom: new Date(data.validFrom),
                    validTo: data.validTo ? new Date(data.validTo) : null,
                },
            });
        }
        catch (e) {
            throw new common_1.BadRequestException('Error creating Worker Fixed Concept: ' + (e.message || JSON.stringify(e)));
        }
    }
    async findAllByWorker(workerId) {
        return this.prisma.workerFixedConcept.findMany({
            where: { employmentRecord: { workerId } },
            include: { concept: true }
        });
    }
    async findAllByEmploymentRecord(employmentRecordId) {
        return this.prisma.workerFixedConcept.findMany({
            where: { employmentRecordId },
            include: { concept: true }
        });
    }
    async findOne(id) {
        return this.prisma.workerFixedConcept.findUnique({
            where: { id },
            include: { concept: true, employmentRecord: true }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.validFrom)
            updateData.validFrom = new Date(data.validFrom);
        if (data.validTo !== undefined)
            updateData.validTo = data.validTo ? new Date(data.validTo) : null;
        return this.prisma.workerFixedConcept.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
        return this.prisma.workerFixedConcept.delete({
            where: { id },
        });
    }
};
exports.WorkerFixedConceptsService = WorkerFixedConceptsService;
exports.WorkerFixedConceptsService = WorkerFixedConceptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerFixedConceptsService);
//# sourceMappingURL=worker-fixed-concepts.service.js.map