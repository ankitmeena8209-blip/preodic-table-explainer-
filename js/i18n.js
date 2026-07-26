class I18nService {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
        this.translations = {};
        
        // Expose to global scope for inline onclick handlers if needed
        window.i18nService = this;
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.bindEvents();
        
        // Listen for language change events to re-translate DOM
        document.addEventListener('languageChanged', () => {
            this.translateDOM();
        });
    }

    async loadLanguage(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load ${lang}.json`);
            this.translations = await response.json();
            this.currentLang = lang;
            document.documentElement.lang = lang;
            localStorage.setItem('preferredLanguage', lang);
            
            // Dispatch event to notify components (like app.js) to re-render
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
            
            // Update the switcher UI if present
            this.updateSwitcherUI();
        } catch (error) {
            console.error('Error loading language:', error);
            // Fallback to english if hindi fails to load
            if (lang !== 'en') {
                await this.loadLanguage('en');
            }
        }
    }

    setLanguage(lang) {
        if (lang !== this.currentLang) {
            this.loadLanguage(lang);
        }
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let val = this.translations;
        for (const k of keys) {
            if (val === undefined) break;
            val = val[k];
        }
        
        if (val === undefined) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }

        if (typeof val === 'string' && Object.keys(params).length > 0) {
            return val.replace(/\{\{([^}]+)\}\}/g, (match, paramKey) => {
                return params[paramKey.trim()] !== undefined ? params[paramKey.trim()] : match;
            });
        }
        return val;
    }

    translateDOM(root = document) {
        // Translate text content
        const elements = root.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                // If the element has children (like icons), we only want to replace text nodes
                // Or we can just use innerHTML if we store HTML in JSON. 
                // A safer way: if it only contains text, replace textContent.
                // If it has icons, we should wrap the text in a span and translate that span.
                
                // Prevent unnecessary DOM updates by comparing encoded HTML
                const temp = document.createElement('div');
                temp.innerHTML = translation;
                if (el.innerHTML !== temp.innerHTML) {
                    el.innerHTML = translation;
                }
            }
        });

        // Translate placeholders
        const placeholders = root.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation !== key) {
                el.placeholder = translation;
            }
        });

        // Translate titles
        const titles = root.querySelectorAll('[data-i18n-title]');
        titles.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation !== key) {
                el.title = translation;
            }
        });
    }

    updateSwitcherUI() {
        const enBtn = document.getElementById('lang-btn-en');
        const hiBtn = document.getElementById('lang-btn-hi');
        
        if (enBtn && hiBtn) {
            if (this.currentLang === 'en') {
                enBtn.classList.add('text-primary', 'font-bold');
                enBtn.classList.remove('text-on-surface-variant');
                hiBtn.classList.remove('text-primary', 'font-bold');
                hiBtn.classList.add('text-on-surface-variant');
            } else {
                hiBtn.classList.add('text-primary', 'font-bold');
                hiBtn.classList.remove('text-on-surface-variant');
                enBtn.classList.remove('text-primary', 'font-bold');
                enBtn.classList.add('text-on-surface-variant');
            }
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-lang-switch]');
            if (target) {
                e.preventDefault();
                const lang = target.getAttribute('data-lang-switch');
                this.setLanguage(lang);
            }
        });

        // Automatically translate newly injected DOM nodes (e.g. from app.js SPA routing)
        this.observer = new MutationObserver((mutations) => {
            let shouldTranslate = false;
            for (const mutation of mutations) {
                // Ignore mutations on attributes to prevent loops if we ever observe attributes
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldTranslate = true;
                    break;
                }
            }
            if (shouldTranslate) {
                this.observer.disconnect();
                this.translateDOM();
                this.observer.observe(document.body, { childList: true, subtree: true });
            }
        });
        this.observer.observe(document.body, { childList: true, subtree: true });
    }
}

const i18n = new I18nService();
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});
