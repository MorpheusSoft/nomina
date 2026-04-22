import { PrismaService } from '../prisma/prisma.service';
import { HolidaysService } from '../holidays/holidays.service';
export declare class AttendanceEngineService {
    private prisma;
    private holidaysService;
    constructor(prisma: PrismaService, holidaysService: HolidaysService);
    processDailyAttendance(tenantId: string, workerId: string, baseDate: string, preloadedHolidays?: any[] | null): Promise<{
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
    processPeriodPunches(tenantId: string, startDate: Date, endDate: Date): Promise<{
        processedWorkerDaysCount: number;
    }>;
    private saveDaily;
    calculateTimeSlices(startTime: Date, totalMinutes: number, nightStartStr: string, nightEndStr: string): {
        dayMins: number;
        nightMins: number;
    };
}
