// Admin Panel JavaScript
let bookings = [];
let isLoggedIn = false;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is already logged in
    const savedLogin = localStorage.getItem('admin-login');
    if (savedLogin === 'true') {
        isLoggedIn = true;
        showAdminPanel();
    } else {
        showLoginModal();
    }
    
    // Set current date
    updateCurrentDate();
    
    // Load data: subscribe Firestore if available, else fallback to localStorage/sample
    if (window.db) {
        subscribeBookings();
    } else {
        loadSampleData();
        updateDashboard();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize content management
    await initializeContentManagement();
    
    // Hide loading screen
    setTimeout(hideLoadingScreen, 500);
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterBookings);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'samad') {
        isLoggedIn = true;
        localStorage.setItem('admin-login', 'true');
        hideLoginModal();
        showAdminPanel();
        showToast('ورود موفقیت‌آمیز!', 'success');
    } else {
        showToast('نام کاربری یا رمز عبور اشتباه است', 'error');
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    const background = document.getElementById('cool-background');
    
    if (modal) {
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('fade-out');
        }, 300);
    }
    
    if (background) {
        background.classList.add('fade-out');
        setTimeout(() => {
            background.classList.add('hidden');
            background.classList.remove('fade-out');
        }, 300);
    }
}

// Show admin panel
function showAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel) {
        panel.classList.remove('hidden');
        if (!window.db) updateDashboard();
    }
}

// Logout function
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('admin-login');
    const panel = document.getElementById('admin-panel');
    const background = document.getElementById('cool-background');
    
    if (panel) {
        panel.classList.add('hidden');
    }
    
    if (background) {
        background.classList.remove('hidden');
    }
    
    showLoginModal();
    showToast('خروج موفقیت‌آمیز!', 'success');
}

// Update current date
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        dateElement.textContent = now.toLocaleDateString('fa-IR', options);
    }
}

// Load sample data
function loadSampleData() {
    // Try to load real bookings from localStorage first
    const realBookings = getAllBookings();

    // If a flag exists to suppress samples, never load samples
    const suppressSamples = localStorage.getItem('maxima-suppress-sample-bookings') === 'true';

    if (realBookings.length > 0 || suppressSamples) {
        bookings = realBookings;
        console.log('Loaded bookings from localStorage:', bookings.length);
    } else {
        // Fallback to sample data if no real bookings exist and not suppressed
        bookings = [
            {
                id: 1,
                name: 'احمد محمدی',
                phone: '09123456789',
                carModel: 'پژو 206',
                service: 'تعمیرات موتور',
                date: '2024-01-15',
                time: '10:00',
                status: 'confirmed',
                notes: 'مشکل در استارت خودرو',
                createdAt: new Date('2024-01-10').toISOString()
            },
            {
                id: 2,
                name: 'فاطمه احمدی',
                phone: '09187654321',
                carModel: 'سمند',
                service: 'سرویس و تعویض روغن',
                date: '2024-01-16',
                time: '14:00',
                status: 'pending',
                notes: 'سرویس دوره‌ای',
                createdAt: new Date('2024-01-11').toISOString()
            },
            {
                id: 3,
                name: 'علی رضایی',
                phone: '09151234567',
                carModel: 'تیبا',
                service: 'تعمیرات گیربکس',
                date: '2024-01-17',
                time: '09:00',
                status: 'completed',
                notes: 'صدا از گیربکس',
                createdAt: new Date('2024-01-12').toISOString()
            },
            {
                id: 4,
                name: 'مریم کریمی',
                phone: '09162345678',
                carModel: 'دنا',
                service: 'سیستم برق خودرو',
                date: '2024-01-18',
                time: '16:00',
                status: 'cancelled',
                notes: 'مشکل در چراغ‌ها',
                createdAt: new Date('2024-01-13').toISOString()
            },
            {
                id: 5,
                name: 'حسن نوری',
                phone: '09173456789',
                carModel: 'کیا سراتو',
                service: 'تعمیرات جلوبندی',
                date: '2024-01-19',
                time: '11:00',
                status: 'confirmed',
                notes: 'لرزش در فرمان',
                createdAt: new Date('2024-01-14').toISOString()
            }
        ];
        console.log('Using sample data');
    }
}

// Get all bookings from localStorage (same function as in main script)
function getAllBookings() {
    try {
        return JSON.parse(localStorage.getItem('maxima-bookings') || '[]');
    } catch (error) {
        console.error('Error loading bookings:', error);
        return [];
    }
}

