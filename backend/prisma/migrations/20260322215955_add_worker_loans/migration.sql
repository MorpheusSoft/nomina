-- AlterTable
ALTER TABLE "payroll_groups" ADD COLUMN     "loan_deduction_concept_id" UUID;

-- CreateTable
CREATE TABLE "worker_loans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "outstanding_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "installment_amount" DECIMAL(15,2) NOT NULL,
    "apply_to_regular" BOOLEAN NOT NULL DEFAULT true,
    "apply_to_vacation" BOOLEAN NOT NULL DEFAULT false,
    "apply_to_bonus" BOOLEAN NOT NULL DEFAULT false,
    "apply_to_liquidation" BOOLEAN NOT NULL DEFAULT true,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VES',
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_loans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payroll_groups" ADD CONSTRAINT "payroll_groups_loan_deduction_concept_id_fkey" FOREIGN KEY ("loan_deduction_concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_loans" ADD CONSTRAINT "worker_loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_loans" ADD CONSTRAINT "worker_loans_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
