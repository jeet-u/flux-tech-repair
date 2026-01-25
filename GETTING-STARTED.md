# Quick Start

Welcome to the jeet-u blog theme! This guide will help you get your blog up and running in 5 minutes.

## 1. Environment Setup

Make sure your computer has:

- **Node.js** 18.0 or higher
- **pnpm** package manager

If you don't have pnpm installed, run:

```bash
npm install -g pnpm
```

## 2. Get Started in 3 Steps

### Step 1: Get the Code

```bash
# Method 1: Clone the repository
git clone https://github.com/cosZone/jeet-u.git
cd jeet-u

# Method 2: Use GitHub template (recommended)
# Click the "Use this template" button on the repository page
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Start the Development Server

```bash
pnpm dev
```

Open your browser and visit http://localhost:4321 to see your blog!

## 3. Configure Your Blog

### Basic Information

Edit `config/site.yaml`:

```yaml
site:
  title: Your Blog Name            # Website title
  alternate: myblog               # Short English name for logo
  subtitle: Your Subtitle         # Subtitle
  name: Your Name                 # Author name
  description: Blog description   # One-line introduction
  author: Jeet-u               # Article author
  url: https://your-domain.com/   # Domain after deployment
  startYear: 2024                 # Year blog started
  avatar: /img/avatar.webp        # Avatar path
  showLogo: true                  # Show logo
  keywords:                       # SEO keywords
    - blog
    - technology
```

### Replace Avatar

Replace your avatar image at `public/img/avatar.webp`

### Social Links

Configure social media links in `config/site.yaml`:

```yaml
social:
  github:
    url: https://github.com/jeet-u
    icon: ri:github-fill
    color: '#191717'
  email:
    url: mailto:flux-tech-repair@proton.me
    icon: ri:mail-line
    color: '#55acd5'
  rss:
    url: /rss.xml
    icon: ri:rss-line
    color: '#ff6600'
  # Add more social links...
```

## 4. Write Your First Article

Create a Markdown file in the `src/content/blog/` directory.

### Basic Template

```markdown
---
title: My First Article
date: 2024-01-01 12:00:00
tags:
  - tag1
  - tag2
categories:
  - category-name
cover: /img/cover/1.webp
---

Article content goes here...
```

### Frontmatter Fields

| Field         | Required | Description                                  |
| ------------- | -------- | -------------------------------------------- |
| `title`       | ✅       | Article title                               |
| `date`        | ✅       | Publication date                            |
| `tags`        | ❌       | List of tags                                |
| `categories`  | ❌       | Categories, supports nesting like `[Notes, Frontend]` |
| `cover`       | ❌       | Cover image path                            |
| `description` | ❌       | Article summary                            |
| `sticky`      | ❌       | Set to `true` to pin article               |
| `draft`       | ❌       | Set to `true` to mark as draft             |

### Using Categories

Single category:

```yaml
categories:
  - Notes
```

Nested categories:

```yaml
categories:
  - [Notes, Frontend]
```

## 5. Deploy

### Vercel One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cosZone/jeet-u&project-name=jeet-u&repository-name=jeet-u)

1. Click the button above
2. Sign in with your GitHub account
3. Wait for the automatic deployment to complete

### Custom Domain

1. Add your domain in Vercel project settings
2. Configure DNS as instructed
3. Update the `site.url` field in `config/site.yaml`

### Docker Deployment

If you prefer to deploy with Docker:

```bash
# 1. Copy the environment variables file and configure it
cp .env.example .env

# 2. Build and start (run from repository root)
docker compose --env-file ./.env -f docker/docker-compose.yml up -d --build

# 3. Visit your blog
open http://localhost:4321
```

**Important**: Generation scripts must be run locally:

```bash
# After adding new images/articles, run locally first:
pnpm koharu generate all

