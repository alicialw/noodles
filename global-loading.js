// Modified loading functionality for all pages
function setupGlobalLoading() {
    // Ensure page starts at the top
    window.scrollTo(0, 0);
    
    // Create loading overlay 
    if (!document.querySelector('.loading-overlay')) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Loading...';
        
        loadingOverlay.appendChild(spinner);
        loadingOverlay.appendChild(loadingText);
        document.body.appendChild(loadingOverlay);
    }
    
    // Create navigation bar 
    if (!document.querySelector('.nav-bar')) {
        const navBar = document.createElement('div');
        navBar.className = 'nav-bar';
        
        // Get current page path
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';
        
        // Create logo container (left side)
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-container';
        
        // Create logo link for home
        const homeLogoLink = document.createElement('a');
        homeLogoLink.href = 'index.html';
        homeLogoLink.className = 'logo-link';
        
        // Create and add logo image
        const logoImg = document.createElement('img');
        logoImg.src = 'media/logo.svg';
        logoImg.alt = 'Noodles & Beyond';
        logoImg.className = 'nav-logo';
        homeLogoLink.appendChild(logoImg);
        logoContainer.appendChild(homeLogoLink);
        
        // Create navigation links container (right side)
        const navLinksContainer = document.createElement('div');
        navLinksContainer.className = 'nav-links';
        
        // Define navigation links (now including Home)
        const navLinks = [
            { href: 'index.html', text: 'Home' },
            { href: 'about.html', text: 'About' },
            { href: 'game.html', text: 'Game' }
        ];
        
        // Create navigation links
        navLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            
            // Set active state for current page
            if ((pageName === link.href) || 
                (pageName === '' && link.href === 'index.html')) {
                a.classList.add('active');
            }
            
            navLinksContainer.appendChild(a);
        });
        
        // Add both containers to the nav bar
        navBar.appendChild(logoContainer);
        navBar.appendChild(navLinksContainer);
        
        document.body.appendChild(navBar);
    }
    
    return document.querySelector('.loading-overlay');
}

// Function to hide loading overlay
function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500); // Match transition time from CSS
    }
}

// Detect what page we're on and call the right initialization
document.addEventListener('DOMContentLoaded', () => {
    // Ensure page starts at the top
    window.scrollTo(0, 0);
    
    // Create loading overlay and navigation
    const loadingOverlay = setupGlobalLoading();
    
    // Get current page path
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';
    
    // Handle back-to-top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Handle page-specific loading
    if (pageName === 'game.html') {
        // For game page, we need to modify the window.init function before it's called
        if (typeof window.init === 'function') {
            // Save original init
            const originalInit = window.init;
            
            // Override init
            window.init = function() {
                // Call original init function
                originalInit();
                
                // Add a timeout to hide loading after 5 seconds if assets don't finish loading
                setTimeout(hideLoading, 5000);
            };
        } else {
            let initCalled = false;
            Object.defineProperty(window, 'init', {
                configurable: true,
                get: function() {
                    return function() {
                        const result = Function.prototype.apply.call(this._init, this, arguments);

                        if (!initCalled) {
                            initCalled = true;
                            // Add a timeout to hide loading after 5 seconds if assets don't finish loading
                            setTimeout(hideLoading, 5000);
                        }
                        return result;
                    };
                },
                set: function(val) {
                    this._init = val;
                }
            });
            
            setTimeout(hideLoading, 8000);
        }

        const originalSetupVessel = window.setupVessel;
        if (typeof originalSetupVessel === 'function') {
            window.setupVessel = function() {
                originalSetupVessel();
                hideLoading();
            };
        }

        setTimeout(hideLoading, 8000);
        
    } else if (pageName === 'index.html' || pageName === '') {
        let startSiteModified = false;
        
        const checkStartSite = setInterval(() => {
            if (typeof window.startSite === 'function' && !startSiteModified) {
                clearInterval(checkStartSite);
                startSiteModified = true;
                
                const originalStartSite = window.startSite;
                window.startSite = function() {
                    originalStartSite();
                    
                    // Ensure we start at the top of the page
                    window.scrollTo(0, 0);
                    hideLoading();
                };
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(checkStartSite);
            window.scrollTo(0, 0);
            hideLoading();
        }, 30000);
    } else {
        setTimeout(hideLoading, 1000);
    }
});