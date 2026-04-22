import { WorkerTicketsService } from './worker-tickets.service';
import { CreateWorkerTicketDto } from './dto/create-worker-ticket.dto';
import { UpdateWorkerTicketDto } from './dto/update-worker-ticket.dto';
export declare class WorkerTicketsController {
    private readonly workerTicketsService;
    constructor(workerTicketsService: WorkerTicketsService);
    create(user: any, createWorkerTicketDto: CreateWorkerTicketDto): Promise<{
        worker: {
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
    findAll(user: any, workerId?: string): Promise<({
        worker: {
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    })[]>;
    findOne(user: any, id: string): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
    update(user: any, id: string, updateWorkerTicketDto: UpdateWorkerTicketDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
    addComment(user: any, id: string, body: {
        text: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
    remove(user: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
}
