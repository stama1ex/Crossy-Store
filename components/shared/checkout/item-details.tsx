import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  title: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

export const CheckoutItemDetails: React.FC<Props> = ({
  title,
  value,
  className,
}) => {
  return (
    <div className={cn('flex my-4', className)}>
      <span className="flex flex-1 text-lg text-primary/80">
        {title}
        <div className="flex-1 border-b border-dashed border-b-text-primary/80 relative -top-1 mx-2" />
      </span>

      <span className="font-bold text-lg">{value}</span>
    </div>
  );
};
