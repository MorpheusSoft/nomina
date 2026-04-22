import { ContractTrustsService } from './contract-trusts.service';
import { CreateTrustTransactionDto } from './dto/create-trust-transaction.dto';
export declare class ContractTrustsController {
    private readonly contractTrustsService;
    constructor(contractTrustsService: ContractTrustsService);
    findAll(user: any): import(".prisma/client").Prisma.PrismaPromise<({
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
        totalAccumulated: import("@prisma/client/runtime/library").Decimal;
        totalAdvances: import("@prisma/client/runtime/library").Decimal;
        availableBalance: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findByEmploymentRecord(user: any, employmentRecordId: string): Promise<{
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
        totalAccumulated: import("@prisma/client/runtime/library").Decimal;
        totalAdvances: import("@prisma/client/runtime/library").Decimal;
        availableBalance: import("@prisma/client/runtime/library").Decimal;
    }>;
    addTransaction(user: any, employmentRecordId: string, dto: CreateTrustTransactionDto): Promise<{
        id: string;
        tenantId: string;
        payrollReceiptId: string | null;
        notes: string | null;
        createdAt: Date;
        type: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        referenceDate: Date;
        contractTrustId: string;
    }>;
}
