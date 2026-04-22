import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(tenantId: string, canViewConfidential?: boolean): Promise<{
        totalWorkers: number;
        budgetExecution: {
            budget: number;
            executed: number;
            percentage: number;
        };
        expiringContracts: number;
        absenteeism: {
            rate: number;
            absences: number;
            totalExpected: number;
        };
        totalTrustDebt: number;
    }>;
}
