import { PrismaService } from '../prisma/prisma.service';
import { CreateTrustTransactionDto } from './dto/create-trust-transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';
export declare class ContractTrustsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmploymentRecord(tenantId: string, employmentRecordId: string): Promise<{
        employmentRecord: {
            owner: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                firstName: string;
                lastName: string;
                primaryIdentityNumber: string;
                birthDate: Date;
                gender: string;
                nationality: string;
                maritalStatus: string;
                deletedAt: Date | null;
                phone: string | null;
                bankAccountNumber: string | null;
                bankAccountType: string | null;
                bankName: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date | null;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            contractType: string;
            position: string;
            status: import(".prisma/client").$Enums.EmploymentStatus;
            isConfidential: boolean;
            workerId: string;
            departmentId: string | null;
            payrollGroupId: string | null;
            costCenterId: string | null;
            crewId: string | null;
        };
        transactions: {
            id: string;
            tenantId: string;
            payrollReceiptId: string | null;
            notes: string | null;
            createdAt: Date;
            type: string;
            amount: Decimal;
            referenceDate: Date;
            contractTrustId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        totalAccumulated: Decimal;
        totalAdvances: Decimal;
        availableBalance: Decimal;
    }>;
    addTransaction(tenantId: string, employmentRecordId: string, dto: CreateTrustTransactionDto): Promise<{
        id: string;
        tenantId: string;
        payrollReceiptId: string | null;
        notes: string | null;
        createdAt: Date;
        type: string;
        amount: Decimal;
        referenceDate: Date;
        contractTrustId: string;
    }>;
    findAll(tenantId: string): import(".prisma/client").Prisma.PrismaPromise<({
        employmentRecord: {
            owner: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                firstName: string;
                lastName: string;
                primaryIdentityNumber: string;
                birthDate: Date;
                gender: string;
                nationality: string;
                maritalStatus: string;
                deletedAt: Date | null;
                phone: string | null;
                bankAccountNumber: string | null;
                bankAccountType: string | null;
                bankName: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date | null;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            contractType: string;
            position: string;
            status: import(".prisma/client").$Enums.EmploymentStatus;
            isConfidential: boolean;
            workerId: string;
            departmentId: string | null;
            payrollGroupId: string | null;
            costCenterId: string | null;
            crewId: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        totalAccumulated: Decimal;
        totalAdvances: Decimal;
        availableBalance: Decimal;
    })[]>;
}
