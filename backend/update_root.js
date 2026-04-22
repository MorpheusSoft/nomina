const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Find LOTT group
  const group = await prisma.payrollGroup.findFirst({ where: { name: 'LOTT' } });
  if (!group) return console.log('Group not found');

  // Find a concept (maybe salary or just any)
  const concepts = await prisma.concept.findMany({ take: 5 });
  console.log('Available Concepts:', concepts.map(c => c.name));

  if (concepts.length > 0) {
    const root = concepts[0];
    await prisma.payrollGroup.update({
      where: { id: group.id },
      data: { rootRegularConceptId: root.id }
    });
    console.log(`Updated LOTT to use Root Concept: ${root.name}`);
  } else {
    console.log('No concepts found!');
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
