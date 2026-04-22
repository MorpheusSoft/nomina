"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAttendanceDetailDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_attendance_detail_dto_1 = require("./create-attendance-detail.dto");
class UpdateAttendanceDetailDto extends (0, mapped_types_1.PartialType)(create_attendance_detail_dto_1.CreateAttendanceDetailDto) {
}
exports.UpdateAttendanceDetailDto = UpdateAttendanceDetailDto;
//# sourceMappingURL=update-attendance-detail.dto.js.map