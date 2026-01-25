# Animation System Design

## Overview

astro-koharu uses **Motion** (the successor to Framer Motion) as its animation library, combined with the design token system to provide a consistent animation experience.

### Animation Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Animation System Architecture            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Design Token Layer (design-tokens.ts)                     │
│   ├── duration - Duration times                             │
│   ├── easing - Easing functions                             │
│   └── spring - Spring configuration                         │
│              │                                              │
│              ▼                                              │
│   Preset Layer (anim/spring.ts)                             │
│   ├── microDampingPreset                                   │
│   └── microReboundPreset                                   │
│              │                                              │
│              ▼                                              │
│   Component Layer                                           │
│   ├── MenuIcon - Menu icon animation                        │
│   ├── Popover - Popover animation                           │
│   └── FlippedCard - Flipped card animation                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Motion Library Basics

### What is Motion?

Motion is the successor to Framer Motion, providing a declarative animation API:

```tsx
import { motion } from 'motion/react';

// Basic animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
/>

// Use variants
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
/>
```

### Core Concepts

| Concept | Description |
|---------|-------------|
| `motion.div` | Animatable DOM element |
| `initial` | Initial state |
| `animate` | Target state |
| `exit` | Exit state (requires AnimatePresence) |
| `transition` | Transition configuration |
| `variants` | Named state set |
| `whileHover` | Hover state |
| `whileTap` | Tap/click state |

---

## Animation Configuration in Design Tokens

### `src/constants/design-tokens.ts`

```typescript
export const animation = {
  // Duration (milliseconds)
  duration: {
    fast: 150,      // Quick feedback
    tween: 200,     // Transition
    normal: 250,    // Standard animation
    ui: 300,        // UI interaction
    slow: 350,      // Slow animation
    slower: 500,    // Slower
    flipCard: 600,  // Card flip
  },

  // CSS easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Bouncy effect
  },

  // Motion Spring configuration
  spring: {
    // Default Spring (balanced)
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },

    // Gentle Spring (smooth)
    gentle: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },

    // Wobbly Spring (bouncy)
    wobbly: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },

    // Stiff Spring (quick response)
    stiff: {
      type: 'spring',
      stiffness: 500,
      damping: 35,
    },

    // Slow Spring (relaxed)
    slow: {
      type: 'spring',
      stiffness: 150,
      damping: 20,
    },

    // Micro animation presets
    microDamping: {
      type: 'spring',
      stiffness: 200,
      damping: 13,
    },

    microRebound: {
      type: 'spring',
      stiffness: 200,
      damping: 9,
    },

    // Component-specific
    menu: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },

    popoverContent: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },

  // CSS transition string
  transition: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
```

### Spring Parameters Explanation

```
                    Spring Physics Model

                    ┌─────────┐
                    │  Mass   │
                    └────┬────┘
                         │
                    ╭────┴────╮
                    │  Spring │ ← stiffness (rigidity)
                    │  ~~~~   │   Higher = faster rebound
                    ╰────┬────╯
                         │
                    ┌────┴────┐
                    │ Damper  │ ← damping (dampening)
                    │  ≋≋≋≋  │   Higher = less oscillation
                    └─────────┘

stiffness = 300, damping = 30  →  Balanced elastic animation
stiffness = 500, damping = 35  →  Quick response, little bounce
stiffness = 400, damping = 20  →  Bouncy animation
```

---

## Common Animation Patterns

### 1. Menu Icon Animation (MenuIcon)

Animation of three lines transforming into an X:

```tsx
// src/components/ui/MenuIcon.tsx

const lineVariants: Variants = {
  closed: {
    rotate: 0,
    y: 0,
    opacity: 1,
  },
  opened: (lineIndex: number) => {
    switch (lineIndex) {
      case 1:
        // First line: rotate 45°, move down
        return {
          rotate: 45,
          y: 6,
          opacity: 1,
          transition: animation.spring.menu,
        };
      case 2:
        // Second line: fade out
        return {
          rotate: 0,
          y: 0,
          opacity: 0,
          transition: animation.spring.menu,
        };
      case 3:
        // Third line: rotate -45°, move up
        return {
          rotate: -45,
          y: -6,
          opacity: 1,
          transition: animation.spring.menu,
        };
    }
  },
};

// Control animation using useAnimation
const controls = useAnimation();

useEffect(() => {
  controls.start(isOpen ? 'opened' : 'closed');
}, [isOpen, controls]);

// Use in SVG
<motion.g variants={lineVariants} animate={controls} custom={1}>
  <line x1="3" y1="6" x2="21" y2="6" />
</motion.g>
```

**Animation Effect**:

```
Closed State (three lines)      Opened State (X)
    ─────────                    ╲
    ─────────         →          ╱
    ─────────
```

### 2. Popover Animation

