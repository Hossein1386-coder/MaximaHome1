// Navigation
function navigateTo(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    updateActiveNav(sectionId);
}

// Update active navigation state
function updateActiveNav(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const bottomItems = document.querySelectorAll('#bottom-nav .bottom-nav-item');
    navLinks.forEach(link => {
        const linkSection = link.getAttribute('data-section');
        if (linkSection === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    bottomItems.forEach(btn => {
        const btnSection = btn.getAttribute('data-section');
        if (btnSection === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const menuButton = document.getElementById('menu-button');
    
    const isOpen = mobileMenu.classList.contains('show');
    
    if (isOpen) {
        // Close menu
        mobileMenu.classList.remove('show');
        backdrop.classList.remove('show');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
    } else {
        // Open menu
        mobileMenu.classList.add('show');
        backdrop.classList.add('show');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('menu-open');
    }

    // update aria-expanded
    if (menuButton) {
        const expanded = isOpen ? 'false' : 'true';
        menuButton.setAttribute('aria-expanded', expanded);
    }
}

// Scroll Detection for Active Section
function handleScroll() {
    const sections = ['home', 'services', 'gallery', 'about', 'faq', 'contact'];
    const scrollPosition = window.scrollY + 200;

    for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
            const offsetTop = element.offsetTop;
            const offsetHeight = element.offsetHeight;
            
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                updateActiveNav(section);
                break;
            }
        }
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden', 'hide');
    toast.classList.add('show');
    
    if (type === 'error') {
        toast.classList.add('bg-red-600');
        toast.classList.remove('bg-black');
    } else {
        toast.classList.add('bg-black');
        toast.classList.remove('bg-red-600');
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Booking Form Multi-Step Navigation
function nextBookingStep(step) {
    // Validate current step before proceeding
    if (step === 2) {
        // Validate step 1
        const name = document.getElementById('name')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        
        if (!name || !phone) {
            showToast('لطفا نام و شماره تماس را وارد کنید', 'error');
            return;
        }
        
        // Basic phone validation
        if (phone.length < 10) {
            showToast('شماره تماس معتبر نیست', 'error');
            return;
        }
    } else if (step === 3) {
        // Validate step 2 (car model is optional, so we can proceed)
    }
    
    // Hide current step
    const currentStep = step - 1;
    const currentStepEl = document.getElementById(`booking-step-${currentStep}`);
    if (currentStepEl) {
        currentStepEl.classList.add('hidden');
    }
    
    // Show next step
    const nextStepEl = document.getElementById(`booking-step-${step}`);
    if (nextStepEl) {
        nextStepEl.classList.remove('hidden');
        // Scroll to top of form
        nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Update progress indicator
    updateBookingProgress(step);
}

function prevBookingStep(step) {
    // Hide current step
    const currentStep = step + 1;
    const currentStepEl = document.getElementById(`booking-step-${currentStep}`);
    if (currentStepEl) {
        currentStepEl.classList.add('hidden');
    }
    
    // Show previous step
    const prevStepEl = document.getElementById(`booking-step-${step}`);
    if (prevStepEl) {
        prevStepEl.classList.remove('hidden');
        // Scroll to top of form
        prevStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Update progress indicator
    updateBookingProgress(step);
}

function updateBookingProgress(activeStep) {
    // Update step indicators
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        const circle = indicator.querySelector('div');
        const line = indicator.nextElementSibling;
        
        if (stepNumber <= activeStep) {
            // Active or completed step
            indicator.classList.add('active');
            circle.classList.remove('bg-gray-300', 'text-gray-600');
            circle.classList.add('bg-black', 'text-white');
            if (line && stepNumber < activeStep) {
                // Line before active step should be filled
                line.classList.remove('bg-gray-300');
                line.classList.add('bg-black');
            }
        } else {
            // Inactive step
            indicator.classList.remove('active');
            circle.classList.remove('bg-black', 'text-white');
            circle.classList.add('bg-gray-300', 'text-gray-600');
            if (line) {
                line.classList.remove('bg-black');
                line.classList.add('bg-gray-300');
            }
        }
    });
}

// Booking Form Submission (guarded for pages without the form)
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    // Initialize progress indicator
    updateBookingProgress(1);
    
    // Set minimum date for booking (today)
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    // Handle form submission with AJAX to prevent redirect
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent default form submission
        
        const name = document.getElementById('name')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const service = document.getElementById('service')?.value || '';
        const date = document.getElementById('date')?.value || '';
        const time = document.getElementById('time')?.value || '';
        
        if (!name || !phone || !service || !date || !time) {
            showToast('لطفا تمام فیلدهای الزامی را پر کنید', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'در حال ارسال...';
        submitBtn.disabled = true;
        
        try {
            // Prepare form data
            const formData = new FormData(this);
            
            // Submit to Formspree via AJAX
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success - show success message
                const form = document.getElementById('booking-form');
                const successMessage = document.getElementById('success-message');
                if (form && successMessage) {
                    form.style.display = 'none';
                    successMessage.classList.remove('hidden');
                    // Scroll to success message
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                showToast('رزرو با موفقیت ثبت شد!', 'success');
                
                // Reset form
                this.reset();
            } else {
                // Error from Formspree
                const data = await response.json();
                if (data.errors) {
                    showToast('خطا در ارسال فرم: ' + data.errors.map(e => e.message).join(', '), 'error');
                } else {
                    showToast('خطا در ارسال فرم. لطفا دوباره تلاش کنید.', 'error');
                }
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            showToast('خطا در اتصال به سرور. لطفا اتصال اینترنت خود را بررسی کنید.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Check for success message on page load
function checkForSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        // Show success message
        const form = document.getElementById('booking-form');
        const successMessage = document.getElementById('success-message');
        if (form && successMessage) {
            form.style.display = 'none';
            successMessage.classList.remove('hidden');
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}


// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Event Listeners
window.addEventListener('scroll', handleScroll, { passive: true });

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuButton = document.getElementById('menu-button');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    
    if (!mobileMenu || !menuButton) return;

    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedToggle = menuButton.contains(event.target);
    const clickedBackdrop = backdrop && backdrop.contains(event.target);

    if (mobileMenu.classList.contains('show') && !clickedInsideMenu && !clickedToggle && !clickedBackdrop) {
        toggleMobileMenu();
    }
});

// Loading Screen Control
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Show loading screen for minimum time
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('fade-out');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    handleScroll(); // Set initial active nav state
    checkForSuccessMessage(); // Check for form success message
    
    // Hide loading screen after page is fully loaded (optimized timing)
    if (document.readyState === 'complete') {
        setTimeout(hideLoadingScreen, 300);
    } else {
        window.addEventListener('load', function() {
            setTimeout(hideLoadingScreen, 300);
        });
        // Also hide if DOM is ready (faster user experience)
        setTimeout(hideLoadingScreen, 500);
    }
});

// Stories viewer logic
(function () {
    let lastStoryEl = null;
  
    function guessMime(url) {
      const u = (url || "").toLowerCase();
      if (u.includes(".mp4")) return "video/mp4";
      if (u.includes(".webm")) return "video/webm";
      if (u.includes(".ogg") || u.includes(".ogv")) return "video/ogg";
      return "";
    }
  
    function buildProgress(single = true) {
      const host = document.getElementById('storyProgress');
      if (!host) return null;
      host.innerHTML = '';
      const seg = document.createElement('div'); seg.className = 'seg';
      const fill = document.createElement('div');
      seg.appendChild(fill);
      host.appendChild(seg);
      return fill;
    }
  
    window.openStoryModalWithPoster = function (src, type, poster, el) {
      lastStoryEl = el || lastStoryEl;
      const img = document.getElementById('storyImage');
      const vid = document.getElementById('storyVideo');
      const source = document.getElementById('storySource');
      const spinner = document.getElementById('storySpinner');
  
      const fill = buildProgress();
  
      if (type && type.toLowerCase() === 'video') {
        img.classList.add('hidden');
        vid.classList.remove('hidden');
        spinner.classList.remove('hidden');
  
        if (poster) vid.setAttribute('poster', poster); else vid.removeAttribute('poster');
  
        if (source) {
          source.setAttribute('src', src || '');
          source.setAttribute('type', guessMime(src));
        }
        try { vid.load(); } catch (e) { }
        vid.currentTime = 0;
  
        const tryPlay = () => {
          const p = vid.play();
          if (p && typeof p.then === 'function') {
            p.catch(function () { try { vid.muted = true; vid.play(); } catch (e) { } });
          }
        };
  
        vid.oncanplay = function () { spinner.classList.add('hidden'); tryPlay(); };
        setTimeout(function () { spinner.classList.add('hidden'); tryPlay(); }, 1200);
  
        vid.onended = function () { nextStory(); };
  
      } else {
        // Image path
        vid.classList.add('hidden');
        try { vid.pause(); } catch (e) { }
        img.classList.remove('hidden');
        img.src = src || '';
        if (fill) {
          fill.style.transitionDuration = '4s';
          setTimeout(() => { fill.style.width = '100%'; }, 50);
          setTimeout(() => { nextStory(); }, 4100);
        }
      }
  
      document.getElementById('storyModal').classList.remove('hidden');
      return false;
    };
  
    window.openStoryFromEl = function (a) {
      lastStoryEl = a;
      const src = a.getAttribute('data-src');
      const type = a.getAttribute('data-type');
      const poster = a.getAttribute('data-poster');
      return openStoryModalWithPoster(src, type, poster, a);
    };
  
    window.nextStory = function () {
      if (!lastStoryEl) return;
      let n = lastStoryEl.nextElementSibling;
      // skip non-elements or text nodes
      while (n && n.nodeType !== 1) n = n.nextSibling;
      if (!n) return closeStoryModal();
      openStoryFromEl(n);
    };
  
    window.prevStory = function () {
      if (!lastStoryEl) return;
      let p = lastStoryEl.previousElementSibling;
      while (p && p.nodeType !== 1) p = p.previousSibling;
      if (!p) return;
      openStoryFromEl(p);
    };
  
    window.closeStoryModal = function () {
      const modal = document.getElementById('storyModal');
      const vid = document.getElementById('storyVideo');
      const source = document.getElementById('storySource');
      try {
        vid.pause();
        if (source) { source.removeAttribute('src'); source.removeAttribute('type'); }
        vid.load();
      } catch (e) { }
      modal.classList.add('hidden');
    };
  
    window.overlayClose = function (e) {
      // only close when backdrop clicked
      if (e.target && e.target.id === 'storyModal') closeStoryModal();
    };
  
    window.scrollStories = function (dir) {
      const track = document.getElementById('storiesTrack');
      if (!track) return;
      const step = 220;
      // direction: -1 -> left, 1 -> right for RTL feel
      track.scrollBy({ left: dir * step, behavior: 'smooth' });
    };
  
    // Export small helper to open by index (optional)
    window.openStoryAt = function (index) {
      const list = document.querySelectorAll('.story-card');
      if (!list || !list.length) return;
      const el = list[index] || list[0];
      if (el) openStoryFromEl(el);
    };
  
    // small enhancement: keyboard support for modal
    document.addEventListener('keydown', function (ev) {
      const modal = document.getElementById('storyModal');
      if (!modal || modal.classList.contains('hidden')) return;
      if (ev.key === 'ArrowRight') nextStory();
      if (ev.key === 'ArrowLeft') prevStory();
      if (ev.key === 'Escape') closeStoryModal();
    });
  
  })();

// Service Worker Registration for PWA (Booking)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // فقط برای booking.html ثبت شود
        if (window.location.pathname.includes('booking.html') || window.location.pathname === '/booking.html') {
            navigator.serviceWorker.register('/booking-sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully for booking:', registration.scope);
                    
                    // بررسی به‌روزرسانی Service Worker
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Service Worker جدید نصب شده است
                                console.log('🔄 New Service Worker available. Please refresh the page.');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        }
    });
    
    // مدیریت آفلاین/آنلاین
    window.addEventListener('online', () => {
        console.log('✅ Connection restored');
    });
    
    window.addEventListener('offline', () => {
        console.log('⚠️ Connection lost');
    });
}

// PWA Install Banner Functions for Booking
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

function isPWAInstalled() {
    // بررسی اینکه آیا اپلیکیشن به صورت standalone نصب شده است
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
}

function shouldShowPWAInstallBanner() {
    // فقط برای booking.html نمایش بده
    if (!window.location.pathname.includes('booking.html') && window.location.pathname !== '/booking.html') {
        return false;
    }
    
    // اگر قبلاً دیده شده باشد، نمایش نده
    const bannerDismissed = localStorage.getItem('pwa-install-banner-booking-dismissed');
    if (bannerDismissed === 'true') {
        return false;
    }
    
    // اگر موبایل نیست، نمایش نده
    if (!isMobileDevice()) {
        return false;
    }
    
    // اگر قبلاً نصب شده، نمایش نده
    if (isPWAInstalled()) {
        return false;
    }
    
    // اگر Service Worker پشتیبانی نمی‌شود، نمایش نده
    if (!('serviceWorker' in navigator)) {
        return false;
    }
    
    return true;
}

function showPWAInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner && shouldShowPWAInstallBanner()) {
        // نمایش با انیمیشن
        banner.classList.remove('hidden');
        setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transform = 'scale(0.95)';
            banner.style.transition = 'all 0.3s ease-out';
            
            setTimeout(() => {
                banner.style.opacity = '1';
                banner.style.transform = 'scale(1)';
            }, 10);
        }, 100);
    }
}

function closePWAInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
        // انیمیشن خروج
        banner.style.opacity = '0';
        banner.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            banner.classList.add('hidden');
            // ذخیره در localStorage که کاربر این بستر را دیده است
            localStorage.setItem('pwa-install-banner-booking-dismissed', 'true');
        }, 300);
    }
}

// PWA Install Banner Functions for Main Site (index.html)
// استفاده از توابع مشترک از بالا

// PWA Install Banner for Main Site (index.html)
function shouldShowPWAInstallBannerMain() {
    // فقط برای index.html نمایش بده (نه booking و نه paziresh)
    if (window.location.pathname.includes('booking.html') || 
        window.location.pathname.includes('paziresh') ||
        (window.location.pathname !== '/' && window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('index.html'))) {
        return false;
    }
    
    // اگر قبلاً دیده شده باشد، نمایش نده
    const bannerDismissed = localStorage.getItem('pwa-install-banner-main-dismissed');
    if (bannerDismissed === 'true') {
        return false;
    }
    
    // اگر موبایل نیست، نمایش نده
    if (!isMobileDevice()) {
        return false;
    }
    
    // اگر قبلاً نصب شده، نمایش نده
    if (isPWAInstalled()) {
        return false;
    }
    
    // اگر Service Worker پشتیبانی نمی‌شود، نمایش نده (نیازی به PWA نیست)
    if (!('serviceWorker' in navigator)) {
        return false;
    }
    
    return true;
}

