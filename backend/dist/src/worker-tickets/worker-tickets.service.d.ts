import { CreateWorkerTicketDto } from './dto/create-worker-ticket.dto';
import { UpdateWorkerTicketDto } from './dto/update-worker-ticket.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class WorkerTicketsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createWorkerTicketDto: CreateWorkerTicketDto): Promise<{
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
    findAll(tenantId: string, workerId?: string): Promise<({
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
    findOne(id: string, tenantId: string): Promise<{
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
    update(id: string, tenantId: string, updateWorkerTicketDto: UpdateWorkerTicketDto): Promise<{
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
    addComment(id: string, tenantId: string, authorName: string, text: string): Promise<{
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
    remove(id: string, tenantId: string): Promise<{
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
