/*
  Warnings:

  - Added the required column `updated_at` to the `payroll_receipts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employment_records" ADD COLUMN     "cost_center_id" UUID,
ADD COLUMN     "crew_id" UUID;

-- AlterTable
ALTER TABLE "payroll_group_variables" ADD COLUMN     "type" VARCHAR(30) NOT NULL DEFAULT 'STATIC';

-- AlterTable
ALTER TABLE "payroll_receipts" ADD COLUMN     "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "attendance_summaries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_period_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "shift_base_hours" DECIMAL(15,2) NOT NULL,
    "shift_type" VARCHAR(30) NOT NULL,
    "days_worked" DECIMAL(15,2) NOT NULL,
    "ordinary_hours" DECIMAL(15,2) NOT NULL,
    "extra_day_hours" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "extra_night_hours" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_details" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "attendance_summary_id" UUID NOT NULL,
    "datetime_in" TIMESTAMP(6) NOT NULL,
    "datetime_out" TIMESTAMP(6) NOT NULL,
    "worked_hours" DECIMAL(15,2) NOT NULL,
    "is_extra" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_annual" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "accounting_code" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "workerId" UUID,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "cost_center_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crews" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VariableConcepts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_summaries_payroll_period_id_worker_id_key" ON "attendance_summaries"("payroll_period_id", "worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "_VariableConcepts_AB_unique" ON "_VariableConcepts"("A", "B");

-- CreateIndex
CREATE INDEX "_VariableConcepts_B_index" ON "_VariableConcepts"("B");

-- AddForeignKey
ALTER TABLE "employment_records" ADD CONSTRAINT "employment_records_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_records" ADD CONSTRAINT "employment_records_crew_id_fkey" FOREIGN KEY ("crew_id") REFERENCES "crews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_records" ADD CONSTRAINT "employment_records_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summaries" ADD CONSTRAINT "attendance_summaries_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summaries" ADD CONSTRAINT "attendance_summaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summaries" ADD CONSTRAINT "attendance_summaries_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_details" ADD CONSTRAINT "attendance_details_attendance_summary_id_fkey" FOREIGN KEY ("attendance_summary_id") REFERENCES "attendance_summaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_details" ADD CONSTRAINT "attendance_details_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crews" ADD CONSTRAINT "crews_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VariableConcepts" ADD CONSTRAINT "_VariableConcepts_A_fkey" FOREIGN KEY ("A") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VariableConcepts" ADD CONSTRAINT "_VariableConcepts_B_fkey" FOREIGN KEY ("B") REFERENCES "payroll_group_variables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
