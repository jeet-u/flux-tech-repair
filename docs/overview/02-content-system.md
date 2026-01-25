# Content System Deep Dive

## Overview

jeet-u's content system is built on **Astro Content Collections**, which is Astro's native content management solution. It provides type-safe content queries, Markdown/MDX support, and flexible schema validation.

The project's content system also includes a sophisticated **categorization system** designed to handle multi-level category structures migrated from Hexo.

---

## Astro Content Collections Basics

### What are Content Collections?

Content Collections are Astro's official way to manage content, organizing Markdown/MDX files into queryable collections:

```plain
src/content/
├── config.ts          # Schema definition
└── blog/              # blog collection
    ├── life/
    │   └── post1.md
    ├── note/
    │   ├── front-end/
    │   │   └── react-learning.md
    │   └── algorithm/
    │       └── sorting.md
    └── weekly/
        └── issue-01.md
```

### Core Advantages

1. **Type Safety**: Schema validation + TypeScript type inference
2. **Automatic Parsing**: Markdown frontmatter automatically converted to objects
3. **High Performance**: Static generation at build time, zero runtime overhead
4. **Flexible Organization**: Supports nested directory structures

---

## Schema Definition

### Configuration File `src/content/config.ts`

```typescript
import type { BlogSchema } from 'types/blog';
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    // Required fields
    title: z.string(),              // Article title
    date: z.date(),                 // Publication date

    // Optional fields
    description: z.string().optional(),  // Article description/summary
    link: z.string().optional(),         // Custom URL identifier
    cover: z.string().optional(),        // Cover image path
    tags: z.array(z.string()).optional(), // Tag array

    // Hexo compatibility fields
    subtitle: z.string().optional(),     // Subtitle (legacy Hexo)
    catalog: z.boolean().optional(),     // Whether to display table of contents
    sticky: z.boolean().optional(),      // Whether to pin article

    // Category fields (supports two formats)
    categories: z
      .array(z.string())                    // Format 1: ['Tools']
      .or(z.array(z.array(z.string())))     // Format 2: [['Notes', 'Frontend', 'React']]
      .optional(),
  }) satisfies z.ZodType<BlogSchema>,
});

export const collections = {
  blog: blogCollection,
};
```

### Schema Fields Reference

| Field         | Type       | Required | Description                       |
| ------------- | ---------- | -------- | --------------------------------- |
| `title`       | `string`   | Yes      | Article title                     |
| `date`        | `Date`     | Yes      | Publication date                  |
| `description` | `string`   | No       | SEO description/summary           |
| `link`        | `string`   | No       | Custom URL (defaults to filename) |
| `cover`       | `string`   | No       | Cover image path                  |
| `tags`        | `string[]` | No       | Tag array                         |
| `categories`  | See below  | No       | Categories (multi-level support)  |
| `sticky`      | `boolean`  | No       | Pin article flag                  |
| `catalog`     | `boolean`  | No       | Generate table of contents (Hexo legacy) |
| `subtitle`    | `string`   | No       | Subtitle (Hexo legacy)            |

---

## Category System Implementation

### Category Format Support

The project supports two category formats to maintain compatibility with Hexo's historical data:

```yaml
# Format 1: Single-level category
categories:
  - Tools

# Format 2: Multi-level category (recommended)
categories:
  - [Notes, Frontend, React]
```

These two formats are unified in the code:

```typescript
// src/lib/content/posts.ts
const firstCategory = categories[0];

if (Array.isArray(firstCategory)) {
  // Format 2: Multi-level category ['Notes', 'Frontend', 'React']
  return firstCategory.includes(categoryName);
} else if (typeof firstCategory === 'string') {
  // Format 1: Single-level category 'Tools'
  return firstCategory === categoryName;
}
```

### Category Mapping `_config.yml`

Since Chinese characters cannot be used directly in URLs, the project uses a mapping table to convert Chinese category names to English slugs:

