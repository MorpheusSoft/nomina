-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "max_active_workers" INTEGER NOT NULL DEFAULT 50;
