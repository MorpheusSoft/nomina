const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const campaignId = 'bd6c125d-bbd2-43bb-a5a4-c71d6f2c2ff3';
    // Let's find exactly why it fails. Is it because of related performanceReviews?
    const reviews = await prisma.performanceReview.findMany({
      where: { campaignId }
    });
    console.log(`Campaign has ${reviews.length} reviews`);
  } catch(e) {
    console.error("Error", e);
  }
}
main();
