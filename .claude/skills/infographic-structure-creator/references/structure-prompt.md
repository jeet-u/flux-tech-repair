# Infographic Structure Component Generation Specification

This file provides guidance for generating Structure component code that conforms to the framework specification.

## Table of Contents
- Framework Core Concepts
- Structure Classification System
- Technical Specifications
- Code Generation Requirements
- Generation Process
- Reference Examples
- Output Format

## Framework Core Concepts

The infographic framework consists of three core components:

- **Structure**: Responsible for overall layout and organization of data items
- **Title**: Optional title component
- **Data Items (Item/Items)**: Display components for single or multiple information units

Structure is the entry component that combines Title and Item/Items with layout logic and interactive buttons to form a complete infographic. For hierarchical structures, you can use the `Items` array to pass multiple components (such as root node and child node components).

## Structure Classification System

Based on information organization characteristics, structures are classified as follows:

1. **List Structures (list-\*)**: Information items arranged side-by-side with no obvious directionality or hierarchical relationship
   - Horizontal lists, vertical lists, grid lists, waterfall flows, etc.

2. **Comparison Structures (compare-\*)**: Explicit binary or multi-element contrast layouts
   - Left-right comparison, top-bottom comparison, multi-item comparison, mirror comparison, etc.

3. **Sequence Structures (sequence-\*)**: Information flows with clear directionality and sequentiality
   - Timelines, step processes, stairs, S-curve flows, etc.

4. **Hierarchy Structures (hierarchy-\*)**: Tree-shaped, nested, or obvious primary-secondary relationship layouts
   - Trees, pyramids, radial, nested circles, etc.

5. **Relationship Structures (relation-\*)**: Display connections, dependencies, or interactions between elements
   - Network diagrams, matrices, circular diagrams, Venn diagrams, etc.

6. **Geographic Structures (geo-\*)**: Information organization based on geographic space or physical location
   - Map annotations, regional distribution, route maps, etc.

7. **Statistical Charts (chart-\*)**: Quantitative data relationships displayed in chart form
   - Bar charts, pie charts, line charts, radar charts, etc.

## Technical Specifications

### 1. Type Definitions

```tsx
export interface BaseStructureProps {
  Title?: ComponentType<Pick<TitleProps, 'title' | 'desc'>>;
  Item?: ComponentType<
    Omit<BaseItemProps, 'themeColors'> &
      Partial<Pick<BaseItemProps, 'themeColors'>>
  >;
  Items?: ComponentType<Omit<BaseItemProps, 'themeColors'>>[];
  data: Data;
  options: ParsedInfographicOptions;
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

export interface BaseItemProps {
  x?: number;
  y?: number;
  id?: string;
  indexes: number[];
  data: Data;
  datum: Data['items'][number];
  themeColors?: ThemeColors;
  positionH?: 'normal' | 'center' | 'flipped';
  positionV?: 'normal' | 'middle' | 'flipped';
  width?: number;
  height?: number;
  [key: string]: any;
}
```

**Important Notes**:

- For simple structures, use the `Item` property to pass a single component
- For hierarchical structures (like trees, pyramids, etc.), use the `Items` array to pass multiple components; different levels can use different component styles
- `options` contains theme configuration, palettes, and other information, accessible via utility functions
- `themeColors` in `BaseItemProps` is optional; some components provide custom values

### 2. Available Components List

**Must select from the following components, do not use components not listed:**

#### Atomic Components (import from ../../jsx)

All atomic components use unified `x`, `y`, `width`, `height` properties to define position and size, not native SVG properties like cx/cy/r, etc.

- **Defs**: Define gradients, filters, and other SVG definitions

  ```tsx
  <Defs>{/* gradient, filter definitions, etc. */}</Defs>
  ```

- **Ellipse**: Ellipse shape

  ```tsx
  <Ellipse x={0} y={0} width={100} height={60} fill="blue" />
  // Notes:
  // 1. x/y are top-left position, not center point
  // 2. Use width/height, not rx/ry
  // 3. For circles, width and height are equal
  ```

