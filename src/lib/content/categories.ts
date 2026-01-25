/**
 * Category-related utility functions
 */

import { getCollection } from 'astro:content';
import { categoryMap } from '@constants/category';

import type { Category, CategoryListResult } from './types';

/**
 * Get hierarchical category list with counts (excluding drafts in production)
 */
export async function getCategoryList(): Promise<CategoryListResult> {
  const allBlogPosts = await getCollection('blog', ({ data }) => {
    // In production, filter out drafts
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  const countMap: { [key: string]: number } = {}; // TODO: Need optimization, should use category path as key instead of name (e.g., if data structure is both root category and note-backend-data-structure)
  const resCategories: Category[] = [];

  // Count direct article count for each category
  for (let i = 0; i < allBlogPosts.length; ++i) {
    const post = allBlogPosts[i];
    const { catalog, categories } = post.data;
    if (!catalog || !categories?.length) {
      continue;
    }

    const firstCategory = categories[0];
    if (Array.isArray(firstCategory)) {
      // categories[0] = ['Notes', 'Algorithm']
      if (!firstCategory.length) continue;

      for (let j = 0; j < firstCategory.length; ++j) {
        const name = firstCategory[j];
        countMap[name] = (countMap[name] || 0) + 1;
        if (j === 0) {
          addCategoryRecursively(resCategories, [], name);
        } else {
          const parentNames = firstCategory.slice(0, j);
          addCategoryRecursively(resCategories, parentNames, name);
        }
      }
    } else if (typeof firstCategory === 'string') {
      // categories[0] = 'Tools'
      countMap[firstCategory] = (countMap[firstCategory] || 0) + 1;
      addCategoryRecursively(resCategories, [], firstCategory);
    }
  }

  return { categories: resCategories, countMap };
}

/**
 * Recursively add subcategories with side effects. For example, ['Category1', 'Category2', 'Category3'] creates level-1 category 'Category1', level-2 category 'Category2', level-3 category 'Category3'
 * @param rootCategories Root categories
 * @param parentNames Parent category names ['Category1', 'Category2']
 * @param name Child category name 'Category3'
 */
export function addCategoryRecursively(rootCategories: Category[], parentNames: string[], name: string) {
  if (parentNames.length === 0) {
    const index = rootCategories.findIndex((c) => c.name === name); // If current category already exists, return directly
    if (index === -1) rootCategories.push({ name });
    return;
  } else {
    const rootParentName = parentNames[0];
    const index = rootCategories.findIndex((c) => c.name === rootParentName);
    if (index === -1) {
      // If parent category does not exist, create it
      const rootParentCategory = { name: rootParentName, children: [] };
      rootCategories.push(rootParentCategory);
      addCategoryRecursively(rootParentCategory.children, parentNames.slice(1), name);
    } else {
      // If parent category exists, find this category
      const rootParentCategory = rootCategories[index];
      if (!rootParentCategory?.children) rootParentCategory.children = [];
      addCategoryRecursively(rootParentCategory.children, parentNames.slice(1), name);
    }
  }
}

/**
 * Get full category link
 * @param categories Categories
 * @param parentLink Parent category link
 * @returns Category link
 */
export function getCategoryLinks(categories?: Category[], parentLink?: string): string[] {
  if (!categories?.length) return [];
  const res: string[] = [];
  categories.forEach((category: Category) => {
    const link = categoryMap[category.name];
    const fullLink = parentLink ? `${parentLink}/${link}` : link;
    res.push(fullLink);
    if (category?.children?.length) {
      const children = getCategoryLinks(category?.children, fullLink);
      res.push(...children);
    }
  });
  return res;
}

/**
 * Get category name by link
 * @param link categories/xxx/front-end
 * @returns Frontend
 */
export function getCategoryNameByLink(link: string): string {
  if (!link) return '';

  // Remove leading/trailing slashes and split
  const cleanLink = link.replace(/^\/+|\/+$/g, '');
  if (!cleanLink) return '';

  const segments = cleanLink.split('/').filter(Boolean); // Filter out empty segments
  if (segments.length === 0) return '';

  const lastSegment = segments[segments.length - 1];
  const res = Object.keys(categoryMap).find((key) => categoryMap[key] === lastSegment) ?? '';
  return res;
}

/**
 * Get category by link
 */
export function getCategoryByLink(categories: Category[], link?: string): Category | null {
  const name = getCategoryNameByLink(link ?? '');
  if (!name || !categories?.length) return null;
  for (let i = 0; i < categories.length; ++i) {
    const category = categories[i];
    if (category.name === name) {
      return category;
    }
    if (category?.children?.length) {
      const res = getCategoryByLink(category.children, link);
      if (res) return res;
    }
  }
  return null;
}

/**
 * Get parent category of a category (recursively find)
 */
export function getParentCategory(category: Category | null, categories: Category[]): Category | null {
  if (!categories?.length || !category) return null;

  for (const c of categories) {
    if (!c.children?.length) continue;

    // Directly check current level
    if (c.children.some((child) => child.name === category.name)) {
      return c;
    }

    // Recursively check subcategories
    for (const child of c.children) {
      if (child.children?.length) {
        const result = getParentCategory(category, [child]);
        if (result) return result;
      }
    }
  }
  return null;
}

/**
 * Build category path from category names
 * @param categoryNames Array of category names or single category name
 * @returns Category path like "/categories/note/front-end"
 */
export function buildCategoryPath(categoryNames: string | string[]): string {
  if (!categoryNames) return '';

  const names = Array.isArray(categoryNames) ? categoryNames : [categoryNames];
  if (names.length === 0) return '';

  const slugs = names.map((name) => categoryMap[name]);
  return `/categories/${slugs.join('/')}`;
}

/**
 * Normalize ['Category1', 'Category2'] and 'Category'
 */
export function getCategoryArr(categories?: string[] | string) {
  if (!categories) return [];
  if (Array.isArray(categories) && categories.length) {
    return categories as string[];
  } else return [categories as string];
}
