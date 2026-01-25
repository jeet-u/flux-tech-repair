# Infographic Data Item Component Generation Specification

This file provides guidance for generating Item component code that conforms to the framework specification.

## Table of Contents
- Data Item Core Concepts
- Data Item Design Philosophy
- Technical Specifications
- Code Generation Requirements
- Generation Process
- Output Format
- Common Issues and Best Practices

## Data Item Core Concepts

Data Item (Item) is the basic information unit in infographics, responsible for displaying individual data elements. Data items are organized and laid out through Structure (Structure), forming complete infographics.

Each data item component receives:

- **datum**: The data object for the current data item
- **data**: The complete data collection (containing all items)
- **indexes**: Position index of the current data item in the structure
- **themeColors**: Theme color configuration
- **positionH**: Horizontal alignment (supports 'normal' 'center' 'flipped')
- **positionV**: Vertical alignment (supports 'normal' 'middle' 'flipped')

## Data Item Design Philosophy

Data items do not have a fixed classification system, but are flexibly created based on different infographic design requirements. They can be simple text displays, complex chart elements, specially-shaped geometric figures, or any other visual representation. When designing, consider:

- Information display requirements (text, numbers, icons, status, etc.)
- Visual hierarchy and aesthetics
- Coordination with structure layout
- Reasonable use of theme colors

### Design Requirements

- **Completeness**: Data items should support four basic elements: ItemIcon, ItemLabel, ItemDesc, ItemValue, all optional
- **Adaptive Layout**: When some elements are missing, other elements should automatically adjust positions to fully utilize space
- **Value Handling**: `datum.value` may be `undefined`, requiring proper handling and conditional rendering
- **Gradient Usage**: Not all designs need gradients, should be decided based on visual effects, solid colors are equally effective

## Technical Specifications

### 1. Type Definitions

```typescript
export interface BaseItemProps {
  x?: number;
  y?: number;
  id?: string;
  indexes: number[];
  data: Data;
  datum: Data['items'][number];
  themeColors: ThemeColors;
  positionH?: 'normal' | 'center' | 'flipped';
  positionV?: 'normal' | 'middle' | 'flipped';
  valueFormatter?: (value: number) => string | number;
  [key: string]: any;
}

export interface Data {
  title?: string;
  desc?: string;
  items: ItemDatum[];
  illus?: Record<string, string | ResourceConfig>;
  [key: string]: any;
}

export interface ItemDatum {
  icon?: string | ResourceConfig;
  label?: string;
  desc?: string;
  value?: number;
  illus?: string | ResourceConfig;
  children?: ItemDatum[];
  [key: string]: any;
}

export interface ThemeColors {
  /** Original primary color */
  colorPrimary: string;
  /** Primary color light background */
  colorPrimaryBg: string;
  /** Text color on primary background */
  colorPrimaryText: string;
  /** Deepest text color */
  colorText: string;
  /** Secondary text color */
  colorTextSecondary: string;
  /** Pure white */
  colorWhite: string;
  /** Background color */
  colorBg: string;
  /** Card background color */
  colorBgElevated: string;
}
```

### 2. Available Components List

**Atomic Components (import from ../../jsx)**

Use unified `x`, `y`, `width`, `height` properties for positioning and sizing:

- **Defs**: SVG definitions container, used to define reusable SVG elements like gradients and patterns

- **Rect**: Rectangle

> Other properties are consistent with React SVG rect

- **Ellipse**: Ellipse/Circle

> Other properties are consistent with React SVG ellipse, but use `x/y/width/height` for coordinates, not `cx/cy/rx/ry`

- **Important**: `x`, `y` are the top-left corner of the ellipse, not the center coordinates

- **Path**: Path shape

> Other properties are consistent with React SVG path

- **Polygon**: Polygon

  ```typescript
  import { Point } from '../../jsx';
  <Polygon points={[{x: 0, y: 0}, {x: 100, y: 0}, {x: 50, y: 100}]} fill={color} />
  ```

> Other properties are consistent with React SVG polygon

- **Group**: Group container

  ```typescript
  <Group x={0} y={0} width={100} height={100}>
    {children}
  </Group>
  ```

  > Group's width/height have no constraining effect, only used for bounding box calculation. If not set, bounding box is calculated from child nodes
  > Other properties are consistent with React SVG group

