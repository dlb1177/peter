/**
 * Church of St. Peter - Navigation Module
 * Uses Tailwind utility classes directly for reliable rendering on file:// protocol
 */

(function() {
  'use strict';

  const Navigation = {
    basePath: './',

    menuStructure: [
      {
        label: 'Home',
        href: 'index.html'
      },
      {
        label: 'Mass & Prayer',
        submenu: [
          { label: 'Mass Times & Confession', href: 'pages/mass-prayer.html' },
          { label: 'Adoration Chapel', href: 'pages/mass-prayer.html#adoration' },
          { label: 'Liturgical Ministries', href: 'pages/mass-prayer.html#liturgy' }
        ]
      },
      {
        label: 'Sacraments',
        submenu: [
          { label: 'Baptism', href: 'pages/sacraments.html#baptism' },
          { label: 'First Reconciliation', href: 'pages/sacraments.html#reconciliation' },
          { label: 'First Communion', href: 'pages/sacraments.html#communion' },
          { label: 'Confirmation', href: 'pages/sacraments.html#confirmation' },
          { label: 'Marriage', href: 'pages/sacraments.html#marriage' },
          { label: 'Anointing of the Sick', href: 'pages/sacraments.html#anointing' },
          { label: 'RCIA', href: 'pages/sacraments.html#rcia' }
        ]
      },
      {
        label: 'Faith Life',
        submenu: [
          { label: 'Faith Formation (CGS)', href: 'pages/faith-formation.html' },
          { label: 'Youth Ministry', href: 'pages/faith-formation.html#youth' },
          { label: 'Adult Small Groups', href: 'pages/small-groups.html' },
          { label: 'Alpha', href: 'pages/alpha.html' },
          { label: 'Faith Enrichment Resources', href: 'pages/faith-enrichment.html' }
        ]
      },
      {
        label: 'About',
        submenu: [
          { label: 'Staff & Contacts', href: 'pages/contact.html' },
          { label: 'Parish History', href: 'pages/history.html' },
          { label: 'Parish Financial', href: 'pages/financial.html' },
          { label: 'Pastoral Care', href: 'pages/pastoral-care.html' },
          { label: 'Cemetery', href: 'pages/cemetery.html' },
          { label: 'Our Catholic School', href: 'pages/school.html' }
        ]
      },
      {
        label: 'News & Events',
        submenu: [
          { label: 'Events Calendar', href: 'pages/events.html' },
          { label: 'Bulletins & Newsletters', href: 'pages/bulletins.html' },
          { label: 'Uganda Mission', href: 'pages/bulletins.html#uganda' }
        ]
      }
    ],

    createUtilityBar: function() {
      return `
        <div style="background-color:#08161c;font-size:0.75rem;letter-spacing:0.05em;" class="text-gray-300 py-2 relative z-[60]">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <div class="flex items-center gap-4">
              <a href="tel:6514524550" class="hover:text-church-gold transition-colors font-bold">
                <i class="fa-solid fa-phone mr-1"></i> (651) 452-4550
              </a>
              <span class="hidden md:inline text-gray-600">|</span>
              <a href="mailto:church@stpetersmendota.org" class="hover:text-church-gold transition-colors hidden sm:inline">
                <i class="fa-solid fa-envelope mr-1"></i> church@stpetersmendota.org
              </a>
            </div>
            <div class="flex items-center gap-4">
              <a href="https://www.facebook.com/stpetersmendota" target="_blank" rel="noopener noreferrer" class="hover:text-church-gold transition-colors" aria-label="Facebook">
                <i class="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://www.youtube.com/channel/UC_fywJlEasDKZOZLPd3cIWA" target="_blank" rel="noopener noreferrer" class="hover:text-church-gold transition-colors" aria-label="YouTube">
                <i class="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    },

    createDesktopMenuItems: function() {
      return this.menuStructure.map((item, index) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;

        if (!hasSubmenu) {
          const href = item.href === 'index.html' ? this.basePath : `${this.basePath}${item.href}`;
          return `
            <a href="${href}"
               class="relative px-3 py-2 text-xs font-bold uppercase tracking-widest text-white hover:text-church-gold transition-colors"
               style="text-decoration:none;">
              ${item.label}
            </a>
          `;
        }

        const submenuId = `desktop-sub-${index}`;
        return `
          <div class="relative group" style="z-index:50;">
            <button
              class="px-3 py-2 text-xs font-bold uppercase tracking-widest text-white hover:text-church-gold flex items-center gap-1 transition-colors"
              onclick="document.getElementById('${submenuId}').classList.toggle('hidden')"
              onmouseenter="document.getElementById('${submenuId}').classList.remove('hidden')"
            >
              ${item.label}
              <i class="fa-solid fa-chevron-down text-[8px] opacity-50 group-hover:opacity-100 transition-opacity"></i>
            </button>
            <div
              id="${submenuId}"
              class="absolute left-0 top-full pt-2 w-56 hidden group-hover:block"
              style="z-index:999;"
              onmouseleave="this.classList.add('hidden')"
            >
              <div class="bg-white text-church-navy shadow-2xl rounded-sm py-2 border-t-4 border-church-gold">
                ${item.submenu.map(sub => `
                  <a href="${this.basePath}${sub.href}"
                     class="block w-full text-left px-6 py-3 text-sm font-semibold hover:bg-gray-50 hover:text-church-gold transition-colors border-b border-gray-100"
                     style="text-decoration:none;color:#0d212a;">
                    ${sub.label}
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    createMobileMenuItems: function() {
      let html = '';
      this.menuStructure.forEach((item, index) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const submenuId = `mobile-sub-${index}`;

        if (!hasSubmenu) {
          const href = item.href === 'index.html' ? this.basePath : `${this.basePath}${item.href}`;
          html += `
            <a href="${href}"
               class="block py-3 px-4 text-white text-sm font-semibold uppercase tracking-wider hover:text-church-gold hover:bg-white/5 transition-colors border-b border-white/10"
               style="text-decoration:none;">
              ${item.label}
            </a>
          `;
        } else {
          html += `
            <div class="border-b border-white/10">
              <button
                onclick="var el=document.getElementById('${submenuId}');el.classList.toggle('hidden');this.querySelector('.mobile-caret').textContent=el.classList.contains('hidden')?'+':'−';"
                class="flex justify-between items-center w-full py-3 px-4 text-white text-sm font-semibold uppercase tracking-wider hover:text-church-gold hover:bg-white/5 transition-colors"
              >
                <span>${item.label}</span>
                <span class="mobile-caret text-church-gold text-lg font-bold">+</span>
              </button>
              <div id="${submenuId}" class="hidden bg-white/5 pb-2">
                ${item.submenu.map(sub => `
                  <a href="${this.basePath}${sub.href}"
                     class="block py-2 pl-8 pr-4 text-gray-300 text-sm hover:text-church-gold hover:bg-white/5 transition-colors"
                     style="text-decoration:none;">
                    ${sub.label}
                  </a>
                `).join('')}
              </div>
            </div>
          `;
        }
      });

      // CTA buttons
      html += `
        <div class="p-4 mt-4 space-y-3">
          <a href="${this.basePath}pages/donations.html"
             class="block text-center bg-church-gold text-white px-6 py-3 rounded-sm uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-church-navy transition-all shadow-lg"
             style="text-decoration:none;">
            Give
          </a>
          <a href="${this.basePath}pages/new-parishioner.html"
             class="block text-center border-2 border-church-gold text-church-gold px-6 py-3 rounded-sm uppercase tracking-widest text-xs font-bold hover:bg-church-gold hover:text-white transition-all"
             style="text-decoration:none;">
            New Here?
          </a>
        </div>
      `;
      return html;
    },

    createMainNav: function() {
      return `
        <nav class="bg-church-navy text-white border-b border-white/10 sticky top-0 z-50 shadow-xl font-sans" id="main-navbar">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">

              <!-- Logo -->
              <div class="flex-shrink-0">
                <a href="${this.basePath}index.html" class="flex items-center gap-3" style="text-decoration:none;">
                  <img
                    src="https://lirp.cdn-website.com/51d19b9a/dms3rep/multi/opt/Logo-1920w.png"
                    alt="Church of St. Peter"
                    class="h-12 w-auto brightness-0 invert filter transition-transform hover:scale-105 duration-300"
                  >
                </a>
              </div>

              <!-- Desktop Menu -->
              <div class="hidden xl:flex items-center space-x-1">
                ${this.createDesktopMenuItems()}

                <!-- CTA Buttons -->
                <a href="${this.basePath}pages/donations.html"
                   class="bg-church-gold hover:bg-white hover:text-church-navy text-white px-4 py-2 rounded-sm uppercase tracking-widest text-[10px] font-bold transition-all duration-300 shadow-lg border border-transparent hover:border-church-navy ml-3"
                   style="text-decoration:none;">
                  Giving
                </a>
                <a href="${this.basePath}pages/new-parishioner.html"
                   class="border border-church-gold text-church-gold hover:bg-church-gold hover:text-white px-4 py-2 rounded-sm uppercase tracking-widest text-[10px] font-bold transition-all duration-300 ml-2"
                   style="text-decoration:none;">
                  New Here?
                </a>
              </div>

              <!-- Mobile Hamburger -->
              <div class="xl:hidden flex items-center">
                <button id="mobile-menu-btn" class="text-white hover:text-church-gold focus:outline-none p-2 transition-transform active:scale-95" aria-label="Toggle menu">
                  <i class="fa-solid fa-bars text-2xl" id="hamburger-icon"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Menu Panel -->
          <div id="mobile-menu" class="hidden xl:hidden bg-church-navy border-t border-white/10 shadow-2xl overflow-y-auto" style="max-height:calc(100vh - 80px);">
            <div class="py-4">
              ${this.createMobileMenuItems()}
            </div>
          </div>
        </nav>
      `;
    },

    createFooterContent: function() {
      return `
        <footer class="bg-church-navy text-white pt-16 pb-8 border-t border-church-gold/30">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

              <!-- About -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <img src="https://lirp.cdn-website.com/51d19b9a/dms3rep/multi/opt/Logo-1920w.png" alt="Logo" class="h-8 w-auto brightness-0 invert filter">
                </div>
                <p class="text-sm text-gray-400 leading-relaxed">
                  Church of St. Peter - A welcoming Catholic parish community dedicated to faith, service, and spiritual growth.
                </p>
                <div class="flex space-x-4 pt-2">
                  <a href="https://www.facebook.com/stpetersmendota" target="_blank" class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-church-gold hover:border-church-gold transition-all text-white text-xs" style="text-decoration:none;">
                    <i class="fa-brands fa-facebook-f"></i>
                  </a>
                  <a href="https://www.youtube.com/channel/UC_fywJlEasDKZOZLPd3cIWA" target="_blank" class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-church-gold hover:border-church-gold transition-all text-white text-xs" style="text-decoration:none;">
                    <i class="fa-brands fa-youtube"></i>
                  </a>
                </div>
              </div>

              <!-- Mass & Prayer Links -->
              <div class="space-y-2 text-sm text-gray-400">
                <h4 class="text-white font-display font-bold uppercase text-xs tracking-widest mb-3">Mass & Prayer</h4>
                <p><a href="${this.basePath}pages/mass-prayer.html" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Mass Times</a></p>
                <p><a href="${this.basePath}pages/mass-prayer.html#confession" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Confession</a></p>
                <p><a href="${this.basePath}pages/mass-prayer.html#adoration" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Adoration Chapel</a></p>
              </div>

              <!-- Community Links -->
              <div class="space-y-2 text-sm text-gray-400">
                <h4 class="text-white font-display font-bold uppercase text-xs tracking-widest mb-3">Community</h4>
                <p><a href="${this.basePath}pages/faith-formation.html" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Faith Formation</a></p>
                <p><a href="${this.basePath}pages/faith-formation.html#youth" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Youth Ministry</a></p>
                <p><a href="${this.basePath}pages/small-groups.html" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Small Groups</a></p>
                <p><a href="${this.basePath}pages/sacraments.html" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Sacraments</a></p>
              </div>

              <!-- Contact Info -->
              <div class="space-y-3">
                <h4 class="text-white font-display font-bold uppercase text-xs tracking-widest mb-3">Contact</h4>
                <div class="text-sm text-gray-400 italic">
                  <p>1405 Sibley Memorial Highway</p>
                  <p>PO Box 50679</p>
                  <p>Mendota, MN 55150-0679</p>
                </div>
                <div class="text-sm text-gray-400 pt-2">
                  <p class="font-bold text-white">Office Hours:</p>
                  <p>Mon-Fri 8am-4pm</p>
                </div>
                <div class="text-sm text-gray-400 space-y-1 pt-1">
                  <p><a href="tel:6514524550" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">(651) 452-4550</a></p>
                  <p><a href="mailto:church@stpetersmendota.org" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">church@stpetersmendota.org</a></p>
                </div>
              </div>

            </div>

            <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 gap-2">
              <p>&copy; ${new Date().getFullYear()} Church of St. Peter. All rights reserved.</p>
              <div class="flex gap-4">
                <a href="${this.basePath}pages/safe-environment.html" class="hover:text-church-gold transition-colors" style="text-decoration:none;color:inherit;">Safe Environment</a>
              </div>
            </div>
          </div>
        </footer>
      `;
    }
  };

  // Public API
  window.createNavigation = function(basePath) {
    if (basePath === undefined) basePath = './';
    Navigation.basePath = basePath;
    return Navigation.createUtilityBar() + Navigation.createMainNav();
  };

  window.createFooter = function(basePath) {
    if (basePath === undefined) basePath = './';
    Navigation.basePath = basePath;
    return Navigation.createFooterContent();
  };

  window.Navigation = Navigation;
})();