- **Group**: Group container

  ```tsx
  <Group x={10} y={10}>
    {children}
  </Group>
  ```

- **Path**: Path shape

  ```tsx
  <Path
    d="M 0 0 L 100 100"
    stroke="black"
    strokeWidth={2}
    width={100}
    height={100}
  />
  // width/height are estimated size of d
  ```

- **Rect**: Rectangle shape

  ```tsx
  <Rect x={0} y={0} width={100} height={50} fill="red" />
  ```

- **Text**: Text element (supports line wrapping)

  ```tsx
  <Text
    x={0}
    y={0}
    width={100}
    height={50}
    fontSize={14}
    fontWeight="normal" // or 'bold'
    alignHorizontal="center" // 'left' | 'center' | 'right'
    alignVertical="middle" // 'top' | 'middle' | 'bottom'
    fill="#000000"
  >
    Text Content
  </Text>
  // Note: text content passed as children, not text property
  ```

- **Polygon**: Polygon
  ```tsx
  <Polygon
    points={[
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ]}
    fill="green"
  />
  // Note: points is object array {x, y}[], not string
  ```

#### Encapsulated Components (import from ../components)

- **BtnAdd**: Add button, requires indexes property

  ```tsx
  <BtnAdd indexes={[0]} x={10} y={20} />
  ```

- **BtnRemove**: Remove button, requires indexes property

  ```tsx
  <BtnRemove indexes={[0]} x={10} y={20} />
  ```

- **BtnsGroup**: Button group container

  ```tsx
  <BtnsGroup>{btnElements}</BtnsGroup>
  ```

- **ShapesGroup**

Identical properties and usage to Group, but internal shapes can be styled rendering

```tsx
<ShapesGroup>
  <Rect width={100} height={100} />
  <Rect x={100} width={100} height={100} />
  <Rect x={200} width={100} height={100} />
</ShapesGroup>
```

- **ItemsGroup**: Data item group container

  ```tsx
  <ItemsGroup>{itemElements}</ItemsGroup>
  ```

- **Illus**: Illustration component (will be replaced with image or SVG)

  ```tsx
  <Illus x={0} y={0} width={200} height={150} />
  ```

- **Title**: Default title component

  ```tsx
  <Title title="Title" desc="Description" alignHorizontal="center" />
  ```

- **ItemLabel**: Data item label

  ```tsx
  <ItemLabel indexes={[0]} x={0} y={0}>
    Label
  </ItemLabel>
  ```

- **ItemDesc**: Data item description

  ```tsx
  <ItemDesc indexes={[0]} x={0} y={0}>
    Description
  </ItemDesc>
  ```

- **ItemIcon**: Data item icon

  ```tsx
  <ItemIcon indexes={[0]} x={0} y={0} size={40} />
  ```

- **ItemValue**: Data item value

  ```tsx
  <ItemValue indexes={[0]} value={100} x={0} y={0} />
  ```

- **ItemIconCircle**: Circular icon component
  ```tsx
  <ItemIconCircle indexes={[0]} x={0} y={0} size={50} fill="#000000" />
  ```

#### Decoration Components (import from ../decorations)

- **SimpleArrow**: Simple arrow decoration

  ```tsx
  <SimpleArrow
    x={0}
    y={0}
    width={25}
    height={25}
    colorPrimary="#000000"
    rotation={0} // Optional, rotation angle: 0, 90, 180, 270
  />
  ```

- **Triangle**: Triangle decoration
  ```tsx
  <Triangle
    x={0}
    y={0}
    width={10}
    height={8}
    rotation={0}
    colorPrimary="#000000"
  />
  ```

#### Definition Components (import from ../defs)

- **LinearGradient**: Linear gradient definition
  ```tsx
  <Defs>
    <LinearGradient
      id="my-gradient"
      startColor="#ff0000"
      stopColor="#0000ff"
      direction="left-right" // 'left-right' | 'right-left' | 'top-bottom' | 'bottom-top'
    />
  </Defs>
  <Rect fill="url(#my-gradient)" />
  ```

