import { CreateWorkerTicketDto } from './create-worker-ticket.dto';
import { TicketStatus } from '@prisma/client';
declare const UpdateWorkerTicketDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateWorkerTicketDto>>;
export declare class UpdateWorkerTicketDto extends UpdateWorkerTicketDto_base {
    status?: TicketStatus;
    hrNotes?: string;
}
export {};
