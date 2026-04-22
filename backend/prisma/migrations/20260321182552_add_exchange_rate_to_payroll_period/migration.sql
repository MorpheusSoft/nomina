-- AlterTable
ALTER TABLE "payroll_periods" ADD COLUMN     "currency" VARCHAR(10) NOT NULL DEFAULT 'VES',
ADD COLUMN     "exchange_rate" DECIMAL(15,4);
