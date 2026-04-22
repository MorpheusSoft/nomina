import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceSummaryDto } from './create-attendance-summary.dto';

export class UpdateAttendanceSummaryDto extends PartialType(CreateAttendanceSummaryDto) {}
