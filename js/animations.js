/**
 * Church of St. Peter - Animations Module
 * Handles scroll reveals, parallax, lazy loading, and other animation effects
 */

(function() {
  'use strict';

  const Animations = {
    observers: [],
    config: {
      rootMargin: '0px 0px -100px 0px',
      threshold: [0, 0.25, 0.5],
      staggerDelay: 50
    },

    /**
     * Initialize animation system
     */
    init: function() {
      this.initScrollReveal();
      this.initLazyLoading();
      this.initParallax();
      this.initCounters();
      this.initPageTransitions();
    },

    /**
     * IntersectionObserver-based scroll reveal
     * Elements with data-animate attribute will animate when scrolled into view
     */
    initScrollReveal: function() {
      const elements = document.querySelectorAll('[data-animate]');
      if (!elements.length) return;

      const observerOptions = {
        root: null,
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const animationType = element.dataset.animate || 'fade-in-up';
            const delay = element.dataset.animateDelay || 0;

            setTimeout(() => {
              element.classList.add('animate-active');
              element.style.animationName = `animate-${animationType}`;
            }, parseInt(delay));

            // Handle staggered animations for children
            if (element.dataset.animateChildren === 'true') {
              this.staggerChildren(element);
            }

            observer.unobserve(element);
          }
        });
      }, observerOptions);

      elements.forEach(el => observer.observe(el));
      this.observers.push(observer);
    },

    /**
     * Stagger animations for child elements
     */
    staggerChildren: function(parent) {
      const children = parent.children;
      Array.from(children).forEach((child, index) => {
        setTimeout(() => {
          child.classList.add('animate-active');
          const childAnimation = child.dataset.animate || 'fade-in-up';
          child.style.animationName = `animate-${childAnimation}`;
        }, index * this.config.staggerDelay);
      });
    },

    /**
     * Lazy load images with fade-in effect
     * Images with data-lazy attribute will load on scroll
     */
    initLazyLoading: function() {
      const images = document.querySelectorAll('img[data-lazy]');
      if (!images.length) return;

      const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.lazy;
            const srcset = img.dataset.lazySrcset;

            const loadImage = () => {
              img.src = src;
              if (srcset) img.srcset = srcset;
              img.classList.add('lazy-loaded');
              observer.unobserve(img);
            };

            if ('loading' in HTMLImageElement.prototype) {
              img.loading = 'lazy';
              loadImage();
            } else {
              loadImage();
            }
          }
        });
      }, observerOptions);

      images.forEach(img => observer.observe(img));
      this.observers.push(observer);
    },

    /**
     * Parallax effect for hero sections
     * Elements with data-parallax attribute will have parallax motion
     */
    initParallax: function() {
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      if (!parallaxElements.length) return;

      const handleScroll = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        parallaxElements.forEach((element) => {
          const speed = element.dataset.parallax || 0.5;
          const yOffset = scrollY * speed;
          element.style.transform = `translateY(${yOffset}px)`;
        });
      };

      const throttledScroll = this.throttle(handleScroll, 30);
      window.addEventListener('scroll', throttledScroll, { passive: true });
    },

    /**
     * Counter animation for statistics
     * Elements with data-counter attribute will animate from 0 to value
     */
    initCounters: function() {
      const counters = document.querySelectorAll('[data-counter]');
      if (!counters.length) return;

      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('counter-active')) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      counters.forEach(counter => observer.observe(counter));
      this.observers.push(observer);
    },

    /**
     * Animate a counter element from 0 to target value
     */
    animateCounter: function(element) {
      const targetValue = parseInt(element.dataset.counter);
      const duration = parseInt(element.dataset.counterDuration) || 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(targetValue * progress);

        element.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.classList.add('counter-active');
        }
      };

      animate();
    },

    /**
     * Smooth page load transition
     */
    initPageTransitions: function() {
      // Fade in page on load
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.6s ease-in-out';

      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);

      // Fade out on link click (for pages with history)
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || link.target === '_blank') return;

        if (href.includes('http') && !href.includes(window.location.hostname)) {
          return; // External link
        }

        e.preventDefault();
        this.transitionToPage(href);
      });
    },

    /**
     * Transition to a new page with fade effect
     */
    transitionToPage: function(href) {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease-in-out';

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    },

    /**
     * Throttle function to limit execution frequency
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    /**
     * Cleanup observers
     */
    destroy: function() {
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
    }
  };

  // Define animation keyframes dynamically
  function injectAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes animate-fade-in-up {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes animate-fade-in-down {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes animate-fade-in-left {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes animate-fade-in-right {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes animate-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes animate-scale-in {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes animate-bounce-in {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
        }
      }

      [data-animate] {
        animation-duration: 0.8s;
        animation-fill-mode: both;
        animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      [data-animate].animate-active {
        animation-play-state: running;
      }

      [data-animate]:not(.animate-active) {
        animation-play-state: paused;
        opacity: 0;
      }

      img[data-lazy] {
        opacity: 0;
        transition: opacity 0.5s ease-in;
      }

      img.lazy-loaded {
        opacity: 1;
      }

      [data-parallax] {
        will-change: transform;
      }

      [data-counter] {
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  // Inject styles when script loads
  if (document.head) {
    injectAnimationStyles();
  } else {
    document.addEventListener('DOMContentLoaded', injectAnimationStyles);
  }

  // Expose to global scope
  window.Animations = Animations;
})();
