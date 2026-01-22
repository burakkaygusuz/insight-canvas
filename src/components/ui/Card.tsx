import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  cn(
    // Layout
    'flex flex-col gap-6',
    // Borders & Effects
    'rounded-xl border shadow-sm transition-all duration-200'
  ),
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground hover:shadow-md',
        glass:
          'bg-card/50 text-card-foreground border-white/10 backdrop-blur-md hover:border-white/20 hover:shadow-md',
        ghost: 'border-none shadow-none bg-transparent'
      }
    },
    defaultVariants: {
      variant: 'glass'
    }
  }
);

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ variant, className }))} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // Layout
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-2',
        // Spacing
        'px-6',
        // Conditional Layout
        'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        // Conditional Spacing
        '[.border-b]:pb-6',
        // Container
        '@container/card-header',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        // Layout
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        // Layout
        'flex items-center',
        // Spacing
        'px-6',
        // Conditional Spacing
        '[.border-t]:pt-6',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants
};
