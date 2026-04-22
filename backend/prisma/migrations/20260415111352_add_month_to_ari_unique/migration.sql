/*
  Warnings:

  - You are about to drop the column `department_id` on the `payroll_periods` table. All the data in the column will be lost.
  - You are about to drop the column `linked_attendance_period_id` on the `payroll_periods` table. All the data in the column will be lost.
  - You are about to drop the column `special_concept_id` on the `payroll_periods` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[signature_token]` on the table `payroll_receipts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PunchSource" AS ENUM ('BIOMETRIC', 'MANUAL', 'EXCEL_IMPORT');

-- CreateEnum
CREATE TYPE "PunchType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "DocumentTemplateType" AS ENUM ('CONTRACT', 'WORK_LETTER', 'LIQUIDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('ABSENCE_OR_LEAVE', 'VACATION', 'TRUST_ADVANCE', 'PAYROLL_CLAIM', 'DOCUMENT_REQUEST', 'EXPENSE_REIMBURSEMENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "payroll_periods" DROP CONSTRAINT "payroll_periods_department_id_fkey";

-- DropForeignKey
ALTER TABLE "payroll_periods" DROP CONSTRAINT "payroll_periods_linked_attendance_period_id_fkey";

-- DropForeignKey
ALTER TABLE "payroll_periods" DROP CONSTRAINT "payroll_periods_special_concept_id_fkey";

-- AlterTable
ALTER TABLE "attendance_summaries" ADD COLUMN     "attendance_mode" VARCHAR(20) NOT NULL DEFAULT 'VIRTUAL',
ADD COLUMN     "justified_absences" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "saturdays_worked" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sundays_worked" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "unjustified_absences" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "concepts" ADD COLUMN     "execution_period_types" TEXT[] DEFAULT ARRAY['REGULAR']::TEXT[];

-- AlterTable
ALTER TABLE "crews" ADD COLUMN     "pattern_anchor" DATE,
ADD COLUMN     "shift_pattern_id" UUID;

-- AlterTable
ALTER TABLE "employment_records" ADD COLUMN     "is_confidential" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payroll_accumulators" ADD COLUMN     "include_all_bonifiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'WEEKS_BACK',
ADD COLUMN     "weeks_back" INTEGER DEFAULT 4;

-- AlterTable
ALTER TABLE "payroll_groups" ADD COLUMN     "night_shift_end_time" VARCHAR(10) NOT NULL DEFAULT '05:00',
ADD COLUMN     "night_shift_start_time" VARCHAR(10) NOT NULL DEFAULT '19:00',
ADD COLUMN     "standard_work_hours" DECIMAL(5,2) NOT NULL DEFAULT 8.0;

-- AlterTable
ALTER TABLE "payroll_periods" DROP COLUMN "department_id",
DROP COLUMN "linked_attendance_period_id",
DROP COLUMN "special_concept_id";

-- AlterTable
ALTER TABLE "payroll_receipts" ADD COLUMN     "email_delivery_status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "signature_ip" VARCHAR(50),
ADD COLUMN     "signature_token" TEXT,
ADD COLUMN     "viewed_at" TIMESTAMP(3),
ADD COLUMN     "whatsapp_delivery_status" VARCHAR(30) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "contact_phone" VARCHAR(50),
ADD COLUMN     "has_worker_portal_access" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logo_url" VARCHAR(255),
ADD COLUMN     "service_end_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "workers" ADD COLUMN     "bank_account_number" VARCHAR(50),
ADD COLUMN     "bank_account_type" VARCHAR(50),
ADD COLUMN     "bank_name" VARCHAR(100);

-- CreateTable
CREATE TABLE "general_catalogs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_absences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_justified" BOOLEAN NOT NULL DEFAULT false,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "reason" VARCHAR(100),
    "observations" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_novelties" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_period_id" UUID,
    "employment_record_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,
    "payment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VES',
    "notes" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_novelties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_journals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_period_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "total_debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_journal_lines" (
    "id" UUID NOT NULL,
    "journal_id" UUID NOT NULL,
    "accounting_code" VARCHAR(50) NOT NULL,
    "cost_center_code" VARCHAR(50),
    "debit_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_devices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(50),
    "mac_address" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_punches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "device_id" UUID,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "type" "PunchType" NOT NULL,
    "source" "PunchSource" NOT NULL,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_punches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_attendance" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "first_in" TIMESTAMP(6),
    "last_out" TIMESTAMP(6),
    "regular_hours" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "late_minutes" INTEGER NOT NULL DEFAULT 0,
    "early_leave_mins" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    "is_manually_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "extra_day_hours" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "extra_night_hours" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "daily_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "start_time" VARCHAR(8) NOT NULL,
    "end_time" VARCHAR(8) NOT NULL,
    "grace_minutes_in" INTEGER NOT NULL DEFAULT 15,
    "meal_minutes" INTEGER NOT NULL DEFAULT 60,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_patterns" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "sequence" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" "DocumentTemplateType" NOT NULL DEFAULT 'OTHER',
    "content_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_self_service" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_tickets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "type" "TicketType" NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "json_metadata" JSONB,
    "hr_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_ari_forms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employment_record_id" UUID NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL DEFAULT 1,
    "estimated_remuneration" DECIMAL(15,2) NOT NULL,
    "tax_units_value" DECIMAL(15,4) NOT NULL,
    "deduction_type" VARCHAR(30) NOT NULL DEFAULT 'UNIQUE',
    "detailed_deductions_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "edu_deduction_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "hcm_deduction_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "med_deduction_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "housing_deduction_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "family_load_count" INTEGER NOT NULL DEFAULT 0,
    "withholding_percentage" DECIMAL(5,2) NOT NULL,
    "is_system_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_ari_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PeriodSpecialConcepts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_AttendanceImportM2M" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_PeriodDepartments" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "general_catalogs_tenant_id_category_value_key" ON "general_catalogs"("tenant_id", "category", "value");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_journals_payroll_period_id_key" ON "accounting_journals"("payroll_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_punches_worker_id_timestamp_key" ON "attendance_punches"("worker_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "daily_attendance_worker_id_date_key" ON "daily_attendance"("worker_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "shift_templates_worker_id_key" ON "shift_templates"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_ari_forms_employment_record_id_fiscal_year_month_key" ON "worker_ari_forms"("employment_record_id", "fiscal_year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "_PeriodSpecialConcepts_AB_unique" ON "_PeriodSpecialConcepts"("A", "B");

-- CreateIndex
CREATE INDEX "_PeriodSpecialConcepts_B_index" ON "_PeriodSpecialConcepts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttendanceImportM2M_AB_unique" ON "_AttendanceImportM2M"("A", "B");

-- CreateIndex
CREATE INDEX "_AttendanceImportM2M_B_index" ON "_AttendanceImportM2M"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PeriodDepartments_AB_unique" ON "_PeriodDepartments"("A", "B");

-- CreateIndex
CREATE INDEX "_PeriodDepartments_B_index" ON "_PeriodDepartments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_receipts_signature_token_key" ON "payroll_receipts"("signature_token");

-- AddForeignKey
ALTER TABLE "general_catalogs" ADD CONSTRAINT "general_catalogs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_absences" ADD CONSTRAINT "worker_absences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_absences" ADD CONSTRAINT "worker_absences_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crews" ADD CONSTRAINT "crews_shift_pattern_id_fkey" FOREIGN KEY ("shift_pattern_id") REFERENCES "shift_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_novelties" ADD CONSTRAINT "worker_novelties_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_novelties" ADD CONSTRAINT "worker_novelties_employment_record_id_fkey" FOREIGN KEY ("employment_record_id") REFERENCES "employment_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_novelties" ADD CONSTRAINT "worker_novelties_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_novelties" ADD CONSTRAINT "worker_novelties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_journals" ADD CONSTRAINT "accounting_journals_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_journals" ADD CONSTRAINT "accounting_journals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_journal_lines" ADD CONSTRAINT "accounting_journal_lines_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "accounting_journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometric_devices" ADD CONSTRAINT "biometric_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_punches" ADD CONSTRAINT "attendance_punches_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "biometric_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_punches" ADD CONSTRAINT "attendance_punches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_punches" ADD CONSTRAINT "attendance_punches_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_attendance" ADD CONSTRAINT "daily_attendance_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_patterns" ADD CONSTRAINT "shift_patterns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_tickets" ADD CONSTRAINT "worker_tickets_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_tickets" ADD CONSTRAINT "worker_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_ari_forms" ADD CONSTRAINT "worker_ari_forms_employment_record_id_fkey" FOREIGN KEY ("employment_record_id") REFERENCES "employment_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_ari_forms" ADD CONSTRAINT "worker_ari_forms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodSpecialConcepts" ADD CONSTRAINT "_PeriodSpecialConcepts_A_fkey" FOREIGN KEY ("A") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodSpecialConcepts" ADD CONSTRAINT "_PeriodSpecialConcepts_B_fkey" FOREIGN KEY ("B") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttendanceImportM2M" ADD CONSTRAINT "_AttendanceImportM2M_A_fkey" FOREIGN KEY ("A") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttendanceImportM2M" ADD CONSTRAINT "_AttendanceImportM2M_B_fkey" FOREIGN KEY ("B") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodDepartments" ADD CONSTRAINT "_PeriodDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeriodDepartments" ADD CONSTRAINT "_PeriodDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
