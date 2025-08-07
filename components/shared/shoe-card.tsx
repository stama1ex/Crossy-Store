'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { ShoeCardWithFavorites } from './types';
import { capitalizeWords, cn } from '@/lib/utils';
import Tilt from 'react-parallax-tilt';
import { FavoriteButton } from './favorite-button';

interface Props {
  className?: string;
  item: ShoeCardWithFavorites;
}

export const ShoeCard: React.FC<Props> = ({ className, item }) => {
  const { id, imageURL, price, model, description } = item;
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn('w-full max-w-[300px] mx-auto', className)}>
      <Tilt
        glareEnable
        glareMaxOpacity={0.05}
        glareColor={'var(--primary)'}
        glarePosition="all"
        scale={1.02}
        tiltMaxAngleX={-5}
        tiltMaxAngleY={-5}
        transitionSpeed={400}
        className="rounded-sm active:scale-99"
      >
        <div className="flex flex-col justify-between overflow-hidden bg-secondary shadow hover:shadow-xl transition duration-200 rounded-sm">
          <Link href={`/shoe/${id}`} className="flex flex-col h-full" prefetch>
            <div className="w-full flex items-center justify-center bg-primary">
              <Image
                src={hasError ? '/fallback-image.png' : imageURL}
                alt={model.name}
                width={300}
                height={300}
                className="object-contain w-full h-auto"
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
              />
              {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-muted animate-pulse rounded-sm z-20" />
              )}
            </div>
            <div className="p-4 sm:p-3 flex flex-col gap-2 flex-1">
              <p className="text-base sm:text-sm font-bold line-clamp-1">
                {capitalizeWords(`${model.brand.name} ${model.name}`)}
              </p>
              <p className="text-sm sm:text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
              <div className="flex justify-between items-center mt-auto">
                <p className="text-lg sm:text-base font-semibold">
                  ${price.toFixed(2)}
                </p>
                <FavoriteButton
                  details={false}
                  shoeId={item.id}
                  isFavorited={item.favorites?.length > 0}
                  likeCount={item.favorites?.length ?? 0}
                />
              </div>
            </div>
          </Link>
        </div>
      </Tilt>
    </div>
  );
};
