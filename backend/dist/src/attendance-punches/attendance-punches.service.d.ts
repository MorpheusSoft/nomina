import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AttendancePunchesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AttendancePunchUncheckedCreateInput): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        workerId: string;
        type: import(".prisma/client").$Enums.PunchType;
        deviceId: string | null;
        timestamp: Date;
        source: import(".prisma/client").$Enums.PunchSource;
        isProcessed: boolean;
    }>;
    createBulk(tenantId: string, punches: any[]): Promise<{
        count: number;
    }>;
    findAll(tenantId: string, workerId?: string): Promise<({
        worker: {
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
        };
        device: {
            name: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        workerId: string;
        type: import(".prisma/client").$Enums.PunchType;
        deviceId: string | null;
        timestamp: Date;
        source: import(".prisma/client").$Enums.PunchSource;
        isProcessed: boolean;
    })[]>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        workerId: string;
        type: import(".prisma/client").$Enums.PunchType;
        deviceId: string | null;
        timestamp: Date;
        source: import(".prisma/client").$Enums.PunchSource;
        isProcessed: boolean;
    }>;
}