- **ShapesGroup**

Identical properties and usage to Group, but internal shapes can be styled rendering

- **Text**: Text

  ```typescript
  <Text x={0} y={0} width={100} height={20} fontSize={14} fill={color}>
    Content
  </Text>
  ```

  Extended properties:
  - **alignHorizontal**: "left" | "center" | "right", horizontal alignment
  - **alignVertical**: "top" | "middle" | "bottom", vertical alignment
  - **lineHeight**: line height, default 1.2
  - **wordWrap**: whether to wrap, default false
  - **backgroundColor**: background color

> Other properties are consistent with React SVG text

**Encapsulated Components (import from ../components)**

- **ItemIcon**: Data item icon (square)

  ```typescript
  <ItemIcon
    indexes={indexes}
    x={0}
    y={0}
    size={30}
    fill={themeColors.colorPrimary}
  />
  ```

- **ItemIconCircle**: Data item icon (circular background container)

  ```typescript
  <ItemIconCircle
    indexes={indexes}
    x={0}
    y={0}
    size={50}
    fill={themeColors.colorPrimary}      // Circle background color
    colorBg={themeColors.colorWhite}     // Internal icon background color
  />
  ```

- **ItemLabel**: Data item label (with default styles)

  ```typescript
  <ItemLabel
    indexes={indexes}
    x={0}
    y={0}
    width={100}
    // Unless special styling is needed, do not set the following properties
    // fontSize={14}
    // alignHorizontal="center"
    // alignVertical="middle"
    // fill={themeColors.colorText}
  >
    {datum.label}
  </ItemLabel>
  ```

- **ItemDesc**: Data item description (with default styles)

  ```typescript
  <ItemDesc
    indexes={indexes}
    x={0}
    y={0}
    width={200}
    // Unless special styling is needed, do not set the following properties
    // fontSize={12}
    // lineHeight={1.4}
    // lineNumber={2}
    // wordWrap={true}
    // fill={themeColors.colorTextSecondary}
  >
    {datum.desc}
  </ItemDesc>
  ```

- **ItemValue**: Data item value (with default styles)

  ```typescript
  <ItemValue
    indexes={indexes}
    x={0}
    y={0}
    value={datum.value}
    formatter={extractedProps.valueFormatter}  // Optional formatter function
    // Unless special styling is needed, do not set the following properties
    // fontSize={16}
    // fontWeight="bold"
    // fill={themeColors.colorPrimary}
  />
  ```

- **Illus**: Illustration component

  ```typescript
  <Illus
    x={0}
    y={0}
    width={100}
    height={100}
  />
  ```

- **Gap**: Layout spacing placeholder

  ```typescript
  <Gap width={10} height={10} />
  ```

  - **Important**: Only use `<Gap />` directly, not via `const gap = <Gap />`

**Layout Components (import from ../layouts)**

- **FlexLayout**: Flex flexible layout

  ```typescript
  <FlexLayout
    flexDirection="row" | "column"
    gap={8}
    alignItems="flex-start" | "center" | "flex-end"
  >
    {children}
  </FlexLayout>
  ```

- **AlignLayout**: Alignment layout

> For example, can horizontally and vertically align child elements (elements may overlap)
> Can also perform horizontal or vertical alignment only, keeping the other direction position unchanged

```typescript
<AlignLayout
  horizontal="left" | "center" | "right"
  vertical="top" | "middle" | "bottom"
  width={100}   // Optional, alignment container size
  height={100}  // Optional, alignment container size
>
  {children}
</AlignLayout>
```

### 3. Utility Functions

- **getElementBounds**: Get element boundaries

  ```typescript
  const bounds = getElementBounds(<ItemLabel indexes={indexes} />);
  // Returns: { x: number, y: number, width: number, height: number }
  ```

- **getItemProps**: Extract and process props, second parameter is custom property names list

  ```typescript
  // Extract specified custom properties from props, avoid passing to restProps
  const [extractedProps, restProps] = getItemProps(props, [
    'width',
    'height',
    'iconSize',
  ]);
  // extractedProps: object containing all BaseItemProps + specified custom properties
  // restProps: remaining props, usually passed to outer Group (avoid DOM warnings)
  ```

