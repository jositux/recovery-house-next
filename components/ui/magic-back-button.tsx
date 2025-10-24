import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { usePageTrackerStore } from 'react-page-tracker';
import { ChevronLeft } from 'lucide-react';

export const MagicBackButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { backLink?: string }
>(({ className, onClick,  backLink = '/', ...props }, ref) => {
  const router = useRouter();
  const isFirstPage = usePageTrackerStore((state) => state.isFirstPage);
  return (
    <Button
  className={cn(
    "rounded-full bg-white text-[#162F40] border border-[#162F40] hover:bg-[#162F40] hover:text-white transition-all px-4 py-2",
    className
  )}
  variant="outline"
  ref={ref}
  onClick={(e) => {
    if (isFirstPage) {
      router.push(backLink);
    } else {
      router.back();
    }
    onClick?.(e);
  }}
  {...props}
>
  <ChevronLeft className="w-4 h-4" />
  Volver
</Button>

  );
});
MagicBackButton.displayName = 'MagicBackButton';
