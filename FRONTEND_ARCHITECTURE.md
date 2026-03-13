# Frontend Architecture Documentation

## Overview

This document outlines the modern, production-quality frontend architecture implemented for the Custom Agent Builder Platform (CABP). The architecture prioritizes scalability, maintainability, performance, and user experience.

## Technology Stack

- **Framework**: React 18 (functional components with hooks)
- **Build Tool**: Vite 8.0.0
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v6
- **State Management**: React Context API + Zustand (lightweight)
- **Animations**: Framer Motion
- **Language**: JavaScript (JSX)

## Architecture Principles

### 1. Component-Based Architecture
- **Atomic Design**: Components are organized from simple primitives to complex compositions
- **Separation of Concerns**: Clear distinction between UI, layout, and feature components
- **Reusability**: Shared components prevent duplication and ensure consistency

### 2. Design System First
- **Design Tokens**: All visual properties defined as tokens (colors, spacing, typography)
- **Consistency**: Uniform look and feel across all pages
- **Scalability**: Easy to maintain and extend visual language

### 3. Performance Optimization
- **Code Splitting**: Lazy loading for routes and heavy components
- **Optimized Re-renders**: React.memo and proper dependency management
- **Efficient Animations**: GPU-accelerated transforms, short durations (<300ms)
- **Tree Shaking**: Vite automatically removes unused code

### 4. Accessibility First
- **Semantic HTML**: Proper use of HTML5 elements
- **Keyboard Navigation**: All interactive elements keyboard-accessible
- **ARIA Labels**: Screen reader support throughout
- **Focus States**: Visible focus indicators
- **Color Contrast**: WCAG AA/AAA compliance

### 5. Mobile-First Responsive Design
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Fluid Layouts**: Components adapt gracefully across devices
- **Touch-Friendly**: Adequate target sizes for mobile interactions

## Directory Structure

```
client/src/
├── components/
│   ├── ui/                      # Primitive UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Container.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Loading.jsx
│   │   └── index.js            # Barrel exports
│   ├── layout/                  # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── PageLayout.jsx
│   └── features/                # Feature-specific components
│       ├── AgentCard.jsx
│       └── AgentDetail.jsx
├── pages/                       # Page components (routes)
│   ├── HomePage.jsx
│   ├── AgentListPage.jsx
│   ├── AgentDetailPage.jsx
│   ├── AgentCreatePage.jsx
│   ├── AgentEditPage.jsx
│   ├── LoginPage.jsx
│   └── AccountPage.jsx
├── context/                     # React Context providers
│   ├── AuthContext.jsx
│   └── ModalContext.jsx
├── hooks/                       # Custom React hooks
│   └── index.js                # useMediaQuery, useDebounce, etc.
├── lib/                         # Utilities and helpers
│   ├── utils.js                # General utilities
│   └── animations.js           # Framer Motion variants
├── api/                         # API client
│   └── api.js
├── styles/                      # Global styles
│   └── globals.css             # Tailwind + custom styles
├── design-system/               # Design system documentation
│   ├── README.md               # Design system guide
│   └── tokens.js               # Design tokens as JS
├── App.jsx                      # Main app component
└── main.jsx                     # Entry point
```

## Component Categories

### UI Primitives (`components/ui/`)

These are the building blocks of the interface. They are:
- **Highly reusable**: Used throughout the application
- **Prop-driven**: Configurable via props, not context
- **Documented**: JSDoc comments explain usage
- **Tested**: Unit tests ensure reliability

**Components:**
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger, success), sizes, loading states, icons
- **Card**: Container with variants (default, bordered, elevated, ghost), hover effects, interactive mode
- **Input/Textarea**: Form inputs with error states, labels, hints, icons
- **Container/Section/Grid/Stack**: Layout primitives for responsive designs
- **Badge**: Status indicators and tags
- **Avatar**: User avatars with fallback initials, avatar groups
- **Loading**: Spinner, LoadingOverlay, Skeleton, SkeletonCard

### Layout Components (`components/layout/`)

Structure the overall page layout:
- **Header**: Sticky navigation with mobile menu, user authentication state
- **Footer**: Site footer with links and branding
- **PageLayout**: Wrapper combining header, main content, footer with page transitions

### Feature Components (`components/features/`)

Domain-specific components:
- **AgentCard**: Displays agent in card format with avatar, skills, roles
- **AgentDetail**: Full agent view with edit/delete actions

## Design System

### Color Palette