```yaml
# _config.yml
category_map:
  Essay: life
  Notes: note
  Frontend: front-end
  React: react
  Tools: tools
  Weekly: weekly
  # ... total 22 category mappings
```

The mapping table is exported in `src/constants/category.ts`:

```typescript
// src/constants/category.ts
export const categoryMap: Record<string, string> = {
  'Essay': 'life',
  'Notes': 'note',
  'Frontend': 'front-end',
  // ...
};
```

### Category Tree Structure

Categories are organized in a tree structure, supporting unlimited levels of nesting:

```typescript
// src/lib/content/types.ts
type Category = {
  name: string;           // Category name
  children?: Category[];  // Subcategories
};
```

Example of an actual category tree:

```plain
Notes
├── Frontend
│   ├── JavaScript
│   └── React
├── Backend
├── Algorithm
└── CS Fundamentals
    └── Data Structures
```

---

## Core Functions Explained

### 1. Get Category List `getCategoryList()`

```typescript
// src/lib/content/categories.ts
export async function getCategoryList(): Promise<CategoryListResult> {
  const allBlogPosts = await getCollection('blog');
  const countMap: { [key: string]: number } = {};  // Article count per category
  const resCategories: Category[] = [];            // Category tree

  for (const post of allBlogPosts) {
    const { catalog, categories } = post.data;
    if (!catalog || !categories?.length) continue;

    const firstCategory = categories[0];

    if (Array.isArray(firstCategory)) {
      // Multi-level category: ['Notes', 'Frontend', 'React']
      for (let j = 0; j < firstCategory.length; ++j) {
        const name = firstCategory[j];
        countMap[name] = (countMap[name] || 0) + 1;

        // Build category tree recursively
        if (j === 0) {
          addCategoryRecursively(resCategories, [], name);
        } else {
          const parentNames = firstCategory.slice(0, j);
          addCategoryRecursively(resCategories, parentNames, name);
        }
      }
    } else if (typeof firstCategory === 'string') {
      // Single-level category: 'Tools'
      countMap[firstCategory] = (countMap[firstCategory] || 0) + 1;
      addCategoryRecursively(resCategories, [], firstCategory);
    }
  }

  return { categories: resCategories, countMap };
}
```

**Return Value Structure**:

```typescript
{
  categories: [
    {
      name: 'Notes',
      children: [
        { name: 'Frontend', children: [{ name: 'React' }] },
        { name: 'Algorithm' }
      ]
    },
    { name: 'Tools' }
  ],
  countMap: {
    'Notes': 50,
    'Frontend': 30,
    'React': 15,
    'Tools': 10
  }
}
```

### 2. Add Category Recursively `addCategoryRecursively()`

This is the core recursive function for building the category tree:

```typescript
// src/lib/content/categories.ts
export function addCategoryRecursively(
  rootCategories: Category[],
  parentNames: string[],
  name: string
) {
  if (parentNames.length === 0) {
    // Root category: add directly
    const index = rootCategories.findIndex((c) => c.name === name);
    if (index === -1) rootCategories.push({ name });
  } else {
    // Subcategory: find parent and recurse
    const rootParentName = parentNames[0];
    const index = rootCategories.findIndex((c) => c.name === rootParentName);

    if (index === -1) {
      // Parent category doesn't exist, create it
      const rootParentCategory = { name: rootParentName, children: [] };
      rootCategories.push(rootParentCategory);
      addCategoryRecursively(rootParentCategory.children, parentNames.slice(1), name);
    } else {
      // Parent category exists, continue recursion
      const rootParentCategory = rootCategories[index];
      if (!rootParentCategory?.children) rootParentCategory.children = [];
      addCategoryRecursively(rootParentCategory.children, parentNames.slice(1), name);
    }
  }
}
```

**Execution Flow Example**:

