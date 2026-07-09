[Back to README](../README.md)

# Animations Documentation

This document describes the animation system used in the OneEntry Next.js Beauty Salon project.

## Overview

The project uses GSAP (GreenSock Animation Platform) for creating smooth animations and transitions. The animations are implemented using React components and hooks, with a special focus on performance and user experience.

## Animation Components

### RegisterGSAP

Registers the required GSAP plugins for the application:

- ScrollTrigger
- ScrollToPlugin
- useGSAP

This component should be included in the application root to ensure all animations work correctly. It returns an empty JSX element to satisfy React component requirements while performing plugin registration as a side effect.

### TransitionProvider

Provides page transition animations using Framer Motion. It wraps the page content and handles transitions between different pages.

### IntroAnimations

Handles the initial loading animation that appears when the application first loads. This creates a smooth introduction to the beauty salon application.

### CardAnimations

A reusable component that applies animations to service and master cards. It can be used to animate elements as they enter the viewport.

### TitleAnimations

A reusable component that applies animations to section titles and headings. Creates elegant entrance animations for content headers.

### GalleryCardAnimations

Specialized animations for gallery items, providing smooth transitions when viewing beauty service results.

## Implementation Details

### Client-Side Providers

All animation components are loaded as client components and are managed through the animation providers. This ensures that animations are only loaded on the client side, improving server-side rendering performance.

The animation system is integrated into the application through:

- TransitionProvider for page transitions
- RegisterGSAP for GSAP plugin registration
- IntroAnimations for initial loading animation
- ToastContainer for notifications

### Dynamic Imports

Heavy animation libraries are loaded using Next.js dynamic imports with lazy loading to optimize bundle size and initial loading performance:

```tsx
const ToastContainer = dynamic(
  () => import('react-toastify').then((mod) => mod.ToastContainer),
  {
    ssr: false,
    loading: () => null,
  },
);
```

This approach is used for:

- react-toastify
- GSAP animation components
- Page transition components

## Usage Examples

### Adding Page Transitions

Page transitions are automatically handled by the TransitionProvider component which is included in the layout.

### Adding Element Animations

To animate individual elements like service cards or master profiles, wrap them with the appropriate animation component:

```tsx
<CardAnimations>
  <ServiceCard service={service} />
</CardAnimations>
```

### Custom Animations

For custom animations, use the useGSAP hook:

```tsx
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

const MyComponent = () => {
  const ref = useRef(null);
  
  useGSAP(() => {
    gsap.to(ref.current, {
      opacity: 1,
      duration: 0.5
    });
  }, []);
  
  return <div ref={ref} style={{opacity: 0}}>Animated content</div>;
};
```

## Performance Considerations

1. All animations are optimized to run efficiently using GSAP's performance features
2. Animations are only loaded on the client side
3. Heavy animation libraries use dynamic imports with lazy loading
4. ScrollTrigger animations are properly cleaned up to prevent memory leaks
5. Initial animations are deferred to avoid blocking critical rendering
