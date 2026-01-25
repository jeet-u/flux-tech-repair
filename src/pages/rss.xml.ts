// edit https://github.com/lawvs/lawvs.github.io/blob/dba2e51e312765f8322ee87755b4e9c22b520048/src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { siteConfig } from '@constants/site-config';
import { getCategoryArr, getSortedPosts } from '@lib/content';
import { getSanitizeHtml } from '@lib/sanitize';
import type { APIContext } from 'astro';
import sanitizeHtml from 'sanitize-html';
import type { BlogPost } from 'types/blog';

// Function for generating plain text summaries
const generateTextSummary = (html?: string, length: number = 150): string => {
  // Convert HTML to plain text (remove all tags)
  const text = sanitizeHtml(html ?? '', {
    allowedTags: [], // No tags allowed
    allowedAttributes: {},
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Intentional - filtering invalid XML characters
    textFilter: (text) => text.replace(/[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm, ''),
  });
  // Truncate to specified length and ensure words are not cut off
  if (text.length <= length) return text;
  return text.substring(0, length).replace(/\s+\S*$/, '');
};

export async function GET(context: APIContext) {
  const posts = await getSortedPosts();
  const { site } = context;

  if (!site) {
    throw new Error('Missing site metadata');
  }

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || 'No description',
    site,
    trailingSlash: false,
    stylesheet: '/rss/feed.xsl', // https://docs.astro.build/en/recipes/rss/#adding-a-stylesheet
    items: posts
      .map((post: BlogPost) => {
        // Get category array
        const categoryArr = getCategoryArr(post.data.categories?.[0]);

        // Build categories array containing categories and tags
        const categories = [
          // Add category information
          ...(categoryArr || []).map((cat) => `category:${cat}`),
          // Add tag information
          ...(post.data.tags || []).map((tag) => `tag:${tag}`),
        ];

        const postSlug = post.data.link ?? post.slug;
        const postLink = `/post/${postSlug}`;

        return {
          title: post.data.title,
          pubDate: post.data.date,
          description: post.data?.description ?? generateTextSummary(post.rendered?.html),
          link: postLink,
          content: getSanitizeHtml(post.rendered?.html ?? ''),
          categories,
          // Add domain-independent GUID using customData
          // The slug-only GUID ensures stability across domain changes
          customData: `<guid isPermaLink="false">${postSlug}</guid>`,
        };
      })
      .slice(0, 20),
  });
}
