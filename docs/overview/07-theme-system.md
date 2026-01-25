# Theme System Implementation

## Overview

astro-koharu implements complete dark/light theme switching functionality, including:

1. **FOUC Prevention**: Prevent theme flickering during page load
2. **localStorage Persistence**: Remember user preferences
3. **System Theme Following**: Follow system settings by default
4. **View Transitions Animation**: Circular diffusion animation for theme switching
5. **Astro Page Transition Compatibility**: Ensure theme persists after page transitions

---

## Theme Switching Principles

### Overall Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  Theme System Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Page Load (HTML parsing phase)                           │
│     - Inline script executes immediately                     │
│     - Check localStorage.theme                              │
│     - Check prefers-color-scheme                            │
│     - Set <html class="dark/light">                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Page Rendering                                           │
│     - CSS variables apply based on .dark/.light classes      │
│     - ThemeToggle component initializes                      │
│     - checkbox state syncs                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. User Switches Theme                                      │
│     - checkbox state changes                                 │
│     - View Transitions API triggers                          │
│     - Circular diffusion animation                           │
│     - localStorage updates                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Astro Page Transition                                    │
│     - astro:page-load event                                  │
│     - Re-check theme                                         │
│     - Re-bind events                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## FOUC Prevention

### What is FOUC?

**FOUC** (Flash of Unstyled Content) refers to the momentary display of the wrong theme during page load because the theme state isn’t applied in time.

### Solution: Inline Script

Use the `is:inline` script in the `<head>` of `Layout.astro`:

```astro
<!-- src/layouts/Layout.astro -->
<head>
  <!-- Execute immediately, complete before DOM rendering -->
  <script is:inline>
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
       window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  </script>
</head>
```

### Why use `is:inline`?

| Feature | Normal Script | `is:inline` Script |
|------|---------|-----------------|
| Execution Timing | Delayed | Immediate |
| Bundle Processing | Bundled | Kept as-is |
| Render Blocking | No | Yes (brief) |
| Use Case | Functional scripts | Critical initialization |

---

## ThemeToggle Component

### Complete Implementation

```astro
<!-- src/components/theme/ThemeToggle.astro -->

<!-- Toggle button UI -->
<div
  class="theme-toggle scale-80 cursor-pointer transition duration-300 hover:scale-90"
  id="theme-toggle-btn"
  role="button"
  tabindex="0"
  aria-label="toggle theme"
>
  <label class="toggle" aria-label="toggle theme">
    <input type="checkbox" id="theme-checkbox" />
    <div></div>
  </label>
</div>

<script>
  function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const checkbox = document.getElementById('theme-checkbox') as HTMLInputElement | null;
    if (!toggleBtn || !checkbox) return;

    // Prevent duplicate event binding (script re-runs during Astro page transitions)
    if (toggleBtn.dataset.listenerAttached === 'true') return;

    const rootElement = document.documentElement;

    // Sync checkbox state with current theme
    const isDarkMode = rootElement.classList.contains('dark');
    checkbox.checked = isDarkMode;

    function toggleTheme() {
      if (!checkbox) return;
      const isDark = checkbox.checked;

      // Get button position as animation start point
      const toggleElement = document.querySelector('.theme-toggle');
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;

      if (toggleElement) {
        const rect = toggleElement.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      // Add theme transition class
      rootElement.classList.add('theme-transition');

      // Check if browser supports View Transitions API
      if (!document.startViewTransition) {
        // Fallback handling
        applyTheme(isDark);
        setTimeout(() => {
          rootElement.classList.remove('theme-transition');
        }, 100);
        return;
      }

      // Use View Transitions API
      const transition = document.startViewTransition(() => {
        applyTheme(isDark);
      });

      // Set animation start point
      transition.ready
        .then(() => {
          rootElement.style.setProperty('--x', `${x}px`);
          rootElement.style.setProperty('--y', `${y}px`);
        })
        .catch(console.error);

      // Cleanup
      transition.finished
        .then(() => rootElement.classList.remove('theme-transition'))
        .catch(() => rootElement.classList.remove('theme-transition'));
    }

    function applyTheme(isDark: boolean): void {
      if (isDark) {
        rootElement.classList.add('dark');
        rootElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      } else {
        rootElement.classList.remove('dark');
        rootElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
    }

    checkbox.addEventListener('change', toggleTheme);
    toggleBtn.dataset.listenerAttached = 'true';
  }

  // First load
  setupThemeToggle();

  // Re-setup after Astro page transition
  document.addEventListener('astro:page-load', setupThemeToggle);
</script>
```

