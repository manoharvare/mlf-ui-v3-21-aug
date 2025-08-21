import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

// Fade in animation
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('150ms ease-out', style({ opacity: 0 }))
  ])
]);

// Slide in animation (for modals)
export const slideIn = trigger('slideIn', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'scale(0.95) translateY(-10px)' 
    }),
    animate('200ms ease-out', style({ 
      opacity: 1, 
      transform: 'scale(1) translateY(0)' 
    }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ 
      opacity: 0, 
      transform: 'scale(0.95) translateY(-10px)' 
    }))
  ])
]);

// Slide in from right (for toasts)
export const slideInFromRight = trigger('slideInFromRight', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateX(100%)' 
    }),
    animate('300ms ease-out', style({ 
      opacity: 1, 
      transform: 'translateX(0)' 
    }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ 
      opacity: 0, 
      transform: 'translateX(100%)' 
    }))
  ])
]);

// Slide down animation (for dropdowns)
export const slideDown = trigger('slideDown', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateY(-10px) scale(0.95)' 
    }),
    animate('150ms ease-out', style({ 
      opacity: 1, 
      transform: 'translateY(0) scale(1)' 
    }))
  ]),
  transition(':leave', [
    animate('100ms ease-in', style({ 
      opacity: 0, 
      transform: 'translateY(-10px) scale(0.95)' 
    }))
  ])
]);

// Accordion expand/collapse
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({
    height: '0px',
    overflow: 'hidden'
  })),
  state('expanded', style({
    height: '*',
    overflow: 'hidden'
  })),
  transition('collapsed <=> expanded', [
    animate('200ms ease-in-out')
  ])
]);

// Progress bar animation
export const progressAnimation = trigger('progressAnimation', [
  transition(':enter', [
    style({ width: '0%' }),
    animate('500ms ease-out', style({ width: '*' }))
  ])
]);