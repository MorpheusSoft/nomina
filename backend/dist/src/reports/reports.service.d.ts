import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWorkerARC(tenantId: string, workerId: string, year: number): Promise<{
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
    generateISLRXml(tenantId: string, month: number, year: number): Promise<string>;
}
