# Multi-Series Feature Test Guide

This document describes how to use patch files to test various scenarios for the multi-series feature.

## Prerequisites

```bash
# Ensure workspace is clean
git status

# If there are uncommitted changes, stash them first
git stash
```

---

## Test 1: Add a Second Series (Reading)

**Purpose**: Verify that the multi-series functionality works correctly

### Apply Patch

```bash
git apply tests/series-test-patches/01-add-reading-series.patch
```

### Changes

- `config/site.yaml`:
  - Add `reading: reading` to `categoryMap`
  - Add a second series configuration to `featuredSeries`
  - Add a "Reading" navigation item to `navigation`
- Create a new test post at `src/content/blog/reading/test-book.md`

### Verification Steps

1. Start the dev server
   ```bash
   pnpm dev
   ```

2. Check the following pages:
   - [ ] Home: the latest post from the "Reading" series should be highlighted
   - [ ] `/reading`: the series page should display the test post
   - [ ] Navigation: a "Reading" menu item should appear
   - [ ] `/weekly`: the weekly series page should still work

3. Build test
   ```bash
   pnpm build
   ```
   The build should complete without errors.

### Revert

```bash
git checkout -- .
rm -rf src/content/blog/reading  # remove the test post directory
```

---

## Test 2: Disable the Weekly Series

**Purpose**: Verify that `enabled: false` correctly disables a series

### Apply Patch

```bash
git apply tests/series-test-patches/02-disable-weekly.patch
```

### Changes

- `config/site.yaml`: change the `weekly` series `enabled: true` to `enabled: false`

### Verification Steps

1. Start the dev server
   ```bash
   pnpm dev
   ```

2. Check the following:
   - [ ] Home: the weekly series highlight should not appear
   - [ ] `/weekly`: visiting should return the 404 page
   - [ ] Sidebar: there should be no weekly entry

3. Build test
   ```bash
   pnpm build
   ```
   The build should complete without errors and should not generate pages for `/weekly`.

### Revert

```bash
git checkout -- .
```

---

## Test 3: Reserved Route Conflict Error

**Purpose**: Verify that using a reserved route as the slug triggers a build error

### Apply Patch

```bash
git apply tests/series-test-patches/03-test-reserved-slug-error.patch
```

### Changes

- `config/site.yaml`: change the slug from `weekly` to `categories` (a reserved route)

### Verification Steps

1. Attempt to build
   ```bash
   pnpm build
   ```

2. Expected results:
   - [ ] The build should **fail**
   - [ ] The error message should indicate that `categories` is a reserved route
   - [ ] The error should list all reserved route names

3. Development mode should also report an error
   ```bash
   pnpm dev
   ```
   - [ ] A configuration error warning should appear on startup

### Revert

```bash
git checkout -- .
```

---

## Test 4: Disable Highlight on Home

**Purpose**: Verify that `highlightOnHome: false` disables the homepage highlight

### Apply Patch

```bash
git apply tests/series-test-patches/04-test-highlight-off.patch
```

### Changes

- `config/site.yaml`: add `highlightOnHome: false` to the weekly series configuration

### Verification Steps

1. Start the dev server
   ```bash
   pnpm dev
   ```

2. Check the following:
   - [ ] Home: the weekly series highlight should **not** appear
   - [ ] `/weekly`: the series page should still work
   - [ ] Navigation: the weekly menu item should still be present

3. Build test
   ```bash
   pnpm build
   ```
   The build should complete without errors.

### Revert

```bash
git checkout -- .
```

---

## Combined Tests (Optional)

You can also apply multiple patches together for more complex testing:

```bash
# Enable the reading series + turn off weekly highlight
git apply tests/series-test-patches/01-add-reading-series.patch
git apply tests/series-test-patches/04-test-highlight-off.patch

pnpm dev
# Verify: Home only shows the reading series highlight, not the weekly highlight

# Revert
git checkout -- .
rm -rf src/content/blog/reading
```

---

## Quick Reference

| Patch | Test Scenario | Expected Result |
|-------|--------------|-----------------|
| `01-add-reading-series.patch` | Add a second series | Both series work normally |
| `02-disable-weekly.patch` | Disable a series | Series page returns 404, no highlight on home |
| `03-test-reserved-slug-error.patch` | Reserved route conflict | Build fails with error message |
| `04-test-highlight-off.patch` | Disable home highlight | Series works but no highlight on home |

---

## After Tests Complete

```bash
# Ensure all changes are reverted
git checkout -- .
rm -rf src/content/blog/reading  # if patch 01 was applied

# Restore any previously stashed changes (if applicable)
git stash pop
```
