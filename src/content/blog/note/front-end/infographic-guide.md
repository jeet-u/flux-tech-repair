---
title: Infographic Guide
link: infographic-guide
date: 2026-01-03 12:00:00
description: Detailed guide on how to use @antv/infographic in Markdown to create beautiful infographics, with practical examples of various templates
tags:
  - Infographic
  - Visualization
  - Markdown
categories:
  - [notes, frontend]
---

This article will provide a detailed introduction on how to use [@antv/infographic](https://infographic.antv.vision/) in Markdown to create various beautiful infographics.

## What is Infographic

Infographic is a type of chart that presents data, information, and knowledge in a visual way. Compared to traditional text descriptions, infographics can convey information more intuitively and attractively.

In this blog, you can directly use the `infographic` tag in Markdown code blocks to create various types of infographics, supporting:

- List display
- Process explanation
- Data comparison
- Hierarchical structure
- Statistical charts
- Quadrant analysis
- Relationship display

## Basic Syntax

Use the `infographic` tag in code blocks, specify the template name on the first line, then define data using YAML-like syntax:

````markdown
```infographic
infographic <template-name>
data
  title Title
  desc Description
  items
    - label Item Name
      desc Item Description
      icon mdi/icon-name
```
````

## List Templates (list-\*)

Suitable for displaying information lists, feature lists, tech stacks, etc.

### Grid Card Layout

Use `list-grid-badge-card` template to display card-style lists:

```infographic
infographic list-grid-badge-card
data
  title Frontend
  desc Modern frontend development common technologies
  items
    - label TypeScript
      desc Type-safe JavaScript superset
      icon mdi/language-typescript
    - label React
      desc JavaScript library for building user interfaces
      icon mdi/react
    - label Astro
      desc Modern static site generator
      icon mdi/rocket-launch
    - label Tailwind CSS
      desc Utility-first CSS framework
      icon mdi/tailwind
    - label Vite
      desc Next generation frontend build tool
      icon mdi/lightning-bolt
    - label Biome
      desc All-in-one web toolchain
      icon mdi/cog
```

### Candy Style Cards

Use `list-grid-candy-card-lite` to create more fun card styles:

```infographic
infographic list-grid-candy-card-lite
data
  title Blog Featured Features
  items
    - label Dark Mode
      desc Elegant theme switching
      icon mdi/theme-light-dark
    - label Site-wide Search
      desc Backend-free search based on Pagefind
      icon mdi/magnify
    - label Enhanced Markdown
      desc Support for GFM, Mermaid, Infographic
      icon mdi/markdown
    - label Smart Recommendations
      desc Article recommendations based on semantic similarity
      icon mdi/brain
```

### Horizontal Arrow List

Use `list-row-horizontal-icon-arrow` to display linear lists:

```infographic
infographic list-row-horizontal-icon-arrow
data
  title Process
  items
    - label Requirements Analysis
      icon mdi/clipboard-text
    - label Design Plan
      icon mdi/palette
    - label Implementation
      icon mdi/code-tags
    - label Testing & Deployment
      icon mdi/rocket-launch
```


### Zigzag Steps

Use `sequence-zigzag-steps-underline-text` to display process steps:

```infographic
infographic sequence-zigzag-steps-underline-text
data
  title Blog Setup Process
  items
    - label Choose Framework
      desc Select Astro as static site generator
    - label Design Theme
      desc Design based on Shoka theme reference
    - label Develop Features
      desc Implement article system, search, comments and more
    - label Deploy to Production
      desc Use Vercel for automated deployment
```

### Circular Process

Use `sequence-circular-simple` to display circular processes:

```infographic
infographic sequence-circular-simple
data
  title PDCA Cycle
  items
    - label Plan
      desc Make a plan
    - label Do
      desc Execute and implement
    - label Check
      desc Verify and validate
    - label Act
      desc Improve and optimize
```

### Vertical Roadmap

Use `sequence-roadmap-vertical-simple` to display timelines or roadmaps:

```infographic
infographic sequence-roadmap-vertical-simple
data
  title Project Milestones
  items
    - label 2024 Q1
      desc Project launch, complete infrastructure
    - label 2024 Q2
      desc Implement core features, begin content migration
    - label 2024 Q3
      desc Optimize performance, add advanced features
    - label 2024 Q4
      desc Official release, continuous optimization
```

### Pyramid Structure

Use `sequence-pyramid-simple` to display hierarchical progression:

```infographic
infographic sequence-pyramid-simple
data
  title Maslow's Hierarchy of Needs
  items
    - label Self-actualization
    - label Esteem needs
    - label Social needs
    - label Safety needs
    - label Physiological needs
theme
  palette
    - #8b5cf6
    - #3b82f6
    - #06b6d4
    - #10b981
    - #f59e0b
```


### SWOT Analysis

Use `compare-swot` for SWOT analysis:

```infographic
infographic compare-swot
data
  title Tech Blog SWOT Analysis
  items
    - label Strengths
      children
        - label Technical Accumulation
        - label Personal Brand
        - label Knowledge Consolidation
    - label Weaknesses
      children
        - label Time Investment
        - label Continuous Update Pressure
        - label Low Initial Traffic
    - label Opportunities
      children
        - label Active Tech Community
        - label Open Source Ecosystem Growth
        - label Personal Growth Space
    - label Threats
      children
        - label Content Homogenization
        - label Platform Competition
        - label Rapid Technology Iteration
```


Suitable for displaying organizational structures, classification systems and other tree relationships.

### System Hierarchical Structure

Use `hierarchy-structure` to display multi-layer architecture:

```infographic
infographic hierarchy-structure
data
  title System Hierarchical Structure
  desc Display modules and function groups at different levels
  items
    - label Presentation Layer
      children
        - label Mini Program
        - label App
        - label Tablet
        - label Desktop Client
        - label Web
    - label Application Layer
      children
        - label Core Module
          children
            - label Feature 1
            - label Feature 2
            - label Feature 3
            - label Feature 4
            - label Feature 5
            - label Feature 6
        - label Base Module
          children
            - label Feature 1
            - label Feature 2
            - label Feature 3
            - label Feature 4
            - label Feature 5
            - label Feature 6
        - label Other Module
          children
            - label Feature 1
            - label Feature 2
            - label Feature 3
            - label Feature 4
            - label Feature 5
            - label Feature 6
    - label Platform Layer
      children
        - label Module 1
          children
            - label Feature 1
            - label Feature 2
            - label Feature 3
            - label Feature 4
        - label Module 2
          children
            - label Feature 1
            - label Feature 2
            - label Feature 3
            - label Feature 4
        - label Module 3
          children
            - label Feature 1
            - label Feature 2
            - label Feature 3
            - label Feature 4
```

### Tech-style Tree Diagram

Use `hierarchy-tree-tech-style-capsule-item` to display hierarchical structure:

```infographic
infographic hierarchy-tree-tech-style-capsule-item
data
  title Frontend Technology System
  items
    - label Frontend Development
      children
        - label Base Technologies
          children
            - label HTML
            - label CSS
            - label JavaScript
        - label Frameworks/Libraries
          children
            - label React
            - label Vue
            - label Astro
        - label Engineering
          children
            - label Vite
            - label Webpack
            - label Rollup
```

### Rounded Rectangle Tree Diagram

Use `hierarchy-tree-curved-line-rounded-rect-node` to display hierarchy:

```infographic
infographic hierarchy-tree-curved-line-rounded-rect-node
data
  title Blog Content Categories
  items
    - label Technical Articles
      children
        - label Frontend
          children
            - label React
            - label TypeScript
        - label Backend
          children
            - label Node.js
            - label Databases
    - label Life Essays
      children
        - label Annual Summary
        - label Book Notes
```

### Column Chart

Use `chart-column-simple` to display data comparison:

```infographic
infographic chart-column-simple
data
  title Monthly Article Publishing Statistics
  items
    - label January
      value 5
    - label February
      value 8
    - label March
      value 12
    - label April
      value 6
    - label May
      value 10
    - label June
      value 15
```

### Bar Chart

Use `chart-bar-plain-text` to display horizontal comparison:

```infographic
infographic chart-bar-plain-text
data
  title Programming Language Usage Share
  items
    - label TypeScript
      value 45
    - label JavaScript
      value 25
    - label Python
      value 15
    - label Go
      value 10
    - label Others
      value 5
```

### Pie Chart

Use `chart-pie-plain-text` to display distribution:

```infographic
infographic chart-pie-plain-text
data
  title Traffic Source Distribution
  items
    - label Search Engines
      value 45
    - label Social Media
      value 30
    - label Direct Visit
      value 15
    - label External Links
      value 10
```

### Donut Chart

Use `chart-pie-donut-pill-badge` to create a donut chart:

```infographic
infographic chart-pie-donut-pill-badge
data
  title Tech Stack Share
  items
    - label Frontend
      value 50
    - label Backend
      value 30
    - label DevOps
      value 20
```

### Line Chart

Use `chart-line-plain-text` to display trends:

```infographic
infographic chart-line-plain-text
data
  title Blog Visit Trend
  items
    - label Week 1
      value 100
    - label Week 2
      value 150
    - label Week 3
      value 200
    - label Week 4
      value 280
    - label Week 5
      value 350
    - label Week 6
      value 420
```


### Simple Card Quadrant

Use `quadrant-quarter-simple-card` for quadrant analysis:

```infographic
infographic quadrant-quarter-simple-card
data
  title Quadrant Analysis
  items
    - label Important and Urgent
      desc Directly Avoid Risk
      illus notify
    - label Important Not Urgent
      desc Take Risk Control Measures
      illus coffee
    - label Not Important But Urgent
      desc Transfer Risk Through Insurance
      illus diary
    - label Not Important Not Urgent
      desc Choose to Accept Risk
      illus invest
```


### Circular Icon Relationship

Use `relation-circle-icon-badge` to display relationship network:

```infographic
infographic relation-circle-circular-progress
data
  title Subsidiary
  desc Financial performance of each subsidiary, year-over-year profit growth
  items
    - label Cloud Computing Subsidiary
      value 25
      desc Annual net profit margin reached 25%, became group's core growth engine
      icon mingcute/cardano-ada-fill
    - label Artificial Intelligence Subsidiary
      value 40
      desc AI business expanded rapidly, profit increased 40% year-over-year
      icon mingcute/openai-fill
    - label Internet of Things Subsidiary
      value 1000
      desc IoT device shipments broke 10 million, profit steadily increased
      icon mingcute/medium-fill
    - label FinTech Subsidiary
      value 18
      desc Digital payment business growing rapidly, net profit margin 18%
      icon mingcute/paypal-fill
    - label New Energy Subsidiary
      value 50
      desc Green energy project achieved scaled profitability, huge growth potential
      icon mingcute/drone-fill
```

## Theme Customization

Customize color scheme through `theme` block:

```infographic
infographic list-grid-badge-card
data
  title Custom Color
  items
    - label Primary Color
      desc Brand primary color
    - label Accent Color
      desc Emphasis color
    - label Neutral Color
      desc Background text
theme
  palette
    - #3b82f6
    - #8b5cf6
    - #f97316
    - #06b6d4
    - #10b981
```

## Practical Tips

### 1. Choose the Right Template

Select the corresponding template based on the type of information to display:

- **List Information** → `list-*`
- **Process Steps** → `sequence-*`
- **Data Comparison** → `compare-*` or `chart-*`
- **Hierarchical Relationships** → `hierarchy-*`
- **Priority Analysis** → `quadrant-*`
- **Relationship Diagram** → `relation-*`

### 2. Use Icons Wisely

Use [Material Design Icons](https://pictogrammers.com/library/mdi/) to make infographics more lively:

```plain
icon mdi/rocket-launch
icon mdi/heart
icon mdi/lightbulb
icon mdi/chart-line
```

### 3. Control Information Density

- Don't include too many items in each infographic (recommend 3-8)
- Use concise labels and descriptions
- Complex information can be split into multiple infographics

### 4. Pay Attention to Theme Adaptation

Infographics automatically follow the blog's dark/light theme switching without additional configuration.

## Summary

Infographic provides powerful visualization capabilities for Markdown documents, making technical blogs, documentation, and notes more lively and readable. Proper use of various templates can significantly enhance the expressiveness and readability of content.

For more templates and detailed documentation, please visit [Infographic Official Website](https://infographic.antv.vision/).
