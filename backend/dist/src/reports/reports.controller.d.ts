import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private prisma;
    private readonly reportsService;
    constructor(prisma: PrismaService, reportsService: ReportsService);
    getConceptsDistribution(user: any, startDateString: string, endDateString: string, currencyView?: string, consolidated?: string, conceptIdsString?: string): Promise<any[]>;
    getLoansAccount(user: any, viewType?: string, currencyView?: string, exchangeRateString?: string): Promise<any[]>;
    getWorkerARC(user: any, yearString: string, workerId: string): Promise<{
        worker: {
            name: string;
            identity: string;
        };
        year: number;
        totalBase: number;
        totalRetained: number;
        monthlyData: {
            base: number;
            retained: number;
        }[];
    }>;
    getISLRXml(user: any, monthString: string, yearString: string, res: any): Promise<void>;
}