### Key Code Analysis

#### 1. Prevent Duplicate Binding

```javascript
if (toggleBtn.dataset.listenerAttached === 'true') return;
// ...
toggleBtn.dataset.listenerAttached = 'true';
```

During Astro page transitions, scripts are re-executed. We need to prevent event listener duplication.

#### 2. View Transitions API

```javascript
const transition = document.startViewTransition(() => {
  applyTheme(isDark);
});

transition.ready.then(() => {
  rootElement.style.setProperty('--x', `${x}px`);
  rootElement.style.setProperty('--y', `${y}px`);
});

```

The View Transitions API allows creating smooth transition animations when DOM changes.

#### 3. Astro Page Transition Compatibility

```javascript
document.addEventListener('astro:page-load', setupThemeToggle);
```

After each Astro page transition completes, re-initialize the component.

---

## Sun/Moon Animation

### CSS Implementation

```css
/* Default state (light mode): Sun */
.toggle input + div {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  position: relative;
  /* Use box-shadow to create sun body */
  box-shadow: inset 16px -16px 0 0 var(--theme-toggle-color, #ffbb52);
  transform: scale(1) rotate(-2deg);
  transition:
    box-shadow 0.5s ease 0s,
    transform 0.4s ease 0.1s;
}

/* Sun rays (8 rays) */
.toggle input + div:after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  /* Use multiple box-shadows to create rays */
  box-shadow:
    0 -23px 0 var(--theme-toggle-color),     /* top */
    0 23px 0 var(--theme-toggle-color),      /* bottom */
    23px 0 0 var(--theme-toggle-color),      /* right */
    -23px 0 0 var(--theme-toggle-color),     /* left */
    15px 15px 0 var(--theme-toggle-color),   /* bottom-right */
    -15px 15px 0 var(--theme-toggle-color),  /* bottom-left */
    15px -15px 0 var(--theme-toggle-color),  /* top-right */
    -15px -15px 0 var(--theme-toggle-color); /* top-left */
  transform: scale(0);  /* Initially hidden */
  transition: all 0.3s ease;
}

/* Checked state (dark mode): Moon */
.toggle input:checked + div {
  /* Larger inset shadow forms moon shape */
  box-shadow: inset 32px -32px 0 0 var(--theme-background-color, #17181c);
  transform: scale(0.5) rotate(0deg);
}

/* Moon circular background */
.toggle input:checked + div:before {
  background: var(--theme-toggle-color, #ffbb52);
}

/* Enlarge rays in dark mode */
.toggle input:checked + div:after {
  transform: scale(1.5);
}
```

### Animation Effect Diagram

```
Light Mode (Sun)           Dark Mode (Moon)
    ·  ·  ·                 ╭──────╮
   ·  ╭──╮  ·              │      │
  ·  │    │  ·      ──→    │   ○  │
   ·  ╰──╯  ·              │      │
    ·  ·  ·                 ╰──────╯

  Yellow circle + 8 rays      Circle + inset shadow
```

---

## View Transitions Circular Diffusion Animation

### CSS Configuration