```plain
Input: ['Notes', 'Frontend', 'React']

Step 1: addCategoryRecursively([], [], 'Notes')
  → categories = [{ name: 'Notes' }]

Step 2: addCategoryRecursively([], ['Notes'], 'Frontend')
  → categories = [{ name: 'Notes', children: [{ name: 'Frontend' }] }]

Step 3: addCategoryRecursively([], ['Notes', 'Frontend'], 'React')
  → categories = [{
      name: 'Notes',
      children: [{
        name: 'Frontend',
        children: [{ name: 'React' }]
      }]
    }]
```

### 3. Build Category Path `buildCategoryPath()`

Converts category name array to URL path:

```typescript
// src/lib/content/categories.ts
export function buildCategoryPath(categoryNames: string | string[]): string {
  if (!categoryNames) return '';

  const names = Array.isArray(categoryNames) ? categoryNames : [categoryNames];
  if (names.length === 0) return '';

  const slugs = names.map((name) => categoryMap[name]);
  return '/categories/' + slugs.join('/');
}

// Example
buildCategoryPath(['Notes', 'Frontend', 'React'])
// → '/categories/note/front-end/react'

buildCategoryPath('Tools')
// → '/categories/tools'
```

### 4. Get Category by Link `getCategoryByLink()`

Reverse lookup category object from URL path:

```typescript
// src/lib/content/categories.ts
export function getCategoryByLink(
  categories: Category[],
  link?: string
): Category | null {
  const name = getCategoryNameByLink(link ?? '');
  if (!name || !categories?.length) return null;

  for (const category of categories) {
    if (category.name === name) return category;

    // Recursively search subcategories
    if (category?.children?.length) {
      const res = getCategoryByLink(category.children, link);
      if (res) return res;
    }
  }
  return null;
}
```

---

## Article Query Functions

### Get Sorted Posts `getSortedPosts()`

```typescript
// src/lib/content/posts.ts
export async function getSortedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog');

  // Sort by date in descending order (newest first)
  return posts.sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
  });
}
```

### Get Posts by Sticky Flag `getPostsBySticky()`

```typescript
// src/lib/content/posts.ts
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
```

### Get Posts by Category `getPostsByCategory()`

```typescript
// src/lib/content/posts.ts
export async function getPostsByCategory(categoryName: string): Promise<BlogPost[]> {
  const posts = await getSortedPosts();

  return posts.filter((post) => {
    const { categories } = post.data;
    if (!categories?.length) return false;

    const firstCategory = categories[0];

    // Handle both category formats
    if (Array.isArray(firstCategory)) {
      return firstCategory.includes(categoryName);
    } else if (typeof firstCategory === 'string') {
      return firstCategory === categoryName;
    }
    return false;
  });
}
```

### Get Series Posts `getSeriesPosts()`

Series posts refer to all articles under the same deepest-level category:

```typescript
// src/lib/content/posts.ts
export async function getSeriesPosts(post: BlogPost): Promise<BlogPost[]> {
  const lastCategory = getPostLastCategory(post);
  if (!lastCategory.name) return [];

  return await getPostsByCategory(lastCategory.name);
}

// Get the deepest-level category of an article
export function getPostLastCategory(post: BlogPost): { link: string; name: string } {
  const { categories } = post.data;
  if (!categories?.length) return { link: '', name: '' };

  const firstCategory = categories[0];

  if (Array.isArray(firstCategory)) {
    // ['Notes', 'Frontend', 'React'] → return 'React'
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
```

### Get Adjacent Series Posts `getAdjacentSeriesPosts()`

Used for "Previous/Next Article" navigation on article pages:

```typescript
// src/lib/content/posts.ts
export async function getAdjacentSeriesPosts(currentPost: BlogPost): Promise<{
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
}> {
  const seriesPosts = await getSeriesPosts(currentPost);

  if (seriesPosts.length === 0) {
    return { prevPost: null, nextPost: null };
  }

  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentPost.slug
  );

  if (currentIndex === -1) {
    return { prevPost: null, nextPost: null };
  }

  // Since articles are sorted by date in descending order (newest first)
  // prevPost is the newer article (index - 1)
  // nextPost is the older article (index + 1)
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < seriesPosts.length - 1
    ? seriesPosts[currentIndex + 1]
    : null;

  return { prevPost, nextPost };
}
```