function showPWAInstallBannerMain() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner && shouldShowPWAInstallBannerMain()) {
        // نمایش با انیمیشن
        banner.classList.remove('hidden');
        setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transform = 'scale(0.95)';
            banner.style.transition = 'all 0.3s ease-out';
            
            setTimeout(() => {
                banner.style.opacity = '1';
                banner.style.transform = 'scale(1)';
            }, 10);
        }, 100);
    }
}

function closePWAInstallBannerMain() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
        // انیمیشن خروج
        banner.style.opacity = '0';
        banner.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            banner.classList.add('hidden');
            // ذخیره در localStorage که کاربر این بستر را دیده است
            localStorage.setItem('pwa-install-banner-main-dismissed', 'true');
        }, 300);
    }
}

// نمایش بستر PWA برای booking بعد از بارگذاری صفحه (از توابع booking استفاده می‌کند)
if (window.location.pathname.includes('booking.html') || window.location.pathname === '/booking.html') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            showPWAInstallBanner(); // از توابع booking
        }, 2000);
    });
}

// نمایش بستر PWA برای صفحه اصلی (index.html) بعد از بارگذاری صفحه
if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('index.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            showPWAInstallBannerMain(); // از توابع main site
        }, 2000);
    });
}

// تابع closePWAInstallBanner برای استفاده در onclick - باید هر دو را چک کند
// این تابع global است و در HTML استفاده می‌شود
window.closePWAInstallBanner = function() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
        // انیمیشن خروج
        banner.style.opacity = '0';
        banner.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            banner.classList.add('hidden');
            // ذخیره در localStorage که کاربر این بستر را دیده است
            if (window.location.pathname.includes('booking.html') || window.location.pathname === '/booking.html') {
                localStorage.setItem('pwa-install-banner-booking-dismissed', 'true');
            } else {
                localStorage.setItem('pwa-install-banner-main-dismissed', 'true');
            }
        }, 300);
    }
};

