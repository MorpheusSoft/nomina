import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(user: any): Promise<{
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