---

## Weekly Column Feature

The project supports a special "Weekly" category, displayed separately from regular articles:

```typescript
// src/lib/content/posts.ts

// Get all weekly articles
export async function getWeeklyPosts(): Promise<BlogPost[]> {
  const { featuredSeries } = siteConfig;
  if (!featuredSeries?.enabled || !featuredSeries.categoryName) {
    return [];
  }

  return await getPostsByCategory(featuredSeries.categoryName);
}

// Get the latest weekly article
export async function getLatestWeeklyPost(): Promise<BlogPost | null> {
  const weeklyPosts = await getWeeklyPosts();
  return weeklyPosts[0] ?? null;
}

// Get non-weekly articles (used on homepage)
export async function getNonWeeklyPosts(): Promise<BlogPost[]> {
  const { featuredSeries } = siteConfig;
  if (!featuredSeries?.enabled || !featuredSeries.categoryName) {
    return await getSortedPosts();
  }

  const allPosts = await getSortedPosts();
  return allPosts.filter(
    (post) => !isPostInCategory(post, featuredSeries.categoryName)
  );
}
```

---

## Article Frontmatter Examples

### Basic Article

```yaml
---
title: React Hooks Learning Notes
date: 2024-01-15
description: Deep dive into how React Hooks work
tags:
  - React
  - Hooks
  - Frontend
categories:
  - [Notes, Frontend, React]
catalog: true
---
Article content...
```

### Pinned Article

```yaml
---
title: Website Announcement
date: 2024-03-01
sticky: true
categories:
  - Essay
---
```

### Custom Link

```yaml
---
title: Very Long Article Title
link: short-url
date: 2024-02-20
---
# Access path will be /post/short-url instead of filename
```

---

## Data Flow Diagram

```plain
┌─────────────────────────────────────────────────────────────┐
│                    Markdown File                            │
│   src/content/blog/note/front-end/react-hooks.md           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Schema Validation                        │
│   src/content/config.ts → z.object({...})                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Content Collection API                      │
│   getCollection('blog') → CollectionEntry<'blog'>[]        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Utility Functions                        │
│   ┌─────────────────┐  ┌─────────────────┐                 │
│   │  posts.ts       │  │  categories.ts  │                 │
│   │  - getSorted    │  │  - getList      │                 │
│   │  - getByCategory│  │  - buildPath    │                 │
│   │  - getSeries    │  │  - getByLink    │                 │
│   └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Page Components                          │
│   ┌─────────────────┐  ┌─────────────────┐                 │
│   │  PostList.astro │  │ CategoryList    │                 │
│   │  PostCard.astro │  │ .astro          │                 │
│   └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Static HTML Output                       │
│   dist/post/react-hooks/index.html                         │
│   dist/categories/note/front-end/react/index.html          │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Learning Points

1. **Content Collections**: Astro's native content management providing type safety and schema validation
2. **Dual Format Categories**: Compatibility with both Hexo's single-level and multi-level category formats
3. **Category Mapping**: Conversion mechanism from Chinese category names to English slugs
4. **Recursive Algorithm**: Building and traversing the category tree
5. **Layered Utility Functions**:
   - `posts.ts`: Article queries (sorting, filtering, pagination)
   - `categories.ts`: Category operations (building, searching, path generation)
   - `tags.ts`: Tag statistics

---

## Related Files

| File                            | Description            |
| ------------------------------- | ---------------------- |
| `src/content/config.ts`         | Schema definition      |
| `src/content/blog/`             | Blog articles directory|
| `src/lib/content/posts.ts`      | Article query functions|
| `src/lib/content/categories.ts` | Category handling      |
| `src/lib/content/tags.ts`       | Tag handling functions |
| `src/lib/content/types.ts`      | Type definitions       |
| `src/constants/category.ts`     | Category mapping table |
| `_config.yml`                   | Hexo category map source|
