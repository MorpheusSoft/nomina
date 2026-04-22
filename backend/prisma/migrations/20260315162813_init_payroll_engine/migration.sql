-- AlterTable
ALTER TABLE "employment_records" ADD COLUMN     "payroll_group_id" UUID;

-- CreateTable
CREATE TABLE "payroll_groups" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "payment_frequency" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_variables" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "value" DECIMAL(15,4) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "accounting_code" VARCHAR(50),
    "accounting_operation" VARCHAR(20),
    "is_salary_incidence" BOOLEAN NOT NULL DEFAULT false,
    "is_taxable" BOOLEAN NOT NULL DEFAULT false,
    "is_auxiliary" BOOLEAN NOT NULL DEFAULT false,
    "formula_factor" TEXT,
    "formula_rate" TEXT,
    "formula_amount" TEXT NOT NULL,
    "condition" TEXT,
    "execution_sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_group_concepts" (
    "id" UUID NOT NULL,
    "payroll_group_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,

    CONSTRAINT "payroll_group_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payroll_group_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "special_concept_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_receipts" (
    "id" UUID NOT NULL,
    "payroll_period_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "total_salary_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_non_salary_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_pay" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "employer_contributions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_receipt_details" (
    "id" UUID NOT NULL,
    "payroll_receipt_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,
    "concept_name_snapshot" VARCHAR(150) NOT NULL,
    "type_snapshot" VARCHAR(30) NOT NULL,
    "factor" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "rate" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "amount" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "payroll_receipt_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_variables_tenant_id_code_valid_from_key" ON "global_variables"("tenant_id", "code", "valid_from");

-- CreateIndex
CREATE UNIQUE INDEX "concepts_tenant_id_code_key" ON "concepts"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_group_concepts_payroll_group_id_concept_id_key" ON "payroll_group_concepts"("payroll_group_id", "concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_receipts_payroll_period_id_worker_id_key" ON "payroll_receipts"("payroll_period_id", "worker_id");

-- AddForeignKey
ALTER TABLE "employment_records" ADD CONSTRAINT "employment_records_payroll_group_id_fkey" FOREIGN KEY ("payroll_group_id") REFERENCES "payroll_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_groups" ADD CONSTRAINT "payroll_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_variables" ADD CONSTRAINT "global_variables_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_group_concepts" ADD CONSTRAINT "payroll_group_concepts_payroll_group_id_fkey" FOREIGN KEY ("payroll_group_id") REFERENCES "payroll_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_group_concepts" ADD CONSTRAINT "payroll_group_concepts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_payroll_group_id_fkey" FOREIGN KEY ("payroll_group_id") REFERENCES "payroll_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_special_concept_id_fkey" FOREIGN KEY ("special_concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_receipts" ADD CONSTRAINT "payroll_receipts_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_receipts" ADD CONSTRAINT "payroll_receipts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_receipt_details" ADD CONSTRAINT "payroll_receipt_details_payroll_receipt_id_fkey" FOREIGN KEY ("payroll_receipt_id") REFERENCES "payroll_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_receipt_details" ADD CONSTRAINT "payroll_receipt_details_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
