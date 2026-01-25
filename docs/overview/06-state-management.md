# State Management (Nanostores)

## Why Nanostores?

astro-koharu uses **Nanostores** for global state management instead of more popular Redux or Zustand. Here's why:

| Feature | Nanostores | Redux | Zustand |
|---------|-----------|-------|----------|\n| Size | ~1KB | ~7KB | ~3KB |
| Framework Agnostic | Yes | No | No |
| Astro Support | Native | Requires Adaptation | Requires Adaptation |
| Learning Curve | Very Low | High | Medium |
| Boilerplate | Almost None | Lots | Some |

### Core Advantages

1. **Ultra Lightweight**: Less than 1KB when compressed
2. **Framework Agnostic**: Works in both Astro and React
3. **Simple API**: Just `atom` and `useStore`
4. **No Provider**: No need to wrap root component
5. **TypeScript Friendly**: Complete type inference

---

## Basic Concepts

### Atom (Atomic State)

Atom is the basic state unit that stores a single value:

```typescript
import { atom } from 'nanostores';

// Create an atom
const count = atom<number>(0);

// Read value
console.log(count.get());  // 0

// Set value
count.set(1);

// Subscribe to changes
const unsubscribe = count.subscribe((value) => {
  console.log('New value:', value);
});

// Unsubscribe
unsubscribe();
```

### Using in React

```tsx
import { useStore } from '@nanostores/react';
import { count } from './store';

function Counter() {
  // useStore triggers rerender when atom changes
  const value = useStore(count);

  return (
    <div>
      <p>Count: {value}</p>
      <button onClick={() => count.set(value + 1)}>+1</button>
    </div>
  );
}
```

---

## State Architecture in Project

```
src/store/
├── app.ts      # Application state (sidebar type, etc.)
└── ui.ts       # UI state (drawer, menu, search, etc.)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Nanostores State Layer                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   app.ts                         ui.ts                      │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ homeSiderSegmentType                                │   │
│   │ homeSiderType                                       │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ drawerOpen                                          │   │
│   │ mobileMenuOpen                                      │   │
│   │ modalOpen                                           │   │
│   │ searchOpen                                          │   │
│   │                                                     │   │
│   │ toggleDrawer()                                      │   │
│   │ openDrawer()                                        │   │
│   │ closeDrawer()                                       │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   React Components              Astro Components            │
│   ┌─────────────────────────┐   ┌─────────────────────────┐ │
│   │ MenuIcon.tsx            │   │ HomeSider.astro         │ │
│   │ DropdownNav.tsx         │   │ MobileDrawer.astro      │ │
│   │ SearchDialog.tsx        │   │ FloatingGroup.astro     │ │
│   └─────────────────────────┘   └─────────────────────────┘ │
│          │                              │                   │
│          │  useStore()                  │  subscribe()      │
│          └──────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## UI State Details

### `src/store/ui.ts`

```typescript
/**
 * Global UI State Management
 *
 * Global state based on Nanostores, used for UI components that need to communicate
 * across Astro/React boundaries. Replaces the previous CustomEvent pattern,
 * providing better type safety and reactivity.
 */

import { atom } from 'nanostores';

/**
 * Mobile drawer state
 * Controls sidebar visibility
 * Used by MenuIcon, HomeSider, FloatingGroup
 */
export const drawerOpen = atom<boolean>(false);

/**
 * Mobile menu state
 * Controls responsive navigation menu visibility
 */
export const mobileMenuOpen = atom<boolean>(false);

/**
 * Modal state
 * Generic modal state for future use
 */
export const modalOpen = atom<boolean>(false);

/**
 * Search modal state
 * Controls search box visibility
 */
export const searchOpen = atom<boolean>(false);

/**
 * Convenience function - Toggle drawer state
 */
export function toggleDrawer(): void {
  drawerOpen.set(!drawerOpen.get());
}

/**
 * Convenience function - Open drawer
 */
export function openDrawer(): void {
  drawerOpen.set(true);
}

/**
 * Convenience function - Close drawer
 */
export function closeDrawer(): void {
  drawerOpen.set(false);
}

/**
 * Convenience function - Toggle mobile menu
 */
export function toggleMobileMenu(): void {
  mobileMenuOpen.set(!mobileMenuOpen.get());
}

/**
 * Convenience function - Toggle modal
 */
export function toggleModal(): void {
  modalOpen.set(!modalOpen.get());
}

/**
 * Convenience function - Toggle search box
 */
export function toggleSearch(): void {
  searchOpen.set(!searchOpen.get());
}
```

### State Descriptions

| State | Type | Purpose |
|-------|------|----------|
| `drawerOpen` | `boolean` | Mobile sidebar drawer |
| `mobileMenuOpen` | `boolean` | Mobile navigation menu |
| `modalOpen` | `boolean` | Generic modal |
| `searchOpen` | `boolean` | Search dialog |

---

## Application State Details

### `src/store/app.ts`

```typescript
import { HomeSiderSegmentType, HomeSiderType } from '@constants/enum';
import { atom } from 'nanostores';

/**
 * Sidebar segment type
 * Controls which content type sidebar displays (info/directory/series)
 */
export const homeSiderSegmentType = atom<HomeSiderSegmentType>(
  HomeSiderSegmentType.INFO
);

/**
 * Sidebar type
 * Controls sidebar overall mode (home/post/none)
 */
export const homeSiderType = atom<HomeSiderType>(HomeSiderType.HOME);
```

### Enum Definitions

```typescript
// src/constants/enum.ts

export enum HomeSiderSegmentType {
  INFO = 'INFO',           // Info panel
  DIRECTORY = 'DIRECTORY', // Directory navigation
  SERIES = 'SERIES',       // Series articles
}

