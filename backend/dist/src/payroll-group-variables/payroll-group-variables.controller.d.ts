import { PayrollGroupVariablesService } from './payroll-group-variables.service';
export declare class PayrollGroupVariablesController {
    private readonly variablesService;
    constructor(variablesService: PayrollGroupVariablesService);
    findAll(payrollGroupId: string, user: any): Promise<any[]>;
    create(createDto: any): Promise<{
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
    update(id: string, updateDto: any): Promise<{
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
