"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePayrollGroupDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_payroll_group_dto_1 = require("./create-payroll-group.dto");
class UpdatePayrollGroupDto extends (0, mapped_types_1.PartialType)(create_payroll_group_dto_1.CreatePayrollGroupDto) {
}
exports.UpdatePayrollGroupDto = UpdatePayrollGroupDto;
//# sourceMappingURL=update-payroll-group.dto.js.map