import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import React from 'react';

interface Props {
  className?: string;
}

export const SortPopup: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-primary-foreground/75 px-3 sm:px-5 h-10 sm:h-[52px] rounded-2xl cursor-pointer text-sm sm:text-base',
        className
      )}
    >
      <ArrowUpDown size={14} className="sm:w-4 sm:h-4" />
      <span>Sort by: </span>
      <b>None</b>
      <b>Popular</b>
    </div>
  );
};
