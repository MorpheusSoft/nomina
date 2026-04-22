import { CreateWorkerAbsenceDto } from './create-worker-absence.dto';
declare const UpdateWorkerAbsenceDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateWorkerAbsenceDto>>;
export declare class UpdateWorkerAbsenceDto extends UpdateWorkerAbsenceDto_base {
    status?: string;
}
export {};