**Using Native SVG Elements in Defs**:
Native SVG elements can be used inside `<Defs>` tags:

```tsx
<Defs>
  <linearGradient
    id="gradient-id"
    x1="0%"
    y1="0%"
    x2="100%"
    y2="100%"
    gradientUnits="userSpaceOnUse"
  >
    <stop offset="0%" stopColor="#ff0000" />
    <stop offset="100%" stopColor="#0000ff" />
  </linearGradient>
</Defs>
```

#### Layout Components (import from ../layouts)

- **FlexLayout**: Flex layout
  ```tsx
  <FlexLayout
    flexDirection="row" // 'row' | 'column' | 'row-reverse' | 'column-reverse'
    justifyContent="center" // 'flex-start' | 'flex-end' | 'center' | 'space-between'
    alignItems="center" // 'flex-start' | 'flex-end' | 'center'
    alignContent="center" // 'flex-start' | 'flex-end' | 'center' | 'space-between'
    flexWrap="wrap" // 'wrap' | 'nowrap'
    gap={20}
  >
    {children}
  </FlexLayout>
  ```

#### Styled Rendering

Styled rendering transforms graphics during rendering to styled graphics, such as hand-drawn style.

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

#### Utility Functions

**Layout Calculation Functions** (import from ../../jsx):

- **getElementBounds**: Get element boundary information
  ```tsx
  const bounds = getElementBounds(<Rect width={100} height={50} />);
  // Returns: { x: number, y: number, width: number, height: number }
  ```

**Theme and Color Functions** (import from ../utils):

- **getPaletteColor**: Get color at specified index in palette

  ```tsx
  const color = getPaletteColor(options, [index]); // Returns color string
  ```

- **getPaletteColors**: Get complete palette color array

  ```tsx
  const palette = getPaletteColors(options); // Returns color array
  ```

- **getColorPrimary**: Get theme color

  ```tsx
  const colorPrimary = getColorPrimary(options); // Returns theme color string
  ```

- **getThemeColors**: Get theme configuration
  ```tsx
  const themeColors = getThemeColors(options.themeConfig);
  // Or custom configuration
  const themeColors = getThemeColors(
    {
      colorPrimary: '#FF356A',
      colorBg: '#ffffff',
    },
    options,
  );
  // Returns theme object containing colorText, colorPrimaryBg, etc.
  ```

**Data Processing Functions** (import from ../../utils):

- **getDatumByIndexes**: Get data item by index
  ```tsx
  const datum = getDatumByIndexes(items, [0, 1]); // Get nested data
  ```

**Component Selection Functions** (import from ../utils):

- **getItemComponent**: Get Item component for specified level (for Items array)
  ```tsx
  const ItemComponent = getItemComponent(Items, level);
  // Items is component array, level is level index
  // If level exceeds array length, returns last component
  ```

### 3. Selective Imports

```tsx
import type { ComponentType, JSXElement } from '../../jsx';
import {
  getElementBounds,
  Defs,
  Ellipse,
  Group,
  Path,
  Polygon,
  Rect,
  Text,
} from '../../jsx';
import {
  BtnAdd,
  BtnRemove,
  BtnsGroup,
  Illus,
  ItemDesc,
  ItemIcon,
  ItemIconCircle,
  ItemLabel,
  ItemsGroup,
  ItemValue,
  Title,
} from '../components';
import { LinearGradient } from '../defs';
import { SimpleArrow, Triangle } from '../decorations';
import { FlexLayout } from '../layouts';
import {
  getColorPrimary,
  getPaletteColor,
  getPaletteColors,
  getThemeColors,
  getItemComponent,
} from '../utils';
import { getDatumByIndexes } from '../../utils';
import { registerStructure } from './registry';
import type { BaseStructureProps } from './types';
```

**Notes**:

- Only import components and functions that are actually used
- For hierarchical structures, remember to import `BaseItemProps` type (if needed)
- Decoration components and definition components should be imported as needed

Supported third-party libraries:

