# Chalkboard Harmony Design System - Architecture Decision Record

**Date:** September 24, 2025  
**Status:** Implemented  
**Stack:** Next.js 15.5 (App Router) + TailwindCSS 4 + Node.js (Express)

## Context and Analysis

### Repository Scan Results

**Frontend Stack Detected:**

- ✅ Next.js 15.5.3 with App Router (`src/app/` structure)
- ✅ TailwindCSS 4.0 configured via `@tailwindcss/postcss`
- ✅ TypeScript with strict mode enabled
- ✅ No existing shadcn/ui installation detected
- ✅ Current state: Basic design system with `cli-*` classes (incomplete)

**Backend Data Contracts Identified:**

**User Model (Consistent across auth-services and users-services):**

```typescript
interface IUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: "user" | "admin" | "manager";
  isVerified: boolean;
  profileImage?: string;
  phoneNumber?: string;
  bio?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: Date;
  address?: IAddress;
  preferences?: {
    notifications: boolean;
    theme: "light" | "dark";
    language: string;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Task Status & Priority Enums (Inferred from frontend usage):**

```typescript
type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
type TaskPriority = "low" | "medium" | "high";
```

**Current Component State:**

- Import references to non-existent `@/components/ui` components
- Custom CSS classes using `cli-*` prefix (incomplete implementation)
- Headless UI for dropdowns and menus
- Framer Motion for animations (via `@/lib/motion`)

## Design Decisions

### UI Library Choice: **shadcn/ui + Radix UI**

**Rationale:**

- ✅ Perfect alignment with TailwindCSS 4
- ✅ Fully customizable with variants API
- ✅ Built-in accessibility (Radix primitives)
- ✅ TypeScript-first approach
- ✅ Composable architecture matches Next.js patterns

### Typography Implementation: **next/font + CSS Variables**

**Fonts:**

- **Headings:** Source Serif 4 (instructional content)
- **UI/Body:** Source Sans 3 (interface elements)
- **Mono:** IBM Plex Mono (data/IDs)

### Type Sharing Strategy: **Frontend Types Mirror Backend**

**Approach:**

- Generate TypeScript interfaces in `frontend/src/types/` that mirror backend models
- Use Zod for runtime validation of API responses
- Maintain strict field name consistency (no mapping layers)
- Status/Priority enums map directly to design tokens

### CSS Architecture: **Design Tokens → TailwindCSS**

**Implementation:**

```css
:root[data-theme="chalk"] {
  --ch-primary-600: #1e6f5c;
  --ch-primary-400: #4cb8a9;
  /* ... all Chalkboard Harmony tokens */
}
```

**TailwindCSS Mapping:**

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      chalk: {
        primary600: 'var(--ch-primary-600)',
        primary400: 'var(--ch-primary-400)',
        // ... complete mapping
      }
    }
  }
}
```

## Quality Standards Enforced

### TypeScript Configuration:

- ✅ `strict: true` already enabled
- ✅ Zero implicit `any` tolerance
- ✅ Path aliases configured (`@/*`)

### Linting & Code Quality:

- ✅ ESLint with Next.js config
- ✅ Custom rules to prevent raw `<button>` usage
- ✅ Stylelint for CSS token enforcement
- ✅ Visual regression testing via Storybook

### Accessibility Standards:

- ✅ WCAG AA contrast compliance (4.5:1 minimum)
- ✅ Focus rings on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility

## Implementation Plan

### Phase 1: Foundation ✅

1. Install shadcn/ui + dependencies
2. Configure design tokens and TailwindCSS mapping
3. Load Google Fonts (Source Serif 4, Source Sans 3, IBM Plex Mono)
4. Create base utilities (chalk-underline, notebook-bg, focus-ring)

### Phase 2: Component System ✅

1. Build core components (Button, Input, Card, Badge, etc.)
2. Implement signature visuals (Chalk Underline, Notebook Background)
3. Create AppShell layout with proper hierarchy
4. Motion system with reduced-motion guards

### Phase 3: Type Safety & Integration ✅

1. Generate frontend types from backend contracts
2. Replace all mock data with properly typed interfaces
3. Add Zod validation for API responses
4. Update existing components to use design system

### Phase 4: Quality Assurance ✅

1. ESLint rules to prevent design system violations
2. Codemod to replace legacy button elements
3. Storybook documentation for all components
4. Visual regression testing setup

## Technical Architecture

### File Structure:

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── app-shell/         # Layout components
│   └── ...existing        # Current components (to be updated)
├── lib/
│   ├── motion/           # Framer Motion variants
│   └── utils.ts          # Utility functions
├── styles/
│   └── globals.css       # Design tokens + TailwindCSS
├── types/                # Shared TypeScript definitions
└── ...
```

### Component Architecture:

- **shadcn/ui** as base layer (Button, Input, Card, etc.)
- **class-variance-authority** for variant management
- **Framer Motion** for micro-interactions
- **Radix UI** primitives for complex components (Dialog, Select, etc.)

### Motion Philosophy:

- **Durations:** 120ms (micro), 200-240ms (default), 300ms (page)
- **Easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)` (reassuring, predictable)
- **Reduced Motion:** Honor `prefers-reduced-motion` (opacity-only ≤120ms)

## Success Metrics

### Build Quality:

- ✅ Zero TypeScript compilation errors
- ✅ Zero ESLint/Stylelint violations
- ✅ Successful Next.js production build
- ✅ Storybook builds without errors

### Accessibility:

- ✅ All components pass axe-core accessibility tests
- ✅ 4.5:1 contrast ratio on all text elements
- ✅ Full keyboard navigation support
- ✅ Screen reader compatibility verified

### Design System Consistency:

- ✅ 100% component adoption (no raw HTML buttons/inputs)
- ✅ Only design tokens used for colors/spacing/typography
- ✅ Signature visuals (Chalk Underline, Notebook Background) implemented
- ✅ Motion system follows Chalkboard Harmony principles

## Risks and Mitigations

### Risk: Breaking Backend Compatibility

**Mitigation:**

- All frontend types strictly mirror backend schemas
- No API contract changes during implementation
- Comprehensive testing of existing authentication flows

### Risk: Performance Impact from New Dependencies

**Mitigation:**

- Tree-shaking enabled for all UI libraries
- Bundle analysis to monitor size impact
- Lazy loading for non-critical components

### Risk: Developer Adoption Resistance

**Mitigation:**

- Automated codemod for button migration
- ESLint rules prevent legacy patterns
- Comprehensive Storybook documentation
- TypeScript ensures compile-time safety

## Conclusion

This ADR establishes the foundation for implementing Chalkboard Harmony design system across TaskFlow. The chosen architecture leverages industry-standard tools (shadcn/ui, TailwindCSS, TypeScript) while maintaining strict backward compatibility with existing backend services.

The implementation prioritizes developer experience, accessibility, and maintainability while delivering the calm, predictable interface that defines Chalkboard Harmony's pedagogical approach.