**Primary** (Brand Blue)
- Used for primary actions, links, active states
- Range: primary-50 to primary-950
- Main: primary-600 (#0284c7)

**Neutral** (Grays)
- Text, borders, backgrounds
- Range: neutral-50 to neutral-950

**Semantic Colors**
- Success: Green (#22c55e)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

### Typography

**Font Family**
- Sans: Inter (UI text)
- Mono: JetBrains Mono (code/data)

**Scale**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
**Weights**: light (300), regular (400), medium (500), semibold (600), bold (700), extrabold (800)

### Spacing

Based on 4px increments: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

### Shadows

- **xs**: Subtle hover
- **sm**: Cards, dropdowns
- **md**: Modals, popovers
- **lg**: Dialog overlays
- **xl**: Heavy emphasis
- **glow**: Focus/active states

## Animation System

### Framer Motion Integration

All animations use Framer Motion for:
- Declarative animation API
- Spring physics
- Layout animations
- Page transitions
- Gesture recognition

### Animation Variants

Predefined variants in `lib/animations.js`:
- **fadeIn**: Simple opacity transition
- **slideUp/slideDown**: Slide with fade
- **scaleIn**: Scale and fade
- **staggerContainer/staggerItem**: List animations
- **modalBackdrop/modalContent**: Modal animations
- **pageTransition**: Page route transitions
- **hoverScale/hoverLift**: Micro-interactions

### Performance Guidelines

- **Duration**: 150-300ms (never exceed 400ms)
- **Easing**: easeOut for entering, easeIn for exiting
- **Properties**: Prefer transform and opacity (GPU-accelerated)
- **Throttling**: Use requestAnimationFrame for scroll listeners

## State Management

### Context API

Used for global state that needs to be accessed throughout the app:
- **AuthContext**: User authentication state (token, user, login, logout)
- **ModalContext**: Global modal management

### Local State

Component-specific state uses `useState` and `useReducer`.

### Future: Zustand

For complex state management, Zustand is included:
- Lightweight (< 1KB)
- No providers needed
- DevTools integration
- TypeScript support

## Custom Hooks

Located in `hooks/index.js`:

- **useMediaQuery**: Responsive breakpoint tracking
- **useDebounce**: Debounce input values
- **useScrollPosition**: Track scroll position
- **useLocalStorage**: Sync state with localStorage
- **useOnClickOutside**: Detect clicks outside element
- **usePageTransition**: Page transition animations
- **useCopyToClipboard**: Copy text to clipboard

## Responsive Design

### Breakpoints

```javascript
sm: 640px   // Mobile landscape, small tablets
md: 768px   // Tablets
lg: 1024px  // Small laptops
xl: 1280px  // Desktops
2xl: 1536px // Large screens
```

### Mobile-First Approach

```jsx
// Default: mobile
// sm: small screens and up
// md: tablets and up
// lg: laptops and up
<div className="w-full md:w-1/2 lg:w-1/3">
```

### Container Sizes

- **sm**: max-w-3xl (~768px)
- **md**: max-w-5xl (~1024px)
- **lg**: max-w-7xl (~1280px)
- **xl**: max-w-screen-2xl (~1536px)

## Accessibility

### Keyboard Navigation

- All interactive elements are keyboard-accessible
- Proper tab order with semantic HTML
- Focus traps in modals
- Skip links for main content

### Screen Readers

- Semantic HTML (header, nav, main, footer, article, section)
- ARIA labels on icon-only buttons
- ARIA live regions for dynamic content
- Alt text for images

### Color Contrast

- Text on white: neutral-900 (WCAG AAA)
- Secondary text: neutral-700 (WCAG AA)
- Disabled states: neutral-400

### Focus Indicators

All interactive elements have visible focus states:
```css
ring-2 ring-primary-500 ring-offset-2
```

## Performance Optimization

### Bundle Size

- Tailwind purges unused CSS
- Tree shaking removes unused JavaScript
- Code splitting via React.lazy
- Vite optimizes dependencies

### Runtime Performance

- React.memo for expensive components
- useMemo/useCallback for expensive calculations
- Virtual scrolling for long lists (future)
- Image optimization (WebP, lazy loading)

### Loading States

- Skeleton screens during data fetch
- Loading spinners for actions
- Progressive enhancement

## Best Practices

### Component Design

1. **Single Responsibility**: Each component does one thing well
2. **Props Over State**: Prefer props for configuration
3. **Composition Over Inheritance**: Build complex UIs from simple parts
4. **TypeScript Ready**: JSDoc comments prepare for TS migration

### Styling

1. **Tailwind First**: Use utility classes, avoid custom CSS
2. **Design Tokens**: Reference tokens, not arbitrary values
3. **Responsive**: Always consider mobile, tablet, desktop
4. **Dark Mode Ready**: Color system supports dark theme

### Code Organization

1. **Colocation**: Keep related code together
2. **Barrel Exports**: index.js files for clean imports
3. **Named Exports**: Prefer named over default exports
4. **Consistent Naming**: PascalCase components, camelCase functions

## Migration Path

This architecture supports incremental migration:

1. **Phase 1** (Complete): Core UI primitives and layout
2. **Phase 2** (In Progress): Update existing pages to use new components
3. **Phase 3** (Future): Add advanced features (search, filters, bulk actions)
4. **Phase 4** (Future): TypeScript migration

## Testing Strategy

### Unit Tests

- React Testing Library for component tests
- Test user interactions, not implementation
- Accessibility tests (axe-core)

### Integration Tests

- Test page-level functionality
- API mocking with MSW
- User workflows

### E2E Tests

- Playwright for critical paths
- Visual regression testing
- Performance monitoring

## Future Enhancements

1. **Dark Mode**: Toggle between light/dark themes
2. **Internationalization**: i18n support for multiple languages
3. **Advanced Search**: Full-text search with filters
4. **Bulk Operations**: Select and act on multiple agents
5. **Data Visualization**: Charts and analytics
6. **Real-time Updates**: WebSocket integration
7. **Offline Support**: Progressive Web App (PWA)
8. **TypeScript**: Full type safety

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Router Docs](https://reactrouter.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design System README](./client/src/design-system/README.md)