- **d3**: For complex layout calculations like force-directed layout, hierarchical layout, etc.
- **lodash-es**: General utility functions
- **tinycolor2**: Color handling

> Other libraries can be imported as needed

### 4. Component Structure Template

**Simple Structure Template** (using Item):

```tsx
export interface [StructureName]Props extends BaseStructureProps {
  gap?: number;
  // Other custom parameters
}

export const [StructureName]: ComponentType<[StructureName]Props> = (props) => {
  const { Title, Item, data, gap = 20, options } = props;
  const { title, desc, items = [] } = data;

  // 1. Handle title
  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  // 2. Get element sizes
  const btnBounds = getElementBounds(<BtnAdd indexes={[0]} />);
  const itemBounds = getElementBounds(
    <Item indexes={[0]} data={data} datum={items[0]} />
  );

  // 3. Prepare element arrays
  const btnElements: JSXElement[] = [];
  const itemElements: JSXElement[] = [];
  const decorElements: JSXElement[] = []; // Decoration elements (arrows, connectors, etc.)

  // 4. Iterate through data items to generate elements
  items.forEach((item, index) => {
    const indexes = [index];

    // Calculate position and add Item
    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={/* calculate x */}
        y={/* calculate y */}
      />
    );

    // Add remove button
    btnElements.push(
      <BtnRemove
        indexes={indexes}
        x={/* calculate x */}
        y={/* calculate y */}
      />
    );

    // Add insert button
    btnElements.push(
      <BtnAdd
        indexes={indexes}
        x={/* calculate x */}
        y={/* calculate y */}
      />
    );
  });

  // 5. Add button at the end
  if (items.length > 0) {
    btnElements.push(
      <BtnAdd
        indexes={[items.length]}
        x={/* calculate x */}
        y={/* calculate y */}
      />
    );
  }

  // 6. Return layout
  return (
    <FlexLayout
      id="infographic-container"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {titleContent}
      <Group>
        <Group>{decorElements}</Group>
        <ItemsGroup>{itemElements}</ItemsGroup>
        <BtnsGroup>{btnElements}</BtnsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('[structure-name]', {
  component: [StructureName],
  composites: ['title', 'item'], // Fill in based on actual components used
});
```

**Hierarchical Structure Template** (using Items array):

```tsx
export interface [StructureName]Props extends BaseStructureProps {
  gap?: number;
  // Other custom parameters
}

export const [StructureName]: ComponentType<[StructureName]Props> = (props) => {
  const { Title, Items, data, gap = 20, options } = props;
  const [RootItem, ChildItem] = Items; // Destructure to get components for different levels
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const btnElements: JSXElement[] = [];
  const itemElements: JSXElement[] = [];

  // Get root and child node sizes
  const rootItemBounds = getElementBounds(
    <RootItem indexes={[0]} data={data} datum={items[0]} />
  );
  const childItemBounds = getElementBounds(
    <ChildItem indexes={[0, 0]} data={data} datum={items[0]?.children?.[0] || {}} />
  );

  // Iterate through root nodes
  items.forEach((rootItem, rootIndex) => {
    const { children = [] } = rootItem;

    // Render root node
    itemElements.push(
      <RootItem
        indexes={[rootIndex]}
        datum={rootItem}
        data={data}
        x={/* calculate x */}
        y={/* calculate y */}
      />
    );

    // Iterate through child nodes
    children.forEach((child, childIndex) => {
      itemElements.push(
        <ChildItem
          indexes={[rootIndex, childIndex]}
          datum={child}
          data={data}
          x={/* calculate x */}
          y={/* calculate y */}
        />
      );
    });
  });

  return (
    <FlexLayout
      id="infographic-container"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {titleContent}
      <Group>
        <ItemsGroup>{itemElements}</ItemsGroup>
        <BtnsGroup>{btnElements}</BtnsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('[structure-name]', {
  component: [StructureName],
  composites: ['title', 'item'], // Fill in based on actual components used
});
```

### 5. Component Declaration (composites)

**composites Field Description**:

When calling `registerStructure`, you must provide a `composites` array to declare which core components the structure uses. This helps the system understand the structure's composition and dependencies.