# Then commit changes
git add src/assets/*.json
git commit -m "chore: update generated assets"

# Finally rebuild Docker
./docker/rebuild.sh
```

For detailed instructions, see the [Docker deployment section in the usage guide](./src/content/blog/tools/jeet-u-guide.md).

## 6. Advanced Features

### Weekly/Series Articles

Configure `featuredSeries` in `config/site.yaml`:

```yaml
featuredSeries:
  categoryName: Weekly
  label: My Weekly
  fullName: My Tech Weekly
  description: Weekly tech sharing
  cover: /img/weekly_header.webp
  enabled: true
  links:
    github: https://github.com/jeet-u
    rss: /rss.xml
```

Then create weekly articles in the `src/content/blog/` directory.

### Content Generation (Optional)

Use the Koharu CLI to generate content assets:

```bash
# Interactively select generation type
pnpm koharu generate

# Or specify type directly
pnpm koharu generate lqips        # Generate LQIP image placeholders for better loading experience
pnpm koharu generate similarities # Generate semantic similarity vectors to recommend related articles
pnpm koharu generate summaries    # Generate AI summaries
pnpm koharu generate all          # Generate all
```

## Common Commands

| Command                     | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `pnpm dev`                  | Start development server                       |
| `pnpm build`                | Build for production                           |
| `pnpm preview`              | Preview production build                       |
| `pnpm lint`                 | Check code                                     |
| `pnpm koharu`               | Interactive CLI menu                           |
| `pnpm koharu backup`        | Backup blog content (--full for complete backup) |
| `pnpm koharu restore`       | Restore from backup (--latest for latest)      |
| `pnpm koharu update`        | Update theme (--check, --skip-backup)         |
| `pnpm koharu generate`      | Generate content assets                        |
| `pnpm koharu clean`         | Clean old backups (--keep N to retain N)       |
| `pnpm koharu list`          | View all backups                               |

## 7. Update Theme

When a new theme version is released, you can update following these steps while preserving your personal content.

### Update Using CLI (Recommended)

Use Koharu CLI for one-click theme updates that automatically handles backup → fetch → merge → install dependencies:

```bash
# Complete update process (backs up by default)
pnpm koharu update

# Only check for updates
pnpm koharu update --check

# Update without backup
pnpm koharu update --skip-backup
```

The update process automatically:
1. Checks workspace status
2. Backs up your personal content (optional)
3. Sets upstream remote (if not already set)
4. Fetches the latest code
5. Shows new commits list
6. Merges updates
7. Installs dependencies

If merge conflicts occur, the CLI will show the conflicting files and provide guidance.

### Manual Update

If you prefer manual updates:

```bash
# 1. Back up your personal content first
pnpm koharu backup --full

# 2. Add upstream repository (only once)
git remote add upstream https://github.com/cosZone/jeet-u.git

# 3. Fetch latest code
git fetch upstream

# 4. Merge updates to your branch
git merge upstream/main

# 5. Resolve possible conflicts, then install dependencies
pnpm install

# 6. Test if everything works
pnpm dev
```

### Restore Backups

If you need to restore a backup after updating:

```bash
# View all backups
pnpm koharu list

# Preview files to be restored
pnpm koharu restore --dry-run

# Restore latest backup
pnpm koharu restore --latest
```

### Post-Update Checklist

After updating, check the following:

1. **Configuration Compatibility**: If `config/site.yaml` has new fields, refer to `.env.example` or documentation
2. **Dependency Updates**: Run `pnpm install` to ensure dependencies are installed correctly
3. **Build Test**: Run `pnpm build` to ensure successful build
4. **Feature Test**: Run `pnpm dev` to check if pages display correctly

### Important Notes

- If you modified theme source code (e.g., component styles), merge conflicts may occur and need manual resolution
- Consider using `git stash` or creating a branch before updating to save local changes
- For major version updates, check [Release Notes](https://github.com/cosZone/jeet-u/releases) for breaking changes

## Get Help

- 📖 [Detailed Usage Guide](./src/content/blog/tools/jeet-u-guide.md)
- 🐛 [Submit an Issue](https://github.com/cosZone/jeet-u/issues)
- ⭐ [GitHub Repository](https://github.com/cosZone/jeet-u)

---

Happy blogging!
