import { TicketType } from '@prisma/client';
export declare class CreateWorkerTicketDto {
    workerId: string;
    type: TicketType;
    title: string;
    description: string;
    jsonMetadata?: any;
}