**composites Value Rules**:

Values in the composites array should be lowercase strings, including the following types:

1. **'title'** - Include when any of the following conditions are met:
   - Used the `Title` prop component (from `props.Title`)
   - Directly accessed and rendered `data.title` (e.g., using `<Text>{title}</Text>` or `<Text>{data.title}</Text>`)
   - Rendered title data as a UI element in any way in the code

2. **'item'** - Include when any of the following conditions are met:
   - Used the `Item` prop component (from `props.Item`)
   - Used the `Items` prop component array (from `props.Items`)
   - Note: Even if using `Items` (plural), you should write `'item'` (singular) in composites

3. **'illus'** - Include when any of the following conditions are met:
   - Used the `Illus` component (imported from `../components`)
   - Directly accessed and rendered `data.illus` (e.g., through image or SVG element)
   - Accessed `data.illus.xxx` and rendered as UI

**Examples**:

```tsx
// Example 1: Used Title and Item props
registerStructure('list-row', {
  component: ListRow,
  composites: ['title', 'item'],
});

// Example 2: Directly render title in code, use Item prop
registerStructure('list-sector', {
  component: ListSector,
  composites: ['title', 'item'], // Even without Title prop, rendered data.title
});

// Example 3: Used Items array (hierarchical structure)
registerStructure('hierarchy-tree', {
  component: HierarchyTree,
  composites: ['title', 'item'], // Note: 'item' not 'items'
});

// Example 4: Used Title, Item, and Illus
registerStructure('some-structure', {
  component: SomeStructure,
  composites: ['title', 'item', 'illus'],
});
```

**Important Notes**:

- Values in composites array must be lowercase
- Even if using `Items` (plural), write `'item'` (singular)
- If the structure directly rendered a data field (like `data.title`), even without using the corresponding prop component, it should be declared in composites
- composites array cannot be empty, must contain at least `['item']`
- First BtnAdd before first data item
- Last BtnAdd after last data item
- indexes value is insertion position index (if inserting before item 0, indexes=[0])

**BtnRemove (Remove Button)**:

- Positioned near each data item, indicates can delete that item
- indexes value is corresponding data item's index

**Position Calculation Examples**:

- **Horizontal layout**: BtnAdd below data item horizontally centered, BtnRemove directly below data item
- **Vertical layout**: BtnAdd above or below data item horizontally centered, BtnRemove to left or right of data item
- **Other layouts**: Adjust flexibly based on visual balance and interaction convenience

### 8. Layout Calculation Key Points

- **Element size retrieval**: Use `getElementBounds()` to get element size for calculations
- **Coordinate system**: x increases rightward, y increases downward
- **Item alignment**: `positionH` and `positionV` control element content alignment
  - `positionH`: 'normal'(default design) | 'center'(horizontally centered) | 'flipped'(flipped layout)
  - `positionV`: 'normal'(default design) | 'middle'(vertically centered) | 'flipped'(flipped layout)
  - Example: In circular distribution, right-side Item uses 'normal', left-side uses 'flipped'
- **Item size constraints**: Some structures need to limit Item size, pass via `width` and `height` properties
- **Layout methods**:
  - Simple layouts use `FlexLayout` for automatic centering and arrangement
  - Complex layouts manually calculate precise coordinates for each element
- **Decoration element hierarchy**: Decoration elements (lines, arrows) should be in separate Group, positioned before ItemsGroup
- **Prioritize d3 for complex layouts**:
  - Tree layout: `d3.tree()` or `d3.cluster()`
  - Force-directed layout: `d3.forceSimulation()`
  - Hierarchical data: `d3.hierarchy()`

### 9. Naming Convention

> Supported types: List, Compare, Sequence, hierarchy, relation, geo, chart

- **Component name**: Upper camel case, e.g. `ListRow`, `CompareLeftRight`
- **Registration name**: Lowercase with hyphens, consistent with classification prefix, e.g. `list-row`, `list-column`
- **Props interface**: Component name + `Props`, e.g. `ListRowProps`
- **Variable naming**: Use meaningful names, e.g. `itemElements`, `btnElements`, `decorElements`

