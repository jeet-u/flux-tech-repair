# Component Patterns and Best Practices

## Component Type Selection

In jeet-u, components are divided into two categories: **Astro components** and **React components**. Which type to choose depends on the component's functional requirements.

### Selection Guide

```
┌─────────────────────────────────────────────────────────────┐
│                  Need Interaction/State?                    │
└─────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
       No                      Yes
        │                       │
        ▼                       ▼
┌───────────────────┐   ┌───────────────────┐
│   Astro Component │   │   React Component │
│   (.astro)        │   │   (.tsx)          │
│                   │   │                   │
│ - Static content  │   │ - Interactive     │
│ - Layout          │   │ - State mgmt      │
│ - SEO metadata    │   │ - Animations      │
│ - Server data     │   │ - Real-time       │
└───────────────────┘   └───────────────────┘
```

### Practical Comparison

| Scenario | Component Type | Example |
|------|---------|------|
| Page layout | Astro | `Layout.astro` |
| Article list (static) | Astro | `PostList.astro` |
| Navigation menu | Astro + React | `Navigator.astro` + `DropdownNav.tsx` |
| Theme toggle | Astro (inline script) | `ThemeToggle.astro` |
| Search dialog | React | `SearchDialog.tsx` |
| Sidebar TOC | React | `TableOfContents.tsx` |
| Paginator | Astro | `Paginator.astro` |

---

## Client Directives Explained

When React components need to be used in Astro pages, you must add `client:*` directives to activate JavaScript.

### Directive Types

```astro
<!-- Activate immediately on page load -->
<ThemeToggle client:load />

<!-- Activate when browser is idle -->
<MenuIcon client:idle />

<!-- Activate when component is visible -->
<SearchDialog client:visible />

<!-- Activate when media query matches -->
<MobileNav client:media="(max-width: 768px)" />

<!-- Client-side rendering only (skip SSR) -->
<ClientOnlyComponent client:only="react" />
```

### Selection Strategy

```typescript
// 1. Critical interactions - use client:load
// Features user needs immediately
<ThemeToggle client:load />
<Navigator client:load />

// 2. Non-critical features - use client:idle
// Features that can be deferred
<MenuIcon client:idle />

// 3. Off-viewport content - use client:visible
// Content requiring scroll to see
<Comments client:visible />
<FooterLinks client:visible />

// 4. Depends on browser API - use client:only
// Components that cannot be server-rendered
<WindowSizeDisplay client:only="react" />
```

### Application in Project

```astro
<!-- src/components/layout/Header.astro -->
---
import { MenuIcon } from '@components/ui/MenuIcon';
import Navigator from './Navigator.astro';
---

<!-- Static navigation bar -->
<Navigator transition:name="page-header" />

<!-- Mobile menu button - needs interaction -->
<MenuIcon
  client:load
  className="tablet:flex fixed top-0 left-3 z-52 hidden"
  id="mobile-menu-container"
/>
```

---

## Component Communication Patterns

### 1. Props Passing (Parent → Child)

Simplest communication method, suitable for simple data passing:

```astro
<!-- Parent component: PostPage.astro -->
---
const post = await getPost(slug);
---
<PostContent post={post} />
<SeriesNavigation client:load post={post} />

<!-- Child component: SeriesNavigation.tsx -->
interface SeriesNavigationProps {
  post: BlogPost;
}

const SeriesNavigation = ({ post }: SeriesNavigationProps) => {
  // Use post data
};
```

### 2. Nanostores (Global State)

State sharing across Astro/React boundaries:

```typescript
// src/store/ui.ts
import { atom } from 'nanostores';

export const drawerOpen = atom<boolean>(false);

export function toggleDrawer(): void {
  drawerOpen.set(!drawerOpen.get());
}
```

```tsx
// Use in React component
import { useStore } from '@nanostores/react';
import { drawerOpen, toggleDrawer } from '@store/ui';

const MenuIcon = () => {
  const isOpen = useStore(drawerOpen);

  return (
    <button onClick={toggleDrawer}>
      {isOpen ? 'Close' : 'Open'}
    </button>
  );
};
```

```astro
<!-- Listen in Astro component -->
<script>
  import { drawerOpen } from '@store/ui';

  drawerOpen.subscribe((isOpen) => {
    document.body.classList.toggle('drawer-open', isOpen);
  });
</script>
```

### 3. Custom Web Components

For complex Astro component internal state management:

