-- AlterTable
ALTER TABLE "concepts" ADD COLUMN     "is_bonifiable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "contract_trusts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employment_record_id" UUID NOT NULL,
    "total_accumulated" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_advances" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "available_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VES',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_trusts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "contract_trust_id" UUID NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "reference_date" DATE NOT NULL,
    "notes" TEXT,
    "payroll_receipt_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_accumulators" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_accumulators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accumulator_concepts" (
    "id" UUID NOT NULL,
    "accumulator_id" UUID NOT NULL,
    "concept_id" UUID NOT NULL,

    CONSTRAINT "accumulator_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contract_trusts_employment_record_id_key" ON "contract_trusts"("employment_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "trust_transactions_payroll_receipt_id_key" ON "trust_transactions"("payroll_receipt_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_accumulators_tenant_id_name_key" ON "payroll_accumulators"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "accumulator_concepts_accumulator_id_concept_id_key" ON "accumulator_concepts"("accumulator_id", "concept_id");

-- AddForeignKey
ALTER TABLE "contract_trusts" ADD CONSTRAINT "contract_trusts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_trusts" ADD CONSTRAINT "contract_trusts_employment_record_id_fkey" FOREIGN KEY ("employment_record_id") REFERENCES "employment_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_contract_trust_id_fkey" FOREIGN KEY ("contract_trust_id") REFERENCES "contract_trusts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_payroll_receipt_id_fkey" FOREIGN KEY ("payroll_receipt_id") REFERENCES "payroll_receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_accumulators" ADD CONSTRAINT "payroll_accumulators_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accumulator_concepts" ADD CONSTRAINT "accumulator_concepts_accumulator_id_fkey" FOREIGN KEY ("accumulator_id") REFERENCES "payroll_accumulators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accumulator_concepts" ADD CONSTRAINT "accumulator_concepts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
