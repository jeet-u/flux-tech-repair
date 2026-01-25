/**
 * SeriesNavigation - Previous/Next navigation for series articles
 */
import { Routes } from '@constants/router';
import { routeBuilder } from '@lib/route';
import { cn } from '@lib/utils';
import { RiArrowDownSLine, RiArrowLeftSLine, RiArrowRightSLine, RiArrowUpSLine } from 'react-icons/ri';
import type { BlogPost } from '@/types/blog';

interface SeriesNavigationProps {
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
  className?: string;
}

export function SeriesNavigation({ prevPost, nextPost, className }: SeriesNavigationProps) {
  if (!prevPost && !nextPost) {
    return null;
  }

  const scrollBehavior: ScrollBehavior = 'smooth';

  return (
    <div className={cn('mt-4 flex flex-col gap-3 border-border border-t pt-4 md:mt-0 md:pt-2', className)}>
      {/* Article navigation */}
      <div className="flex items-center justify-between gap-2">
        {/* Previous article */}
        {prevPost ? (
          <a
            href={routeBuilder(Routes.Post, prevPost)}
            className={cn(
              'group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors',
              'text-muted-foreground hover:bg-accent hover:text-primary',
              'min-w-0 max-w-[45%] flex-1',
            )}
            title={prevPost.data.title}
            suppressHydrationWarning
          >
            <RiArrowLeftSLine className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs">{prevPost.data.title}</span>
          </a>
        ) : (
          <div className="max-w-[45%] flex-1" />
        )}

        {/* Next article */}
        {nextPost ? (
          <a
            href={routeBuilder(Routes.Post, nextPost)}
            className={cn(
              'group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors',
              'text-muted-foreground hover:bg-accent hover:text-primary',
              'min-w-0 max-w-[45%] flex-1 justify-end text-right',
            )}
            title={nextPost.data.title}
            suppressHydrationWarning
          >
            <span className="truncate text-xs">{nextPost.data.title}</span>
            <RiArrowRightSLine className="h-4 w-4 shrink-0" />
          </a>
        ) : (
          <div className="max-w-[45%] flex-1" />
        )}
      </div>

      {/* Back to top and scroll to bottom */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior })}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 transition-colors',
            'text-muted-foreground text-xs hover:bg-accent hover:text-primary',
          )}
          title="Back to top"
          aria-label="Back to top"
          suppressHydrationWarning
        >
          <RiArrowUpSLine className="h-4 w-4" />
          Back to top
        </button>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: scrollBehavior })}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 transition-colors',
            'text-muted-foreground text-xs hover:bg-accent hover:text-primary',
          )}
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
          suppressHydrationWarning
        >
          <RiArrowDownSLine className="h-4 w-4" />
          Scroll to bottom
        </button>
      </div>
    </div>
  );
}