```astro
<!-- src/components/layout/HomeSider.astro -->
<script>
  // Define Web Component
  class SiderContent extends HTMLElement {
    private infoContent: HTMLElement | null = null;
    private directoryContent: HTMLElement | null = null;

    connectedCallback() {
      this.infoContent = this.querySelector('[data-slot="info"]');
      this.directoryContent = this.querySelector('[data-slot="directory"]');
    }

    updateSlot(type: string) {
      this.infoContent?.classList.toggle('hidden', type !== 'INFO');
      this.directoryContent?.classList.toggle('hidden', type !== 'DIRECTORY');
    }
  }

  customElements.define('sider-content', SiderContent);
</script>

<sider-content>
  <div data-slot="info">...</div>
  <div data-slot="directory">...</div>
</sider-content>
```

---

## Error Boundary Design

### Basic Error Boundary

Used to catch JavaScript errors in the component tree:

```tsx
// src/components/common/ErrorBoundary.tsx
'use client';

import { ErrorBoundary as ErrorBoundaryLib } from 'react-error-boundary';
import { Button } from '../ui/button';

const FallbackComponent = () => {
  return (
    <div className="flex-center-y w-full gap-2 py-6">
      Oops, Something wrong! Please contact to{' '}
      <a href="mailto:i@flux-tech-repair@proton.me" className="text-blue-500">
        i@flux-tech-repair@proton.me
      </a>
      or
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </div>
  );
};

export const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ErrorBoundaryLib
      FallbackComponent={FallbackComponent}
      onError={(e) => console.error(e)}
    >
      {children}
    </ErrorBoundaryLib>
  );
};
```

### Floating UI Specific Error Boundary

Error handling for floating components like Popover, Tooltip:

```tsx
// src/components/common/FloatingErrorBoundary.tsx

/**
 * Floating component error boundary
 * Feature: Silent degradation on error (render null), doesn't affect main content
 */
class FloatingErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Print error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('FloatingErrorBoundary caught:', error, errorInfo);
    }
    // Can send to Sentry in production
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Floating component failed → silently return null
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/**
 * HOC: Quick component wrapping
 */
export function withFloatingErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <FloatingErrorBoundary componentName={componentName}>
      <Component {...props} />
    </FloatingErrorBoundary>
  );

  WrappedComponent.displayName =
    `withFloatingErrorBoundary(${componentName || Component.name})`;

  return WrappedComponent;
}
```

### Usage Examples

```tsx
// src/components/layout/DropdownNav.tsx

import { withFloatingErrorBoundary } from '@components/common/FloatingErrorBoundary';

const DropdownNavComponent = ({ item }: DropdownNavProps) => {
  // Component implementation...
};

// 1. Performance optimization: memo prevents unnecessary re-renders
const DropdownNav = memo(DropdownNavComponent);

// 2. Error isolation: HOC wrapping
const DropdownNavWithErrorBoundary = withFloatingErrorBoundary(
  DropdownNav,
  'DropdownNav'
);

export default DropdownNavWithErrorBoundary;
```

---

## Performance Optimization Tips

### 1. React.memo

Prevent unnecessary re-renders:

```tsx
// Before optimization
const DropdownNav = ({ item }: DropdownNavProps) => {
  // ...
};

// After optimization
const DropdownNavComponent = ({ item }: DropdownNavProps) => {
  // ...
};

const DropdownNav = memo(DropdownNavComponent);
```

### 2. useCallback

Stabilize function references:

```tsx
// Before optimization: creates new function on each render
const handleClick = () => {
  setIsOpen(!isOpen);
};

// After optimization: function reference stable
const handleClick = useCallback(() => {
  setIsOpen((prev) => !prev);
}, []);
```

### 3. Lazy Loading Directives

```astro
<!-- Defer off-viewport component loading -->
<Comments client:visible />

<!-- Load non-critical components when idle -->
<Analytics client:idle />
```

### 4. Conditional Rendering Optimization

```astro
---
// Server-side conditional rendering - produces no extra JS
const showSidebar = post.data.catalog;
---

{showSidebar && <TableOfContents client:visible headings={headings} />}
```

---

## Complete Component Example

### DropdownNav Component Analysis