// Subscribe to Firestore bookings in real time
let bookingsUnsub = null;
function subscribeBookings() {
    import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js').then(({ collection, onSnapshot, orderBy, query }) => {
        const q = query(collection(window.db, 'bookings'), orderBy('createdAt', 'desc'));
        if (bookingsUnsub) bookingsUnsub();
        bookingsUnsub = onSnapshot(q, (snap) => {
            bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            updateDashboard();
        }, (err) => console.error('Firestore subscribe error:', err));
    }).catch(err => {
        console.error('Failed to load Firestore for subscribe:', err);
    });
}

// Save bookings to localStorage
function saveBookings() {
    try {
        localStorage.setItem('maxima-bookings', JSON.stringify(bookings));
        console.log('Bookings saved to localStorage');
    } catch (error) {
        console.error('Error saving bookings:', error);
    }
}

// Update dashboard
function updateDashboard() {
    updateStats();
    updateChart();
    updateRecentBookings();
    updateBookingsTable();
}

// Update statistics
function updateStats() {
    const totalBookings = bookings.length;
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    }).length;
    
    const monthRevenue = monthBookings * 500000; // فرضی: هر رزرو 500 هزار تومان
    
    document.getElementById('total-bookings').textContent = totalBookings;
    document.getElementById('today-bookings').textContent = todayBookings;
    document.getElementById('month-bookings').textContent = monthBookings;
    document.getElementById('month-revenue').textContent = monthRevenue.toLocaleString('fa-IR');
}

// Update chart
function updateChart() {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) return;
    
    // Generate last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayBookings = bookings.filter(b => b.date === dateStr).length;
        last7Days.push({
            date: dateStr,
            count: dayBookings,
            label: date.toLocaleDateString('fa-IR', { weekday: 'short' })
        });
    }
    
    // Clear container
    chartContainer.innerHTML = '';
    
    // Create bars
    const maxCount = Math.max(...last7Days.map(d => d.count));
    last7Days.forEach(day => {
        const barHeight = maxCount > 0 ? (day.count / maxCount) * 200 : 20;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'flex flex-col items-center gap-2';
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar w-8';
        bar.style.height = `${barHeight}px`;
        bar.setAttribute('data-value', day.count);
        
        const label = document.createElement('div');
        label.className = 'text-xs text-gray-600';
        label.textContent = day.label;
        
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        chartContainer.appendChild(barContainer);
    });
}

