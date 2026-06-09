import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/src/prisma/client';
import { caseStudies } from '../src/constants/case-studies.data';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('Seeding case studies...');

  for (const study of caseStudies) {
    // 1. Find or create the category
    let category = await prisma.caseStudyCategory.findFirst({
      where: { name: study.category },
    });

    if (!category) {
      category = await prisma.caseStudyCategory.create({
        data: { name: study.category },
      });
      console.log(`Created category: ${study.category}`);
    }

    // 2. Map and seed case study
    const data = {
      title: study.title,
      excerpt: study.excerpt,
      date: study.date,
      readingTime: study.readingTime,
      ctaLabel: study.ctaLabel,
      isFeatured: study.featured ?? false,
      isPublished: true,
      slug: study.slug,
      industryTag: study.industryTag,
      coverImage: (study as any).coverImage ?? '/placeholder.png',
      metrics: study.metrics as any,
      snapshot: study.snapshot as any,
      challenge: study.challenge as any,
      approachSteps: study.approachSteps as any,
      deliverables: study.deliverables,
      transformation: study.transformation as any,
      results: study.results as any,
      keyTakeaways: study.keyTakeaways,
      testimonial: study.testimonial as any,
      categoryId: category.id,
    };

    const record = await prisma.caseStudy.upsert({
      where: { slug: study.slug },
      update: data,
      create: data,
    });

    console.log(`Upserted case study: "${record.title}" (${record.slug})`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding case studies:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
