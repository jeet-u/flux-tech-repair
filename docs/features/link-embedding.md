# Link Embedding Feature

![](https://r2.cosine.ren/i/2026/01/6804aa167fd4cf7022a9b511d52017ce.webp)

Automatically convert standalone Twitter/X and CodePen links into embedded components, and display OG preview cards for other links.

## Features

### 1. Auto Tweet Embedding

Automatically convert standalone Twitter or X links into beautiful Tweet embedded components:

- ✅ Support for `twitter.com` and `x.com` domains
- ✅ Only 16KB in size (vs Twitter native iframe 560KB)
- ✅ Auto-adapt to dark/light theme
- ✅ Server-side rendering, no client-side JavaScript required
- ✅ No iframe, avoiding layout shift

**Example:**

```markdown
This is a standalone Tweet link that will be automatically converted to an embedded component:

https://twitter.com/vercel/status/1683949196632969217

Or using x.com domain:

https://x.com/elonmusk/status/1683631781486342144
```

### 2. Auto CodePen Embedding

Automatically convert standalone CodePen links into interactive code demos:

- ✅ Support for `codepen.io` domain
- ✅ Use CodePen official embedding format
- ✅ Support live code editing and preview
- ✅ Auto-adapt to Astro page navigation
- ✅ On-demand loading, optimizing performance
- ✅ Support dark/light theme

**Example:**

```markdown
This is a standalone CodePen link that will be automatically converted to an interactive embed:

https://codepen.io/username/pen/PenId

Supported formats:
https://codepen.io/username/pen/PenId
https://codepen.io/username/details/PenId
```

**Technical Implementation:**

- Use CodePen official embedding API (`__CPEmbed`)
- Automatically handle Astro page transitions, ensuring embeds initialize correctly
- Load scripts on-demand, only when page contains CodePen embeds
- Support multiple CodePen embeds on the same page

### 3. Generic Link Preview

Display OG (Open Graph) preview cards for standalone generic links:

- ✅ Fetch OG metadata at build time (title, description, image)
- ✅ Fully static, no runtime overhead
- ✅ Display website icon and domain
- ✅ Responsive design, compatible with mobile
- ✅ Graceful error handling and fallback
- ✅ Support dark/light theme
- ✅ SEO friendly

**Example:**

```markdown
This is a standalone link that will display OG preview:

https://github.com/vercel/react-tweet

Another example:

https://react-tweet.vercel.app/
```

### 4. Inline Links Remain Unchanged

Links within paragraphs will not be converted and maintain their original style:

```markdown
The link [react-tweet](https://github.com/vercel/react-tweet) in this paragraph will not be embedded.
```

## How It Works

### Markdown Processing Flow

1. **Remark Plugin Parsing**: `remark-link-embed` plugin identifies standalone links during Markdown compilation
2. **Link Classification**:
   - Detect Twitter/X links and extract Tweet ID (client-side hydration)
   - Other links use **metascraper** to fetch OG data at build time (server-side rendering)
3. **Build Time Processing**:
   - Tweet: Generate placeholder, client-side hydration
   - Link preview: Use metascraper to fetch metadata, generate complete static HTML
4. **Client-side Hydration**: `EmbedHydrator` component only handles Tweet embeds

### Architecture Diagram

```plain
Markdown File
    ↓
remark-link-embed plugin (identify standalone links)
    ↓
├─ Tweet Link → Generate Placeholder (<div data-tweet-embed>)
│                    ↓
│               EmbedHydrator (client-side hydrate TweetEmbed)
│
└─ Generic Link → metascraper fetch OG data at build time
                   ↓
              Generate Complete Static HTML
```

## Configuration Options

You can configure in `src/constants/content-config.ts`:

```typescript
export interface ContentConfig {
  // ... other config

  // Whether to enable link embedding feature
  enableLinkEmbed: boolean;

  // Whether to enable Tweet embedding
  enableTweetEmbed: boolean;

  // Whether to enable OG link preview
  enableOGPreview: boolean;

  // Preview data cache time (seconds)
  previewCacheTime: number;

  // Whether to lazy load embed content
  lazyLoadEmbeds: boolean;
}

export const defaultContentConfig: ContentConfig = {
  // ... other config
  enableLinkEmbed: true,
  enableTweetEmbed: true,
  enableOGPreview: true,
  previewCacheTime: 3600, // 1 hour
  lazyLoadEmbeds: true,
};
```

## File Structure

```plain
src/
├── lib/
│   └── markdown/
│       ├── remark-link-embed.ts      # Remark plugin (using metascraper)
│       └── link-utils.ts             # Link detection utilities
├── components/
│   └── embed/
│       ├── TweetEmbed.tsx            # Tweet embed component
│       └── EmbedHydrator.tsx         # Hydration component (handles tweets only)
└── styles/
    └── components/
        └── embed.css                 # Embed component styles
```

## Build-Time Data Fetching (metascraper)

Link preview uses **metascraper** to fetch OG metadata at build time, without needing an API endpoint:

- **Powerful metadata extraction**: metascraper supports multiple metadata sources and rules
- **Build-time processing**: OG data is fetched during Markdown compilation
- **Fully static**: No runtime overhead
- **Graceful fallback**: If fetching fails, degrades to simple link
- **Auto-update**: Requires site rebuild when link content updates

### metascraper Features

- Support for standard Open Graph tags like og:title, og:description, og:image
- Automatically extract website logo/favicon
- Smart fallback to meta tags and HTML title
- Highly customizable rule system

## Performance Optimization

### Tweet Embed

- Use `react-tweet` library, only 16KB vs native Twitter embed 560KB
- Server-side rendering, displays immediately on first screen
- No iframe, avoiding additional HTTP requests and layout shift

### Link Preview

- **Fully static**: Fetch OG data at build time, zero runtime overhead
- **No JavaScript**: No client-side JavaScript required
- **SEO friendly**: Search engines can directly index preview content
- **Graceful fallback**: Display simple link if fetching fails
- **Faster page load**: No additional API requests needed

## Theme Support

Both embedding types support dark/light themes:

- **TweetEmbed**: Monitor `document.documentElement` class changes via MutationObserver
- **Link Preview**: Use Tailwind theme variables, auto-adapt without JavaScript

## Troubleshooting

### Tweet Not Displaying

1. Check if Tweet ID is correct
2. Confirm network connection is normal
3. Check if Tweet has been deleted or set to private

### Link Preview Not Displaying

1. Check if target website has OG tags
2. Check build log to confirm if OG data fetching succeeded
3. If website requires authentication or has access restrictions, preview may not be fetched
4. Check network connection to ensure target website is accessible at build time

### Style Issues

1. Ensure `src/styles/components/embed.css` is imported
2. Check if react-tweet styles are loaded correctly
3. Clear browser cache and retry

## Disable Feature

To disable this feature, you can set it in `src/constants/content-config.ts`:

```typescript
export const defaultContentConfig: ContentConfig = {
  // ...
  enableLinkEmbed: false,
  // Or disable individual features
  enableTweetEmbed: false,
  enableOGPreview: false,
};
```

## Tech Stack

- **react-tweet**: Tweet embedding library
- **metascraper**: Powerful metadata extraction library, fetch OG data at build time
- **remark**: Markdown processing
- **unist-util-visit**: AST traversal
- **React 19**: Tweet component rendering
- **Astro 5**: Framework integration
- **Static Site Generation (SSG)**: Link previews generated at build time
