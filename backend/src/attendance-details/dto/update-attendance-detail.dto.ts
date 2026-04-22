import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDetailDto } from './create-attendance-detail.dto';

export class UpdateAttendanceDetailDto extends PartialType(CreateAttendanceDetailDto) {}
