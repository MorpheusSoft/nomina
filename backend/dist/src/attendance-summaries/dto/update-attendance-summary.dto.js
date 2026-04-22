"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAttendanceSummaryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_attendance_summary_dto_1 = require("./create-attendance-summary.dto");
class UpdateAttendanceSummaryDto extends (0, mapped_types_1.PartialType)(create_attendance_summary_dto_1.CreateAttendanceSummaryDto) {
}
exports.UpdateAttendanceSummaryDto = UpdateAttendanceSummaryDto;
//# sourceMappingURL=update-attendance-summary.dto.js.map