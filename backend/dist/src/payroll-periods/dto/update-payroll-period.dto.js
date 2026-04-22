"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePayrollPeriodDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_payroll_period_dto_1 = require("./create-payroll-period.dto");
class UpdatePayrollPeriodDto extends (0, mapped_types_1.PartialType)(create_payroll_period_dto_1.CreatePayrollPeriodDto) {
}
exports.UpdatePayrollPeriodDto = UpdatePayrollPeriodDto;
//# sourceMappingURL=update-payroll-period.dto.js.map