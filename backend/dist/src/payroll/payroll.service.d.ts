import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculatePeriod(tenantId: string, periodId: string): Promise<{
        success: boolean;
        receiptsGenerated: number;
    }>;
}
