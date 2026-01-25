# UI Component Library Implementation

## Design Philosophy

The UI component library in jeet-u follows the design philosophy of **shadcn/ui**:

1. **Components as Code**: Components are placed directly in the project and fully customizable
2. **CVA Variant System**: Use class-variance-authority to manage style variants
3. **Radix UI Foundation**: Built on unstyled Radix UI primitives
4. **Tailwind Styling**: Use Tailwind CSS atomic classes to define styles
5. **Type Safe**: Complete TypeScript support

```
┌─────────────────────────────────────────────────────────────┐
│                  Component Hierarchy                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Business Components                                       │
│   ├── DropdownNav                                           │
│   ├── SearchDialog                                          │
│   └── SeriesNavigation                                      │
│              │                                              │
│              ▼                                              │
│   UI Components (src/components/ui/)                        │
│   ├── Button  ─────────┬──→ CVA Variant System             │
│   ├── Popover ─────────┼──→ Floating UI                    │
│   ├── Card    ─────────┼──→ Compound Components            │
│   └── Dialog  ─────────┼──→ Radix UI                       │
│              │         │                                    │
│              ▼         ▼                                    │
│   Utility Functions                                         │
│   └── cn() ← clsx + tailwind-merge                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Utility Functions

### `cn()` Function

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Function Explanation**:

1. **`clsx`**: Merge multiple class names, support conditional class names
2. **`twMerge`**: Intelligently merge Tailwind classes, avoid conflicts

**Usage Examples**:

```tsx
// Basic merge
cn('px-4 py-2', 'text-white')
// → 'px-4 py-2 text-white'

// Conditional class names
cn('base-class', {
  'active-class': isActive,
  'disabled-class': isDisabled,
})
// → 'base-class active-class' (when isActive is true)

// Conflict resolution (twMerge's role)
cn('px-4', 'px-6')  // → 'px-6' (latter overrides)
cn('text-red-500', 'text-blue-500')  // → 'text-blue-500'

// Real usage
<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  className  // Allow external override
)}>
```

---

## Button Component

### CVA Variant System

```tsx
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

// Define variants
const buttonVariants = cva(
  // Base styles (shared by all variants)
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // Appearance variants
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        'gradient-shoka': 'bg-gradient-shoka-button text-primary-foreground',
      },
      // Size variants
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    // Default variants
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
```

### Component Implementation

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When asChild is true, Button's styles apply to child elements
   * Commonly used to wrap Link components
   */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // When asChild is true, use Slot to render child element
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Usage Examples

```tsx
// Basic usage
<Button variant="default" size="md">
  Click me
</Button>

// Different variants
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="gradient-shoka">Gradient Button</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// asChild pattern (wrap Link)
<Button asChild>
  <a href="/about">About</a>
</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

---

## Popover Component

### Core Features

Popover is a complex floating UI component that integrates multiple libraries:

- **Floating UI**: Precise positioning
- **Motion**: Animation effects
- **Custom Hooks**: State management

### Complete Implementation

