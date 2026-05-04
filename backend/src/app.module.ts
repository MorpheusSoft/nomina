import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { WorkersModule } from './workers/workers.module';
import { FamilyMembersModule } from './family-members/family-members.module';
import { PayrollModule } from './payroll/payroll.module';
import { GlobalVariablesModule } from './global-variables/global-variables.module';
import { ConceptsModule } from './concepts/concepts.module';
import { EmploymentRecordsModule } from './employment-records/employment-records.module';
import { PayrollGroupsModule } from './payroll-groups/payroll-groups.module';
import { PayrollGroupVariablesModule } from './payroll-group-variables/payroll-group-variables.module';
import { ConceptDependenciesModule } from './concept-dependencies/concept-dependencies.module';
import { PayrollPeriodsModule } from './payroll-periods/payroll-periods.module';
import { AttendanceSummariesModule } from './attendance-summaries/attendance-summaries.module';
import { AttendanceDetailsModule } from './attendance-details/attendance-details.module';
import { HolidaysModule } from './holidays/holidays.module';
import { CostCentersModule } from './cost-centers/cost-centers.module';
import { DepartmentsModule } from './departments/departments.module';
import { CrewsModule } from './crews/crews.module';
import { PayrollEngineModule } from './payroll-engine/payroll-engine.module';
import { WorkerFixedConceptsModule } from './worker-fixed-concepts/worker-fixed-concepts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { WorkerLoansModule } from './worker-loans/worker-loans.module';
import { PayrollAccumulatorsModule } from './payroll-accumulators/payroll-accumulators.module';
import { ContractTrustsModule } from './contract-trusts/contract-trusts.module';
import { VacationHistoriesModule } from './vacation-histories/vacation-histories.module';
import { AccountingJournalsModule } from './accounting-journals/accounting-journals.module';
import { AttendancePunchesModule } from './attendance-punches/attendance-punches.module';
import { AttendanceEngineModule } from './attendance-engine/attendance-engine.module';
import { BiometricDevicesModule } from './biometric-devices/biometric-devices.module';
import { ShiftTemplatesModule } from './shift-templates/shift-templates.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GeneralCatalogsModule } from './general-catalogs/general-catalogs.module';
import { ShiftsModule } from './shifts/shifts.module';
import { WorkerAbsencesModule } from './worker-absences/worker-absences.module';
import { DocumentTemplatesModule } from './document-templates/document-templates.module';
import { PortalModule } from './portal/portal.module';
import { WorkerNoveltiesModule } from './worker-novelties/worker-novelties.module';
import { ReportsModule } from './reports/reports.module';
import { ShiftPatternsModule } from './shift-patterns/shift-patterns.module';
import { WorkerTicketsModule } from './worker-tickets/worker-tickets.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AriFormsModule } from './ari-forms/ari-forms.module';
import { OracleModule } from './oracle/oracle.module';
import { WorkLocationsModule } from './work-locations/work-locations.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
    }),
    PrismaModule, TenantsModule, WorkersModule, FamilyMembersModule, PayrollModule, GlobalVariablesModule, ConceptsModule, EmploymentRecordsModule, PayrollGroupsModule, PayrollGroupVariablesModule, ConceptDependenciesModule, PayrollPeriodsModule, AttendanceSummariesModule, AttendanceDetailsModule, HolidaysModule, CostCentersModule, DepartmentsModule, CrewsModule, PayrollEngineModule, WorkerFixedConceptsModule, AuthModule, UsersModule, RolesModule, WorkerLoansModule, PayrollAccumulatorsModule, ContractTrustsModule, VacationHistoriesModule, AccountingJournalsModule, AttendancePunchesModule, AttendanceEngineModule, BiometricDevicesModule, ShiftTemplatesModule, DashboardModule, GeneralCatalogsModule, ShiftsModule, WorkerAbsencesModule, DocumentTemplatesModule, PortalModule, WorkerNoveltiesModule, ReportsModule, ShiftPatternsModule, WorkerTicketsModule, AriFormsModule, OracleModule, WorkLocationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
