import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from 'generated/src/prisma/client';
import { guidesPlaybooks } from '../src/constants/guides-playbook.data';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function upsertCategoriesAndTypes() {
  const categoryIds = new Map<string, string>();
  const typeIds = new Map<string, string>();

  // Extract unique categories and types
  const categories = new Set(guidesPlaybooks.map(p => p.category));
  const types = new Set(guidesPlaybooks.map(p => p.type));

  for (const categoryName of categories) {
    if (!categoryName) continue;
    const category = await prisma.playbookCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    categoryIds.set(categoryName, category.id);
  }

  for (const typeName of types) {
    if (!typeName) continue;
    const type = await prisma.playbookType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
    typeIds.set(typeName, type.id);
  }

  return { categoryIds, typeIds };
}

async function seedPlaybooks(categoryIds: Map<string, string>, typeIds: Map<string, string>) {
  for (const playbook of guidesPlaybooks) {
    const categoryId = playbook.category ? categoryIds.get(playbook.category) : undefined;
    const typeId = playbook.type ? typeIds.get(playbook.type) : undefined;

    const { category, type, ...rest } = playbook;

    await prisma.playbook.upsert({
      where: {
        slug: playbook.slug,
      },
      update: {
        ...rest,
        frameworkSteps: rest.frameworkSteps as Prisma.InputJsonValue,
        samplePreviews: rest.samplePreviews as Prisma.InputJsonValue,
        relatedServices: rest.relatedServices as Prisma.InputJsonValue,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        type: typeId ? { connect: { id: typeId } } : undefined,
      },
      create: {
        ...rest,
        frameworkSteps: rest.frameworkSteps as Prisma.InputJsonValue,
        samplePreviews: rest.samplePreviews as Prisma.InputJsonValue,
        relatedServices: rest.relatedServices as Prisma.InputJsonValue,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        type: typeId ? { connect: { id: typeId } } : undefined,
      },
    });
  }
}

async function main() {
  const { categoryIds, typeIds } = await upsertCategoriesAndTypes();
  await seedPlaybooks(categoryIds, typeIds);
}

main()
  .then(async () => {
    console.log('Playbook seed completed.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