```tsx
// src/components/ui/popover.tsx
import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import { useControlledState } from '@hooks/useControlledState';
import { useFloatingUI } from '@hooks/useFloatingUI';
import { AnimatePresence, motion, type MotionProps } from 'motion/react';
import React, { cloneElement } from 'react';
import { animation } from '@constants/design-tokens';
import { withFloatingErrorBoundary } from '@components/common/FloatingErrorBoundary';

type PopoverProps = {
  /** Controlled mode: whether open */
  open?: boolean;
  /** State change callback */
  onOpenChange?: (open: boolean) => void;
  /** Render popup content */
  render: (data: { close: () => void }) => React.ReactNode;
  /** Position direction */
  placement?: Placement;
  /** Trigger element */
  children: React.JSX.Element;
  /** Custom styles */
  className?: string;
  /** Offset distance */
  offset?: number;
  /** Custom animation */
  motionProps?: MotionProps;
  /** Trigger method */
  trigger?: 'click' | 'hover';
};

function Popover({
  children,
  render,
  open: passedOpen,
  placement,
  onOpenChange,
  className,
  offset: offsetNum = 10,
  motionProps,
  trigger = 'click',
}: React.PropsWithChildren<PopoverProps>) {
  // 1. State management (support controlled/uncontrolled)
  const [isOpen, setIsOpen] = useControlledState({
    value: passedOpen,
    defaultValue: false,
    onChange: onOpenChange,
  });

  // 2. Floating positioning
  const { refs, floatingStyles, context } = useFloatingUI({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    offset: offsetNum,
    transform: false,
  });

  // 3. Interaction handling
  const hover = useHover(context, {
    enabled: trigger === 'hover',
    delay: { open: 0, close: animation.duration.fast },
  });
  const click = useClick(context, {
    enabled: trigger === 'click',
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    click,
    useDismiss(context),  // Close on outside click
    useRole(context),     // ARIA role
  ]);

  return (
    <>
      {/* 4. Trigger element */}
      {cloneElement(
        children,
        getReferenceProps({ ref: refs.setReference, ...children.props })
      )}

      {/* 5. Popup content (with animation) */}
      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <motion.div
                className={cn(
                  'z-10 rounded-ss-2xl rounded-ee-2xl bg-black/30 backdrop-blur-sm',
                  className
                )}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1, originY: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={animation.spring.popoverContent}
                style={{ ...floatingStyles }}
                {...motionProps}
                {...getFloatingProps({ ref: refs.setFloating })}
              >
                {render({ close: () => setIsOpen(false) })}
              </motion.div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </>
  );
}

// 6. Wrap with error boundary + memo optimization
const PopoverWithErrorBoundary = withFloatingErrorBoundary(Popover, 'Popover');
export default React.memo(PopoverWithErrorBoundary);
```

### Architecture Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Popover Component                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  State Layer                                                │
│  └── useControlledState → Support controlled/uncontrolled   │
│                                                             │
│  Positioning Layer                                          │
│  └── useFloatingUI → Floating UI configuration             │
│      ├── Auto-flip                                         │
│      ├── Boundary detection                                │
│      └── Offset calculation                                │
│                                                             │
│  Interaction Layer                                          │
│  └── useInteractions                                       │
│      ├── useHover → hover trigger                          │
│      ├── useClick → click trigger                          │
│      ├── useDismiss → close on outside click               │
│      └── useRole → ARIA role                               │
│                                                             │
│  Render Layer                                               │
│  ├── FloatingPortal → transport to body                    │
│  ├── FloatingFocusManager → focus management               │
│  └── motion.div → animation effects                        │
│                                                             │
│  Safety Layer                                               │
│  └── withFloatingErrorBoundary → error isolation           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Usage Examples

```tsx
// Hover-triggered dropdown menu
<Popover
  trigger="hover"
  placement="bottom-start"
  render={({ close }) => (
    <div className="flex flex-col">
      <a href="/about" onClick={close}>About</a>
      <a href="/contact" onClick={close}>Contact</a>
    </div>
  )}
>
  <button>Menu</button>
</Popover>

// Click-triggered popup
<Popover
  trigger="click"
  placement="bottom"
  offset={15}
  render={({ close }) => (
    <div className="p-4">
      <p>Popup content</p>
      <Button onClick={close}>Close</Button>
    </div>
  )}
>
  <Button>Open Popup</Button>
</Popover>

// Controlled mode
const [isOpen, setIsOpen] = useState(false);

<Popover
  open={isOpen}
  onOpenChange={setIsOpen}
  render={() => <div>Content</div>}
>
  <Button>Trigger</Button>
</Popover>
```

---

## Card Component

### Compound Component Pattern

Card uses the compound component pattern, breaking complex components into multiple sub-components:

```tsx
// src/components/ui/card.tsx
import * as React from 'react';
import { cn } from '@lib/utils';

// Main container
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-card text-card-foreground rounded-lg border shadow-xs',
        className
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

// Header area
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

// Title
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl leading-none font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

// Description
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  ),
);
CardDescription.displayName = 'CardDescription';

// Content area
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

// Footer area
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
```

### Usage Examples

```tsx
// Complete card
<Card>
  <CardHeader>
    <CardTitle>Article Title</CardTitle>
    <CardDescription>Brief description of the article</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Article content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>Read More</Button>
  </CardFooter>
</Card>

// Simple card
<Card>
  <CardContent className="pt-6">
    <p>Simple content</p>
  </CardContent>
</Card>

// Custom styling
<Card className="border-primary">
  <CardHeader className="bg-primary/10">
    <CardTitle className="text-primary">Featured Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

---

## useControlledState Hook

### Unified Controlled/Uncontrolled Mode

```tsx
// src/hooks/useControlledState.ts

