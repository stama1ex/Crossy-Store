import React from 'react';
import { Title } from '../title';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  endAdornment?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const Block: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  endAdornment,
  className,
  contentClassName,
  children,
}) => {
  return (
    <div className={cn('bg-muted rounded-3xl', className)}>
      {title && (
        <div className="flex items-center justify-between p-5 px-7 border-b">
          <Title text={title} size="sm" className="font-bold" />
          {endAdornment}
        </div>
      )}

      <div className={cn('p-5', contentClassName)}>{children}</div>
    </div>
  );
};
