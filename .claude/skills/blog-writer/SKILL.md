---
name: blog-writer
description: Help users create new blog posts according to astro-koharu blog standards. Automatically generates correct frontmatter structure, selects appropriate category paths, and provides Markdown content framework suggestions. Use cases: write a post, create new article, write article, write blog, new post, create blog post.
---

# Blog Writer Skill

Help users create new blog posts according to astro-koharu blog standards.

## Your Task

When users request to create a new blog post:

1. **Collect necessary information** (if not provided by user):
   - Article title
   - Article category (select from the category list below)
   - Article topic/keywords (for generating tags and description)

2. **Generate frontmatter**:
   ```yaml
   ---
   title: [Article Title]
   link: [URL slug, using English hyphenated words]
   catalog: true
   date: [Current date and time, format: YYYY-MM-DD HH:mm:ss]
   description: [One-sentence article description, 50-100 words]
   tags:
     - [Related tag 1]
     - [Related tag 2]
     - [Related tag 3]
   categories:
     - [Primary Category, Secondary Category]
   ---
   ```

   **Category format explanation**:
   - Nested categories use array format: `- [Primary Category, Secondary Category]`
   - Example: `- [Notes, Frontend]` creates URL `/categories/notes/frontend` and breadcrumb "Notes → Frontend"
   - Single category written directly: `categories: Essays`

3. **Determine file path**:
   - Base path: `src/content/blog/`
   - Generate corresponding subdirectory structure based on category
   - Filename: Use the value of `link` field + `.md` extension

4. **Generate Markdown content framework**:
   - Provide article structure suggestions (introduction, body sections, conclusion, etc.)
   - If appropriate, suggest using infographic components
   - Provide code example placeholders (if technical article)

## Category System

### Primary Categories and Their Subcategories

1. **Notes (notes/)**
   - Frontend (frontend/)
     - React
     - Vue
     - TypeScript
     - CSS
     - Performance Optimization
   - Backend (backend/) - If needed, ensure mapping is added to `config/site.yaml`
   - Other new subcategories - Require mapping to be added to `config/site.yaml` first

2. **Tools (tools/)**
   - Development Tools
   - Productivity Tools
   - Usage Guides

3. **Essays (essays/)**
   - Life Essays
   - Annual Reviews
   - Book Notes

4. **Weekly (weekly/)**
   - Tech Weekly
   - Weekly Shares

### Category Mapping Rules

**YAML Format (Important)**:
```yaml
# Nested categories (recommended) - Use array format
categories:
  - [Notes, Frontend]

# Single category - Write category name directly
categories: Essays
```

**URL and Path Mapping**:
- `categories: Essays` → URL: `/categories/essays` → File path: `src/content/blog/essays/`
- `categories: - [Notes, Frontend]` → URL: `/categories/notes/frontend` → File path: `src/content/blog/notes/frontend/`
- `categories: - [Notes, Frontend, CSS]` → URL: `/categories/notes/frontend` → File path: `src/content/blog/notes/frontend/`(third-level category as tag)

**Notes**:
- Nested categories must use `- [Primary, Secondary]` format
- Category names will be mapped to URL slugs

### Adding New Categories

If users need categories beyond those listed above, they must:

1. **Update `config/site.yaml`**:
   ```yaml
   categoryMap:
     # Primary categories
     Essays: essays
     Notes: notes
     Tools: tools
     Weekly: weekly

     # Secondary categories
     Frontend: frontend
     Backend: backend  # New example

     # Add new category mapping
     New Category: new-category-slug
   ```

2. **Create corresponding directory**:
   - Create directory structure in `src/content/blog/`
   - Example: adding "Backend" category requires creating `src/content/blog/notes/backend/`

3. **Inform user**:
   - Tell user the new category mapping has been added to `config/site.yaml`
   - Explain the URL path for the new category

## File Naming Convention

- Use English lowercase letters
- Use hyphens `-` between words
- Avoid special characters
- Examples: `react-hooks-guide.md`, `astro-blog-setup.md`

## Content Suggestions

### Technical Article Structure

```markdown
## Background/Problem

[Describe the problem to solve or technical background]

## Solution

[Detailed explanation of the solution method]

### Key Technical Point 1

[Technical details and code examples]

### Key Technical Point 2

[Technical details and code examples]

## Practical Results

[Actual application results, performance comparisons, etc.]

## Summary

[Summary of key points and experience]
```

### Tools/Guide Article Structure

```markdown
## Introduction

[Tool/Method introduction]

## Installation/Preparation

[Installation steps or prerequisites]

## Basic Usage

[Basic usage and examples]

## Advanced Features

[Advanced features and tips]

## Practical Tips

[Best practices and important notes]

## Summary

[Summary and resource links]
```

### Essay Article Structure

```markdown
## Introduction

[Opening, introduce the topic]

## Main Content

[Multiple paragraphs expanding on the topic]

## Reflections/Summary

[Personal thoughts and summary]
```

## Infographic Usage Suggestions

Based on article type, suggested scenarios for using infographics:

- **List Information** (tech stack, features) → `list-grid-badge-card`
- **Process Steps** (installation steps, development process) → `sequence-zigzag-steps-underline-text`
- **Comparison Analysis** (tech comparison, pros/cons) → `compare-binary-horizontal-simple-fold`
- **Statistics** (performance comparison, usage statistics) → `chart-column-simple` or `chart-bar-plain-text`
- **Hierarchical Structure** (directory structure, knowledge system) → `hierarchy-tree-tech-style-capsule-item`

## Final Steps

After creating the blog post:

1. **If new categories were added**:
   - Confirm `categoryMap` in `config/site.yaml` has been updated
   - Confirm corresponding directory structure has been created
   - Inform user of the new category's URL path

2. **Run checks**:
   - Run `pnpm dev` to preview locally
   - Run `pnpm lint:fix` to check formatting

3. **Follow-up suggestions**:
   - Remind users they can use infographic skills to add graphics
   - If needed, provide recommendations for related articles (based on tags)

## Example Conversations

### Example 1: Using Existing Categories

**User**: Write an article about React Hooks best practices

**You should**:

1. Confirm category: Notes > Frontend > React
2. Generate file path: `src/content/blog/notes/frontend/react-hooks-best-practices.md`
3. Create file with complete frontmatter (use `- [Notes, Frontend]` category format)
4. Provide article structure framework
5. Suggest using `list-grid-badge-card` infographic for "Common Hooks Comparison" section
6. Suggest using `sequence-zigzag-steps-underline-text` infographic for "Hooks Usage Process" section

### Example 2: Need to Add New Category

**User**: Write an article about Node.js backend development

**You should**:

1. Discover "Backend" category is not in existing category list
2. Ask user if they want to add "Backend" category
3. If user agrees:
   - Update `config/site.yaml`, add `Backend: backend`
   - Create directory `src/content/blog/notes/backend/`
   - Generate article file `src/content/blog/notes/backend/nodejs-development.md`
   - Use `- [Notes, Backend]` category format in frontmatter
4. Inform user:
   - New category has been added to `config/site.yaml`
   - URL path is `/categories/notes/backend`
   - Corresponding directory structure has been created
