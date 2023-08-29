import { PrismaClient } from '@prisma/client';
import { parseArgs } from 'node:util';

const prisma = new PrismaClient();

const options = {
  role: { type: 'string' },
} as const;

async function main() {
  const {
    values: { role },
  } = parseArgs({ options });

  console.log('role ', role);

  await prisma.$transaction([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    }),
    prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER' },
    }),
  ]);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
