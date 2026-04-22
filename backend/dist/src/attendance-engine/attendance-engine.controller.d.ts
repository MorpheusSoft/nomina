import { AttendanceEngineService } from './attendance-engine.service';
export declare class AttendanceEngineController {
    private readonly engineService;
    constructor(engineService: AttendanceEngineService);
    processDaily(body: {
        tenantId: string;
        workerId: string;
        date: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        date: Date;
        firstIn: Date | null;
        lastOut: Date | null;
        regularHours: import("@prisma/client/runtime/library").Decimal;
        ordinaryDayHours: import("@prisma/client/runtime/library").Decimal;
        ordinaryNightHours: import("@prisma/client/runtime/library").Decimal;
        lateMinutes: number;
        earlyLeaveMins: number;
        isManuallyEdited: boolean;
        extraDayHours: import("@prisma/client/runtime/library").Decimal;
        extraNightHours: import("@prisma/client/runtime/library").Decimal;
    }>;
}
