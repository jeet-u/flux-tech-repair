# Architecture Design and Technology Stack

## Astro Islands Architecture Concept

jeet-u 采用 Astro 的 **Islands Architecture（群岛架构）**，这是理解整个项目的核心。

### What is Islands Architecture?

Traditional SPA (Single Page Applications) treat the entire page as a JavaScript application, leading to:

- Large amount of JS on first load
- Static content also requires JS rendering
- Poor SEO

Islands Architecture concept: **Pages are static HTML by default, only interactive sections ("islands") load JavaScript**.

```plain
┌─────────────────────────────────────────────────────────────┐
│                  Static HTML Page (Ocean)                    │
│  ┌─────────────┐                      ┌─────────────┐       │
│  │   React     │                      │   React     │       │
│  │  Component  │                      │  Component  │       │
│  │   Island    │                      │   Island    │       │
│  │(Interactive)│                      │(Interactive)│       │
│  └─────────────┘                      └─────────────┘       │
│                                                             │
│   Static Content (No JS)  Static Content (No JS)            │
│                                                             │
│  ┌─────────────┐                                            │
│  │   Astro     │         Pure HTML + CSS                    │
│  │  Component  │         No JavaScript Required             │
│  │(Static)     │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### How It Manifests in jeet-u

```typescript
// Static Astro component - produces no JS
// src/components/post/PostList.astro
---
const posts = await getSortedPosts();
---
<ul>
  {posts.map(post => <PostItemCard post={post} />)}
</ul>

// Interactive React component - JS loaded only when needed
// src/pages/index.astro
<ThemeToggle client:load />        // Activate when page loads
<SearchDialog client:visible />    // Activate when scrolled into view
<MenuIcon client:idle />           // Activate when browser is idle
```

---

## Technology Selection Analysis

### Why Choose Astro?

| Requirement | Astro's Advantages |
| --- | --- |
| Blog Static Generation | Generates pure HTML, perfect for CDN |
| SEO Friendly | Server-side rendering, crawlers can directly read content |
| Content Management | Content Collections natively supported |
| Performance First | Zero JS startup, load on demand |
| Framework Flexibility | Can mix React, Vue, Svelte |

### Why Choose React?

Interactive components in the project use React 19 for these reasons:

1. **Mature Ecosystem**: Rich UI libraries (Radix UI, Floating UI)
2. **Powerful Hooks**: Complex state logic is easy to manage
3. **TypeScript Support**: Excellent type inference
4. **Motion Library**: Native React animation library support

### Why Choose Tailwind CSS 4?

1. **Atomic CSS**: No naming needed, rapid development
2. **On-demand Generation**: Only package styles that are used
3. **Design System**: Unified design tokens through configuration
4. **Dark Mode**: Native `dark:` prefix support

### Why Choose Nanostores?

State management uses Nanostores instead of Redux/Zustand:

1. **Extremely Lightweight**: < 1KB
2. **Framework Agnostic**: Works with both Astro and React
3. **Simple API**: `atom` + `useStore` is all you need
4. **No Boilerplate**: No need for Provider wrappers

---

## Configuration Files Explained

### astro.config.mjs

This is Astro's core configuration file:

```javascript
// astro.config.mjs
import react from '@astrojs/react';
import { siteConfig } from './src/constants/site-config';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import svgr from 'vite-plugin-svgr';
import umami from '@yeskunall/astro-umami';
import tailwindcss from '@tailwindcss/vite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import pagefind from 'astro-pagefind';

