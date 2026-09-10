'use client';

import * as React from 'react';
import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

function Sheet({
  ...props
}: SheetPrimitive.Root.Props) {
  return (
    <SheetPrimitive.Root
      data-slot="sheet"
      {...props}
    />
  );
}

function SheetTrigger({
  ...props
}: SheetPrimitive.Trigger.Props) {
  return (
    <SheetPrimitive.Trigger
      data-slot="sheet-trigger"
      {...props}
    />
  );
}

function SheetClose({
  ...props
}: SheetPrimitive.Close.Props) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      {...props}
    />
  );
}

function SheetPortal({
  ...props
}: SheetPrimitive.Portal.Props) {
  return (
    <SheetPrimitive.Portal
      data-slot="sheet-portal"
      {...props}
    />
  );
}

function SheetOverlay({
  className,
  ...props
}: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        [
          'fixed inset-0 z-50',
          'bg-slate-950/45',
          'backdrop-blur-[2px]',
          'transition-opacity duration-200',
          'data-ending-style:opacity-0',
          'data-starting-style:opacity-0',
        ].join(' '),
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: 'top' | 'right' | 'bottom' | 'left';
  showCloseButton?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />

      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          [
            'fixed z-50 flex flex-col',
            'bg-background text-foreground',
            'shadow-[0_20px_70px_rgba(15,23,42,0.16)]',

            'outline-none',

            'transition-all duration-250 ease-out',

            /* Top */
            'data-[side=top]:inset-x-0',
            'data-[side=top]:top-0',
            'data-[side=top]:h-auto',
            'data-[side=top]:border-b',
            'data-[side=top]:border-border',
            'data-[side=top]:rounded-b-[28px]',
            'data-[side=top]:data-starting-style:translate-y-[-100%]',
            'data-[side=top]:data-ending-style:translate-y-[-100%]',

            /* Right */
            'data-[side=right]:inset-y-0',
            'data-[side=right]:right-0',
            'data-[side=right]:h-full',
            'data-[side=right]:w-[88%]',
            'data-[side=right]:max-w-[420px]',
            'data-[side=right]:border-l',
            'data-[side=right]:border-border',
            'data-[side=right]:rounded-l-[28px]',
            'data-[side=right]:data-starting-style:translate-x-[100%]',
            'data-[side=right]:data-ending-style:translate-x-[100%]',

            /* Left */
            'data-[side=left]:inset-y-0',
            'data-[side=left]:left-0',
            'data-[side=left]:h-full',
            'data-[side=left]:w-[88%]',
            'data-[side=left]:max-w-[420px]',
            'data-[side=left]:border-r',
            'data-[side=left]:border-border',
            'data-[side=left]:rounded-r-[28px]',
            'data-[side=left]:data-starting-style:translate-x-[-100%]',
            'data-[side=left]:data-ending-style:translate-x-[-100%]',
            'data-[side=left]:data-ending-style:translate-x-[-100%]',

            /* Bottom */
            'data-[side=bottom]:inset-x-0',
            'data-[side=bottom]:bottom-0',
            'data-[side=bottom]:max-h-[88vh]',
            'data-[side=bottom]:border-t',
            'data-[side=bottom]:border-border',
            'data-[side=bottom]:rounded-t-[30px]',
            'data-[side=bottom]:data-starting-style:translate-y-[100%]',
            'data-[side=bottom]:data-ending-style:translate-y-[100%]',

            className,
          ].join(' '),
        )}
        {...props}
      >
        {/* Decorative top line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 rounded-full bg-primary/20"
        />

        {children}

        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4 z-20 h-9 w-9 rounded-xl border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted hover:text-foreground"
              />
            }
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">
              بستن
            </span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        'flex flex-col gap-1 border-b border-border px-5 pb-4 pt-6',
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'mt-auto border-t border-border bg-background/95 p-5 backdrop-blur',
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        'text-right text-lg font-black tracking-tight text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(
        'text-right text-sm leading-6 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};