import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollGroupVariablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        payrollGroupId: string;
        type: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(payrollGroupId: string): Promise<({
        concepts: {
            id: string;
            name: string;
            code: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        payrollGroupId: string;
        type: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findAllByTenant(tenantId: string): Promise<any[]>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        payrollGroupId: string;
        type: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        payrollGroupId: string;
        type: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }>;
}