export default defineConfig({
  // 1. Site URL (for generating absolute paths)
  site: siteConfig.site, // 'https://blog.cosine.ren/'

  // 2. Markdown processing configuration
  markdown: {
    gfm: true, // GitHub Flavored Markdown
    rehypePlugins: [
      rehypeSlug, // Generate ID for headings
      [
        rehypeAutolinkHeadings, // Add anchor links to headings
        {
          behavior: 'append', // Append link after heading
          properties: {
            className: ['anchor-link'],
          },
        },
      ],
    ],
    shikiConfig: {
      themes: {
        light: 'github-light', // Light code theme
        dark: 'github-dark', // Dark code theme
      },
    },
  },

  // 3. Astro integrations
  integrations: [
    react(), // React support
    icon({
      // Icon system
      include: {
        gg: ['*'], // gg icon set
        'fa6-regular': ['*'],
        'fa6-solid': ['*'],
        ri: ['*'], // Remix Icon
      },
    }),
    umami({
      // Visitor statistics
      id: '14de13b0-3220-4beb-8f0b-e08b17724991',
      endpointUrl: 'https://stats.cosine.ren',
      hostUrl: 'https://stats.cosine.ren',
    }),
    pagefind(), // Static search
  ],

  // 4. Development toolbar
  devToolbar: {
    enabled: true,
  },

  // 5. Vite configuration (underlying build tool)
  vite: {
    plugins: [
      svgr(), // Convert SVG to React component
      tailwindcss(), // Tailwind CSS
    ],
  },

  // 6. URL trailing slash handling
  trailingSlash: 'ignore', // /about and /about/ both valid
});
```

### Key Configuration Explanation

#### Markdown Processing Flow

```plain
Markdown file
     ↓
   Parse to AST (syntax tree)
     ↓
   rehypeSlug → Generate id="heading" for ## headings
     ↓
   rehypeAutolinkHeadings → Add <a href="#heading">🔗</a>
     ↓
   Shiki → Code block syntax highlighting
     ↓
   Output HTML
```

#### Icon System Configuration

`astro-icon` integrates Iconify icon library, configuration includes 4 icon sets:

```jsx
// Usage example
import { Icon } from 'astro-icon/components';

