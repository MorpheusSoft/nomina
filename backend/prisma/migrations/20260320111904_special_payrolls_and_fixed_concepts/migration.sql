-- AlterTable
ALTER TABLE "payroll_periods" ADD COLUMN     "linked_attendance_period_id" UUID;

-- CreateTable
CREATE TABLE "worker_fixed_concepts" (
    "id" UUID NOT NULL,
    "employment_record_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VES',
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_fixed_concepts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_linked_attendance_period_id_fkey" FOREIGN KEY ("linked_attendance_period_id") REFERENCES "payroll_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_fixed_concepts" ADD CONSTRAINT "worker_fixed_concepts_employment_record_id_fkey" FOREIGN KEY ("employment_record_id") REFERENCES "employment_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_fixed_concepts" ADD CONSTRAINT "worker_fixed_concepts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