- **getItemKeyFromIndexes**: Generate key from index array
  ```typescript
  import { getItemKeyFromIndexes } from '../../utils';
  const key = getItemKeyFromIndexes([0, 1]); // "0-1"
  ```

### 4. Third-party Library Support

Can import the following libraries to enhance functionality:

- **d3**:

  ```typescript
  import { xxx } from 'd3';
  ```

- **lodash-es**: Utility functions (recommended to import on demand)

  ```typescript
  import { xxx } from 'lodash-es';
  ```

- **tinycolor2**: Color handling

  ```typescript
  import tinycolor from 'tinycolor2';

  // Instance methods - chainable
  tinycolor(color).darken(20).toHexString();
  tinycolor(color).lighten(10).toHexString();

  // Static methods - mix colors
  tinycolor.mix(themeColors.colorPrimary, '#fff', 40).toHexString();

  // Clone method - avoid modifying original object
  const base = tinycolor(baseColor);
  const gradStart = base.clone().darken(4).toHexString();
  const gradEnd = base.clone().lighten(12).toHexString();
  ```

- **round-polygon**: Rounded polygon handling
  ```typescript
  import roundPolygon, { getSegments } from 'round-polygon';
  const rounded = roundPolygon(points, radius);
  const segments = getSegments(rounded, 'AMOUNT', 10);
  ```

### 5. Import Template

```typescript
import { ComponentType, Group } from '../../jsx';

// Selectively import atomic components and types as needed
import {
  getElementBounds,
  Defs,
  Ellipse,
  Path,
  type Point, // Polygon requires Point type
  Polygon,
  Rect,
  Text,
} from '../../jsx';

// Selectively import encapsulated components as needed
import {
  Gap,
  Illus,
  ItemDesc,
  ItemIcon,
  ItemIconCircle,
  ItemLabel,
  ItemValue,
} from '../components';

// Selectively import layout components as needed
import { AlignLayout, FlexLayout } from '../layouts';

import { registerItem } from './registry';
import type { BaseItemProps } from './types';
import { getItemProps } from './utils';

// Import third-party libraries as needed
// import { xxx } from 'd3';
// import tinycolor from 'tinycolor2';
// import { xxxx } from 'lodash-es';
// import roundPolygon, { xxx } from 'round-polygon';
```

### 6. composites Field Rules

When calling `registerItem`, need to pass `composites` field indicating which encapsulated components are used. The `composites` value is determined by components used in the code implementation:

- **ItemLabel** → `"label"`
- **ItemDesc** → `"desc"`
- **ItemValue** → `"value"`
- **ItemIcon** or **ItemIconCircle** → `"icon"`
- **Illus** → `"illus"`

**Examples**:

```typescript
// If component uses ItemLabel and ItemDesc
registerItem('simple-text', {
  component: SimpleText,
  composites: ['label', 'desc'],
});

// If component uses ItemIcon, ItemLabel, ItemValue and ItemDesc
registerItem('full-card', {
  component: FullCard,
  composites: ['icon', 'label', 'value', 'desc'],
});

// If component uses Illus, ItemLabel and ItemDesc
registerItem('illus-item', {
  component: IllusItem,
  composites: ['illus', 'label', 'desc'],
});
```

### 7. Component Structure Template

