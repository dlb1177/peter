/**
 * Church of St. Peter - Components Module
 * Reusable UI components: modals, toasts, accordions, tabs, lightbox, etc.
 */

(function() {
  'use strict';

  const Components = {
    toasts: [],
    modals: {},
    config: {
      toastDuration: 4000,
      animationDuration: 300
    },

    /**
     * Initialize all components
     */
    init: function() {
      this.initMobileAccordions();
      this.initTabs();
      this.initBackToTop();
      this.initLightbox();
      this.initForms();
    },

    /**
     * TOAST NOTIFICATION SYSTEM
     */
    toast: function(message, type = 'info', duration = null) {
      const toastContainer = this.getOrCreateToastContainer();
      const id = `toast-${Date.now()}`;
      const finalDuration = duration || this.config.toastDuration;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.id = id;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `
        <div class="toast-content">
          <span class="toast-message">${this.escapeHtml(message)}</span>
          <button class="toast-close" aria-label="Close notification">×</button>
        </div>
      `;

      toastContainer.appendChild(toast);
      this.toasts.push(id);

      // Trigger animation
      setTimeout(() => toast.classList.add('show'), 10);

      // Close button
      toast.querySelector('.toast-close').addEventListener('click', () => {
        this.removeToast(id);
      });

      // Auto remove
      if (finalDuration > 0) {
        setTimeout(() => this.removeToast(id), finalDuration);
      }

      return id;
    },

    removeToast: function(id) {
      const toast = document.getElementById(id);
      if (!toast) return;

      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
        this.toasts = this.toasts.filter(t => t !== id);
      }, this.config.animationDuration);
    },

    getOrCreateToastContainer: function() {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      return container;
    },

    /**
     * MODAL/DIALOG SYSTEM
     */
    createModal: function(id, options = {}) {
      const {
        title = '',
        content = '',
        footer = '',
        size = 'medium',
        closeButton = true,
        backdrop = true
      } = options;

      const modal = document.createElement('div');
      modal.className = `modal modal-${size}`;
      modal.id = id;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');

      let html = `
        <div class="modal-overlay" ${backdrop ? 'data-backdrop="true"' : ''}></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">${this.escapeHtml(title)}</h2>
            ${closeButton ? '<button class="modal-close" aria-label="Close modal">&times;</button>' : ''}
          </div>
          <div class="modal-body">
            ${content}
          </div>
      `;

      if (footer) {
        html += `<div class="modal-footer">${footer}</div>`;
      }

      html += `</div>`;
      modal.innerHTML = html;

      document.body.appendChild(modal);
      this.modals[id] = modal;

      // Event listeners
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal(id));
      }

      const overlay = modal.querySelector('[data-backdrop="true"]');
      if (overlay) {
        overlay.addEventListener('click', () => this.closeModal(id));
      }

      // Escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') this.closeModal(id);
      };
      modal.addEventListener('keydown', escapeHandler);

      return modal;
    },

    openModal: function(id) {
      const modal = this.modals[id] || document.getElementById(id);
      if (!modal) return;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus management
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]');
      if (focusableElements.length) {
        focusableElements[0].focus();
      }
    },

    closeModal: function(id) {
      const modal = this.modals[id] || document.getElementById(id);
      if (!modal) return;

      modal.classList.remove('active');
      document.body.style.overflow = '';
    },

    /**
     * ACCORDION COMPONENT
     */
    initMobileAccordions: function() {
      const accordions = document.querySelectorAll('[data-accordion]');
      accordions.forEach(accordion => {
        this.setupAccordion(accordion);
      });
    },

    setupAccordion: function(container) {
      const toggles = container.querySelectorAll('[data-accordion-toggle]');

      toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
          const contentId = toggle.getAttribute('data-accordion-toggle');
          const content = document.getElementById(contentId);
          const isOpen = content.classList.contains('open');

          // Close siblings
          const parent = toggle.closest('[data-accordion]');
          parent.querySelectorAll('[data-accordion-content].open').forEach(item => {
            if (item.id !== contentId) {
              item.classList.remove('open');
              const relatedToggle = parent.querySelector(`[data-accordion-toggle="${item.id}"]`);
              if (relatedToggle) {
                relatedToggle.setAttribute('aria-expanded', 'false');
              }
            }
          });

          // Toggle current
          content.classList.toggle('open');
          toggle.setAttribute('aria-expanded', !isOpen);
        });
      });
    },

    /**
     * TABS COMPONENT
     */
    initTabs: function() {
      const tabContainers = document.querySelectorAll('[data-tabs]');

      tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('[role="tab"]');
        const panels = container.querySelectorAll('[role="tabpanel"]');

        tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => {
            // Remove active from all tabs and panels
            tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab
            tab.setAttribute('aria-selected', 'true');
            const panelId = tab.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) panel.classList.add('active');
          });

          // Keyboard navigation
          tab.addEventListener('keydown', (e) => {
            let nextTab;
            if (e.key === 'ArrowRight') {
              nextTab = index < tabs.length - 1 ? tabs[index + 1] : tabs[0];
            } else if (e.key === 'ArrowLeft') {
              nextTab = index > 0 ? tabs[index - 1] : tabs[tabs.length - 1];
            }

            if (nextTab) {
              e.preventDefault();
              nextTab.click();
              nextTab.focus();
            }
          });
        });
      });
    },

    /**
     * BACK TO TOP BUTTON
     */
    initBackToTop: function() {
      const button = document.querySelector('.back-to-top');
      if (!button) {
        this.createBackToTopButton();
        return;
      }

      window.addEventListener('scroll', () => {
        const isVisible = window.pageYOffset > 300;
        button.classList.toggle('visible', isVisible);
      }, { passive: true });

      button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    createBackToTopButton: function() {
      const button = document.createElement('button');
      button.className = 'back-to-top';
      button.setAttribute('aria-label', 'Back to top');
      button.innerHTML = '↑';

      document.body.appendChild(button);
      this.initBackToTop();
    },

    /**
     * LIGHTBOX COMPONENT
     */
    initLightbox: function() {
      const images = document.querySelectorAll('[data-lightbox]');
      images.forEach(img => {
        img.addEventListener('click', (e) => {
          e.preventDefault();
          this.openLightbox(img.dataset.lightbox, img.dataset.lightboxSrc || img.src);
        });
      });
    },

    openLightbox: function(gallery, imageSrc) {
      const lightbox = this.createLightboxModal(imageSrc, gallery);
      lightbox.classList.add('active');

      // Keyboard controls
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          lightbox.remove();
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);

      // Close on overlay click
      const overlay = lightbox.querySelector('.lightbox-overlay');
      overlay.addEventListener('click', () => {
        lightbox.remove();
        document.removeEventListener('keydown', handleKeydown);
      });
    },

    createLightboxModal: function(src, gallery) {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
          <img src="${src}" alt="Lightbox image" class="lightbox-image">
        </div>
      `;

      document.body.appendChild(lightbox);

      const closeBtn = lightbox.querySelector('.lightbox-close');
      closeBtn.addEventListener('click', () => lightbox.remove());

      return lightbox;
    },

    /**
     * FORM VALIDATION HELPERS
     */
    initForms: function() {
      const forms = document.querySelectorAll('[data-validate]');
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          if (!this.validateForm(form)) {
            e.preventDefault();
          }
        });
      });
    },

    validateForm: function(form) {
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      return isValid;
    },

    validateField: function(field) {
      const value = field.value.trim();
      let isValid = true;

      // Required
      if (field.hasAttribute('required') && !value) {
        isValid = false;
      }

      // Email
      if (field.type === 'email' && value && !this.isValidEmail(value)) {
        isValid = false;
      }

      // Phone
      if (field.dataset.validate === 'phone' && value && !this.isValidPhone(value)) {
        isValid = false;
      }

      // Min length
      if (field.hasAttribute('minlength') && value.length < parseInt(field.getAttribute('minlength'))) {
        isValid = false;
      }

      // Show error
      const container = field.closest('.form-group');
      if (container) {
        const errorEl = container.querySelector('.form-error');
        if (!isValid) {
          if (!errorEl) {
            const error = document.createElement('span');
            error.className = 'form-error';
            error.textContent = field.dataset.errorMessage || 'This field is invalid';
            container.appendChild(error);
          }
          container.classList.add('error');
        } else {
          if (errorEl) errorEl.remove();
          container.classList.remove('error');
        }
      }

      return isValid;
    },

    /**
     * EMAIL VALIDATION
     */
    isValidEmail: function(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    /**
     * PHONE VALIDATION
     */
    isValidPhone: function(phone) {
      const re = /^[\d\s\-\+\(\)\.]+$/;
      return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    /**
     * ESCAPE HTML
     */
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Inject component styles
  function injectComponentStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Toast Notifications */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .toast {
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 300px;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease;
      }

      .toast.show {
        opacity: 1;
        transform: translateX(0);
      }

      .toast-info {
        border-left: 4px solid #0d212a;
      }

      .toast-success {
        border-left: 4px solid #22c55e;
      }

      .toast-error {
        border-left: 4px solid #ef4444;
      }

      .toast-warning {
        border-left: 4px solid #f59e0b;
      }

      .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }

      /* Modals */
      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9998;
      }

      .modal.active {
        display: flex;
      }

      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
      }

      .modal-content {
        position: relative;
        background: white;
        border-radius: 12px;
        margin: auto;
        max-height: 90vh;
        overflow-y: auto;
        animation: modalSlideIn 0.3s ease;
      }

      .modal-medium .modal-content {
        width: 90%;
        max-width: 500px;
      }

      .modal-large .modal-content {
        width: 90%;
        max-width: 800px;
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid #eee;
      }

      .modal-title {
        margin: 0;
        font-size: 20px;
        color: #0d212a;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #999;
      }

      .modal-body {
        padding: 24px;
      }

      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      /* Accordion */
      [data-accordion-content] {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      [data-accordion-content].open {
        max-height: 500px;
      }

      /* Lightbox */
      .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .lightbox-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
      }

      .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
      }

      .lightbox-image {
        width: 100%;
        height: auto;
      }

      .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 32px;
        cursor: pointer;
      }

      /* Back to Top */
      .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #c5a059;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
      }

      .back-to-top.visible {
        opacity: 1;
        visibility: visible;
      }

      .back-to-top:hover {
        background: #deb872;
      }

      /* Form Validation */
      .form-error {
        display: block;
        color: #ef4444;
        font-size: 14px;
        margin-top: 4px;
      }

      .form-group.error input,
      .form-group.error textarea,
      .form-group.error select {
        border-color: #ef4444;
      }

      @media (max-width: 640px) {
        .toast-container {
          right: 10px;
          left: 10px;
        }

        .toast {
          min-width: unset;
        }

        .lightbox-close {
          top: 20px;
          right: 20px;
          color: white;
        }

        .back-to-top {
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          font-size: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Inject styles
  if (document.head) {
    injectComponentStyles();
  } else {
    document.addEventListener('DOMContentLoaded', injectComponentStyles);
  }

  // Expose to global scope
  window.Components = Components;
})();
