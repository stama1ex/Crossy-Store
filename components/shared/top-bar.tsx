// components/shared/top-bar.tsx
'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { Container, Brands } from './index';
import { Brand } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cart';
import { CartButton } from './cart-button';

interface Props {
  className?: string;
  brands: Brand[];
}

export const TopBar: React.FC<Props> = ({ className, brands }) => {
  const { isCartLoading } = useCartStore();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'hidden sm:block sticky top-0 py-5 shadow-lg shadow-black/5 z-20 backdrop-blur-md',
        className
      )}
    >
      <Container className="flex items-center justify-between gap-3">
        <Brands brands={brands} />
        <motion.div
          className="flex items-center gap-3"
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* <SortPopup className="h-[52px] text-base" /> */}
          <AnimatePresence>
            {!isHeaderVisible && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
              >
                <CartButton isLoading={isCartLoading} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </div>
  );
};
