-- AlterTable
ALTER TABLE "payroll_groups" ADD COLUMN     "root_bonus_concept_id" UUID,
ADD COLUMN     "root_liquidation_concept_id" UUID,
ADD COLUMN     "root_regular_concept_id" UUID,
ADD COLUMN     "root_vacation_concept_id" UUID;

-- CreateTable
CREATE TABLE "concept_dependencies" (
    "id" UUID NOT NULL,
    "parent_concept_id" UUID NOT NULL,
    "child_concept_id" UUID NOT NULL,
    "execution_sequence" INTEGER NOT NULL,

    CONSTRAINT "concept_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "concept_dependencies_parent_concept_id_child_concept_id_key" ON "concept_dependencies"("parent_concept_id", "child_concept_id");

-- AddForeignKey
ALTER TABLE "payroll_groups" ADD CONSTRAINT "payroll_groups_root_regular_concept_id_fkey" FOREIGN KEY ("root_regular_concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_groups" ADD CONSTRAINT "payroll_groups_root_vacation_concept_id_fkey" FOREIGN KEY ("root_vacation_concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_groups" ADD CONSTRAINT "payroll_groups_root_bonus_concept_id_fkey" FOREIGN KEY ("root_bonus_concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_groups" ADD CONSTRAINT "payroll_groups_root_liquidation_concept_id_fkey" FOREIGN KEY ("root_liquidation_concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_dependencies" ADD CONSTRAINT "concept_dependencies_parent_concept_id_fkey" FOREIGN KEY ("parent_concept_id") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_dependencies" ADD CONSTRAINT "concept_dependencies_child_concept_id_fkey" FOREIGN KEY ("child_concept_id") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