```tsx
// src/components/ui/popover.tsx

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, originY: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={animation.spring.popoverContent}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

**Animation Effect**:

```
Enter animation:
opacity: 0 → 1
scale: 0.85 → 1

Exit animation:
opacity: 1 → 0
scale: 1 → 0.85
```

### 3. Flipped Card Animation

```tsx
// Use CSS 3D transform
const flipCardStyle = {
  perspective: '1000px',
};

const cardFrontStyle = {
  backfaceVisibility: 'hidden',
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
  transition: `transform ${animation.duration.flipCard}ms ${animation.easing.easeInOut}`,
};

const cardBackStyle = {
  backfaceVisibility: 'hidden',
  transform: isFlipped ? 'rotateY(0)' : 'rotateY(-180deg)',
  transition: `transform ${animation.duration.flipCard}ms ${animation.easing.easeInOut}`,
};
```

### 4. Hover and Tap Effects

```tsx
// Generic clickable element animation
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

---

## AnimatePresence Usage

### What is AnimatePresence?

`AnimatePresence` allows components to execute exit animations when removed from the React tree:

```tsx
import { AnimatePresence, motion } from 'motion/react';

function Modal({ isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}  // Execute on exit
        >
          Modal content
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Application in Project

```tsx
// Popover component
<AnimatePresence>
  {isOpen && (
    <FloatingPortal>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
      >
        {content}
      </motion.div>
    </FloatingPortal>
  )}
</AnimatePresence>
```

---

## Variants Pattern

### Defining Variants

```tsx
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,  // Children appear in sequence
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};
```

### Using Variants

```tsx
<motion.ul
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Custom Parameter

Used to pass different parameters to each child element:

```tsx
// Use function when defining
const lineVariants: Variants = {
  opened: (lineIndex: number) => ({
    rotate: lineIndex === 1 ? 45 : -45,
    y: lineIndex === 1 ? 6 : -6,
  }),
};

// Pass custom when using
<motion.g variants={lineVariants} custom={1}>...</motion.g>
<motion.g variants={lineVariants} custom={2}>...</motion.g>
<motion.g variants={lineVariants} custom={3}>...</motion.g>
```

---

## useAnimation Hook

### Manual Animation Control

```tsx
import { useAnimation } from 'motion/react';

function Component() {
  const controls = useAnimation();

  // Respond to state changes
  useEffect(() => {
    controls.start(isOpen ? 'opened' : 'closed');
  }, [isOpen, controls]);

  // Manual trigger
  const handleClick = async () => {
    await controls.start('hover');
    await controls.start('normal');
  };

  return (
    <motion.div animate={controls} variants={variants}>
      ...
    </motion.div>
  );
}
```

---

## CSS Animation vs Motion

### When to Use CSS Animation

```css
/* Simple state transitions */
.button {
  transition: transform 0.2s ease-out, background-color 0.2s ease-out;
}

.button:hover {
  transform: translateY(-2px);
  background-color: var(--primary-hover);
}
```

Applicable Scenarios:
- Simple hover effects
- Color/opacity transitions
- No JavaScript control needed

### When to Use Motion

```tsx
// Complex sequence animation
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}
  transition={{ duration: 0.3 }}
/>
```

Applicable Scenarios:
- Requires exit animation
- Complex sequence/stagger animation
- JavaScript control needed
- Layout animation (LayoutGroup)
- Gesture-driven animation

### Choice in Project

| Scenario | Choice | Reason |
|----------|--------|--------|
| Button hover | CSS | Simple transition |
| Menu icon | Motion | Complex path transformation |
| Popover | Motion | Requires exit animation |
| Link hover | CSS | Simple highlight |
| Card flip | CSS | 3D transform |
| List transition | Motion | Stagger effect |

---

## Accessibility Considerations

### prefers-reduced-motion

```tsx
import { useReducedMotion } from 'motion/react';

function Component() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
      }}
    />
  );
}
```

### CSS Media Query

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Learning Points

1. **Motion Basics**: `motion.div`, `initial`, `animate`, `exit`
2. **Spring Animation**: Understand `stiffness` and `damping` parameters
3. **Design Tokens**: Centralized animation configuration management
4. **Variants**: Named state sets, supports `staggerChildren`
5. **AnimatePresence**: Supports exit animation
6. **useAnimation**: Manual animation control
7. **Accessibility**: Use `useReducedMotion` or CSS media query

---

## Related Files

| File | Description |
|------|-------------|
| `src/constants/design-tokens.ts` | Animation design tokens |
| `src/constants/anim/spring.ts` | Spring presets |
| `src/components/ui/MenuIcon.tsx` | Menu icon animation |
| `src/components/ui/popover.tsx` | Popover animation |
| `src/components/post/FlippedCard.astro` | Flipped card |
