'use client';

import { useClickAway, useDebounce } from 'react-use';
import { capitalizeWords, cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import { Api } from '@/services/api-client';
import Link from 'next/link';
import { ShoeCardType } from './types';
import Image from 'next/image';

interface Props {
  className?: string;
}

export const SearchInput: React.FC<Props> = ({ className }) => {
  const [shoes, setShoes] = useState<ShoeCardType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const wrapperRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickAway(wrapperRef, () => {
    setFocused(false);
  });

  useDebounce(
    async () => {
      const trimmedQuery = searchQuery.trim();

      if (!trimmedQuery) {
        setShoes([]);
        return;
      }

      try {
        console.log('[SearchInput] searching for:', trimmedQuery);
        const response = await Api.shoes.search(trimmedQuery);
        console.log('[SearchInput] got response:', response);
        setShoes(response);
      } catch (error) {
        console.error('[SearchInput] search error:', error);
      }
    },
    300,
    [searchQuery]
  );

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery('');
    setShoes([]);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShoes([]);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modKey = e.metaKey || e.ctrlKey;
      if (modKey && e.code === 'KeyX') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div
        className={cn(
          'fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-xs z-30 transition-opacity duration-300 ease-in-out',
          focused ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />
      <div
        ref={wrapperRef}
        className={cn(
          'flex rounded-2xl flex-1 justify-between relative h-9 sm:h-11 z-30',
          className
        )}
      >
        <Search className="absolute top-1/2 translate-y-[-50%] left-2 sm:left-3 h-4 sm:h-5 text-primary" />
        <input
          ref={inputRef}
          className="rounded-2xl outline-none w-full bg-secondary px-8 sm:px-11 pr-10 sm:pr-12 text-sm sm:text-base focus:border"
          type="text"
          placeholder="Search here..."
          onFocus={() => setFocused(true)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <button
            onClick={handleClear}
            aria-label="Clear search input"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
        ) : !focused ? (
          <div className="hidden sm:flex absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none items-center gap-1 text-xs">
            <kbd className="bg-muted px-1 sm:px-1.5 py-0.5 rounded border border-b-2 sm:border-b-3 text-muted-foreground">
              Ctrl
            </kbd>
            <kbd className="bg-muted px-1 sm:px-1.5 py-0.5 rounded border border-b-2 sm:border-b-3 text-muted-foreground">
              X
            </kbd>
          </div>
        ) : null}

        {shoes.length > 0 && (
          <div
            className={cn(
              'absolute w-full sm:w-[calc(100%+2rem)] sm:-left-4 bg-primary-foreground rounded-xl py-2 top-12 sm:top-14 shadow-md transition-all duration-200 invisible opacity-0 min-h-[40px] z-30',
              focused && 'visible opacity-100 top-10 sm:top-12'
            )}
          >
            {shoes.map((shoe) => (
              <Link
                onClick={onClickItem}
                key={shoe.id}
                className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-3 py-1 sm:py-2 hover:bg-primary/10 overflow-hidden"
                href={`/shoe/${shoe.id}`}
                prefetch
              >
                <Image
                  className="rounded-sm object-cover"
                  src={shoe.imageURL}
                  alt={shoe.model.name}
                  width={32}
                  height={32}
                  unoptimized
                />
                <span className="text-sm sm:text-base">
                  {capitalizeWords(
                    `${shoe.model.brand.name} ${shoe.model.name}`
                  )}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {shoe.description}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
