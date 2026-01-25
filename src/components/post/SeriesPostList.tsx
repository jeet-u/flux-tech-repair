/**
 * SeriesPostList - Display series post list
 */

import { Routes } from '@constants/router';
import { routeBuilder } from '@lib/route';
import { cn } from '@lib/utils';
import type { BlogPost } from '@/types/blog';

interface SeriesPostListProps {
  posts: BlogPost[];
  currentPostSlug?: string;
  className?: string;
}

export function SeriesPostList({ posts, currentPostSlug, className }: SeriesPostListProps) {
  if (!posts?.length) {
    return <div className="py-8 text-center text-muted-foreground text-sm">No series posts yet</div>;
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {posts.map((post) => {
        const href = routeBuilder(Routes.Post, post);
        const isActive = post.slug === currentPostSlug;

        return (
          <a
            key={post.slug}
            href={href}
            className={cn(
              'group relative flex items-start gap-3 rounded-md px-1 py-2 transition-colors',
              'hover:bg-accent/50',
              isActive && 'font-medium text-primary',
            )}
          >
            {/* Dot indicator */}
            <span
              className={cn(
                'mt-2 h-2 w-2 shrink-0 rounded-full transition-colors',
                isActive ? 'bg-primary' : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/60',
              )}
            />

            {/* Post title */}
            <span
              className={cn(
                'line-clamp-2 flex-1 text-sm leading-relaxed transition-colors',
                isActive ? 'text-primary' : 'text-foreground group-hover:text-primary',
              )}
            >
              {post.data.title}
            </span>
          </a>
        );
      })}
    </div>
  );
}
