import { PrismaClient, Role, ProductType, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Users ---
  const adminPass = await bcrypt.hash('admin123', 10);
  const sellerPass = await bcrypt.hash('seller123', 10);
  const buyerPass = await bcrypt.hash('buyer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@market.io' },
    update: {},
    create: {
      email: 'admin@market.io',
      passwordHash: adminPass,
      name: 'Site Administrator',
      role: Role.ADMIN,
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: 'maria@market.io' },
    update: {},
    create: {
      email: 'maria@market.io',
      passwordHash: sellerPass,
      name: 'Maria Kovalenko',
      role: Role.SELLER,
      bio: 'Independent author and educator. Writing about productivity and craft.',
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'devstudio@market.io' },
    update: {},
    create: {
      email: 'devstudio@market.io',
      passwordHash: sellerPass,
      name: 'Forge Dev Studio',
      role: Role.SELLER,
      bio: 'Building tools that respect your time.',
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'ivan@market.io' },
    update: {},
    create: {
      email: 'ivan@market.io',
      passwordHash: buyerPass,
      name: 'Ivan Petrenko',
      role: Role.BUYER,
    },
  });

  // --- Categories ---
  const categories = [
    { name: 'E-books', slug: 'ebooks' },
    { name: 'Software', slug: 'software' },
    { name: 'Music & Audio', slug: 'music' },
    { name: 'Templates', slug: 'templates' },
    { name: 'Courses', slug: 'courses' },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const ebooks = await prisma.category.findUniqueOrThrow({ where: { slug: 'ebooks' } });
  const software = await prisma.category.findUniqueOrThrow({ where: { slug: 'software' } });
  const music = await prisma.category.findUniqueOrThrow({ where: { slug: 'music' } });
  const templates = await prisma.category.findUniqueOrThrow({ where: { slug: 'templates' } });

  // --- Products ---
  // Files use public URLs that actually work for testing. In real production,
  // these would all be Vercel Blob URLs created by sellers via the upload UI.
  const products = [
    {
      title: 'The Quiet Craft',
      slug: 'the-quiet-craft',
      description: 'A deeply personal manual for makers who want to slow down and ship work that matters. 240 pages, illustrated.',
      price: 18.0,
      type: ProductType.EBOOK,
      status: ProductStatus.APPROVED,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'the-quiet-craft.pdf',
      fileMimeType: 'application/pdf',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
      sellerId: seller1.id,
      categoryId: ebooks.id,
    },
    {
      title: 'Field Notes on Focus',
      slug: 'field-notes-on-focus',
      description: 'Essays and exercises on attention. Read it in an afternoon, return to it for years.',
      price: 12.0,
      type: ProductType.EBOOK,
      status: ProductStatus.APPROVED,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'field-notes.pdf',
      fileMimeType: 'application/pdf',
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
      sellerId: seller1.id,
      categoryId: ebooks.id,
    },
    {
      title: 'Anvil — Markdown Editor',
      slug: 'anvil-editor',
      description: 'A focused, offline-first markdown editor for macOS, Windows, and Linux. Lifetime license, one user.',
      price: 39.0,
      type: ProductType.SOFTWARE,
      status: ProductStatus.APPROVED,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'anvil-installer.zip',
      fileMimeType: 'application/zip',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      sellerId: seller2.id,
      categoryId: software.id,
    },
    {
      title: 'Bellows — Icon Pack',
      slug: 'bellows-icons',
      description: '480 hand-drawn vector icons. SVG, PNG, Figma library. Commercial use included.',
      price: 24.0,
      type: ProductType.OTHER,
      status: ProductStatus.APPROVED,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'bellows-icons.zip',
      fileMimeType: 'application/zip',
      coverImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
      sellerId: seller2.id,
      categoryId: templates.id,
    },
    {
      title: 'Slow Mornings — Ambient EP',
      slug: 'slow-mornings',
      description: 'Six tracks of warm, instrumental ambient. FLAC and MP3 included.',
      price: 8.0,
      type: ProductType.MUSIC,
      status: ProductStatus.APPROVED,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'slow-mornings.zip',
      fileMimeType: 'application/zip',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      sellerId: seller1.id,
      categoryId: music.id,
    },
    {
      title: 'Ledger — Invoice Templates',
      slug: 'ledger-invoices',
      description: 'A set of 12 invoice and receipt templates for freelancers. Editable in Pages, Word, and Google Docs.',
      price: 15.0,
      type: ProductType.OTHER,
      status: ProductStatus.PENDING,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'ledger-templates.zip',
      fileMimeType: 'application/zip',
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      sellerId: seller2.id,
      categoryId: templates.id,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // --- A sample review ---
  const product = await prisma.product.findUniqueOrThrow({ where: { slug: 'the-quiet-craft' } });
  await prisma.review.upsert({
    where: { productId_userId: { productId: product.id, userId: buyer.id } },
    update: {},
    create: {
      productId: product.id,
      userId: buyer.id,
      rating: 5,
      comment: 'Honest, unhurried, and genuinely useful. Read it twice already.',
    },
  });

  console.log('Done.');
  console.log('  Admin:  admin@market.io / admin123');
  console.log('  Seller: maria@market.io / seller123');
  console.log('  Buyer:  ivan@market.io  / buyer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
