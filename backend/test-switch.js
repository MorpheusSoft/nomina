const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    const target = await prisma.tenant.findFirst({ where: { name: { not: "Nebula Root Node" } }});
    const user = await prisma.user.findUnique({ where: { email: "admin@nebulapayrolls.com" }});
    
    console.log("God User ID:", user.id);
    console.log("God User Role ID:", user.roleId);
    console.log("Target Tenant ID:", target.id);

    // Replicate switchTenant logic
    let superRole = await prisma.role.findFirst({
        where: { tenantId: target.id, name: 'Super Administrador' }
    });
    console.log("Super Role found:", superRole);
    if (!superRole) {
       superRole = await prisma.role.create({
          data: { tenantId: target.id, name: 'Super Administrador', permissions: ['ALL_ACCESS'] }
       });
       console.log("Super Role created:", superRole);
    }
    
    const finalRoleId = superRole.id;
    console.log("Executing update context to -> Tenant:", target.id, "Role:", finalRoleId);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { tenantId: target.id, roleId: finalRoleId },
      include: { role: true, tenant: true, tenantAccesses: { include: { tenant: true, role: true } } }
    });
    console.log("SUCCESS!", updatedUser.id);
  } catch(e) {
    console.error("ERROR IN UPDATE:", e);
  }
}
run().finally(() => prisma.$disconnect());
