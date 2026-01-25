/**
 * Post-related utility functions
 */

import { type CollectionEntry, getCollection } from 'astro:content';

import summaries from '@assets/summaries.json';
import { siteConfig } from '@constants/site-config';
import type { FeaturedSeriesItem } from '@lib/config/types';
import type { BlogPost } from 'types/blog';
import { extractTextFromMarkdown } from '../sanitize';
import { buildCategoryPath } from './categories';

/** AI summary data type */
type SummariesData = Record<string, { title: string; summary: string }>;

/**
 * Get post description
 * Prioritize using description in frontmatter, if not present, intelligently extract from Markdown content
 * @param post Post object
 * @param maxLength Maximum length, default 150 characters
 * @returns Article description text
 */
export function getPostDescription(post: BlogPost, maxLength: number = 150): string {
  return post.data.description || extractTextFromMarkdown(post.body, maxLength);
}

/**
 * Get article's AI summary
 * @param slug Article slug (usually post.data.link or post.slug)
 * @returns AI summary text, returns null if not present
 */
export function getPostSummary(slug: string): string | null {
  const data = summaries as SummariesData;
  return data[slug]?.summary ?? null;
}

/**
 * Get post description with AI summary fallback
 * Priority: frontmatter description > AI summary > markdown extraction
 * @param post Post object
 * @param maxLength Maximum length, default 150 characters
 * @returns Article description text
 */
export function getPostDescriptionWithSummary(post: BlogPost, maxLength: number = 150): string {
  const slug = post.data?.link ?? post.slug;
  return post.data.description || getPostSummary(slug) || extractTextFromMarkdown(post.body, maxLength);
}

/**
 * Get all posts sorted by date (newest first)
 * In production, draft posts are filtered out
 */
export async function getSortedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => {
    // In production environment, filter out drafts
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  // Sort by date
  const sortedPosts = posts.sort((a: BlogPost, b: BlogPost) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
  });

  return sortedPosts;
}

/**
 * Get posts separated by sticky status
 * @returns Object containing sticky and non-sticky posts, both sorted by date (newest first)
 */
export async function getPostsBySticky(): Promise<{
  stickyPosts: CollectionEntry<'blog'>[];
  nonStickyPosts: CollectionEntry<'blog'>[];
}> {
  const posts = await getSortedPosts();

  const stickyPosts: CollectionEntry<'blog'>[] = [];
  const nonStickyPosts: CollectionEntry<'blog'>[] = [];

  for (const post of posts) {
    if (post.data?.sticky) {
      stickyPosts.push(post);
    } else {
      nonStickyPosts.push(post);
    }
  }

  return { stickyPosts, nonStickyPosts };
}

/**
 * Get post count (excluding drafts in production)
 */
