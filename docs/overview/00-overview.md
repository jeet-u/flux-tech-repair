# astro-koharu Project Overview

## Project Introduction

astro-koharu is a modern static blog system built on **Astro 5.x**, migrated from Hexo with inspiration from the Shoka theme. The project uses React for interactive components, Tailwind CSS for styling, while maintaining compatibility with the original Hexo blog content.

### Project Features

- **High Performance**: Astro Islands architecture, zero JavaScript by default, on-demand loading
- **Modern**: React 19 + Tailwind CSS 4 + Motion animation library
- **Content First**: Astro Content Collections managing 183+ blog articles
- **Full-Text Search**: Pagefind static search, no backend required
- **Theme Switching**: Dark/light mode, supporting View Transitions animation
- **Hexo Compatible**: Preserving original article format and category structure

---

## Technology Stack Overview

```plain
┌─────────────────────────────────────────────────────────────┐
│                        astro-koharu                         │
├─────────────────────────────────────────────────────────────┤
│  Framework Layer                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Astro 5.x  │  │  React 19   │  │  TypeScript │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Styling Layer                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Tailwind 4  │  │   Motion    │  │  CSS Vars   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Feature Layer                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Nanostores  │  │  Pagefind   │  │ Floating UI │         │
│  │State Mgmt   │  │Full-text    │  │   Floating  │         │
│  │             │  │   Search    │  │ Positioning │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Content Layer                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Content    │  │   Shiki     │  │   Rehype    │         │
│  │ Collections │  │Code         │  │  Markdown   │         │
│  │             │  │ Highlighting│  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Core Dependencies Overview

| Dependency       | Version | Purpose                                 |
| ---------------- | ------- | --------------------------------------- |
| `astro`          | 5.2.3   | Core framework, static site generation  |
| `react`          | 19.0.0  | Interactive component development       |
| `tailwindcss`    | 4.0.0   | Atomic CSS framework                    |
| `motion`         | 11.15.0 | Animation library (Framer Motion successor) |
| `nanostores`     | -       | Lightweight state management            |
| `astro-pagefind` | -       | Static full-text search                 |
| `astro-icon`     | 1.1.5   | Icon system (Iconify)                   |

---

## Directory Structure

```plain
astro-koharu/
├── public/                     # Static assets (directly copied to build directory)
│   ├── favicon.ico
│   ├── img/                    # Image assets
│   │   ├── avatar.webp        # Avatar
│   │   └── cover/             # Article covers
│   └── js/                     # Third-party scripts
│
├── src/                        # Source code
│   ├── assets/                 # Assets to be processed
│   │   └── svg/               # SVG files
│   │
│   ├── components/             # Component library (60+ components)
│   │   ├── common/            # Common components (ErrorBoundary)
│   │   ├── layout/            # Layout components (Header, Navigator)
│   │   ├── ui/                # UI base components (Button, Card, Popover)
│   │   ├── post/              # Post-related components
│   │   ├── category/          # Category components
│   │   ├── theme/             # Theme switching
│   │   ├── friends/           # Friends/links components
│   │   └── comment/           # Comment components
│   │
│   ├── content/                # Astro Content Collections
│   │   ├── config.ts          # Schema definition
│   │   └── blog/              # Blog articles (183 posts)
│   │       ├── life/          # Personal essays
│   │       ├── note/          # Notes
│   │       │   ├── front-end/ # Frontend notes
│   │       │   └── ...
│   │       ├── weekly/        # Weekly newsletter
│   │       └── ...
│   │
│   ├── constants/              # Constant configurations
│   │   ├── site-config.ts     # Site configuration (most important)
│   │   ├── router.ts          # Navigation routes
│   │   ├── design-tokens.ts   # Design tokens
│   │   └── anim/              # Animation configurations
│   │
│   ├── hooks/                  # React Hooks
│   │   ├── useToggle.ts
│   │   ├── useFloatingUI.ts
│   │   └── ...
│   │
│   ├── layouts/                # Page layouts
│   │   ├── Layout.astro       # Main layout
│   │   └── TwoColumnLayout.astro
│   │
│   ├── lib/                    # Utility functions
│   │   ├── content/           # Content operations
│   │   │   ├── posts.ts       # Post queries
│   │   │   ├── categories.ts  # Category handling
│   │   │   └── tags.ts        # Tag handling
│   │   ├── utils.ts           # Common utilities
│   │   └── datetime.ts        # Date handling
│   │
│   ├── pages/                  # Page routing
│   │   ├── index.astro        # Homepage
│   │   ├── post/[...slug].astro    # Article details
│   │   ├── posts/[...page].astro   # Article list
│   │   ├── categories/        # Category pages
│   │   ├── tags/              # Tag pages
│   │   └── rss.xml.ts         # RSS feed
│   │
│   ├── store/                  # Nanostores state
│   │   ├── app.ts             # App state
│   │   └── ui.ts              # UI state
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.css          # Entry point
│   │   ├── global/            # Global styles
│   │   ├── theme/             # Theme styles
│   │   └── components/        # Component styles
│   │
│   └── types/                  # TypeScript types
│       ├── blog.ts
│       └── components.ts
│
├── astro.config.mjs            # Astro configuration
├── tailwind.config.mjs         # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── _config.yml                 # Hexo category mapping (legacy)
└── CLAUDE.md                   # AI assistant guide
```

---

## Quick Start

### Environment Requirements

- **Node.js**: 18.x or higher
- **Package Manager**: pnpm 9.15.1 (project specified)

### Installation and Running

```bash
# 1. Clone the project
git clone <repo-url>
cd astro-koharu

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
# Visit http://localhost:4321