export enum HomeSiderType {
  HOME = 'HOME',  // Home mode
  POST = 'POST',  // Post page mode
  NONE = 'NONE',  // No sidebar
}
```

---

## Using in React Components

### MenuIcon Component Example

```tsx
// src/components/ui/MenuIcon.tsx
'use client';

import { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useStore } from '@nanostores/react';
import { drawerOpen, toggleDrawer } from '@store/ui';

const MenuIcon = ({ className, id }: MenuIconProps) => {
  // 1. Subscribe to state
  const isOpen = useStore(drawerOpen);
  const controls = useAnimation();

  // 2. Trigger animation when state changes
  useEffect(() => {
    controls.start(isOpen ? 'opened' : 'closed');
  }, [isOpen, controls]);

  // 3. Toggle state on click
  const handleToggle = () => {
    toggleDrawer();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <svg>
        <motion.g variants={lineVariants} animate={controls} custom={1}>
          <line x1="3" y1="6" x2="21" y2="6" />
        </motion.g>
        {/* More lines... */}
      </svg>
    </button>
  );
};
```

### Key Points

1. **`useStore`**: Automatically subscribes to atom changes, component rerenders when state updates
2. **`toggleDrawer()`**: Use convenience functions instead of direct `set`
3. **Two-Way Binding**: UI reflects state, clicking changes state

---

## Using in Astro Components

### Using `<script>` Tag

```astro
<!-- src/components/layout/MobileDrawer.astro -->
<div id="mobile-drawer" class="hidden">
  <!-- Drawer content -->
</div>

<script>
  import { drawerOpen } from '@store/ui';

  // Subscribe to state changes
  drawerOpen.subscribe((isOpen) => {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) {
      drawer.classList.toggle('hidden', !isOpen);
    }
  });
</script>
```

### Using React Islands

```astro
<!-- src/components/layout/HomeSider.astro -->
---
import { HomeSiderSegmented } from './HomeSiderSegmented';
---

<div class="sider-container">
  <!-- React component handles interaction -->
  <HomeSiderSegmented
    client:load
    defaultValue={defaultSegmentType}
  />

  <!-- Static content -->
  <div class="sider-content">
    <slot />
  </div>
</div>
```

---

## State Communication Flow

### Scenario: Click Menu Icon to Open Drawer

```
┌─────────────────────────────────────────────────────────────┐
│  1. User clicks MenuIcon                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. toggleDrawer() is called                                 │
│     drawerOpen.set(!drawerOpen.get())                       │
│     drawerOpen: false → true                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. All subscribers are notified                             │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ MenuIcon.tsx    │  │ MobileDrawer    │                  │
│  │ useStore() fires│  │ subscribe() fires                 │
│  │ rerender        │  │ DOM update      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. UI Updates                                               │
│  - MenuIcon animates to X shape                              │
│  - MobileDrawer slides in                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. State Granularity

Each atom stores only one concern:

```typescript
// ✅ Good: Fine-grained state
export const drawerOpen = atom<boolean>(false);
export const searchOpen = atom<boolean>(false);

// ❌ Bad: Coarse-grained state
export const uiState = atom({
  drawerOpen: false,
  searchOpen: false,
  // More...
});
```

### 2. Convenience Functions

Provide convenience functions for common operations:

```typescript
// ✅ Good: Provide semantic functions
export function toggleDrawer(): void {
  drawerOpen.set(!drawerOpen.get());
}

// Usage
toggleDrawer();

// ❌ Bad: Direct operation
drawerOpen.set(!drawerOpen.get());
```

### 3. Type Safety

Use TypeScript generics to ensure type safety:

```typescript
// Atom with generics
export const homeSiderType = atom<HomeSiderType>(HomeSiderType.HOME);

// Type checking
homeSiderType.set(HomeSiderType.POST);  // ✅
homeSiderType.set('invalid');           // ❌ Type error
```

### 4. Component Decoupling

Separate state logic from component logic:

```typescript
// store/ui.ts - State definition
export const drawerOpen = atom<boolean>(false);
export function toggleDrawer(): void { /* ... */ }

// MenuIcon.tsx - Only concerns UI
const MenuIcon = () => {
  const isOpen = useStore(drawerOpen);
  return <button onClick={toggleDrawer}>...</button>;
};
```

---

## Comparison with Previous Solutions

### CustomEvent Pattern (Old)

```javascript
// Dispatch event
window.dispatchEvent(new CustomEvent('drawer-toggle', { detail: true }));

// Listen for event
window.addEventListener('drawer-toggle', (e) => {
  const isOpen = e.detail;
  // Update UI
});
```

**Problems**:
- No type safety
- Hard to trace state
- Easy memory leaks

### Nanostores Pattern (New)

```typescript
// Update state
drawerOpen.set(true);

// Subscribe to state
const unsubscribe = drawerOpen.subscribe((isOpen) => {
  // Update UI
});
```

**Advantages**:
- Complete type inference
- State is traceable
- Automatic cleanup of subscriptions

---

## Learning Key Points

1. **Nanostores Basics**: `atom` creates state, `useStore` subscribes to state
2. **Cross-Framework Communication**: React uses `useStore`, Astro uses `subscribe`
3. **State Granularity**: Each atom stores only one value
4. **Convenience Functions**: Wrap common operations to improve readability
5. **Type Safety**: Use generics to ensure state types are correct
6. **Alternative Solution**: Safer and easier to maintain than CustomEvent

---

## Related Files

| File | Description |
|------|-------------|
| `src/store/app.ts` | Application state |
| `src/store/ui.ts` | UI state |
| `src/constants/enum.ts` | State enums |
| `src/components/ui/MenuIcon.tsx` | Component example using state |
| `src/components/layout/MobileDrawer.astro` | Using state in Astro |
