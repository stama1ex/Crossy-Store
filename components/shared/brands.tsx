'use client';

import React, { useEffect, useRef, useState } from 'react';
import { capitalizeWords, cn } from '@/lib/utils';
import { useBrandStore } from '@/store/brand';
import { Brand } from '@prisma/client';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Function to sanitize brand name for filename
const sanitizeBrandName = (brandName: string) => {
  return brandName.toLowerCase().replace(/\s+/g, '-'); // Replace spaces with hyphens
};

interface Props {
  className?: string;
  brands: Brand[];
}

export const Brands: React.FC<Props> = ({ className, brands }) => {
  const activeId = useBrandStore((state) => state.activeId);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const [mobileHighlightStyle, setMobileHighlightStyle] = useState<{
    top: number;
    height: number;
  }>({ top: 0, height: 0 });
  const [desktopHighlightStyle, setDesktopHighlightStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const desktopPrevHighlightRef = useRef<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [isStretching, setIsStretching] = useState(false);

  // Mobile highlight logic
  useEffect(() => {
    if (!mobileContainerRef.current) return;

    const activeElement =
      mobileContainerRef.current.querySelector<HTMLAnchorElement>(
        `a[data-id="${activeId}"]`
      );
    if (!activeElement) return;

    const rect = activeElement.getBoundingClientRect();
    const containerRect = mobileContainerRef.current.getBoundingClientRect();

    const newTop = rect.top - containerRect.top;
    const newHeight = rect.height;

    setMobileHighlightStyle({ top: newTop, height: newHeight });

    activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeId, brands]);

  // Mobile initial highlight
  useEffect(() => {
    if (!mobileContainerRef.current) return;

    const activeElement =
      mobileContainerRef.current.querySelector<HTMLAnchorElement>(
        `a[data-id="${activeId}"]`
      );
    if (!activeElement) return;

    const rect = activeElement.getBoundingClientRect();
    const containerRect = mobileContainerRef.current.getBoundingClientRect();

    setMobileHighlightStyle({
      top: rect.top - containerRect.top,
      height: rect.height,
    });
  }, []);

  // Desktop highlight logic
  useEffect(() => {
    if (!desktopContainerRef.current) return;

    const activeElement =
      desktopContainerRef.current.querySelector<HTMLAnchorElement>(
        `a[data-id="${activeId}"]`
      );
    if (!activeElement) return;

    const rect = activeElement.getBoundingClientRect();
    const containerRect = desktopContainerRef.current.getBoundingClientRect();

    const newLeft = rect.left - containerRect.left;
    const newWidth = rect.width;

    const prev = desktopPrevHighlightRef.current;

    if (prev.left === newLeft && prev.width === newWidth) {
      setDesktopHighlightStyle({ left: newLeft, width: newWidth });
      return;
    }

    const stretchLeft = Math.min(prev.left, newLeft);
    const stretchRight = Math.max(prev.left + prev.width, newLeft + newWidth);
    const stretchWidth = stretchRight - stretchLeft;

    setIsStretching(true);
    setDesktopHighlightStyle({ left: stretchLeft, width: stretchWidth });

    const timeout = setTimeout(() => {
      setIsStretching(false);
      setDesktopHighlightStyle({ left: newLeft, width: newWidth });
      desktopPrevHighlightRef.current = { left: newLeft, width: newWidth };
    }, 200);

    return () => clearTimeout(timeout);
  }, [activeId, brands]);

  // Desktop initial highlight
  useEffect(() => {
    if (!desktopContainerRef.current) return;

    const activeElement =
      desktopContainerRef.current.querySelector<HTMLAnchorElement>(
        `a[data-id="${activeId}"]`
      );
    if (!activeElement) return;

    const rect = activeElement.getBoundingClientRect();
    const containerRect = desktopContainerRef.current.getBoundingClientRect();

    desktopPrevHighlightRef.current = {
      left: rect.left - containerRect.left,
      width: rect.width,
    };
    setDesktopHighlightStyle(desktopPrevHighlightRef.current);
  }, []);

  return (
    <>
      {/* Mobile Sidebar (< sm) */}
      <div
        ref={mobileContainerRef}
        className={cn(
          'sm:hidden flex flex-col items-center justify-center gap-2 bg-primary-foreground/75 w-12 py-4 fixed left-0 top-0 h-screen rounded-r-lg shadow-md overflow-y-auto',
          className
        )}
      >
        <motion.div
          className="absolute left-1 right-1 rounded-md bg-primary"
          style={{
            top: mobileHighlightStyle.top,
            height: mobileHighlightStyle.height,
            willChange: 'top, height',
          }}
          animate={{
            top: mobileHighlightStyle.top,
            height: mobileHighlightStyle.height,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {brands.map((brand) => {
          const brandForPic = brand.name; // Use the brand name directly
          const sanitizedBrandName = sanitizeBrandName(brandForPic);
          const imageSrc =
            sanitizedBrandName === 'nike'
              ? `/brand-logos/for-sidebar/nike.svg`
              : `/brand-logos/for-sidebar/${sanitizedBrandName}.png`;

          return (
            <a
              key={brand.id}
              href={`#${brand.name}`}
              data-id={brand.id}
              className={cn(
                'relative flex items-center justify-center w-10 h-10 text-sm font-bold rounded-md transition-colors p-1 my-1',
                activeId === brand.id
                  ? 'text-primary-foreground not-dark:invert'
                  : 'text-secondary-foreground hover:bg-primary/10 dark:invert'
              )}
              aria-label={`Filter by ${brand.name}`}
            >
              <Image
                src={imageSrc}
                alt={`${brand.name} logo`}
                width={40} // Adjusted for sidebar size
                height={40}
                className="object-contain"
                onError={(e) =>
                  console.error(
                    `Failed to load ${brand.name} logo from ${imageSrc}:`,
                    e
                  )
                }
              />
            </a>
          );
        })}
      </div>
      {/* Desktop Horizontal Bar (sm and above) */}
      <div
        ref={desktopContainerRef}
        className={cn(
          'hidden sm:flex relative flex-nowrap gap-1 bg-primary-foreground/75 p-1 rounded-2xl overflow-x-auto sm:overflow-x-visible',
          className
        )}
      >
        <span
          className={cn(
            'absolute top-1 bottom-1 rounded-2xl bg-primary',
            'transition-all ease-in-out',
            isStretching ? 'duration-200' : 'duration-200'
          )}
          style={{
            left: desktopHighlightStyle.left,
            width: desktopHighlightStyle.width,
            willChange: 'left, width',
          }}
        />
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={`#${brand.name}`}
            data-id={brand.id}
            className={cn(
              'relative flex items-center font-bold h-9 sm:h-11 rounded-2xl px-3 sm:px-5 cursor-pointer select-none whitespace-nowrap',
              activeId === brand.id
                ? 'text-primary-foreground'
                : 'text-secondary-foreground'
            )}
            aria-label={`Filter by ${brand.name}`}
          >
            <span className="text-sm sm:text-base">
              {capitalizeWords(brand.name)}
            </span>
          </a>
        ))}
      </div>
    </>
  );
};
