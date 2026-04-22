import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const histories = await prisma.vacationHistory.findMany({
    where: { serviceYear: 1 }
  });
  console.log(histories);
  for(const h of histories) {
     if(h.enjoymentDays === 15 && h.restDays === 1) {
        await prisma.vacationHistory.update({
           where: { id: h.id },
           data: { enjoymentDays: 14 }
        });
        console.log("Fixed history", h.id);
     }
  }
}
run();
