const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM performance_reviews;');
  console.log("Deleted");
}
main();