```tsx
// src/components/layout/DropdownNav.tsx

import { memo } from 'react';
import Popover from '@components/ui/popover';
import { type Router } from '@constants/router';
import { useToggle } from '@hooks/useToggle';
import { Icon } from '@iconify/react';
import { cn } from '@lib/utils';
import { withFloatingErrorBoundary } from '@components/common/FloatingErrorBoundary';

interface DropdownNavProps {
  item: Router;
  className?: string;
}

const DropdownNavComponent = ({ item, className }: DropdownNavProps) => {
  // 1. Use custom Hook for toggle state management
  const { isOpen, setIsOpen } = useToggle({ defaultOpen: false });
  const { name, icon, children } = item;

  return (
    // 2. Use Popover component for dropdown effect
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-start"
      trigger="hover"
      render={() => (
        // 3. Dropdown menu content
        <div className="nav-dropdown flex flex-col items-center">
          {children?.map((child: Router, index) => (
            <a
              key={child.path}
              href={child.path}
              className={cn(
                'hover:bg-gradient-shoka-button px-4 py-2 transition-colors',
                {
                  // 4. Dynamic border radius
                  'rounded-ss-2xl': index === 0,
                  'rounded-ee-2xl': index === children.length - 1,
                  // 5. Highlight current route
                  'bg-gradient-shoka-button': window.location.pathname === child.path,
                },
              )}
            >
              {child.icon && <Icon icon={child.icon} />}
              {child.name}
            </a>
          ))}
        </div>
      )}
    >
      {/* 6. Trigger button */}
      <button
        className={cn('inline-flex items-center px-4 py-2', className)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${name} menu`}
      >
        {icon && <Icon icon={icon} />}
        {name}
        {/* 7. Arrow rotation animation */}
        <Icon
          icon="ri:arrow-drop-down-fill"
          className={cn('transition-transform', {
            'rotate-180': isOpen,
          })}
        />
      </button>
    </Popover>
  );
};

// 8. Performance optimization: memo
const DropdownNav = memo(DropdownNavComponent);

// 9. Error isolation: HOC
const DropdownNavWithErrorBoundary = withFloatingErrorBoundary(
  DropdownNav,
  'DropdownNav'
);

export default DropdownNavWithErrorBoundary;
```

### Key Design Points

1. **State Management**: Use `useToggle` custom Hook
2. **Composite Component**: Popover + trigger + content
3. **Style Composition**: `cn()` function merges Tailwind classes
4. **Accessibility**: ARIA attributes support
5. **Animations**: CSS transition for arrow rotation
6. **Performance**: memo prevents re-renders
7. **Error Handling**: HOC wraps error boundary

---

## Component Organization Structure

```
src/components/
├── common/              # Common utility components
│   ├── ErrorBoundary.tsx
│   └── FloatingErrorBoundary.tsx
│
├── layout/              # Layout components
│   ├── Header.astro         # Static header
│   ├── Navigator.astro      # Navigation container
│   ├── DropdownNav.tsx      # Dropdown navigation (interactive)
│   ├── HomeSider.astro      # Sidebar
│   └── MobileDrawer.astro   # Mobile drawer
│
├── ui/                  # Base UI components
│   ├── button.tsx
│   ├── popover.tsx
│   ├── card.tsx
│   └── ...
│
├── post/                # Post-related
│   ├── PostList.astro       # Static list
│   ├── PostItemCard.astro   # Static card
│   └── SeriesNavigation.tsx # Series navigation (interactive)
│
└── theme/               # Theme components
    └── ThemeToggle.astro
```

---

## Learning Key Points

1. **Component Type Selection**:
   - Static content → Astro component
   - Interactive features → React component
2. **Client Directives**:
   - `client:load` - Critical interactions
   - `client:idle` - Non-critical features
   - `client:visible` - Lazy loading
3. **Communication Patterns**:
   - Props - Simple data passing
   - Nanostores - Cross-component state
   - Web Components - Complex Astro internal state
4. **Error Handling**:
   - ErrorBoundary - Generic error catching
   - FloatingErrorBoundary - Floating UI silent degradation
5. **Performance Optimization**:
   - `memo()` - Prevent re-renders
   - `useCallback()` - Stable function references
   - Client directives - Control JS loading timing

---

## Related Files

| File | Description |
|------|------|
| `src/components/common/ErrorBoundary.tsx` | Generic error boundary |
| `src/components/common/FloatingErrorBoundary.tsx` | Floating UI error boundary |
| `src/components/layout/Header.astro` | Header component |
| `src/components/layout/DropdownNav.tsx` | Dropdown navigation |
| `src/components/layout/Navigator.astro` | Navigation container |
| `src/store/ui.ts` | UI state management |
| `src/hooks/useToggle.ts` | Toggle state Hook |
