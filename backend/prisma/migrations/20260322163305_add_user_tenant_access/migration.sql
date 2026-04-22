-- CreateTable
CREATE TABLE "user_tenant_access" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "user_tenant_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_tenant_access_user_id_tenant_id_key" ON "user_tenant_access"("user_id", "tenant_id");

-- AddForeignKey
ALTER TABLE "user_tenant_access" ADD CONSTRAINT "user_tenant_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenant_access" ADD CONSTRAINT "user_tenant_access_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenant_access" ADD CONSTRAINT "user_tenant_access_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
