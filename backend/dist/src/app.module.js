"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const tenants_module_1 = require("./tenants/tenants.module");
const workers_module_1 = require("./workers/workers.module");
const family_members_module_1 = require("./family-members/family-members.module");
const payroll_module_1 = require("./payroll/payroll.module");
const global_variables_module_1 = require("./global-variables/global-variables.module");
const concepts_module_1 = require("./concepts/concepts.module");
const employment_records_module_1 = require("./employment-records/employment-records.module");
const payroll_groups_module_1 = require("./payroll-groups/payroll-groups.module");
const payroll_group_variables_module_1 = require("./payroll-group-variables/payroll-group-variables.module");
const concept_dependencies_module_1 = require("./concept-dependencies/concept-dependencies.module");
const payroll_periods_module_1 = require("./payroll-periods/payroll-periods.module");
const attendance_summaries_module_1 = require("./attendance-summaries/attendance-summaries.module");
const attendance_details_module_1 = require("./attendance-details/attendance-details.module");
const holidays_module_1 = require("./holidays/holidays.module");
const cost_centers_module_1 = require("./cost-centers/cost-centers.module");
const departments_module_1 = require("./departments/departments.module");
const crews_module_1 = require("./crews/crews.module");
const payroll_engine_module_1 = require("./payroll-engine/payroll-engine.module");
const worker_fixed_concepts_module_1 = require("./worker-fixed-concepts/worker-fixed-concepts.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const worker_loans_module_1 = require("./worker-loans/worker-loans.module");
const payroll_accumulators_module_1 = require("./payroll-accumulators/payroll-accumulators.module");
const contract_trusts_module_1 = require("./contract-trusts/contract-trusts.module");
const vacation_histories_module_1 = require("./vacation-histories/vacation-histories.module");
const accounting_journals_module_1 = require("./accounting-journals/accounting-journals.module");
const attendance_punches_module_1 = require("./attendance-punches/attendance-punches.module");
const attendance_engine_module_1 = require("./attendance-engine/attendance-engine.module");
const biometric_devices_module_1 = require("./biometric-devices/biometric-devices.module");
const shift_templates_module_1 = require("./shift-templates/shift-templates.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const general_catalogs_module_1 = require("./general-catalogs/general-catalogs.module");
const shifts_module_1 = require("./shifts/shifts.module");
const worker_absences_module_1 = require("./worker-absences/worker-absences.module");
const document_templates_module_1 = require("./document-templates/document-templates.module");
const portal_module_1 = require("./portal/portal.module");
const worker_novelties_module_1 = require("./worker-novelties/worker-novelties.module");
const reports_module_1 = require("./reports/reports.module");
const shift_patterns_module_1 = require("./shift-patterns/shift-patterns.module");
const worker_tickets_module_1 = require("./worker-tickets/worker-tickets.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const ari_forms_module_1 = require("./ari-forms/ari-forms.module");
const oracle_module_1 = require("./oracle/oracle.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads/',
            }),
            prisma_module_1.PrismaModule, tenants_module_1.TenantsModule, workers_module_1.WorkersModule, family_members_module_1.FamilyMembersModule, payroll_module_1.PayrollModule, global_variables_module_1.GlobalVariablesModule, concepts_module_1.ConceptsModule, employment_records_module_1.EmploymentRecordsModule, payroll_groups_module_1.PayrollGroupsModule, payroll_group_variables_module_1.PayrollGroupVariablesModule, concept_dependencies_module_1.ConceptDependenciesModule, payroll_periods_module_1.PayrollPeriodsModule, attendance_summaries_module_1.AttendanceSummariesModule, attendance_details_module_1.AttendanceDetailsModule, holidays_module_1.HolidaysModule, cost_centers_module_1.CostCentersModule, departments_module_1.DepartmentsModule, crews_module_1.CrewsModule, payroll_engine_module_1.PayrollEngineModule, worker_fixed_concepts_module_1.WorkerFixedConceptsModule, auth_module_1.AuthModule, users_module_1.UsersModule, roles_module_1.RolesModule, worker_loans_module_1.WorkerLoansModule, payroll_accumulators_module_1.PayrollAccumulatorsModule, contract_trusts_module_1.ContractTrustsModule, vacation_histories_module_1.VacationHistoriesModule, accounting_journals_module_1.AccountingJournalsModule, attendance_punches_module_1.AttendancePunchesModule, attendance_engine_module_1.AttendanceEngineModule, biometric_devices_module_1.BiometricDevicesModule, shift_templates_module_1.ShiftTemplatesModule, dashboard_module_1.DashboardModule, general_catalogs_module_1.GeneralCatalogsModule, shifts_module_1.ShiftsModule, worker_absences_module_1.WorkerAbsencesModule, document_templates_module_1.DocumentTemplatesModule, portal_module_1.PortalModule, worker_novelties_module_1.WorkerNoveltiesModule, reports_module_1.ReportsModule, shift_patterns_module_1.ShiftPatternsModule, worker_tickets_module_1.WorkerTicketsModule, ari_forms_module_1.AriFormsModule, oracle_module_1.OracleModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map