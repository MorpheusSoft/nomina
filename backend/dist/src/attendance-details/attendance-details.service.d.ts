import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceDetailsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    importBiometric(payrollPeriodId: string, records: {
        identity: string;
        datetimeIn: string;
        datetimeOut: string;
    }[]): Promise<{
        message: string;
        processedWorkers: number;
    }>;
}
