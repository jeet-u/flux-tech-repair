# Markdown Parsing and Styling System

This document provides detailed information about Markdown parsing, rendering, and styling system in the astro-koharu blog project.

## Table of Contents

- [Markdown Configuration](#markdown-configuration)
- [Syntax Highlighting](#syntax-highlighting)
- [Styling System](#styling-system)
- [Content Enhancement](#content-enhancement)
- [Table of Contents Navigation](#table-of-contents-navigation)
- [Extended Features](#extended-features)

## Markdown Configuration

### Astro Markdown Settings

The project uses Astro's built-in Markdown processing capabilities, configured at `astro.config.mjs:15-37`:

```javascript
markdown: {
  // Enable GitHub Flavored Markdown
  gfm: true,

  // Rehype plugins configuration
  rehypePlugins: [
    rehypeSlug,                    // Auto-generate IDs for headings
    [
      rehypeAutolinkHeadings,      // Auto-generate anchor links for headings
      {
        behavior: 'append',
        properties: {
          className: ['anchor-link'],
        },
      },
    ],
  ],

  // Shiki syntax highlighting configuration
  shikiConfig: {
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
}
```

**Key Features:**

- **GFM Support**: Enable GitHub Flavored Markdown, supports extended syntax like tables, task lists, strikethrough, etc.
- **Auto ID Generation**: Use `rehype-slug` to auto-generate URL-friendly IDs for all headings (h1-h6)
- **Auto Anchor Links**: Use `rehype-autolink-headings` to append clickable anchor icons to headings

### Content Collections Configuration

Blog articles use Astro Content Collections for management, Schema defined at `src/content/config.ts:4-21`:

```typescript
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),                       // Article title
    description: z.string().optional(),      // Description
    link: z.string().optional(),             // Custom link
    date: z.date(),                          // Publish date
    cover: z.string().optional(),            // Cover image
    tags: z.array(z.string()).optional(),    // Tags
    categories: z.array(z.string())          // Categories (supports nested)
      .or(z.array(z.array(z.string())))
      .optional(),
    // Hexo compatibility fields
    subtitle: z.string().optional(),
    catalog: z.boolean().optional(),
    sticky: z.boolean().optional(),
  }),
});
```

**Features:**

- Type-safe frontmatter validation
- Support for hierarchical category structure
- Maintain compatibility with Hexo blog

## Syntax Highlighting

### Shiki Integration

The project uses Shiki for code syntax highlighting, supporting light and dark themes:

- **Light Theme**: `github-light` - suitable for daytime reading
- **Dark Theme**: `github-dark` - suitable for nighttime reading

Shiki performs syntax highlighting at build time, generating HTML with inline styles, requiring no runtime JavaScript.

**Advantages:**

- Zero runtime overhead
- Accurate syntax highlighting (based on VSCode's TextMate syntax)
- Theme automatically switches with system/user preference

## Styling System

### Tailwind Typography

The project uses `@tailwindcss/typography` plugin to provide basic typography styling, configured at `tailwind.config.mjs:138`:

```javascript
plugins: [
  require('@tailwindcss/typography'),
  // ... other plugins
];
```

Article content applies `.prose` class to get elegant typography effects (see `src/pages/post/[...slug].astro:96`):

```html
<article class="prose md:prose-sm dark:prose-invert">
  <CustomContent Content="{Content}" />
</article>
```

**Typography Provided Styles:**

- Reasonable font sizes and line heights
- Paragraph spacing and list indentation
- Default styles for links, blockquotes, code blocks
- Responsive typography (via `md:prose-sm` modifier)
- Dark mode support (`dark:prose-invert`)

### Custom Markdown Styles

Deep customization of `.prose` is done in `src/styles/theme/markdown.css`:

#### 1. Global Settings

```css
.prose {
  /* Remove default max-width constraint */
  max-width: none;
}
```

#### 2. Link Styles

```css
.prose a {
  @apply text-primary hover:text-blue no-underline transition-colors duration-300 hover:underline;
}
```

**Features:**

- Use theme color `text-primary`
- Turn blue and show underline on hover
- 300ms smooth transition animation

#### 3. Heading Anchor Links

```css
/* Heading scroll offset to avoid being hidden by fixed header */
.prose h1,
h2,
h3,
h4,
h5,
h6 {
  position: relative;
  scroll-margin-top: 4rem; /* 64px offset */
}

/* Anchor icon */
.prose a.anchor-link > span::before {
  content: '';
  width: 1em;
  height: 1em;
  position: absolute;
  right: -1.25em;
  top: 0.2em;
  opacity: 0;
  transition: opacity 0.3s;

  /* Use SVG mask to display # icon */
  background-color: currentColor;
  mask-image: url('data:image/svg+xml,...');
  /* ... */
}

/* Show anchor icon on heading hover */
.prose h1:hover .anchor-link > span::before,
.prose h2:hover .anchor-link > span::before {
  opacity: 1;
}
```

**How It Works:**

1. `rehype-autolink-headings` inserts `<a class="anchor-link">` element after each heading
2. Use CSS `::before` pseudo-element to display # icon on the right of heading
3. Default transparent, gradually appear on mouse hover
4. `scroll-margin-top` ensures heading is not hidden by fixed header when clicking anchor

### Article Component Styles

`src/styles/components/post.css` provides styles related to Table of Contents (TOC):

```css
/* Custom scrollbar */
.toc-container::-webkit-scrollbar {
  width: 4px;
}
.toc-container::-webkit-scrollbar-thumb {
  background: hsl(var(--primary) / 0.3);
  border-radius: 2px;
}

/* TOC item hover effect */
.toc-item::before {
  content: '';
  position: absolute;
  left: 0;
  width: 0;
  height: 100%;
  background: hsl(var(--primary) / 0.1);
  transition: width 0.2s ease;
}
.toc-item:hover::before {
  width: 100%;
}
```

## Content Enhancement

### CustomContent Component

`src/components/common/CustomContent.astro` is responsible for rendering Markdown content and providing runtime enhancement functionality.

#### Component Configuration

```typescript
interface ContentConfig {
  addBlankTarget: boolean;   // Add target="_blank" to external links
  smoothScroll: boolean;      // Enable smooth scrolling
}
```

Default configuration (`src/constants/content-config.ts:8-11`):

```typescript
export const defaultContentConfig: ContentConfig = {
  addBlankTarget: true,
  smoothScroll: true,
};
```

#### Functionality Implementation

1. **External Link Handling** (`CustomContent.astro:37-49`)

```javascript
// Add target="_blank" to all external links
if (config.addBlankTarget) {
  const links = contentContainer.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('http') || href.startsWith('//')) {
      link.setAttribute('target', '_blank');
    }
  });
}
```

2. **Smooth Scrolling** (`CustomContent.astro:52-76`)

```javascript
if (config.smoothScroll) {
  const anchorLinks = contentContainer.querySelectorAll('a.anchor-link[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        // Update URL hash
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });
}
```

**Advantages:**

- Smooth scroll to target heading
- Update URL without triggering page navigation
- Better user experience

#### Lifecycle

```javascript
// Re-run on Astro page transition
document.addEventListener('astro:page-load', enhanceContent);

// Run on initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceContent);
} else {
  enhanceContent();
}
```

## Table of Contents Navigation

### TableOfContents Component

`src/components/layout/TableOfContents/index.tsx` provides intelligent Table of Contents navigation functionality.

#### Core Features

1. **Auto Extract Heading Tree**

Use custom Hook `useHeadingTree()` to extract all headings from document and build hierarchical structure.

2. **Active Heading Detection**

```typescript
const activeId = useActiveHeading({ offsetTop: 120 });
```

- Auto-detect currently visible heading while scrolling
- Consider fixed header height offset (120px)
- Highlight current heading in TOC

3. **Accordion-style Expansion** (`TableOfContents/index.tsx:40-98`)

```typescript
const handleHeadingClick = useCallback((id: string) => {
  // Scroll to target heading
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Accordion logic:
  // 1. Close other headings at same level
  // 2. Open parent heading chain
  // 3. Expand if has child headings
  setExpandedIds((prev) => {
    // ... Complex state management logic
  });
}, [headings, setExpandedIds]);
```

**User Experience:**

- When clicking heading, only expand that heading and its parents
- Auto-collapse other headings at same level, keep interface clean
- Smooth scroll to target position

4. **Hierarchical Rendering**

Recursively render nested heading structure through `HeadingList` sub-component, supporting arbitrary heading hierarchy depth.

### Integration into Sidebar

TOC is displayed in the article details page sidebar (`src/components/layout/HomeSider.astro:56`):

```html
<div slot="directory" class="sider-slot" data-slot-type="directory">
  {type === HomeSiderType.POST && <TableOfContents client:load />}
</div>
```

**Sidebar Features:**

- Segmented control (info, TOC, series)
- Smooth switching animation
- Responsive: hidden on mobile, fixed on desktop
- Custom scrollbar styling

## Extended Features

### 1. Reading Time Calculation

Although this document focuses on Markdown parsing and styling, it's worth mentioning that the project also includes reading time estimation functionality.

Dependency: `reading-time` package (`package.json:54`)

Usage example:

```typescript
import readingTime from 'reading-time';
const stats = readingTime(post.body);
console.log(stats.text); // "5 min read"
```

### 2. RSS Feed

The project generates RSS feeds using Markdown-rendered content.

Location: `src/pages/rss.xml.ts`
Dependency: `@astrojs/rss` package (`package.json:20`)

### 3. SEO Optimization

Article detail page (`src/pages/post/[...slug].astro:29-41`) includes structured data (JSON-LD):

```javascript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description: description || post.body?.slice(0, 100),
  keywords: categories?.length ? tags.concat(categories[0]) : tags,
  author: { '@type': 'Person', name: siteConfig.author },
  datePublished: parseDate(date, 'YYYY-MM-DD'),
};
```

**Benefits:**

- Help search engines understand article content
- May display rich text snippets in search results
- Improve SEO and social media sharing effects

## Best Practices

### Writing Markdown

1. **Use Semantic Headings**

   ```markdown
   # Article Title (only one h1)

   ## Main Chapter

   ### Subsection

   #### Details
   ```

2. **Leverage GFM Extensions**

   ```markdown
   | Header 1 | Header 2 |
   | -------- | -------- |
   | Content  | Content  |

   - [x] Completed Task
   - [ ] Pending Task

   ~~Strikethrough Text~~
   ```

3. **Specify Language for Code Blocks**
   ````markdown
   ```typescript
   const hello: string = "world";
   ```
   ````

### Style Customization

1. **Extend Prose Styles**

   Add custom rules in `src/styles/theme/markdown.css`:

   ```css
   .prose blockquote {
     @apply border-primary/50 bg-primary/5 border-l-4 italic;
   }
   ```

2. **Add Custom Components**

   Use MDX components in Markdown:

   ```markdown
   import { Callout } from '@components/ui/Callout';

   <Callout type="warning">
   This is a warning callout box
   </Callout>
   ```

3. **Adjust Shiki Theme**

   Modify `shikiConfig.themes` in `astro.config.mjs` to use different code highlighting themes.

## File Index

**Configuration Files:**

- `astro.config.mjs:15-37` - Markdown main configuration
- `tailwind.config.mjs:138` - Typography plugin
- `src/content/config.ts` - Content Collections Schema

**Style Files:**

- `src/styles/theme/markdown.css` - Custom Markdown styles
- `src/styles/components/post.css` - Article component styles
- `src/styles/global/tailwind.css` - Tailwind base configuration

**Component Files:**

- `src/components/common/CustomContent.astro` - Content enhancement component
- `src/components/layout/TableOfContents/index.tsx` - TOC navigation component
- `src/components/layout/HomeSider.astro` - Sidebar container

**Page Files:**

- `src/pages/post/[...slug].astro` - Article detail page template

**Configuration Constants:**

- `src/constants/content-config.ts` - Content enhancement configuration

## Summary

The Markdown system in astro-koharu provides powerful and elegant content rendering capabilities through the following tech stack:

- **Astro + Rehype** - Flexible Markdown processing pipeline
- **Shiki** - High-quality syntax highlighting
- **Tailwind Typography** - Professional typography foundation
- **Custom CSS** - Fine-grained style control
- **React Enhancement Components** - Dynamic interactive features (TOC, smooth scrolling)

This system provides outstanding reading experience for readers while offering powerful content expression capabilities for authors, all while maintaining simplicity and ease of use.
