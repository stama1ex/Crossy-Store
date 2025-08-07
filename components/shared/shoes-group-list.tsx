'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Title } from './title';
import { capitalizeWords, cn } from '@/lib/utils';
import { useBrandStore } from '@/store/brand';
import { debounce } from 'lodash';
import { ShoeCardWithFavorites } from './types';
import { ShoeCard } from './shoe-card';
import Image from 'next/image';
import { brands } from '../../prisma/constants';
import { motion } from 'framer-motion';

const sanitizeBrandName = (brandName: string) =>
  brandName.toLowerCase().replace(/\s+/g, '-');

interface Props {
  className?: string;
  listClassName: string;
  brand: string;
  brandId: number;
  items: ShoeCardWithFavorites[];
  isLoading?: boolean; // Добавляем проп для состояния загрузки
}

export const ShoesGroupList: React.FC<Props> = ({
  className,
  listClassName,
  items,
  brandId,
  brand,
  isLoading = false,
}) => {
  const setActiveId = useBrandStore((state) => state.setActiveId);
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '-50% 0px -50% 0px',
    triggerOnce: false,
  });

  const debouncedSetActiveId = debounce((id: number) => {
    setActiveId(id);
  }, 100);

  useEffect(() => {
    if (inView && !isLoading) {
      debouncedSetActiveId(brandId);
    }
  }, [inView, brandId, debouncedSetActiveId, isLoading]);

  const brandForPic =
    brands.find((b) => b.name.toLowerCase().includes(brand.toLowerCase()))
      ?.name || brand;

  const sanitizedBrandName = sanitizeBrandName(brandForPic);

  const [hasAnimated, setHasAnimated] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView && !hasAnimated && !isLoading) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated, isLoading]);

  const sideImgBasePath = `/side-pics/${sanitizedBrandName}`;
  const leftImg = `${sideImgBasePath}/${sanitizedBrandName}-left.png`;
  const rightImg = `${sideImgBasePath}/${sanitizedBrandName}-right.png`;

  // Компонент скелетона
  const ShoeCardSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
      <div className="mt-4 space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded"></div>
        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/2 rounded"></div>
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        'mt-12 scroll-mt-8 sm:scroll-mt-28 relative overflow-visible z-10',
        className
      )}
      id={brand}
      ref={ref}
    >
      {/* Боковые картинки рядом с заголовком */}
      <div ref={titleRef} className="relative">
        {hasAnimated && !isLoading && (
          <>
            <motion.img
              src={leftImg}
              alt={`${brand} left`}
              className="hidden lg:block absolute -left-20 lg:-left-16 xl:-left-28 top-1/2 -translate-y-1/2 -rotate-6 z-10 pointer-events-none select-none"
              width={200}
              height={400}
              initial={{ x: -300, opacity: 0, scale: 0 }}
              animate={{ x: 115, y: 50, opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 12,
              }}
              style={{
                filter: 'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.5))',
              }}
            />
            <motion.img
              src={rightImg}
              alt={`${brand} right`}
              className="hidden lg:block absolute -right-20 lg:-right-16 xl:-right-28 top-1/2 -translate-y-1/2 rotate-6 z-10 pointer-events-none select-none"
              width={200}
              height={400}
              initial={{ x: 300, opacity: 0, scale: 0 }}
              animate={{ x: -115, y: 50, opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 12,
              }}
              style={{
                filter: 'drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.5))',
              }}
            />
          </>
        )}

        <Title
          text={
            <div className="flex items-center justify-center border-t border-b py-5 relative">
              {capitalizeWords(brand)}
              <Image
                src={
                  sanitizedBrandName === 'nike'
                    ? `/brand-logos/nike.svg`
                    : `/brand-logos/${sanitizedBrandName}.png`
                }
                alt={`${brand} logo`}
                width={sanitizedBrandName === 'salomon' ? 130 : 100}
                height={100}
                className="ml-5 dark:invert"
              />
            </div>
          }
          size="lg"
          className="font-bold mb-4"
        />
      </div>

      {/* Список кроссовок */}
      <div
        className={cn(
          'px-4 sm:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4',
          listClassName
        )}
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ShoeCardSkeleton key={index} />
          ))
        ) : items.length > 0 ? (
          items.map((shoe) => <ShoeCard key={shoe.id} item={shoe} />)
        ) : (
          <p className="text-muted-foreground col-span-full text-center">
            No items found with current filters.
          </p>
        )}
      </div>
    </section>
  );
};