```css
/* src/styles/theme/theme-transition.css */

/* Special animation for theme switching */
.theme-transition::view-transition-old(root),
.theme-transition::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* Old view fades out */
.theme-transition::view-transition-old(root) {
  z-index: 1;
}

/* New view circular diffusion */
.theme-transition::view-transition-new(root) {
  z-index: 9999;
  /* Circular clip-path starting from button position */
  clip-path: circle(0% at var(--x, 50%) var(--y, 50%));
  animation: theme-clip 0.5s ease-out forwards;
}

@keyframes theme-clip {
  from {
    clip-path: circle(0% at var(--x, 50%) var(--y, 50%));
  }
  to {
    clip-path: circle(150% at var(--x, 50%) var(--y, 50%));
  }
}
```

### Animation Principle

```
1. Click theme toggle button
   ┌─────────────────────┐
   │                     │
   │         ●          │  ← Click position (--x, --y)
   │                     │
   └─────────────────────┘

2. Circle starts diffusing
   ┌─────────────────────┐
   │      ╭────╮         │
   │     │  ●  │        │  ← circle(10%)
   │      ╰────╯         │
   └─────────────────────┘

3. Continue expanding
   ┌─────────────────────┐
   │ ╭──────────────╮    │
   │ │       ●      │    │  ← circle(50%)
   │ ╰──────────────╯    │
   └─────────────────────┘

4. Cover entire page
   ┌─────────────────────┐
   │                     │
   │         ●          │  ← circle(150%)
   │                     │
   └─────────────────────┘
```

---

## Astro Page Transition Compatibility

### Problem

Astro's View Transitions don't trigger a full page refresh, which can cause:
- Theme state may not sync
- Event listeners may be lost

### Solution

```javascript
// Layout.astro - Check theme after each page load
<script>
  function checkTheme() {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
       window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }

  // Check theme on every page load (including transitions)
  document.addEventListener('astro:page-load', checkTheme);
</script>
```

---

## localStorage Persistence

### Storage Structure

```javascript
// Key: 'theme'
// Value: 'dark' | 'light' | undefined

localStorage.setItem('theme', 'dark');   // Dark mode
localStorage.setItem('theme', 'light');  // Light mode
localStorage.removeItem('theme');         // Follow system
```

### Priority

```javascript
// Check order
if (localStorage.theme === 'dark') {
  // 1. User explicitly chose dark
} else if (localStorage.theme === 'light') {
  // 2. User explicitly chose light
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  // 3. System prefers dark
} else {
  // 4. Default to light
}
```

---

## CSS Variable System

### Theme Variable Definition

```css
/* src/styles/theme/index.css */

/* Light mode variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

/* Dark mode variables */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... more variables */
}
```

### Using Variables

```css
/* Use in Tailwind CSS */
.bg-background {
  background-color: hsl(var(--background));
}

.text-foreground {
  color: hsl(var(--foreground));
}

/* Use in custom CSS */
.custom-element {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
}
```

---

## Accessibility Support

### ARIA Attributes

```html
<div
  role="button"
  tabindex="0"
  aria-label="toggle theme"
>
  <label aria-label="toggle theme">
    <input type="checkbox" />
  </label>
</div>
```

### Keyboard Support

```javascript
// Support Enter and Space keys to toggle
toggleBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    checkbox.click();
  }
});
```

---

## Learning Points

1. **FOUC Prevention**: Use `is:inline` script to set theme before rendering
2. **View Transitions API**: Implement circular diffusion animation effect
3. **localStorage**: Persist user theme preferences
4. **System Theme Following**: Use `prefers-color-scheme` media query
5. **Astro Compatibility**: Listen to `astro:page-load` events
6. **CSS box-shadow**: Create sun/moon icon animation
7. **CSS Variables**: Achieve unified theme color management

---

## Related Files

| File | Description |
|------|-------------|
| `src/components/theme/ThemeToggle.astro` | Theme toggle component |
| `src/layouts/Layout.astro` | Theme initialization script |
| `src/styles/theme/index.css` | Theme CSS variables |
| `src/styles/theme/theme-transition.css` | Theme transition animation |