### 10. Parameter Design Guidance

**Common parameters and their default values**:

- `gap`: Data item spacing, default 20-40 (for list, sequence structures)
- `rowGap` / `columnGap`: Row/column spacing
- `spacing`: Overall spacing, default 20-30
- `radius`: Circular layout radius, default 150-250
- `outerRadius` / `innerRadius`: Outer/inner radius (ring layout)
- `angle` / `startAngle` / `endAngle`: Angle-related parameters
- `columns` / `rows`: Grid layout columns/rows, default 3-4
- `itemsPerRow`: Items per row, default 3
- `levelGap`: Level spacing, default 60-80
- `showAxis` / `showConnections`: Whether to show axis/connection lines, default true

**Parameter design principles**:

- All parameters should have reasonable default values
- Mark optional parameters with `?`
- Parameter names should clearly express meaning
- Boolean parameters use `show*` / `enable*` prefix

## Code Generation Requirements

1. **Completeness**:
   - Generate complete, runnable code containing all necessary imports, type definitions, and registration statements
   - Only import components and functions that are actually used
   - **Must include composites array in registerStructure call**, correctly declare used components

2. **Correctness**:
   - Ensure indexes array is correctly passed to all required components
   - Coordinate calculations are accurate, avoid element overlap or misalignment
   - Edge case handling (e.g., provide friendly empty state when items is empty array)
   - Use `getElementBounds` to get accurate element sizes
   - Text component's text passed as children, not text property
   - **composites array must accurately reflect actually used components** (see "Component Declaration (composites)" section)

3. **Conciseness**:
   - Use meaningful but concise variable names
   - Avoid redundant calculations, reasonably reuse calculation results
   - Extract constants and configuration items

4. **Consistency**:
   - Follow the style and patterns of example code
   - Button layout logic matches structure type
   - Theme colors obtained using utility functions

5. **Extensibility**:
   - Reserve space for custom parameters, all parameters have reasonable default values
   - Support nested structures (access child items via datum.children when needed)
   - Props interface inherits `BaseStructureProps`

6. **Performance Optimization**:
   - Use `forEach` to iterate through data items, not `map`
   - Collect elements into arrays, render together

7. **Other Requirements**:
   - No code comments needed (unless logic is particularly complex)
   - Don't use React features (like key, useEffect, etc.)
   - Array elements can be directly passed as children, no key needed

## Generation Process

When user requests structure generation, follow these steps:

1. **Understand Requirements**:
   - Clarify the layout type, characteristics, and purpose the user wants
   - Understand data organization method (flat, nested, hierarchical, etc.)
   - Confirm whether button interaction is needed

2. **Determine Classification**:
   - Based on information organization characteristics, assign to appropriate structure classification
   - Choose appropriate naming (follow naming conventions)

3. **Design Layout**:
   - Determine whether to use Item or Items
   - Determine arrangement and alignment of data items
   - Calculate position relationships between elements
   - Design decoration elements (connectors, arrows, etc.)
   - Design reasonable button positions (if needed)

4. **Write Code**:
   - Add JSX import directive
   - Import required components and functions
   - Define Props interface
   - Implement component logic
   - **Register structure (include composites array)**

5. **Validate Output**:
   - Check code completeness and correctness
   - Confirm all imports are correct
   - Confirm indexes are correctly passed
   - Confirm coordinate calculations are accurate
   - **Confirm composites array accurately reflects used components**

## Reference Examples

### Example 1: Simple Horizontal List

**Requirement**: Data items arranged horizontally with equal spacing

**Implementation Key Points**:

- Use single Item component
- Each item's x coordinate = index × (itemWidth + gap)
- Use `positionH="center"` to center content
- BtnAdd between adjacent items, BtnRemove below each item

**Key Code Snippet**:

```tsx
items.forEach((item, index) => {
  const itemX = index * (itemBounds.width + gap);
  itemElements.push(
    <Item
      indexes={[index]}
      datum={item}
      data={data}
      x={itemX}
      positionH="center"
    />,
  );
});
```

