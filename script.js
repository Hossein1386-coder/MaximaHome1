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
    const sections = ['home', 'services', 'gallery', 'about', 'contact'];
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

// Booking Form Submission (guarded for pages without the form)
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    // Set minimum date for booking (today)
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
    
    // Handle form submission
    bookingForm.addEventListener('submit', function(e) {
        const name = document.getElementById('name')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const service = document.getElementById('service')?.value || '';
        const date = document.getElementById('date')?.value || '';
        const time = document.getElementById('time')?.value || '';
        
        if (!name || !phone || !service || !date || !time) {
            e.preventDefault();
            showToast('لطفا تمام فیلدهای الزامی را پر کنید', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'در حال ارسال...';
        submitBtn.disabled = true;
        
        // Reset button after a delay (in case of error)
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 5000);
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
    
    // Hide loading screen after page is fully loaded (faster for minimal)
    if (document.readyState === 'complete') {
        setTimeout(hideLoadingScreen, 700);
    } else {
        window.addEventListener('load', function() {
            setTimeout(hideLoadingScreen, 700);
        });
    }
});
