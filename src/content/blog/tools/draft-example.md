---
title: Console Repair Technician Guide - Draft Template
link: draft-example
catalog: true
date: 2024-01-06 00:00:00
description: This is a draft example post for console repair technicians working on repair documentation and technical guides in development.
tags:
  - Draft
  - Console Repair
categories:
  - tools
draft: true
---

This is a draft repair guide!

## Console Repair Draft Mode Overview

Set `draft: true` to mark a repair guide as draft for technicians:

```yaml
---
title: Console Repair Procedure
draft: true
---
```

## Repair Guide Draft Status Behavior

### Development Mode - Technician Preview (`pnpm dev`)

- ✅ Draft repair guides are visible
- ✅ Guide cards display "DRAFT" indicator in top right
- ✅ Can preview repair procedures and test troubleshooting steps

### Production Release - Published Guides (`pnpm build`)

- ❌ Draft guides are automatically filtered
- ❌ Will not appear in any repair guide lists
- ❌ Will not be indexed by search or help systems

## When to Use Draft Mode for Repair Guides

- Repair procedures under development
- Troubleshooting guides being tested in the field
- Hardware documentation not ready for public release
- Console repair techniques requiring review before publishing
- Internal technician notes and procedures

## Important Reminder for Console Technicians

If you can see this repair guide, you are in the development environment.

Remember to change `draft: true` to `draft: false` or remove the field before publishing repair procedures to your technician documentation.