### Example 2: Hierarchical Comparison Structure

**Requirement**: Left-right columns, each with root node and multiple child nodes

**Implementation Key Points**:

- Use Items array: `[RootItem, ChildItem]`
- Root node at fixed position, child nodes arranged below
- Child nodes use different positionH (left column 'normal', right column 'flipped')

**Key Code Snippet**:

```tsx
const [RootItem, ChildItem] = Items;
items.forEach((rootItem, rootIndex) => {
  const { children = [] } = rootItem;
  itemElements.push(
    <RootItem indexes={[rootIndex]} datum={rootItem} data={data} />,
  );

  children.forEach((child, childIndex) => {
    itemElements.push(
      <ChildItem indexes={[rootIndex, childIndex]} datum={child} data={data} />,
    );
  });
});
```

### Example 3: Decorated Sequence Structure

**Requirement**: Horizontal process with arrows connecting data items

**Implementation Key Points**:

- Use decoration element (SimpleArrow) to connect adjacent items
- Decoration elements in separate Group, positioned before ItemsGroup
- Use theme color to draw arrows

**Key Code Snippet**:

```tsx
const colorPrimary = getColorPrimary(options);
items.forEach((item, index) => {
  if (index < items.length - 1) {
    decorElements.push(
      <SimpleArrow
        x={itemX + itemBounds.width + (gap - arrowWidth) / 2}
        y={itemY + itemBounds.height / 2 - arrowHeight / 2}
        width={arrowWidth}
        height={arrowHeight}
        colorPrimary={colorPrimary}
      />,
    );
  }
});

return (
  <Group>
    <Group>{decorElements}</Group>
    <ItemsGroup>{itemElements}</ItemsGroup>
    <BtnsGroup>{btnElements}</BtnsGroup>
  </Group>
);
```

### Example 4: Circular Layout Using Palette

**Requirement**: Data items distributed in circle, each using different color

**Implementation Key Points**:

- Use trigonometric functions to calculate circular positions
- Use `getPaletteColor` to get color for each item
- Pass color to Item via themeColors

**Key Code Snippet**:

```tsx
items.forEach((item, index) => {
  const angle = (index * 2 * Math.PI) / items.length - Math.PI / 2;
  const itemX = centerX + radius * Math.cos(angle) - itemBounds.width / 2;
  const itemY = centerY + radius * Math.sin(angle) - itemBounds.height / 2;
  const color = getPaletteColor(options, [index]);

  itemElements.push(
    <Item
      indexes={[index]}
      datum={item}
      data={data}
      x={itemX}
      y={itemY}
      themeColors={getThemeColors({ colorPrimary: color }, options)}
    />,
  );
});
```

You can creatively design new layout structures based on these patterns.

## Output Format

Generated code should be a complete TypeScript file containing:

- **Type Imports**: Import necessary types like `ComponentType`, `JSXElement`, etc.
- **Component Imports**: Selectively import used atomic components, encapsulated components, decoration components, etc.
- **Utility Function Imports**: Import used layout, theme, data processing utility functions
- **Props Interface**: Inherit `BaseStructureProps`, define custom parameters
- **Component Implementation**: Complete component logic
- **Structure Registration**: Register component using `registerStructure`

**Code Style Requirements**:

- Use 2-space indentation
- Group import statements by type
- Use `const` for variable declarations
- Use concise arrow function syntax
- Appropriate blank lines separating logical blocks

**Example Output**:

```tsx
import type { ComponentType, JSXElement } from '../../jsx';
import { getElementBounds, Group } from '../../jsx';
import { BtnAdd, BtnRemove, BtnsGroup, ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import type { BaseStructureProps } from './types';

export interface ExampleProps extends BaseStructureProps {
  gap?: number;
}

export const Example: ComponentType<ExampleProps> = (props) => {
  // Component implementation
};

registerStructure('example', {
  component: Example,
  composites: ['title', 'item'], // Fill in based on actual components used
});
```

---