# 4. Build production version
pnpm build

# 5. Preview build results
pnpm preview
```

### Common Commands Reference

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Start development server        |
| `pnpm build`       | Build production version        |
| `pnpm preview`     | Preview production build        |
| `pnpm lint`        | Run ESLint check                |
| `pnpm lint-md`     | Check Markdown files            |
| `pnpm lint-md:fix` | Auto-fix Markdown issues        |
| `pnpm knip`        | Find unused code and dependencies |
| `pnpm change`      | Generate CHANGELOG              |

---

## Path Aliases

The project is configured with rich path aliases to simplify import paths:

```typescript
// Defined in tsconfig.json
import { cn } from '@lib/utils';           // src/lib/utils.ts
import { Button } from '@components/ui/button';  // src/components/ui/button.tsx
import { siteConfig } from '@constants/site-config';  // src/constants/site-config.ts
import type { BlogPost } from '@types/blog';  // src/types/blog.ts
```

| Alias           | Corresponding Path |
| --------------- | ------------------ |
| `@/*`           | `src/*`            |
| `@components/*` | `src/components/*` |
| `@lib/*`        | `src/lib/*`        |
| `@constants/*`  | `src/constants/*`  |
| `@hooks/*`      | `src/hooks/*`      |
| `@store/*`      | `src/store/*`      |
| `@types/*`      | `src/types/*`      |
| `@layouts/*`    | `src/layouts/*`    |
| `@pages/*`      | `src/pages/*`      |
| `@content/*`    | `src/content/*`    |
| `@styles/*`     | `src/styles/*`     |
| `@assets/*`     | `src/assets/*`     |
| `@scripts/*`    | `src/scripts/*`    |

---

## Site Configuration

The core site configuration is located at `src/constants/site-config.ts`:

```typescript
export const siteConfig = {
  // Basic information
  title: 'Flux Phone Repair Blog',
  alternate: 'Flux',
  subtitle: 'WA sound and tears',
  name: 'cos',
  description: 'FE / ACG / Handicraft / Dark mode enthusiast...',

  // Resources
  avatar: '/img/avatar.webp',
  site: 'https://blog.cosine.ren/',
  startYear: 2020,

  // Featured categories (displayed on homepage)
  featuredCategories: [...],

  // Weekly newsletter configuration
  featuredSeries: {
    categoryName: 'Weekly',
    label: 'FE Bits',
    fullName: 'FE Bits Frontend Weekly Chat',
  },

  // Social links
  socialConfig: {
    github: '...',
    bilibili: '...',
    email: '...',
    twitter: '...',
    rss: '/rss.xml',
  }
};
```

---

## Page Routing Overview

```plain
/                           # Homepage (latest articles + pinned)
├── /posts/[page]           # Article list pagination
├── /post/[slug]            # Article detail page
├── /categories/            # Category homepage
│   └── /categories/[...slug]  # Category page (supports nested)
├── /tags/                  # Tag homepage
│   └── /tags/[tag]         # Tag page
├── /archives               # Archive page
├── /weekly                 # Weekly newsletter
├── /friends                # Friends/links page
├── /about                  # About page
└── /rss.xml                # RSS feed
```

---

## Documentation Navigation

This documentation series consists of 10 parts, recommended to read in order:

1. **[00-overview.md](./00-overview.md)** (current) - Project overview and quick start
2. **[01-architecture.md](./01-architecture.md)** - Architecture design and technology stack
3. **[02-content-system.md](./02-content-system.md)** - Content system deep dive
4. **[03-routing.md](./03-routing.md)** - Routing system explained
5. **[04-component-patterns.md](./04-component-patterns.md)** - Component patterns and best practices
6. **[05-ui-components.md](./05-ui-components.md)** - UI component library implementation
7. **[06-state-management.md](./06-state-management.md)** - State management (Nanostores)
8. **[07-theme-system.md](./07-theme-system.md)** - Theme system implementation
9. **[08-animation-system.md](./08-animation-system.md)** - Animation system design
10. **[09-styling.md](./09-styling.md)** - Styling system (Tailwind + design tokens)

---

## Key Learning Points

- astro-koharu is a modern blog project migrated from Hexo to Astro
- Uses the Astro Islands architecture, statically rendered by default with on-demand React component activation
- Project structure is clear and organized by functional modules
- Uses pnpm as the package manager to ensure consistent dependency versions
- Path aliases simplify module imports and improve development experience