export async function getPostCount() {
  const posts = await getCollection('blog', ({ data }) => {
    // In production environment, filter out drafts
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  return posts?.length ?? 0;
}

/**
 * Get all posts under a category
 * @param categoryName Category name
 * @returns Article list
 */
export async function getPostsByCategory(categoryName: string): Promise<BlogPost[]> {
  const posts = await getSortedPosts();
  return posts.filter((post) => {
    const { categories } = post.data;
    if (!categories?.length) return false;

    const firstCategory = categories[0];
    // Handle two types of category formats
    if (Array.isArray(firstCategory)) {
      // ['notes', 'algorithm']
      return firstCategory.includes(categoryName);
    } else if (typeof firstCategory === 'string') {
      // 'tools'
      return firstCategory === categoryName;
    }
    return false;
  });
}

/**
 * Get the last (deepest) category of a post
 */
export function getPostLastCategory(post: BlogPost): { link: string; name: string } {
  const { categories } = post.data;
  if (!categories?.length) return { link: '', name: '' };

  const firstCategory = categories[0];
  if (Array.isArray(firstCategory)) {
    if (!firstCategory.length) return { link: '', name: '' };
    return {
      link: buildCategoryPath(firstCategory),
      name: firstCategory[firstCategory.length - 1],
    };
  } else if (typeof firstCategory === 'string') {
    return {
      link: buildCategoryPath(firstCategory),
      name: firstCategory,
    };
  }

  return { link: '', name: '' };
}

/**
 * Fisher-Yates shuffle algorithm
 * Compared to sort(() => Math.random() - 0.5), produces uniformly distributed random shuffles
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get random posts
 * @param count Number of posts
 * @returns Random article list
 */
export async function getRandomPosts(count: number = 10): Promise<BlogPost[]> {
  const posts = await getSortedPosts();
  const shuffled = shuffleArray(posts);
  return shuffled.slice(0, Math.min(count, posts.length));
}

/**
 * Get all posts belonging to the post's series (based on deepest category)
 * @param post Current post
 * @returns Series article list (sorted by date, newest first)
 */
export async function getSeriesPosts(post: BlogPost): Promise<BlogPost[]> {
  const lastCategory = getPostLastCategory(post);
  if (!lastCategory.name) return [];

  return await getPostsByCategory(lastCategory.name);
}

/**
 * Get previous and next posts (in the same series)
 * @param currentPost Current post
 * @returns Previous and next posts
 */
export async function getAdjacentSeriesPosts(currentPost: BlogPost): Promise<{
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
}> {
  const seriesPosts = await getSeriesPosts(currentPost);

  if (seriesPosts.length === 0) {
    return { prevPost: null, nextPost: null };
  }

  const currentIndex = seriesPosts.findIndex((post) => post.slug === currentPost.slug);

  if (currentIndex === -1) {
    return { prevPost: null, nextPost: null };
  }

  // Because posts are sorted by date in descending order (newest first)
  // prevPost is a newer post (index - 1)
  // nextPost is an older post (index + 1)
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null;

  return { prevPost, nextPost };
}

/**
 * Check if an article belongs to a specific category
 * @param post Post
 * @param categoryName Category name
 * @returns Whether it belongs to this category
 */
function isPostInCategory(post: BlogPost, categoryName: string): boolean {
  const { categories } = post.data;
  if (!categories?.length) return false;

  const firstCategory = categories[0];
  if (Array.isArray(firstCategory)) {
    return firstCategory.includes(categoryName);
  } else if (typeof firstCategory === 'string') {
    return firstCategory === categoryName;
  }
  return false;
}

// =============================================================================
// Featured Series Functions
// =============================================================================

/**
 * Get all enabled Featured Series
 * @returns List of enabled series
 */
export function getEnabledSeries(): FeaturedSeriesItem[] {
  return siteConfig.featuredSeries.filter((series) => series.enabled !== false);
}

/**
 * Find Featured Series by slug
 * @param slug Series slug
 * @returns Series configuration or undefined
 */
export function getSeriesBySlug(slug: string): FeaturedSeriesItem | undefined {
  const normalizedSlug = slug.trim().toLowerCase();
  return siteConfig.featuredSeries.find((series) => series.slug.toLowerCase() === normalizedSlug && series.enabled !== false);
}

/**
 * Get all posts of a Featured Series
 * @param slug Series slug
 * @returns Article list (sorted by date, newest first)
 */
export async function getPostsBySeriesSlug(slug: string): Promise<BlogPost[]> {
  const series = getSeriesBySlug(slug);
  if (!series) return [];

  return await getPostsByCategory(series.categoryName);
}

/**
 * Get category names of all Featured Series
 * @returns List of category names
 */
export function getFeaturedCategoryNames(): string[] {
  return getEnabledSeries().map((series) => series.categoryName);
}

/**
 * Get all non-Featured Series posts (already sorted)
 * @returns Non-series article list (sorted by date, newest first)
 */
export async function getNonFeaturedPosts(): Promise<BlogPost[]> {
  const categoryNames = getFeaturedCategoryNames();
  if (categoryNames.length === 0) {
    return await getSortedPosts();
  }

  const allPosts = await getSortedPosts();
  return allPosts.filter((post) => !categoryNames.some((catName) => isPostInCategory(post, catName)));
}

/**
 * Get non-Featured Series posts grouped by sticky status
 * @returns Sticky posts and regular non-sticky posts (mutually exclusive, no overlap)
 */
export async function getNonFeaturedPostsBySticky(): Promise<{
  stickyPosts: BlogPost[];
  regularPosts: BlogPost[];
}> {
  const nonFeaturedPosts = await getNonFeaturedPosts();

  const stickyPosts: BlogPost[] = [];
  const regularPosts: BlogPost[] = [];

  for (const post of nonFeaturedPosts) {
    if (post.data?.sticky) {
      stickyPosts.push(post);
    } else {
      regularPosts.push(post);
    }
  }

  return { stickyPosts, regularPosts };
}

/**
 * Get the latest posts of all series with highlightOnHome=true
 * @returns List of latest posts (one per series)
 */
export async function getHomeHighlightedPosts(): Promise<BlogPost[]> {
  const highlightedSeries = getEnabledSeries().filter((series) => series.highlightOnHome !== false);

  const posts: BlogPost[] = [];
  for (const series of highlightedSeries) {
    const seriesPosts = await getPostsByCategory(series.categoryName);
    if (seriesPosts[0]) {
      posts.push(seriesPosts[0]);
    }
  }

  return posts;
}

/**
 * Optimized homepage data retrieval - get all needed data in single pass
 * @returns Object containing highlighted posts, sticky posts and regular posts
 */
export async function getHomePagePosts(): Promise<{
  highlightedPosts: BlogPost[];
  stickyPosts: BlogPost[];
  regularPosts: BlogPost[];
}> {
  const allPosts = await getSortedPosts();
  const categoryNames = getFeaturedCategoryNames();
  const highlightedSeries = getEnabledSeries().filter((series) => series.highlightOnHome !== false);

  // Used to track the latest post of each highlighted series
  const seriesLatestMap = new Map<string, BlogPost>();

  const stickyPosts: BlogPost[] = [];
  const regularPosts: BlogPost[] = [];

  // Single pass through all posts
  for (const post of allPosts) {
    const isFeatured = categoryNames.some((catName) => isPostInCategory(post, catName));

    if (isFeatured) {
      // Check if it belongs to a highlighted series
      for (const series of highlightedSeries) {
        if (isPostInCategory(post, series.categoryName)) {
          // Only keep the latest post of each series (first one, as they are sorted)
          if (!seriesLatestMap.has(series.categoryName)) {
            seriesLatestMap.set(series.categoryName, post);
          }
          break;
        }
      }
      // Skip series posts, don't add to regular list
      continue;
    }

    // Non-series posts, grouped by sticky status
    if (post.data?.sticky) {
      stickyPosts.push(post);
    } else {
      regularPosts.push(post);
    }
  }

  // Extract highlighted posts (maintain the order defined by series)
  const highlightedPosts: BlogPost[] = [];
  for (const series of highlightedSeries) {
    const post = seriesLatestMap.get(series.categoryName);
    if (post) {
      highlightedPosts.push(post);
    }
  }

  return { highlightedPosts, stickyPosts, regularPosts };
}

// =============================================================================
// Deprecated Functions (for backwards compatibility)
// =============================================================================

/**
 * @deprecated Use getPostsBySeriesSlug('weekly') instead
 */
export async function getWeeklyPosts(): Promise<BlogPost[]> {
  return await getPostsBySeriesSlug('weekly');
}

/**
 * @deprecated Use getHomeHighlightedPosts() instead
 */
export async function getLatestWeeklyPost(): Promise<BlogPost | null> {
  const posts = await getPostsBySeriesSlug('weekly');
  return posts[0] ?? null;
}

/**
 * @deprecated Use getNonFeaturedPosts() instead
 */
export async function getNonWeeklyPosts(): Promise<BlogPost[]> {
  return await getNonFeaturedPosts();
}

/**
 * @deprecated Use getNonFeaturedPostsBySticky() instead
 */
export async function getNonWeeklyPostsBySticky(): Promise<{
  stickyPosts: BlogPost[];
  regularPosts: BlogPost[];
}> {
  return await getNonFeaturedPostsBySticky();
}
