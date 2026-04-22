"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceSummariesModule = void 0;
const common_1 = require("@nestjs/common");
const attendance_summaries_service_1 = require("./attendance-summaries.service");
const attendance_summaries_controller_1 = require("./attendance-summaries.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const attendance_engine_module_1 = require("../attendance-engine/attendance-engine.module");
let AttendanceSummariesModule = class AttendanceSummariesModule {
};
exports.AttendanceSummariesModule = AttendanceSummariesModule;
exports.AttendanceSummariesModule = AttendanceSummariesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, attendance_engine_module_1.AttendanceEngineModule],
        controllers: [attendance_summaries_controller_1.AttendanceSummariesController],
        providers: [attendance_summaries_service_1.AttendanceSummariesService],
    })
], AttendanceSummariesModule);
//# sourceMappingURL=attendance-summaries.module.js.map