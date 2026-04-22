-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_VACATION', 'SUSPENDED', 'LIQUIDATED');

-- AlterTable
ALTER TABLE "employment_records" ADD COLUMN     "status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "payroll_periods" ADD COLUMN     "process_statuses" "EmploymentStatus"[] DEFAULT ARRAY['ACTIVE']::"EmploymentStatus"[];

-- CreateTable
CREATE TABLE "vacation_histories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employment_record_id" UUID NOT NULL,
    "payroll_receipt_id" UUID,
    "service_year" INTEGER NOT NULL,
    "service_period_name" VARCHAR(50) NOT NULL,
    "enjoyment_days" INTEGER NOT NULL,
    "rest_days" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vacation_histories" ADD CONSTRAINT "vacation_histories_employment_record_id_fkey" FOREIGN KEY ("employment_record_id") REFERENCES "employment_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_histories" ADD CONSTRAINT "vacation_histories_payroll_receipt_id_fkey" FOREIGN KEY ("payroll_receipt_id") REFERENCES "payroll_receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
