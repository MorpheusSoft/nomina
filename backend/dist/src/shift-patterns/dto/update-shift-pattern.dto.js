"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShiftPatternDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_shift_pattern_dto_1 = require("./create-shift-pattern.dto");
class UpdateShiftPatternDto extends (0, mapped_types_1.PartialType)(create_shift_pattern_dto_1.CreateShiftPatternDto) {
}
exports.UpdateShiftPatternDto = UpdateShiftPatternDto;
//# sourceMappingURL=update-shift-pattern.dto.js.map