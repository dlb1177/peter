/**
 * Church of St. Peter - Main Application Bootstrap
 * Loads shared components, initializes modules, manages page lifecycle
 */

(function() {
  'use strict';

  const App = {
    config: {
      navSelector: 'body',
      footerSelector: 'body',
      navBreakpoint: 768,
      colors: {
        navy: '#0d212a',
        gold: '#c5a059',
        goldLight: '#deb872',
        cream: '#f9f7f2'
      },
      contact: {
        phone: '(651) 452-4550',
        email: 'church@stpetersmendota.org'
      }
    },

    /**
     * Detect if we're running from root or /pages/ subdirectory
     */
    getBasePath: function() {
      const pathname = window.location.pathname;
      const isSubpage = pathname.includes('/pages/');
      return isSubpage ? '../' : './';
    },

    /**
     * Get current page name for nav highlighting
     */
    getCurrentPage: function() {
      const pathname = window.location.pathname;
      const filename = pathname.split('/').pop() || 'index.html';
      return filename;
    },

    /**
     * Initialize navigation
     */
    initNav: function() {
      var basePath = this.getBasePath();
      var navHtml = window.createNavigation ? window.createNavigation(basePath) : '';
      var container = document.getElementById('site-navigation');
      if (container) {
        container.innerHTML = navHtml;
      }
      this.highlightActiveNav();
    },

    /**
     * Initialize footer
     */
    initFooter: function() {
      var basePath = this.getBasePath();
      var footerHtml = window.createFooter ? window.createFooter(basePath) : '';
      var container = document.getElementById('site-footer');
      if (container) {
        container.innerHTML = footerHtml;
      }
    },

    /**
     * Highlight active nav link based on current page
     */
    highlightActiveNav: function() {
      const currentPage = this.getCurrentPage();
      const navbar = document.getElementById('main-navbar');
      if (!navbar) return;

      const navLinks = navbar.querySelectorAll('a[href]');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        let isActive = false;

        if (currentPage === 'index.html' && (href === './' || href === '../' || href.endsWith('index.html'))) {
          isActive = true;
        } else if (href && href.endsWith(currentPage)) {
          isActive = true;
        }

        if (isActive) {
          link.style.color = '#c5a059';
        }
      });
    },

    /**
     * Initialize animations module
     */
    initAnimations: function() {
      if (window.Animations && typeof window.Animations.init === 'function') {
        window.Animations.init();
      }
    },

    /**
     * Initialize components module
     */
    initComponents: function() {
      if (window.Components && typeof window.Components.init === 'function') {
        window.Components.init();
      }
    },

    /**
     * Handle mobile menu toggle
     */
    initMobileMenu: function() {
      const hamburger = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      const icon = document.getElementById('hamburger-icon');

      if (!hamburger || !mobileMenu) return;

      let isOpen = false;

      const toggleMenu = (open) => {
        if (open === undefined) open = !isOpen;
        isOpen = open;
        mobileMenu.classList.toggle('hidden', !isOpen);
        if (icon) {
          icon.classList.toggle('fa-bars', !isOpen);
          icon.classList.toggle('fa-xmark', isOpen);
        }
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };

      hamburger.addEventListener('click', () => toggleMenu());

      // Close menu when links clicked
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
          toggleMenu(false);
        }
      });
    },

    /**
     * Initialize sticky nav with scroll shrink
     */
    initStickyNav: function() {
      const nav = document.getElementById('main-navbar');
      if (!nav) return;

      let lastScrollTop = 0;
      const scrollThreshold = 100;

      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > scrollThreshold) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
      }, { passive: true });
    },

    /**
     * Initialize desktop hover dropdowns
     */
    initDesktopMenus: function() {
      if (window.innerWidth < this.config.navBreakpoint) return;

      const dropdownTriggers = document.querySelectorAll('[data-dropdown-menu]');

      dropdownTriggers.forEach(trigger => {
        const submenu = trigger.nextElementSibling;
        if (!submenu || !submenu.classList.contains('nav-dropdown')) return;

        trigger.addEventListener('mouseenter', () => {
          submenu.classList.add('visible');
        });

        trigger.addEventListener('mouseleave', () => {
          submenu.classList.remove('visible');
        });

        submenu.addEventListener('mouseenter', () => {
          submenu.classList.add('visible');
        });

        submenu.addEventListener('mouseleave', () => {
          submenu.classList.remove('visible');
        });
      });
    },

    /**
     * Utility: Check if element is in viewport
     */
    isInViewport: function(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
      );
    },

    /**
     * Utility: Generate unique ID
     */
    generateId: function(prefix = 'id') {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Utility: Debounce function calls
     */
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Utility: Throttle function calls
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
     * Handle responsive behavior
     */
    initResponsive: function() {
      const handleResize = this.debounce(() => {
        const isMobile = window.innerWidth < this.config.navBreakpoint;
        document.documentElement.classList.toggle('mobile', isMobile);
      }, 250);

      window.addEventListener('resize', handleResize);
      handleResize();
    },

    /**
     * Page-specific initialization dispatcher
     */
    initPageSpecific: function() {
      const currentPage = this.getCurrentPage();
      const pageInitializers = {
        'index.html': 'initHome',
        'mass-prayer.html': 'initMassPrayer',
        'sacraments.html': 'initSacraments',
        'events.html': 'initEvents',
        'donations.html': 'initDonations'
      };

      const initFn = pageInitializers[currentPage];
      if (initFn && typeof window[initFn] === 'function') {
        window[initFn]();
      }
    },

    /**
     * Main initialization
     */
    init: function() {
      // Load shared components
      this.initNav();
      this.initFooter();

      // Initialize core features
      this.initMobileMenu();
      this.initStickyNav();
      this.initDesktopMenus();
      this.initResponsive();

      // Initialize modules
      this.initAnimations();
      this.initComponents();

      // Page-specific init
      this.initPageSpecific();

      // Emit custom event
      document.dispatchEvent(new CustomEvent('appReady', { detail: { app: this } }));
    }
  };

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

  // Expose to global scope
  window.App = App;
})();