```typescript
export interface [ItemName]Props extends BaseItemProps {
  // Custom parameters beyond BaseItemProps (gap etc. customized per design)
  width?: number;
  height?: number;
  iconSize?: number;
  // Other custom parameters
}

export const [ItemName]: ComponentType<[ItemName]Props> = (props) => {
  const [
    {
      datum,
      data,
      indexes,
      width = 300,
      height = 60,
      iconSize = 30,
      positionH = 'normal',
      positionV = 'normal',
      themeColors,
      valueFormatter = (v: any) => `${v}%`,  // Can set default formatter
      // Other custom parameters
    },
    restProps,
  ] = getItemProps(props, ['width', 'height', 'iconSize' /* other custom parameters */]);

  // 1. Data processing
  const value = datum.value; // Keep original value for condition checking
  const displayValue = value ?? 0; // Value for display

  // 2. Size and position calculation
  // Use getElementBounds to get child element sizes
  // Adjust layout based on positionH/positionV

  // 3. Gradient definition (if needed)
  const gradientId = `${themeColors.colorPrimary}-component-name`; // Generate from color for reuse

  // 4. Component structure
  return (
    <Group {...restProps}>
      {/* Defs definition (if gradient needed) */}

      {/* Main shapes and content */}
      {datum.icon && <ItemIcon indexes={indexes} {...iconProps} />}

      {datum.label !== undefined && (
        <ItemLabel
          indexes={indexes}
          x={/** Calculate X coordinate */}
          y={/** Calculate Y coordinate */}
          {...labelProps}>
          {datum.label}
        </ItemLabel>
      )}

      {/* Value - Conditional rendering */}
      {value !== undefined && (
        <ItemValue
          indexes={indexes}
          x={/** Calculate X coordinate */}
          y={/** Calculate Y coordinate */}
          value={displayValue}
          formatter={valueFormatter}
          {...valueProps}
        />
      )}

      {/* Description - Dynamic layout */}
      {datum.desc !== undefined && (
        <ItemDesc
          indexes={indexes}
          x={/** Calculate X coordinate */}
          y={/** Calculate Y coordinate */}
          {...descProps}
        >
          {datum.desc}
        </ItemDesc>
      )}
    </Group>
  );
};

registerItem('[item-name]', {
  component: [ItemName],
  composites: ['label', 'desc', 'icon', 'value', 'illus'] // Determine based on actual components used
});
```

### 8. indexes Index System

**indexes** is the position identifier of a data item in the infographic, represented as an array showing hierarchical relationships:

- **One-dimensional structure** (list, horizontal arrangement, etc.): `[0]`, `[1]`, `[2]`, ...
- **Nested structure** (tree, hierarchical, etc.):
  - Root nodes: `[0]`
  - Child nodes of first root node: `[0, 0]`, `[0, 1]`, `[0, 2]`, ...
  - Child nodes of `[0, 1]` node: `[0, 1, 0]`, `[0, 1, 1]`, ...

This index system ensures each data item has a unique identifier.

**Common index operations**:

```typescript
// Generate sequence number
const indexNumber = indexes[0] + 1;
const indexStr = String(indexes[0] + 1).padStart(2, '0'); // "01", "02", ...

// Check odd/even (for alternating styles)
const isEven = indexes[0] % 2 === 0;
```

### 9. Key Design Principles

#### positionH/positionV Handling

> positionH/V handling is not always necessary, but if the design has alignment requirements, adaptation is needed.

```typescript
// positionH handling example
const iconX =
  positionH === 'flipped'
    ? width - iconSize // Right align
    : positionH === 'center'
      ? (width - iconSize) / 2 // Center
      : 0; // Default left align

// positionV handling example
const iconY =
  positionV === 'middle'
    ? (height - iconSize) / 2
    : positionV === 'flipped'
      ? height - iconSize
      : 0;

// Text alignment
const textAlign =
  positionH === 'flipped'
    ? 'right'
    : positionH === 'center'
      ? 'center'
      : 'left';
```

#### Theme Color Usage

```typescript
// Primary color
fill={themeColors.colorPrimary}

// Background color
fill={themeColors.colorPrimaryBg}

// Main text
fill={themeColors.colorText}

// Secondary text
fill={themeColors.colorTextSecondary}

// White (commonly used for icons/text on dark background)
fill={themeColors.colorWhite}
```

#### Gradient Definition

**Linear Gradient**:

