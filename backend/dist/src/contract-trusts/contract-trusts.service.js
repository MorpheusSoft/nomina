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
exports.ContractTrustsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let ContractTrustsService = class ContractTrustsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmploymentRecord(tenantId, employmentRecordId) {
        let trust = await this.prisma.contractTrust.findUnique({
            where: { employmentRecordId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                },
                employmentRecord: {
                    include: { owner: true }
                }
            },
        });
        if (!trust) {
            const contract = await this.prisma.employmentRecord.findFirst({
                where: { id: employmentRecordId, tenantId },
            });
            if (!contract) {
                throw new common_1.NotFoundException('Contrato no encontrado');
            }
            await this.prisma.contractTrust.create({
                data: {
                    tenantId,
                    employmentRecordId,
                },
            });
            trust = await this.prisma.contractTrust.findUnique({
                where: { employmentRecordId },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                    },
                    employmentRecord: {
                        include: { owner: true }
                    }
                },
            });
        }
        if (trust?.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Fideicomiso no encontrado');
        }
        return trust;
    }
    async addTransaction(tenantId, employmentRecordId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const trust = await tx.contractTrust.findUnique({
                where: { employmentRecordId },
            });
            if (!trust || trust.tenantId !== tenantId) {
                throw new common_1.NotFoundException('El fideicomiso no ha sido activado para este contrato. Consulta el saldo primero.');
            }
            if (['WITHDRAWAL', 'ADVANCE'].includes(dto.type)) {
                if (new library_1.Decimal(trust.availableBalance).lessThan(dto.amount)) {
                    throw new common_1.BadRequestException('Fondos insuficientes en el fideicomiso para este retiro/adelanto.');
                }
            }
            const transaction = await tx.trustTransaction.create({
                data: {
                    tenantId,
                    contractTrustId: trust.id,
                    type: dto.type,
                    amount: dto.amount,
                    referenceDate: new Date(dto.referenceDate),
                    notes: dto.notes,
                },
            });
            let newAccumulated = new library_1.Decimal(trust.totalAccumulated);
            let newAdvances = new library_1.Decimal(trust.totalAdvances);
            if (['DEPOSIT', 'INTEREST'].includes(dto.type)) {
                newAccumulated = newAccumulated.add(dto.amount);
            }
            else if (['WITHDRAWAL', 'ADVANCE'].includes(dto.type)) {
                newAdvances = newAdvances.add(dto.amount);
            }
            const newAvailable = newAccumulated.sub(newAdvances);
            await tx.contractTrust.update({
                where: { id: trust.id },
                data: {
                    totalAccumulated: newAccumulated,
                    totalAdvances: newAdvances,
                    availableBalance: newAvailable,
                },
            });
            return transaction;
        });
    }
    findAll(tenantId) {
        return this.prisma.contractTrust.findMany({
            where: { tenantId },
            include: {
                employmentRecord: {
                    include: {
                        owner: true,
                    },
                },
            },
        });
    }
};
exports.ContractTrustsService = ContractTrustsService;
exports.ContractTrustsService = ContractTrustsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractTrustsService);
//# sourceMappingURL=contract-trusts.service.js.map