<Icon name="ri:github-fill" />        // Remix Icon
<Icon name="fa6-solid:house" />       // Font Awesome 6 Solid
<Icon name="fa6-regular:heart" />     // Font Awesome 6 Regular
<Icon name="gg:menu" />               // css.gg icons
```

### tsconfig.json

TypeScript configuration file:

```json
{
  "extends": "astro/tsconfigs/strict", // Extend Astro strict configuration
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx", // React 17+ JSX transform
    "jsxImportSource": "react", // Auto import React
    "baseUrl": "src", // Base path
    "paths": {
      // Path aliases
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@lib/*": ["lib/*"]
      // ... other aliases
    }
  }
}
```

#### Path Alias Working Principle

```typescript
// Without alias
import { cn } from '../../../lib/utils';

// With alias (recommended)
import { cn } from '@lib/utils';
```

At compile time, TypeScript resolves `@lib/utils` to `src/lib/utils`.

---

## Main Layout Architecture

### Layout.astro Analysis

Main layout file `src/layouts/Layout.astro` is the foundation for all pages:

```astro
---
// 1. Type definition
interface Props {
  title: string;
  description?: string;
  siderType?: HomeSiderType;
  post?: BlogPost;
}

// 2. Component imports
import FloatingGroup from '@components/layout/FloatingGroup.astro';
import Header from '@components/layout/Header.astro';
import MobileDrawer from '@components/layout/MobileDrawer.astro';
import { ClientRouter } from 'astro:transitions';
import '@styles/index.css'; // Global styles
---

<!doctype html>
<html transition:name="root" lang="zh-CN">
  <head>
    <!-- 3. SEO metadata -->
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />

    <!-- 4. View Transitions -->
    <ClientRouter />

    <!-- 5. Theme initialization (prevent flash) -->
    <script is:inline>
      if (
        localStorage.theme === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark');
      }
    </script>
  </head>

  <body>
    <div class="flex min-h-screen flex-col">
      <!-- 6. Page structure -->
      <Header />
      <main class="relative flex grow flex-col gap-4">
        <slot />
        <!-- Page content insertion point -->
      </main>
      <FloatingGroup />
      <MobileDrawer type={siderType} post={post} />
    </div>
  </body>
</html>
```

### Architecture Flow Diagram

```plain
┌─────────────────────────────────────────────────────────────┐
│                         Layout.astro                         │
├─────────────────────────────────────────────────────────────┤
│  <head>                                                      │
│  ├── SEO metadata (title, description, og:*)                │
│  ├── ClientRouter (page transition animations)              │
│  ├── LoadingIndicator (loading indicator)                   │
│  └── Theme initialization script (inline, execute at once)  │
├─────────────────────────────────────────────────────────────┤
│  <body>                                                      │
│  │                                                           │
│  │  ┌─────────────────────────────────────────────────────┐ │
│  │  │                    Header                           │ │
│  │  │  ┌─────────┐ ┌───────────────────┐ ┌─────────────┐ │ │
│  │  │  │  Logo   │ │    Navigator      │ │ ThemeToggle │ │ │
│  │  │  └─────────┘ └───────────────────┘ └─────────────┘ │ │
│  │  └─────────────────────────────────────────────────────┘ │
│  │                                                           │
│  │  ┌─────────────────────────────────────────────────────┐ │
│  │  │                    <main>                           │ │
│  │  │                                                     │ │
│  │  │                    <slot />                         │ │
│  │  │              (page specific content)                │ │
│  │  │                                                     │ │
│  │  └─────────────────────────────────────────────────────┘ │
│  │                                                           │
│  │  ┌──────────────┐           ┌───────────────────────┐    │
│  │  │ FloatingGroup│           │     MobileDrawer      │    │
│  │  │ - Back to top│           │   (mobile sidebar)    │    │
│  │  │ - Search btn │           │                       │    │
│  │  └──────────────┘           └───────────────────────┘    │
│  │                                                           │
│  └───────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┘
```

---

## Build Process

### Development Mode (pnpm dev)

```plain
Source file change
    ↓
Vite HMR (Hot Module Replacement)
    ↓
Browser auto refresh
```

### Production Build (pnpm build)

```plain
src/ source files
    ↓
Astro compilation
├── .astro component → static HTML
├── .tsx component → JavaScript bundles (on-demand)
├── .md file → HTML (Content Collections)
└── .css file → optimized CSS
    ↓
Vite packaging optimization
├── Code splitting
├── Tree shaking
└── Resource compression
    ↓
Pagefind index generation (full-text search)
    ↓
dist/ output directory
├── index.html
├── _astro/
│   ├── *.js (chunks)
│   └── *.css
├── post/
│   └── [slug]/index.html
└── pagefind/
    └── search index files
```

---

## Client Directives Explained

Astro provides multiple `client:*` directives to control when component JavaScript loads:

### Directives Comparison

| Directive        | When JS Loads | Use Case |
| --- | --- | --- |
| `client:load`    | Immediately on page load | Critical interactions (theme toggle, navigation) |
| `client:idle`    | When browser is idle | Non-critical features (comments, statistics) |
| `client:visible` | When component is visible | Lazy loading (charts, bottom components) |
| `client:media`   | When media query matches | Responsive features |
| `client:only`    | Client-side rendering only | Depends on browser API |

### Usage Examples in Project

```astro
// src/layouts/Layout.astro
// Theme toggle - critical feature, load immediately
<ThemeToggle client:load />

// src/components/layout/Header.astro
// Dropdown navigation - requires interaction
<DropdownNav client:load router={router} />

// src/pages/index.astro
// Search dialog - load when visible
<SearchDialog client:visible />

// Menu icon - load when idle
<MenuIcon client:idle />
```

---

## View Transitions (Page Transitions)

Astro has built-in View Transitions API support for implementing page transition animations:

### Configuration Method

```astro
// Layout.astro
import { ClientRouter } from 'astro:transitions';

<html transition:name="root">
  <head>
    <ClientRouter />
  </head>
</html>
```

### How It Works

```plain
User clicks link
     ↓
Astro intercepts navigation
     ↓
Preload target page
     ↓
View Transitions API
├── Old page fade out
└── New page fade in
     ↓
Update URL (no refresh)
```

### Theme Toggle Compatibility

Since page transitions don't trigger full refresh, need to check theme after each navigation:

```javascript
// Layout.astro
document.addEventListener('astro:page-load', () => {
  // Check theme on every page load (including after transitions)
  if (localStorage.theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
});
```

---

## Learning Key Points

1. **Islands Architecture Core**: Pages are static by default, interactive components load JavaScript on-demand
2. **Astro vs React Division**:
   - Astro components: Static content, layout, SEO
   - React components: Interactions, animations, complex state
3. **Configuration Layers**:
   - `astro.config.mjs`: Framework-level configuration
   - `tsconfig.json`: TypeScript and path aliases
   - `tailwind.config.mjs`: Styling system
4. **Client Directives**: `client:load/idle/visible` control JS loading timing
5. **View Transitions**: Non-refresh page switching, enhances user experience

---

## Related Files

| File | Description |
| --- | --- |
| `astro.config.mjs` | Astro core configuration |
| `tsconfig.json` | TypeScript configuration |
| `src/layouts/Layout.astro` | Main layout template |
| `src/constants/site-config.ts` | Site configuration |
| `package.json` | Dependencies and scripts |
