import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  cn(
    // Layout & Spacing
    'flex h-9 w-full min-w-0 rounded-md border px-3 py-1',
    // Typography
    'text-base md:text-sm file:text-sm file:font-medium placeholder:text-muted-foreground selection:text-primary-foreground',
    // Colors & Backgrounds
    'border-input bg-transparent file:bg-transparent selection:bg-primary dark:bg-input/30',
    // Borders & Effects
    'shadow-xs file:border-0',
    // Interactive & States
    'transition-[color,box-shadow] outline-none',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    // File Input specifics
    'file:text-foreground file:inline-flex file:h-7'
  ),
  {
    variants: {
      variant: {
        default: '',
        ghost:
          'border-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function Input({
  className,
  variant,
  type,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