export interface UseControlledStateOptions<T> {
  /** Controlled value */
  value?: T;
  /** Uncontrolled default value */
  defaultValue?: T;
  /** Value change callback */
  onChange?: (value: T) => void;
}

export function useControlledState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControlledStateOptions<T>): [T | undefined, (value: T) => void] {
  // Determine if controlled mode
  const isControlled = controlledValue !== undefined;
  const isControlledRef = useRef(isControlled);

  // Development warning: mode switching
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (isControlled !== isControlledRef.current) {
        console.warn(
          'useControlledState: switched from' +
          `${isControlledRef.current ? 'controlled' : 'uncontrolled'} to` +
          `${isControlled ? 'controlled' : 'uncontrolled'} mode, this is an anti-pattern.`
        );
      }
    }
    isControlledRef.current = isControlled;
  }, [isControlled]);

  // Uncontrolled mode internal state
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Returned value
  const value = isControlled ? controlledValue : internalValue;

  // Value setter function
  const setValue = useCallback(
    (newValue: T) => {
      // Uncontrolled mode: update internal state
      if (!isControlled) {
        setInternalValue(newValue);
      }
      // Both modes call onChange
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
```

### Use Cases

```tsx
// Component supports two modes
function Dropdown({ value, defaultValue, onChange }) {
  const [selectedValue, setSelectedValue] = useControlledState({
    value,
    defaultValue,
    onChange,
  });

  return (
    <select
      value={selectedValue}
      onChange={(e) => setSelectedValue(e.target.value)}
    >
      {/* options */}
    </select>
  );
}

// Uncontrolled usage
<Dropdown defaultValue="option1" />

// Controlled usage
const [value, setValue] = useState('option1');
<Dropdown value={value} onChange={setValue} />
```

---

## Component Design Principles

### 1. forwardRef Pattern

All UI components use `forwardRef` to forward ref:

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <button ref={ref} {...props} />;
  }
);
```

### 2. displayName Configuration

Convenient for DevTools debugging:

```tsx
Button.displayName = 'Button';
```

### 3. Type Export Pattern

Export Props type for external use:

```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export { Button, type ButtonProps };
```

### 4. Default Value Handling

Use `??` or `defaultVariants` to handle default values:

```tsx
const Comp = asChild ? Slot : 'button';
const offset = offsetNum ?? 10;
```

---

## UI Component List

```
src/components/ui/
├── button.tsx      # Button component (CVA variant example)
├── card.tsx        # Card component (Compound component example)
├── popover.tsx     # Popover (Floating UI example)
├── tooltip.tsx     # Tooltip
├── badge.tsx       # Badge
├── avatar.tsx      # Avatar
├── divider.tsx     # Divider
├── segmented.tsx   # Segmented controller
├── MenuIcon.tsx    # Menu icon (animated)
├── dialog/         # Dialog
├── cover/          # Cover component
├── loading/        # Loading component
├── navigator/      # Navigator component
└── segmented/      # Segmented controller
```

---

## Learning Key Points

1. **CVA Variant System**: Use class-variance-authority to manage style variants
2. **cn() Function**: clsx + tailwind-merge intelligently merge class names
3. **Compound Component Pattern**: Card is split into multiple sub-components for flexible composition
4. **Controlled/Uncontrolled Unified**: useControlledState allows components to support both modes
5. **Floating UI Integration**: Popover demonstrates best practices for floating positioning
6. **forwardRef**: All UI components should forward ref
7. **Error Boundary**: Floating components use withFloatingErrorBoundary to isolate errors

---

## Related Files

| File | Description |
|------|-------------|
| `src/components/ui/button.tsx` | Button component |
| `src/components/ui/card.tsx` | Card component |
| `src/components/ui/popover.tsx` | Popover component |
| `src/lib/utils.ts` | cn() utility function |
| `src/hooks/useControlledState.ts` | Controlled state Hook |
| `src/hooks/useFloatingUI.ts` | Floating positioning Hook |
| `src/constants/design-tokens.ts` | Design tokens |
