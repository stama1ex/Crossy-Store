import { prisma } from '@/prisma/prisma-client';

async function fixUserAvatars() {
  try {
    // Update users with non-null avatar values to null
    // You can refine the `where` clause to target specific invalid URLs if needed
    const result = await prisma.user.updateMany({
      where: {
        avatar: { not: null }, // Targets users with any non-null avatar
      },
      data: {
        avatar: null,
      },
    });

    console.log(`Updated ${result.count} users' avatar fields to null`);
  } catch (error) {
    console.error('Error updating user avatars:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserAvatars();