// Update recent bookings
function updateRecentBookings() {
    const container = document.getElementById('recent-bookings');
    if (!container) return;
    
    const recentBookings = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    container.innerHTML = '';
    
    recentBookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'booking-row p-3 border border-gray-200 rounded-lg';
        
        bookingElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-black">${booking.name}</p>
                    <p class="text-sm text-gray-600">${booking.service}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600">${booking.date}</p>
                    <span class="status-badge status-${booking.status}">${getStatusText(booking.status)}</span>
                </div>
            </div>
        `;
        
        container.appendChild(bookingElement);
    });
}

// Update bookings table
function updateBookingsTable() {
    const tbody = document.getElementById('bookings-table');
    if (!tbody) return;
    
    const statusFilter = document.getElementById('status-filter').value;
    let filteredBookings = bookings;
    
    if (statusFilter !== 'all') {
        filteredBookings = bookings.filter(b => b.status === statusFilter);
    }
    
    tbody.innerHTML = '';
    
    filteredBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.className = 'booking-row';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.service}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.time}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge status-${booking.status}">${getStatusText(booking.status)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                    ${getActionButtons(booking)}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get status text
function getStatusText(status) {
    const statusTexts = {
        pending: 'در انتظار',
        confirmed: 'تأیید شده',
        completed: 'تکمیل شده',
        cancelled: 'لغو شده'
    };
    return statusTexts[status] || status;
}

// Get action buttons
function getActionButtons(booking) {
    let buttons = '';
    
    if (booking.status === 'pending') {
        buttons += `<button onclick="updateBookingStatus(${booking.id}, 'confirmed')" class="action-btn btn-confirm">تأیید</button>`;
    }
    
    if (booking.status === 'confirmed') {
        buttons += `<button onclick="updateBookingStatus(${booking.id}, 'completed')" class="action-btn btn-confirm">تکمیل</button>`;
    }
    
    buttons += `<button onclick="editBooking(${booking.id})" class="action-btn btn-edit">ویرایش</button>`;
    buttons += `<button onclick="deleteBooking(${booking.id})" class="action-btn btn-delete">حذف</button>`;
    
    return buttons;
}

// Update booking status
function updateBookingStatus(id, newStatus) {
    if (window.db && typeof id === 'string') {
        import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js').then(({ doc, updateDoc }) => {
            updateDoc(doc(window.db, 'bookings', id), { status: newStatus }).then(() => {
                showToast('وضعیت رزرو به‌روزرسانی شد', 'success');
            }).catch(err => console.error(err));
        });
    } else {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
            booking.status = newStatus;
            saveBookings(); // Save to localStorage
            updateDashboard();
            showToast('وضعیت رزرو به‌روزرسانی شد', 'success');
        }
    }
}

// Edit booking
function editBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        // Simple edit - in real app, show modal
        const newName = prompt('نام جدید:', booking.name);
        if (newName) {
            booking.name = newName;
            saveBookings(); // Save to localStorage
            updateDashboard();
            showToast('رزرو ویرایش شد', 'success');
        }
    }
}

// Delete booking
function deleteBooking(id) {
    if (!confirm('آیا از حذف این رزرو اطمینان دارید؟')) return;
    if (window.db && typeof id === 'string') {
        import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js').then(({ doc, deleteDoc }) => {
            deleteDoc(doc(window.db, 'bookings', id)).then(() => {
                showToast('رزرو حذف شد', 'success');
            }).catch(err => console.error(err));
        });
    } else {
        bookings = bookings.filter(b => b.id !== id);
        saveBookings(); // Save to localStorage
        updateDashboard();
        showToast('رزرو حذف شد', 'success');
    }
}

// Filter bookings
function filterBookings() {
    updateBookingsTable();
}

// Refresh bookings
function refreshBookings() {
    if (!window.db) updateDashboard();
    showToast('داده‌ها به‌روزرسانی شد', 'success');
}

// Export bookings
function exportBookings() {
    const csvContent = generateCSV(bookings);
    downloadCSV(csvContent, 'bookings.csv');
    showToast('فایل Excel دانلود شد', 'success');
}

// Clear all data
function clearAllData() {
    if (confirm('آیا از پاک کردن همه داده‌ها اطمینان دارید؟ این عمل قابل بازگشت نیست!')) {
        localStorage.removeItem('maxima-bookings');
        // Set flag to not repopulate samples again
        localStorage.setItem('maxima-suppress-sample-bookings', 'true');
        bookings = [];
        updateDashboard();
        showToast('همه داده‌ها پاک شد', 'success');
    }
}

// Generate CSV
function generateCSV(data) {
    const headers = ['نام', 'تلفن', 'مدل خودرو', 'خدمات', 'تاریخ', 'ساعت', 'وضعیت', 'یادداشت'];
    const csvRows = [headers.join(',')];
    
    data.forEach(booking => {
        const row = [
            booking.name,
            booking.phone,
            booking.carModel,
            booking.service,
            booking.date,
            booking.time,
            getStatusText(booking.status),
            booking.notes
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Download CSV
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Content Management Functions
let siteContent = {};

// Initialize content management
async function initializeContentManagement() {
    await loadSiteContent();
    setupContentForms();
    loadImages();
}

// Load site content from Firestore (with localStorage fallback)
async function loadSiteContent() {
    // Try Firestore first
    if (window.db) {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
            const docSnap = await getDoc(doc(window.db, 'site', 'content'));
            if (docSnap.exists()) {
                siteContent = docSnap.data();
                console.log('Site content loaded from Firestore');
                populateContentForms();
                return;
            }
        } catch (error) {
            console.warn('Firestore load failed, falling back to localStorage', error);
        }
    }
    
    // Fallback: localStorage
    try {
        siteContent = JSON.parse(localStorage.getItem('maxima-site-content') || '{}');
        
        // Set default values if not exists
        if (!siteContent.contact) {
            siteContent.contact = {
                phoneMain: '۰۲۱-۱۲۳۴۵۶۷۸',
                phoneMobile: '۰۹۱۲۳۴۵۶۷۸۹',
                email: 'info@maximahome.ir',
                address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
                emergencyText: 'در هر ساعت از شبانه‌روز آماده ارائه خدمات اورژانسی هستیم',
                emergencyPhone: '09123456789'
            };
        }
        
        if (!siteContent.hours) {
            siteContent.hours = {
                workingHoursText: 'شنبه تا پنجشنبه: ۸ صبح تا ۸ شب',
                startTime: '08:00',
                endTime: '20:00',
                workingDays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'],
                notes: 'تعطیلات رسمی تعطیل است'
            };
        }
        
        if (!siteContent.footer) {
            siteContent.footer = {
                description: 'ماکسیما هوم - تعمیرگاه تخصصی خودرو با بیش از ۱۰ سال تجربه در زمینه تعمیر و نگهداری انواع خودروهای داخلی و خارجی.',
                links: 'صفحه اصلی\nخدمات\nدرباره ما\nتماس با ما',
                contact: 'تلفن: ۰۲۱-۱۲۳۴۵۶۷۸\nموبایل: ۰۹۱۲۳۴۵۶۷۸۹\nایمیل: info@maximahome.ir'
            };
        }
        
        if (!siteContent.images) {
            siteContent.images = {
                heroImage: '',
                galleryImages: [],
                galleryMode: 'replace',
                defaultGalleryImages: [
                    {
                        id: 'default-1',
                        src: 'https://images.unsplash.com/photo-1702146713870-8cdd7ab983fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW90aXZlJTIwcmVwYWlyJTIwZ2FyYWdlfGVufDF8fHx8MTc2MDgxMjQzNHww&ixlib=rb-4.1.0&q=80&w=1080',
                        alt: 'تعمیرگاه مدرن'
                    },
                    {
                        id: 'default-2',
                        src: 'https://images.unsplash.com/photo-1566206085505-2e0904c3e547?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbmdpbmUlMjByZXBhaXJ8ZW58MXx8fHwxNzYwNzg4OTYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
                        alt: 'تعمیر موتور'
                    },
                    {
                        id: 'default-3',
                        src: 'https://images.unsplash.com/photo-1602267774924-38124c047174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pYyUyMHRvb2xzfGVufDF8fHx8MTc2MDc1MTQwMHww&ixlib=rb-4.1.0&q=80&w=1080',
                        alt: 'ابزار تخصصی'
                    },
                    {
                        id: 'default-4',
                        src: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJ8ZW58MXx8fHwxNzYwNzA3NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
                        alt: 'خدمات خودرو'
                    }
                ]
            };
        }
        
        populateContentForms();
    } catch (error) {
        console.error('Error loading site content:', error);
        siteContent = {};
    }
}

// Save site content to Firestore (with localStorage fallback)
async function saveSiteContent() {
    // Try Firestore first
    if (window.db) {
        try {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
            await setDoc(doc(window.db, 'site', 'content'), siteContent);
            console.log('Site content saved to Firestore');
            return true;
        } catch (error) {
            console.warn('Firestore save failed, falling back to localStorage', error);
        }
    }
    
    // Fallback: localStorage
    try {
        localStorage.setItem('maxima-site-content', JSON.stringify(siteContent));
        console.log('Site content saved to localStorage');
        return true;
    } catch (error) {
        console.error('Error saving site content:', error);
        return false;
    }
}

// Setup content forms
function setupContentForms() {
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveContactInfo();
        });
    }
    
    // Hours form
    const hoursForm = document.getElementById('hours-form');
    if (hoursForm) {
        hoursForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWorkingHours();
        });
    }
    
    // Footer form
    const footerForm = document.getElementById('footer-form');
    if (footerForm) {
        footerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveFooterContent();
        });
    }
    
    // Image inputs
    const heroImageInput = document.getElementById('hero-image-input');
    if (heroImageInput) {
        heroImageInput.addEventListener('change', function(e) {
            handleHeroImageUpload(e.target.files[0]);
        });
    }
    
    const galleryImagesInput = document.getElementById('gallery-images-input');
    if (galleryImagesInput) {
        galleryImagesInput.addEventListener('change', function(e) {
            handleGalleryImagesUpload(e.target.files);
        });
    }
}

// Populate content forms with current data
function populateContentForms() {
    // Contact info
    if (siteContent.contact) {
        document.getElementById('phone-main').value = siteContent.contact.phoneMain || '';
        document.getElementById('phone-mobile').value = siteContent.contact.phoneMobile || '';
        document.getElementById('email').value = siteContent.contact.email || '';
        document.getElementById('address').value = siteContent.contact.address || '';
        const emergencyText = document.getElementById('emergency-text');
        const emergencyPhone = document.getElementById('emergency-phone');
        if (emergencyText) emergencyText.value = siteContent.contact.emergencyText || '';
        if (emergencyPhone) emergencyPhone.value = siteContent.contact.emergencyPhone || '';
    }
    
    // Working hours
    if (siteContent.hours) {
        const workingHoursInput = document.getElementById('working-hours-text');
        if (workingHoursInput) workingHoursInput.value = siteContent.hours.workingHoursText || '';
        document.getElementById('start-time').value = siteContent.hours.startTime || '';
        document.getElementById('end-time').value = siteContent.hours.endTime || '';
        document.getElementById('hours-notes').value = siteContent.hours.notes || '';
        
        // Set working days checkboxes
        const workingDays = siteContent.hours.workingDays || [];
        workingDays.forEach(day => {
            const checkbox = document.getElementById(`day-${day}`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Footer content
    if (siteContent.footer) {
        document.getElementById('footer-description').value = siteContent.footer.description || '';
        document.getElementById('footer-links').value = siteContent.footer.links || '';
        document.getElementById('footer-contact').value = siteContent.footer.contact || '';
    }
    
    // Images
    if (siteContent.images) {
        // Set gallery mode radio button
        const galleryMode = siteContent.images.galleryMode || 'replace';
        const radioButtons = document.querySelectorAll('input[name="gallery-mode"]');
        radioButtons.forEach(radio => {
            radio.checked = radio.value === galleryMode;
        });
    }
    loadImages();
}

// Save contact info
function saveContactInfo() {
    siteContent.contact = {
        phoneMain: document.getElementById('phone-main').value,
        phoneMobile: document.getElementById('phone-mobile').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        emergencyText: document.getElementById('emergency-text')?.value || '',
        emergencyPhone: document.getElementById('emergency-phone')?.value || ''
    };
    
    if (saveSiteContent()) {
        showToast('اطلاعات تماس ذخیره شد', 'success');
    } else {
        showToast('خطا در ذخیره اطلاعات', 'error');
    }
}

// Save working hours
function saveWorkingHours() {
    const workingDays = [];
    const dayIds = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
    
    dayIds.forEach(day => {
        const checkbox = document.getElementById(`day-${day}`);
        if (checkbox && checkbox.checked) {
            workingDays.push(day);
        }
    });
    
    siteContent.hours = {
        workingHoursText: document.getElementById('working-hours-text')?.value || 'شنبه تا پنجشنبه: ۸ صبح تا ۸ شب',
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        workingDays: workingDays,
        notes: document.getElementById('hours-notes').value
    };
    
    if (saveSiteContent()) {
        showToast('ساعت کاری ذخیره شد', 'success');
    } else {
        showToast('خطا در ذخیره ساعت کاری', 'error');
    }
}

// Save footer content
function saveFooterContent() {
    siteContent.footer = {
        description: document.getElementById('footer-description').value,
        links: document.getElementById('footer-links').value,
        contact: document.getElementById('footer-contact').value
    };
    
    if (saveSiteContent()) {
        showToast('محتوای فوتر ذخیره شد', 'success');
    } else {
        showToast('خطا در ذخیره محتوای فوتر', 'error');
    }
}

// Handle hero image upload
function handleHeroImageUpload(file) {
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('حجم فایل نباید بیشتر از 2MB باشد', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        siteContent.images.heroImage = e.target.result;
        document.getElementById('hero-image-preview').src = e.target.result;
        saveSiteContent();
        showToast('عکس اصلی ذخیره شد', 'success');
    };
    reader.readAsDataURL(file);
}

// Handle gallery images upload
function handleGalleryImagesUpload(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            showToast(`فایل ${file.name} بیش از حد مجاز است`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            siteContent.images.galleryImages.push({
                id: Date.now(),
                data: e.target.result,
                name: file.name
            });
            loadImages();
            saveSiteContent();
        };
        reader.readAsDataURL(file);
    });
}

// Load and display images
function loadImages() {
    // Hero image
    const heroPreview = document.getElementById('hero-image-preview');
    if (heroPreview) {
        if (siteContent.images && siteContent.images.heroImage) {
            heroPreview.src = siteContent.images.heroImage;
        } else {
            // Show default hero image
            heroPreview.src = 'https://images.unsplash.com/photo-1637640125496-31852f042a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBtZWNoYW5pYyUyMHdvcmtzaG9wfGVufDF8fHx8MTc2MDgxMjQzMnww&ixlib=rb-4.1.0&q=80&w=1080';
        }
    }
    
    // Load default gallery preview
    loadDefaultGalleryPreview();
    
    // Gallery images
    const galleryContainer = document.getElementById('gallery-images');
    if (galleryContainer) {
        galleryContainer.innerHTML = '';
        
        if (siteContent.images && siteContent.images.galleryImages) {
            siteContent.images.galleryImages.forEach(image => {
                const imageItem = document.createElement('div');
                imageItem.className = 'gallery-image-item';
                imageItem.innerHTML = `
                    <img src="${image.data}" alt="${image.name}">
                    <button class="delete-btn" onclick="deleteGalleryImage(${image.id})">×</button>
                `;
                galleryContainer.appendChild(imageItem);
            });
        }
    }
}

// Load default gallery preview
function loadDefaultGalleryPreview() {
    const defaultGalleryContainer = document.getElementById('default-gallery-preview');
    if (defaultGalleryContainer) {
        // Default gallery images from the main site
        const defaultImages = [
            {
                src: 'https://images.unsplash.com/photo-1702146713870-8cdd7ab983fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW90aXZlJTIwcmVwYWlyJTIwZ2FyYWdlfGVufDF8fHx8MTc2MDgxMjQzNHww&ixlib=rb-4.1.0&q=80&w=1080',
                alt: 'تعمیرگاه مدرن'
            },
            {
                src: 'https://images.unsplash.com/photo-1566206085505-2e0904c3e547?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbmdpbmUlMjByZXBhaXJ8ZW58MXx8fHwxNzYwNzg4OTYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
                alt: 'تعمیر موتور'
            },
            {
                src: 'https://images.unsplash.com/photo-1602267774924-38124c047174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pYyUyMHRvb2xzfGVufDF8fHx8MTc2MDc1MTQwMHww&ixlib=rb-4.1.0&q=80&w=1080',
                alt: 'ابزار تخصصی'
            },
            {
                src: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJ8ZW58MXx8fHwxNzYwNzA3NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
                alt: 'خدمات خودرو'
            }
        ];
        
        defaultGalleryContainer.innerHTML = defaultImages.map((image, index) => 
            `<div class="relative aspect-square rounded-lg overflow-hidden border border-gray-300 group cursor-pointer" onclick="editDefaultImage('${image.id || 'default-' + (index + 1)}')">
                <img src="${image.src}" alt="${image.alt}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                        <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); deleteDefaultImage('${image.id || 'default-' + (index + 1)}')" 
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                    ×
                </button>
            </div>`
        ).join('');
    }
}

// Edit default image
function editDefaultImage(imageId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Update the default image
                const defaultImages = siteContent.images.defaultGalleryImages || [];
                const imageIndex = defaultImages.findIndex(img => img.id === imageId);
                if (imageIndex !== -1) {
                    defaultImages[imageIndex].src = e.target.result;
                    defaultImages[imageIndex].name = file.name;
                }
                saveSiteContent();
                loadImages();
                showToast('عکس پیش‌فرض تغییر کرد', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Delete default image
function deleteDefaultImage(imageId) {
    if (confirm('آیا از حذف این عکس پیش‌فرض اطمینان دارید؟')) {
        const defaultImages = siteContent.images.defaultGalleryImages || [];
        siteContent.images.defaultGalleryImages = defaultImages.filter(img => img.id !== imageId);
        saveSiteContent();
        loadImages();
        showToast('عکس پیش‌فرض حذف شد', 'success');
    }
}

// Delete gallery image
function deleteGalleryImage(imageId) {
    if (confirm('آیا از حذف این عکس اطمینان دارید؟')) {
        siteContent.images.galleryImages = siteContent.images.galleryImages.filter(img => img.id !== imageId);
        loadImages();
        saveSiteContent();
        showToast('عکس حذف شد', 'success');
    }
}

// Save images
function saveImages() {
    // Save gallery mode
    const selectedMode = document.querySelector('input[name="gallery-mode"]:checked');
    if (selectedMode) {
        siteContent.images.galleryMode = selectedMode.value;
    }
    
    if (saveSiteContent()) {
        showToast('عکس‌ها ذخیره شدند', 'success');
    } else {
        showToast('خطا در ذخیره عکس‌ها', 'error');
    }
}

// Show content tab
function showContentTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.content-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.content-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}-tab`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`[onclick="showContentTab('${tabName}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
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
}
