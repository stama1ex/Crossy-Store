import { prisma } from './prisma-client';
import { brands } from './constants';
import { shoeModels } from './shoe-models.config';

async function up() {
  //USERS
  await prisma.user.createMany({
    data: [
      // {
      //   fullName: 'Stamat Alex',
      //   email: 'stamalex2000@gmail.com',
      //   username: 'stamalex',
      //   password: hashSync('123456', 10),
      //   role: 'ADMIN',
      // },
      // {
      //   fullName: 'User',
      //   email: 'user@test.com',
      //   username: 'user',
      //   password: hashSync('123456', 10),
      // },
    ],
  });
  //BRANDS
  await prisma.brand.createMany({
    data: brands,
  });

  //SHOES
  const brandMap = await prisma.brand.findMany();
  const brandIdMap = Object.fromEntries(
    brandMap.map((b) => [b.name.toLowerCase(), b.id])
  );

  const shoeModelCache: Record<string, number> = {};

  for (const item of shoeModels) {
    const brandKey = item.brand.toLowerCase();
    const brandId = brandIdMap[brandKey];
    if (!brandId) {
      console.warn(`Brand "${brandKey}" not found. Skipping...`);
      continue;
    }

    const modelKey = `${brandId}-${item.model}`;
    let modelId = shoeModelCache[modelKey];

    if (!modelId) {
      const model = await prisma.shoeModel.create({
        data: {
          name: item.model,
          brandId,
        },
      });
      modelId = model.id;
      shoeModelCache[modelKey] = modelId;
    }

    await prisma.shoe.create({
      data: {
        modelId,
        imageURL: item.imageURL,
        color: item.color as 'NEUTRAL' | 'OTHER',
        gender: item.gender as 'UNISEX',
        price: item.price,
        description: item.description,
      },
    });
  }
}

async function down() {
  await prisma.$executeRaw`TRUNCATE TABLE "Shoe" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ShoeModel" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Brand" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Favorite" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Cart" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "VerificationCode" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Order" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "OrderItem" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Comment" RESTART IDENTITY CASCADE`;
}

async function main() {
  try {
    await down();
    await up();
  } catch (e) {
    console.error(e);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
