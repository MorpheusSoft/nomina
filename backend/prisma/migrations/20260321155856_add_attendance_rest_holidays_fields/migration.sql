-- AlterTable
ALTER TABLE "attendance_summaries" ADD COLUMN     "holidays" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "rest_days" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "worked_holidays" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "worked_rest_days" DECIMAL(15,2) NOT NULL DEFAULT 0;