// Toggle Share Buttons
function toggleShareButtons() {
    const container = document.getElementById('share-buttons-container');
    const shareIcon = document.getElementById('share-icon');
    const closeIcon = document.getElementById('close-icon');
    const buttons = container.querySelectorAll('.share-button');
    
    if (container.classList.contains('hidden')) {
        // Show buttons
        container.classList.remove('hidden');
        shareIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        
        // Animate buttons appearing
        buttons.forEach((btn, index) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px) scale(0.8)';
            setTimeout(() => {
                btn.style.transition = 'all 0.3s ease-out';
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0) scale(1)';
            }, index * 50);
        });
    } else {
        // Hide buttons
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.transition = 'all 0.2s ease-in';
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(20px) scale(0.8)';
            }, index * 30);
        });
        
        setTimeout(() => {
            container.classList.add('hidden');
            shareIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        }, 200);
    }
}

// Close share buttons when clicking outside
document.addEventListener('click', function(event) {
    const container = document.getElementById('share-buttons-container');
    const toggleBtn = document.getElementById('share-toggle-btn');
    
    if (container && !container.classList.contains('hidden')) {
        const clickedInside = container.contains(event.target) || toggleBtn.contains(event.target);
        
        if (!clickedInside) {
            toggleShareButtons();
        }
    }
});
