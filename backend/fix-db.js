const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.performanceReview.updateMany({
    where: { 
      status: 'COMPLETED',
      interviewSummary: null
    },
    data: {
      status: 'PARTIAL'
    }
  });
  console.log("Updated rows:", result.count);
}
main();
