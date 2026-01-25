---
title: Table of Contents Without Numbering Example
link: toc-no-numbering
catalog: true
tocNumbering: false
date: 2024-01-07 00:00:00
description: Demonstrates how to disable automatic numbering for article table of contents.
tags:
  - Table of Contents
  - Tutorial
categories:
  - notes
---

This article demonstrates how to disable automatic numbering for table of contents.

## Table of Contents Numbering Feature

By default, astro-koharu uses CSS counters to automatically add hierarchical numbering to the table of contents, such as:

- 1. Chapter One
  - 1.1. Section One
  - 1.2. Section Two
- 2. Chapter Two

## Disabling Numbering

You can disable numbering for a specific article by setting `tocNumbering: false`:

```yaml
---
title: My Article
tocNumbering: false
---
```

## Effect Comparison

### Numbering Enabled (Default)

Table of contents items display numbering like 1., 1.1., 1.1.1.

### Numbering Disabled

Table of contents items only show heading text without numbering prefix.

## This Article's Effect

This article has `tocNumbering: false` set. You can view the table of contents on the right side (desktop) or expand it (mobile) to see the effect.

## Technical Implementation

The numbering feature is implemented using pure CSS counters with zero runtime overhead:

```css
.toc-numbering {
  counter-reset: h2;
}

.toc-numbering h2::before {
  counter-increment: h2;
  content: counter(h2) ". ";
}
```

## Usage Suggestions

You may want to disable numbering in the following scenarios:

- Essay-type articles
- Titles already have numbering
- Articles with loose content structure
- Personal preference

## Summary

Table of contents numbering is an optional feature. Use it flexibly based on your article type.
