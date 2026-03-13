# Design System Documentation

## Overview
This design system provides a comprehensive set of design tokens, components, and guidelines for building the Custom Agent Builder Platform UI.

## Design Principles

### 1. Trust Through Visual Design
- Consistent typography, spacing, and layout rhythm
- Professional color palette with semantic meaning
- High visual polish to build credibility

### 2. Clean Layout and Visual Hierarchy
- Generous whitespace for breathing room
- Clear hierarchy through size, weight, and color
- Primary actions are visually prominent

### 3. Performance First
- Optimized animations (under 300ms)
- Minimal layout shifts
- Efficient component structures

## Design Tokens

### Color Palette

#### Primary Colors
Used for primary actions, links, and brand elements.
- primary-50 to primary-950 (11 shades)
- Main: primary-600 (#0284c7)

#### Neutral Colors
Used for text, borders, and backgrounds.
- neutral-50 to neutral-950 (11 shades)
- Text: neutral-900, neutral-700
- Borders: neutral-200
- Backgrounds: neutral-50, neutral-100

#### Semantic Colors
- **Success**: Green (success-500: #22c55e)
- **Warning**: Amber (warning-500: #f59e0b)
- **Error**: Red (error-500: #ef4444)

### Typography

#### Font Families
- **Sans**: Inter (primary interface font)
- **Mono**: JetBrains Mono (code and data)

#### Font Sizes
- xs: 12px / 16px line-height
- sm: 14px / 20px
- base: 16px / 24px
- lg: 18px / 28px
- xl: 20px / 28px
- 2xl: 24px / 32px
- 3xl: 30px / 36px
- 4xl: 36px / 40px
- 5xl: 48px
- 6xl: 60px

#### Font Weights
- light: 300
- regular: 400
- medium: 500
- semibold: 600
- bold: 700
- extrabold: 800

### Spacing Scale
Based on 0.25rem (4px) increments:
- 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

Custom additions:
- 18 (72px)
- 88 (352px)
- 112 (448px)
- 128 (512px)

### Border Radius
- xs: 2px
- sm: 4px
- DEFAULT: 6px
- md: 8px
- lg: 12px
- xl: 16px
- 2xl: 24px
- 3xl: 32px
- full: 9999px

### Shadows
- xs: Subtle hover state
- sm: Cards, dropdowns
- DEFAULT: Elevated cards
- md: Modals, popovers
- lg: Dialog overlays
- xl: Heavy emphasis
- glow: Focus/active states

## Breakpoints

### Responsive Design
Mobile-first approach with these breakpoints:

- **sm**: 640px (mobile landscape, small tablets)
- **md**: 768px (tablets)
- **lg**: 1024px (small laptops)
- **xl**: 1280px (desktops)
- **2xl**: 1536px (large screens)

### Usage Example
```jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

## Animation System

### Duration Standards
- **Fast**: 150ms - Micro-interactions (hover, focus)
- **Base**: 200ms - Standard transitions
- **Slow**: 300ms - Complex state changes
- **Slower**: 400ms - Page transitions

### Easing Functions
- **ease-in-out**: Default for most transitions
- **ease-out**: Elements entering the screen
- **ease-in**: Elements leaving the screen

### Animation Utilities
- `animate-fade-in`: Fade in elements
- `animate-slide-up`: Slide up with fade
- `animate-slide-down`: Slide down with fade
- `animate-scale-in`: Scale and fade in
- `animate-shimmer`: Loading shimmer effect
- `animate-pulse-slow`: Gentle pulsing

## Component Patterns

### Cards
```jsx
<div className="card-base hover-lift p-6">
  {/* Card content */}
</div>
```

### Buttons
```jsx
<button className="btn-base bg-primary-600 text-white hover:bg-primary-700">
  Click me
</button>
```

### Inputs
```jsx
<input className="input-base" type="text" />
```

### Containers
```jsx
<div className="container-custom">
  {/* Page content */}
</div>
```

### Sections
```jsx
<section className="section">
  {/* Section content with vertical padding */}
</section>
```

## Accessibility Guidelines

### Focus States
All interactive elements must have visible focus states using:
- `ring-2 ring-primary-500 ring-offset-2`

### Color Contrast
- Text on white: neutral-900 (WCAG AAA)
- Secondary text: neutral-700 (WCAG AA)
- Disabled text: neutral-400

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use semantic HTML (button, a, input)
- Proper tab order

### ARIA Labels
- Use descriptive labels for all form inputs
- Add aria-label for icon-only buttons
- Use aria-live for dynamic content

## Usage Examples

### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

### Gradient Text
```jsx
<h1 className="text-gradient">Beautiful Heading</h1>
```

### Glass Effect
```jsx
<div className="glass p-6 rounded-lg">
  {/* Content with frosted glass background */}
</div>
```

### Loading Skeleton
```jsx
<div className="skeleton h-8 w-full"></div>
```

## File Structure

```
src/
  styles/
    globals.css           # Base styles and utilities
  design-system/
    README.md            # This file
    tokens.js            # Design tokens as JS
  components/
    ui/                  # Primitive UI components
    layout/              # Layout components
    features/            # Feature-specific components
  hooks/                 # Custom React hooks
  store/                 # State management
  lib/                   # Utilities and helpers
```

## Best Practices

1. **Use design tokens** - Always use Tailwind classes, avoid arbitrary values
2. **Component composition** - Build complex UIs from simple primitives
3. **Consistent spacing** - Use the spacing scale, don't use custom values
4. **Mobile-first** - Design for mobile, enhance for desktop
5. **Performance** - Minimize re-renders, use React.memo when appropriate
6. **Accessibility** - Test with keyboard, screen readers, color contrast tools

## Resources

- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Framer Motion Documentation: https://www.framer.com/motion
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
