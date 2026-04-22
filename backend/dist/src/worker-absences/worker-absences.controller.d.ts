import { WorkerAbsencesService } from './worker-absences.service';
import { CreateWorkerAbsenceDto } from './dto/create-worker-absence.dto';
import { UpdateWorkerAbsenceDto } from './dto/update-worker-absence.dto';
export declare class WorkerAbsencesController {
    private readonly workerAbsencesService;
    constructor(workerAbsencesService: WorkerAbsencesService);
    create(req: any, createWorkerAbsenceDto: CreateWorkerAbsenceDto): Promise<{
        worker: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        isJustified: boolean;
        isPaid: boolean;
        reason: string | null;
        observations: string | null;
    }>;
    findAll(req: any): Promise<({
        worker: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        isJustified: boolean;
        isPaid: boolean;
        reason: string | null;
        observations: string | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        worker: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        isJustified: boolean;
        isPaid: boolean;
        reason: string | null;
        observations: string | null;
    }>;
    update(req: any, id: string, updateWorkerAbsenceDto: UpdateWorkerAbsenceDto): Promise<{
        worker: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        isJustified: boolean;
        isPaid: boolean;
        reason: string | null;
        observations: string | null;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        isJustified: boolean;
        isPaid: boolean;
        reason: string | null;
        observations: string | null;
    }>;
    updateStatus(req: any, id: string, body: {
        status: string;
        isJustified?: boolean;
        isPaid?: boolean;
    }): Promise<{
        worker: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        isJustified: boolean;
        isPaid: boolean;
        reason: string | null;
        observations: string | null;
    }>;
}
