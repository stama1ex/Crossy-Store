import { prisma } from '@/prisma/prisma-client';
import { Container, TopBar, Brands } from '@/components/shared/index';
import { Title } from '@/components/shared/title';
import { Filters } from '@/components/shared/filters';
import { ShoesGroupList } from '@/components/shared/shoes-group-list';
import { unstable_cache } from 'next/cache';
import { ShoeCardWithFavorites } from '@/components/shared/types';

export const revalidate = 60;

interface BrandWithShoes {
  id: number;
  name: string;
  shoes: ShoeCardWithFavorites[];
}

export default async function Home({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{
    colors?: string;
    gender?: string;
    priceFrom?: string;
    priceTo?: string;
  }>;
}) {
  const searchParams = await searchParamsPromise;
  const colors = searchParams.colors ? searchParams.colors.split(',') : [];
  const gender = searchParams.gender?.toUpperCase();
  const priceFrom = Number(searchParams.priceFrom) || 0;
  const priceTo = Number(searchParams.priceTo) || Number.MAX_SAFE_INTEGER;

  const getCachedBrandsWithShoes = unstable_cache(
    async () => {
      const brands = await prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          models: {
            select: {
              id: true,
              name: true,
              shoes: {
                select: {
                  id: true,
                  imageURL: true,
                  price: true,
                  description: true,
                  color: true,
                  gender: true,
                  model: {
                    select: {
                      name: true,
                      brand: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                  favorites: {
                    select: { id: true, userId: true, shoeId: true },
                  }, // Include userId and shoeId
                },
                take: 10,
              },
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      return brands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        shoes: brand.models
          .flatMap((model) =>
            model.shoes.map((shoe) => ({
              id: shoe.id,
              imageURL: shoe.imageURL || '',
              price: shoe.price,
              description: shoe.description ?? undefined,
              color: shoe.color || 'NEUTRAL',
              gender: shoe.gender || 'UNISEX',
              model: {
                name: model.name,
                brand: { name: brand.name },
              },
              favorites: shoe.favorites || [],
            }))
          )
          .filter((shoe) => {
            const matchesColor =
              colors.length === 0 || colors.includes(shoe.color.toUpperCase());
            let matchesGender = true;
            if (gender) {
              if (gender === 'MALE') {
                matchesGender =
                  shoe.gender.toUpperCase() === 'MALE' ||
                  shoe.gender.toUpperCase() === 'UNISEX';
              } else if (gender === 'FEMALE') {
                matchesGender =
                  shoe.gender.toUpperCase() === 'FEMALE' ||
                  shoe.gender.toUpperCase() === 'UNISEX';
              } else {
                matchesGender = shoe.gender.toUpperCase() === gender;
              }
            }
            const matchesPrice =
              shoe.price >= priceFrom && shoe.price <= priceTo;
            return matchesColor && matchesGender && matchesPrice;
          }) as ShoeCardWithFavorites[],
      }));
    },
    [
      'brands-with-shoes',
      JSON.stringify({ colors, gender, priceFrom, priceTo }),
    ],
    { tags: ['brands-with-shoes'], revalidate: 60 }
  );

  const brandsWithShoes: BrandWithShoes[] = await getCachedBrandsWithShoes();

  return (
    <>
      <div className="sm:hidden">
        <Brands brands={brandsWithShoes} />
      </div>
      <Container className="mt-6 sm:mt-8 pl-14 sm:pl-0">
        <Title
          text="All shoes"
          size="md"
          className="font-extrabold text-xl sm:text-2xl"
        />
      </Container>
      <TopBar brands={brandsWithShoes} />
      <Container className="pb-10 sm:pb-14 pl-14 sm:pl-0">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-[60px]">
          <div className="w-full sm:w-[250px]">
            <Filters className="mt-6 sm:mt-8" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-12 sm:gap-16">
              {brandsWithShoes.map((brand) => (
                <ShoesGroupList
                  key={brand.id}
                  listClassName=""
                  brand={brand.name}
                  brandId={brand.id}
                  items={brand.shoes}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
