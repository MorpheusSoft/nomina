import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    calculatePeriod(periodId: string, tenantId: string): Promise<{
        success: boolean;
        receiptsGenerated: number;
    }>;
}
