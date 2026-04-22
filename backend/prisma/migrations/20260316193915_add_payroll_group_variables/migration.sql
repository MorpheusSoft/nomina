-- CreateTable
CREATE TABLE "payroll_group_variables" (
    "id" UUID NOT NULL,
    "payroll_group_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "value" DECIMAL(15,4) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_group_variables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payroll_group_variables_payroll_group_id_code_valid_from_key" ON "payroll_group_variables"("payroll_group_id", "code", "valid_from");

-- AddForeignKey
ALTER TABLE "payroll_group_variables" ADD CONSTRAINT "payroll_group_variables_payroll_group_id_fkey" FOREIGN KEY ("payroll_group_id") REFERENCES "payroll_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
