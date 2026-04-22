import { AttendanceDetailsService } from './attendance-details.service';
export declare class AttendanceDetailsController {
    private readonly attendanceDetailsService;
    constructor(attendanceDetailsService: AttendanceDetailsService);
    importBiometric(periodId: string, data: {
        records: {
            identity: string;
            datetimeIn: string;
            datetimeOut: string;
        }[];
    }): Promise<{
        message: string;
        processedWorkers: number;
    }>;
}