```typescript
const gradientId = `${themeColors.colorPrimary}-component-name`;
<Defs>
  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor={themeColors.colorPrimary} />
    <stop
      offset="100%"
      stopColor={tinycolor.mix(themeColors.colorPrimary, '#fff', 40).toHexString()}
    />
  </linearGradient>
</Defs>;

// Use gradient
<Rect fill={`url(#${gradientId})`} {...props} />;
```

**Radial Gradient**:

```typescript
const radialId = `${themeColors.colorPrimary}-radial`;
<Defs>
  <radialGradient id={radialId} cx="50%" cy="50%" r="50%">
    <stop offset="0%" stopColor={themeColors.colorPrimary} />
    <stop
      offset="100%"
      stopColor={tinycolor(themeColors.colorPrimary).darken(20).toHexString()}
    />
  </radialGradient>
</Defs>;
```

**Multiple Gradient Definitions**:

```typescript
// Define multiple gradients for different purposes
const progressGradientId = `${themeColors.colorPrimary}-progress`;
const backgroundGradientId = `${themeColors.colorPrimaryBg}-progress-bg`;
const positiveGradient = `gradient-${themeColors.colorPrimary}-positive`;
const negativeGradient = `gradient-${themeColors.colorPrimary}-negative`;

<Defs>
  <linearGradient id={progressGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor={themeColors.colorPrimary} />
    <stop
      offset="100%"
      stopColor={tinycolor.mix(themeColors.colorPrimary, '#fff', 20).toHexString()}
    />
  </linearGradient>
  <linearGradient id={backgroundGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor={themeColors.colorPrimaryBg} />
    <stop offset="100%" stopColor={themeColors.colorBg} />
  </linearGradient>
</Defs>;
```

**SVG Pattern Fill**:

```typescript
// Generate unique ID from indexes (for scenarios requiring uniqueness)
const uniqueId = `letter-card-${indexes.join('-')}`;
const patternId = `${uniqueId}-pattern`;

<Defs>
  <pattern
    id={patternId}
    patternUnits="userSpaceOnUse"
    width={10}
    height={10}
    patternTransform={`rotate(45)`}
  >
    {/* Note: use lowercase native SVG elements inside pattern */}
    <rect x="0" y="0" width={4} height={10} fill="rgba(0, 0, 0, 0.03)" />
  </pattern>
</Defs>;

// Use pattern
<Rect fill={`url(#${patternId})`} {...props} />;
```

#### Styled Rendering Support

Styled rendering transforms graphics during rendering into styled graphics, such as hand-drawn style.

Graphics identified in the following ways can be styled rendered (implementation by renderer):

1. Add `data-element-type="shape"` attribute

```tsx
<Rect data-element-type="shape" width="100" height="100" />
```

2. Wrap with ShapesGroup

```tsx
<ShapesGroup>
  <Rect width="100" height="100" />
  <Rect x="100" width="100" height="100" />
  <Rect x="200" width="100" height="100" />
</ShapesGroup>
```

> Styled rendering only supports shape elements (Path, Ellipse, Rect, Polygon, etc.), not text elements and groups

#### Responsive Sizing

```tsx
// Dynamically adjust based on content
const labelBounds = getElementBounds(
  <ItemLabel indexes={indexes}>{datum.label}</ItemLabel>,
);
const totalHeight = iconSize + gap + labelBounds.height;

// Calculate ratio based on data collection
const values = data.items.map((item) => item.value ?? 0);
const maxValue = Math.max(...values);
const barHeight = (value / maxValue) * availableHeight;
```

#### Complex SVG Path Drawing

```typescript
// 1/4 circle arc path
const quarterCirclePath = isFlipped
  ? `M ${x} ${y} L ${x} ${y + r} A ${r} ${r} 0 0 0 ${x + r} ${y} Z`
  : `M ${x} ${y} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x - r} ${y} Z`;

<Path d={quarterCirclePath} fill={themeColors.colorPrimary} />;

// Arrow polygon
<Polygon
  points={[
    { x: 0, y: 0 },
    { x: width - 10, y: 0 },
    { x: width, y: height / 2 }, // Arrow tip
    { x: width - 10, y: height },
    { x: 0, y: height },
    { x: 10, y: height / 2 },
  ]}
  fill={themeColors.colorPrimary}
/>;
```

**SVG Path Command Reference**:

- `M x y` - Move to
- `L x y` - Line to
- `A rx ry x-axis-rotation large-arc-flag sweep-flag x y` - Arc
- `Z` - Close path

### 10. Constraint Rules

**Strictly follow**:

1. **Only use listed components and properties**
2. **All shape components use x/y/width/height positioning**
3. **Must pass indexes to all encapsulated components** (ItemIcon, ItemLabel, ItemDesc, ItemValue, etc.)
4. **Use getItemProps to handle props**
5. **tinycolor correct usage**:
   - Instance methods: `tinycolor(color).darken(20).toHexString()`
   - Static methods: `tinycolor.mix(color1, color2, amount).toHexString()`
6. **Support positionH/V alignment** (based on design requirements)
7. **Avoid element coordinates with negative values**
8. **Conditionally render optional elements** (icon, label, desc, value)
9. **Provide composites field when registering** component, determine value based on actual encapsulated components used

### 11. Naming Convention

- Component name: Upper camel case, e.g. `DoneList`, `ChartColumn`
- Registration name: Lowercase with hyphens, e.g. `done-list`, `chart-column`
- Props interface: Component name + `Props`
- Constants: Uppercase with underscores, e.g. `CIRCLE_MASS`, `DOT_RADIUS`

## Code Generation Requirements

1. **Completeness**: Include all imports, type definitions, component implementations, and registration
2. **Correctness**:
   - Only use allowed components and properties
   - indexes correctly passed to all encapsulated components
   - Accurate coordinate calculations
   - Ellipse's x/y are top-left corner coordinates
3. **Style Principle**:
   - ItemLabel/ItemDesc/ItemValue prioritize default styles
   - Only override style properties when special effects are truly needed
   - Reasonable use of theme colors
4. **Flexibility**:
   - Parameters have reasonable default values
   - Handle edge cases (empty data, missing fields, etc.)
   - Conditionally render optional elements
   - Support positionH/V alignment
   - Responsive sizing design

## Generation Process

1. **Understand Requirements**: Clarify what content and visual effect the data item should display
2. **Design Layout**: Determine element arrangement and size relationships
3. **Write Code**: Generate complete code according to template
4. **Validate Output**: Check code completeness and specification compliance

## Output Format

Generate complete TypeScript file:

1. JSX import comment
2. Import statements
3. Props interface
4. Component implementation
5. Registration statement

## Common Issues and Best Practices

### Value Handling Issue

❌ **Wrong Approach**:

```typescript
const value = datum.value ?? 0; // value never undefined
{
  value !== undefined && <ItemValue value={value} />; // Condition always true
}
```

✅ **Correct Approach**:

```typescript
const value = datum.value; // Keep original value
const displayValue = value ?? 0; // Value for display
{
  value !== undefined && <ItemValue value={displayValue} />; // Conditional rendering correct
}
```

### Gradient ID Generation

```typescript
// Recommended: Based on color and purpose (reusable)
const gradientId = `${themeColors.colorPrimary}-progress`;

// Or based on indexes (for scenarios requiring uniqueness)
const uniqueId = `letter-card-${indexes.join('-')}`;
const gradientId = `${uniqueId}-gradient`;
```

### tinycolor Usage

❌ **Wrong Approach**:

```typescript
tinycolor.darken(color, 20); // Static method doesn't exist
tinycolor.lighten(color, 10); // Static method doesn't exist
```

✅ **Correct Approach**:

```typescript
// Instance methods - chainable
tinycolor(color).darken(20).toHexString();
tinycolor(color).lighten(10).toHexString();

// Static methods - mix colors
tinycolor.mix(themeColors.colorPrimary, '#fff', 40).toHexString();

// Clone method - avoid modifying original object
const base = tinycolor(baseColor);
const gradStart = base.clone().darken(4).toHexString();
const gradEnd = base.clone().lighten(12).toHexString();
```

### Dynamic Layout Example

```typescript
// Description position dynamically adjusts based on whether value exists
const descY = value !== undefined ? labelY + labelHeight + valueHeight + gap : labelY + labelHeight + smallGap;

<ItemDesc indexes={indexes} y={descY}>
  {datum.desc}
</ItemDesc>;

// Content width adjusts based on icon existence
const textWidth = showIcon && datum.icon ? width - iconSize - gap : width;

<ItemLabel indexes={indexes} width={textWidth}>
  {datum.label}
</ItemLabel>;
```

### Common Utility Functions and Tips

```typescript
// String formatting
String(indexes[0] + 1).padStart(2, '0'); // "01", "02", ...
datum.label?.[0].toUpperCase(); // Optional chaining + capitalize first letter

// Math constants
Math.SQRT2; // √2 ≈ 1.414
Math.PI; // π ≈ 3.14159

// Calculate circle center of mass (for arc shapes)
const CIRCLE_MASS = (4 * radius) / (3 * Math.PI);

// Circle progress calculation
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference * (1 - percentage);
```
