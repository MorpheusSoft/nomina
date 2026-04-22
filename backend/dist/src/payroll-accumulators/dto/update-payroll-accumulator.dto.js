"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePayrollAccumulatorDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_payroll_accumulator_dto_1 = require("./create-payroll-accumulator.dto");
class UpdatePayrollAccumulatorDto extends (0, mapped_types_1.PartialType)(create_payroll_accumulator_dto_1.CreatePayrollAccumulatorDto) {
}
exports.UpdatePayrollAccumulatorDto = UpdatePayrollAccumulatorDto;
//# sourceMappingURL=update-payroll-accumulator.dto.js.map