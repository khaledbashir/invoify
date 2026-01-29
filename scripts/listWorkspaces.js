const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async function(){
  try {
    const ws = await prisma.workspace.findMany({ include: { users: true } });
    console.log('WORKSPACES:', ws);
    const proposals = await prisma.proposal.findMany();
    console.log('PROPOSALS:', proposals);
  } catch(e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
})();
