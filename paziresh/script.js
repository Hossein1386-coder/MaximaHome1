// Paziresh System JavaScript with Firebase

// Global variables for data storage
let admissionsData = [];
let invoicesData = [];
// Invoices can be deleted by admin
const INVOICES_READ_ONLY = false;

// Chart instances
let admissionsChart = null;
let revenueChart = null;
let serviceTypesChart = null;
// Invoice filter state
window.invoiceFilter = 'all';
function setInvoiceFilter(filter) {
    window.invoiceFilter = filter;
    updateInvoicesList();
}

// Firebase collections
const ADMISSIONS_COLLECTION = 'admissions';
const INVOICES_COLLECTION = 'invoices';

// Firebase Functions
async function loadAdmissionsFromFirebase() {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        const { db, collection, getDocs, query, orderBy } = window.firebase;
        const admissionsRef = collection(db, ADMISSIONS_COLLECTION);
        const q = query(admissionsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        
        admissionsData = [];
        snapshot.forEach((doc) => {
            admissionsData.push({ id: doc.id, ...doc.data() });
        });
        
        return admissionsData;
    } catch (error) {
        console.error('Error loading admissions:', error);
        showToast('خطا در بارگذاری پذیرش‌ها. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
        return [];
    }
}

async function loadInvoicesFromFirebase() {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        const { db, collection, getDocs, query, orderBy } = window.firebase;
        const invoicesRef = collection(db, INVOICES_COLLECTION);
        const q = query(invoicesRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        
        invoicesData = [];
        snapshot.forEach((doc) => {
            invoicesData.push({ id: doc.id, ...doc.data() });
        });
        
        return invoicesData;
    } catch (error) {
        console.error('Error loading invoices:', error);
        showToast('خطا در بارگذاری فاکتورها. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
        return [];
    }
}

async function saveAdmissionToFirebase(admissionData) {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        const { db, collection, addDoc } = window.firebase;
        const docRef = await addDoc(collection(db, ADMISSIONS_COLLECTION), admissionData);
        return docRef.id;
    } catch (error) {
        console.error('Error saving admission:', error);
        showToast('خطا در ذخیره پذیرش. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
        throw error;
    }
}

async function updateAdmissionInFirebase(admissionId, updates) {
    try {
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) throw new Error('Firebase not available');
        }
        const { db, doc, updateDoc } = window.firebase;
        await updateDoc(doc(db, ADMISSIONS_COLLECTION, admissionId), updates);
    } catch (error) {
        console.error('Error updating admission:', error);
        showToast('خطا در بروزرسانی پذیرش', 'error');
        throw error;
    }
}

async function saveInvoiceToFirebase(invoiceData) {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        const { db, collection, addDoc } = window.firebase;
        const docRef = await addDoc(collection(db, INVOICES_COLLECTION), invoiceData);
        return docRef.id;
    } catch (error) {
        console.error('Error saving invoice:', error);
        showToast('خطا در ذخیره فاکتور. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
        throw error;
    }
}

// Update existing invoice in Firebase
async function updateInvoiceInFirebase(invoiceId, updates) {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        const { db, doc, updateDoc } = window.firebase;
        const ref = doc(db, INVOICES_COLLECTION, invoiceId);
        await updateDoc(ref, updates);
    } catch (error) {
        console.error('Error updating invoice:', error);
        showToast('خطا در ذخیره فاکتور. لطفاً اتصال اینترنت را بررسی کنید.', 'error');
        throw error;
    }
}

async function deleteAdmissionFromFirebase(admissionId) {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        const { db, doc, deleteDoc } = window.firebase;
        await deleteDoc(doc(db, ADMISSIONS_COLLECTION, admissionId));
    } catch (error) {
        console.error('Error deleting admission:', error);
        showToast('خطا در حذف پذیرش. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
        throw error;
    }
}

async function deleteInvoiceFromFirebase(invoiceId) {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        const { db, doc, deleteDoc } = window.firebase;
        await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showToast('خطا در حذف فاکتور. لطفاً اتصال اینترنت خود را بررسی کنید.', 'error');
        throw error;
    }
}

// Security credentials for Firebase Auth
const ADMIN_EMAIL = 'admin@mechaniclnd.ir';
const ADMIN_PASSWORD = 'samad1379';

// Current step for multi-step form
let currentStep = 1;

// Toast notification system using SweetAlert2
function showToast(message, type = 'success') {
    if (typeof Swal === 'undefined') {
        // Fallback to old toast if SweetAlert2 is not loaded
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toast-icon');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastIcon && toastMessage) {
            if (type === 'success') {
                toastIcon.innerHTML = '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
            } else if (type === 'error') {
                toastIcon.innerHTML = '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
            }
            toastMessage.textContent = message;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
        return;
    }
    
    // Use SweetAlert2 for toast notifications
    const iconMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    Swal.fire({
        title: message,
        icon: iconMap[type] || 'success',
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}

// Confirm dialog using SweetAlert2
async function showConfirm(title, text, confirmButtonText = 'بله، مطمئنم', cancelButtonText = 'خیر، انصراف') {
    if (typeof Swal === 'undefined') {
        // Fallback to native confirm if SweetAlert2 is not loaded
        return confirm(text || title);
    }
    
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: true
    });
    
    return result.isConfirmed;
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    // Phone validation (if provided)
    const phone = formData.get('customer-phone');
    if (phone && !/^09\d{9}$/.test(phone)) {
        errors.push('شماره تلفن باید با 09 شروع شود و 11 رقم باشد');
    }
    
    // Persian date validation (if provided)
    const admissionDate = formData.get('admission-date');
    if (admissionDate && !validatePersianDate(admissionDate)) {
        errors.push('تاریخ پذیرش باید در فرمت شمسی باشد (مثال: 1403/01/15)');
    }
    
    return errors;
}

// Format form data
function formatFormData(formData) {
    return {
        customer: {
            name: formData.get('customer-name') || '',
            phone: formData.get('customer-phone') || ''
        },
        vehicle: {
            type: formData.get('car-type') || '',
            model: formData.get('car-model') || '',
            plate: formData.get('car-plate') || ''
        },
        service: {
            type: formData.get('service-type') || '',
            actualCost: parseInt(formData.get('actual-cost')) || 0,
            admissionDate: formData.get('admission-date') || '',
            admissionTime: formData.get('admission-time') || '',
            description: formData.get('problem-description') || ''
        },
        parts: window.currentAdmissionParts || [],
        totals: window.currentAdmissionTotals || null,
        status: document.getElementById('admission-payment-status')?.value || 'ثبت شده'
    };
}

// Generate receipt number
function generateReceiptNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `MH${year}${month}${day}${random}`;
}

// Set default Persian date and time
function setMinimumDate() {
    const admissionDateInput = document.getElementById('admission-date');
    if (admissionDateInput) {
        try {
            // Set today's date in Persian calendar
            if (typeof moment !== 'undefined') {
                const today = moment().format('jYYYY/jMM/jDD');
                admissionDateInput.value = today;
                console.log('✅ Persian date set successfully');
            } else {
                console.warn('⚠️ Moment.js not loaded, using fallback date');
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');
                admissionDateInput.value = `${year}/${month}/${day}`;
            }
        } catch (error) {
            console.error('❌ Error setting Persian date:', error.message);
            // Fallback to regular date
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            admissionDateInput.value = `${year}/${month}/${day}`;
        }
    }
    
    const admissionTimeInput = document.getElementById('admission-time');
    if (admissionTimeInput) {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        admissionTimeInput.value = timeString;
    }
}

// Admission parts table handlers
function initializeAdmissionPartsUI() {
    const rowsEl = document.getElementById('admission-parts-rows');
    const addBtn = document.getElementById('admission-add-part-row');
    const subtotalEl = document.getElementById('admission-parts-subtotal');
    const laborAmountEl = document.getElementById('admission-labor-amount');
    const grandEl = document.getElementById('admission-grand-total');
    const actualCostInput = document.getElementById('actual-cost');

    if (!rowsEl) return;

    function toNumber(v){ const n = parseInt((v||'').toString().replace(/[\s,]/g,'')); return isNaN(n)?0:n; }
    function format(n){ return (n||0).toLocaleString(); }

    function parseRow(tr){
        const [nameInp, qtyInp, unitInp] = tr.querySelectorAll('input');
        const name = (nameInp?.value||'').trim();
        const quantity = Math.max(1, toNumber(qtyInp?.value));
        const unitPrice = toNumber(unitInp?.value);
        return { name, quantity, unitPrice };
    }

    function updateRowTotal(tr){
        const d = parseRow(tr);
        const line = d.quantity * d.unitPrice;
        const el = tr.querySelector('.admission-line-total');
        if (el) el.textContent = format(line);
        return line;
    }

    function updateTotals(){
        const rows = Array.from(rowsEl.querySelectorAll('tr'));
        const parts = rows.map(parseRow).filter(p => p.name || p.unitPrice);
        const subtotal = parts.reduce((s,p)=>s+(p.quantity*p.unitPrice),0);
        if (subtotalEl) subtotalEl.textContent = format(subtotal);
        const labor = toNumber(actualCostInput?.value);
        if (laborAmountEl) laborAmountEl.textContent = `${format(labor)} تومان`;
        const grand = labor + subtotal;
        if (grandEl) grandEl.textContent = `${format(grand)} تومان`;
        window.currentAdmissionParts = parts;
        window.currentAdmissionTotals = { partsSubtotal: subtotal, laborCost: labor, grandTotal: grand };
    }

    function bindRow(tr){
        const inputs = tr.querySelectorAll('input');
        inputs.forEach((inp, idx)=>{
            inp.addEventListener('input', ()=>{
                if (idx===2){ const raw = toNumber(inp.value); inp.value = raw ? raw.toLocaleString() : ''; }
                updateRowTotal(tr); updateTotals();
            });
        });
        const del = tr.querySelector('.admission-remove-row');
        if (del) del.addEventListener('click', ()=>{ tr.remove(); updateTotals(); });
        updateRowTotal(tr);
    }

    function createRow(part={ name:'', quantity:1, unitPrice:0 }){
        const tr = document.createElement('tr');
        tr.className = 'border-b';
        tr.innerHTML = `
            <td class="py-2 pr-2"><input type="text" class="w-full border rounded px-2 py-1" value="${part.name||''}" placeholder="مثلاً لنت جلو"></td>
            <td class="py-2 text-center"><input type="number" min="1" class="w-20 border rounded px-2 py-1 text-center" value="${part.quantity||1}"></td>
            <td class="py-2 text-center"><input type="text" class="w-32 border rounded px-2 py-1 text-center" value="${part.unitPrice?part.unitPrice.toLocaleString():''}" placeholder="0"></td>
            <td class="py-2 pl-2 text-left"><span class="admission-line-total">0</span></td>
            <td class="py-2 text-center"><button type="button" class="text-red-600 hover:underline admission-remove-row">حذف</button></td>
        `;
        rowsEl.appendChild(tr);
        bindRow(tr); updateTotals();
    }

    if (addBtn) addBtn.addEventListener('click', ()=> createRow());
    if (actualCostInput) actualCostInput.addEventListener('input', updateTotals);

    // Load any existing parts for edit
    const existing = Array.isArray(window.currentAdmissionParts) ? window.currentAdmissionParts : [];
    if (existing.length>0) existing.forEach(p=>createRow(p)); else createRow();
}

// Format Persian date input
function formatPersianDate(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    
    if (value.length >= 4) {
        value = value.slice(0, 4) + '/' + value.slice(4);
    }
    if (value.length >= 7) {
        value = value.slice(0, 7) + '/' + value.slice(7, 9);
    }
    
    input.value = value;
}

// Validate Persian date
function validatePersianDate(dateString) {
    if (!dateString) return false;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    // Basic validation
    if (year < 1300 || year > 1500) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    return true;
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
            loadingScreen.style.display = 'none';
    }
}

// Dashboard functions
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard-section').classList.remove('hidden');
    updateStatistics();
    
    // Wait a bit for DOM to be ready, then create charts
    setTimeout(() => {
        updateCharts();
    }, 100);
}

function showNewAdmission() {
    hideAllSections();
    document.getElementById('form-section').classList.remove('hidden');
    
    // Reset form to step 1
    currentStep = 1;
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.add('hidden');
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.classList.remove('active', 'completed');
    });
    document.querySelector('[data-step="1"]').classList.add('active');
    
    // Clear any editing state
    window.currentEditingAdmissionId = null;
    
    // Reset form
    const form = document.getElementById('car-admission-form');
    if (form) {
        form.reset();
        setMinimumDate(); // Set default Persian date
    }
}

function hideAllSections() {
    const sections = ['dashboard-section', 'form-section', 'daily-report-section', 'all-admissions-section', 'invoices-section'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

// Statistics update
function updateStatistics() {
    // Total admissions
    const totalAdmissions = admissionsData.length;
    const totalAdmissionsEl = document.getElementById('total-admissions');
    if (totalAdmissionsEl) {
        totalAdmissionsEl.textContent = totalAdmissions;
    }
    
    // Today's invoices
    const today = new Date().toISOString().split('T')[0];
    const todayInvoices = invoicesData.filter(invoice => 
        new Date(invoice.date).toISOString().split('T')[0] === today
    ).length;
    const todayInvoicesEl = document.getElementById('today-invoices');
    if (todayInvoicesEl) {
        todayInvoicesEl.textContent = todayInvoices;
    }
    
    // Today's revenue
    const todayRevenue = invoicesData
        .filter(invoice => new Date(invoice.date).toISOString().split('T')[0] === today)
        .reduce((sum, invoice) => sum + (parseInt(invoice.service?.actualCost) || 0), 0);
    const todayRevenueEl = document.getElementById('today-revenue');
    if (todayRevenueEl) {
        todayRevenueEl.textContent = todayRevenue.toLocaleString();
    }
    
    // Pending admissions
    const pendingAdmissions = admissionsData.filter(admission => 
        admission.status === 'ثبت شده' || admission.status === 'در انتظار'
    ).length;
    const pendingAdmissionsEl = document.getElementById('pending-admissions');
    if (pendingAdmissionsEl) {
        pendingAdmissionsEl.textContent = pendingAdmissions;
    }
    
    // Update charts
    updateCharts();
}

// Chart functions
function updateCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js not loaded yet, retrying in 1 second...');
        setTimeout(updateCharts, 1000);
        return;
    }
    
    try {
        console.log('📊 Creating charts...');
        createAdmissionsChart();
        createRevenueChart();
        createServiceTypesChart();
        console.log('✅ Charts created successfully');
    } catch (error) {
        console.error('❌ Error creating charts:', error.message);
    }
}

function createAdmissionsChart() {
    const ctx = document.getElementById('admissionsChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (admissionsChart) {
        admissionsChart.destroy();
    }
    
    // Get last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const admissionsCount = last7Days.map(date => {
        return admissionsData.filter(admission => 
            new Date(admission.date).toISOString().split('T')[0] === date
        ).length;
    });
    
    admissionsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(date => new Date(date).toLocaleDateString('fa-IR')),
            datasets: [{
                label: 'تعداد پذیرش‌ها',
                data: admissionsCount,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    // Get last 12 months data
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        last12Months.push(date.toISOString().substring(0, 7));
    }
    
    const revenueData = last12Months.map(month => {
        return invoicesData
            .filter(invoice => invoice.date.startsWith(month))
            .reduce((sum, invoice) => sum + (parseInt(invoice.service?.actualCost) || 0), 0);
    });
    
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last12Months.map(month => new Date(month + '-01').toLocaleDateString('fa-IR', { year: 'numeric', month: 'short' })),
            datasets: [{
                label: 'درآمد (تومان)',
                data: revenueData,
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                borderColor: 'rgb(168, 85, 247)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' تومان';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createServiceTypesChart() {
    const ctx = document.getElementById('serviceTypesChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (serviceTypesChart) {
        serviceTypesChart.destroy();
    }
    
    // Get service types data
    const serviceTypes = {};
    admissionsData.forEach(admission => {
        const serviceType = admission.service?.type || 'نامشخص';
        serviceTypes[serviceType] = (serviceTypes[serviceType] || 0) + 1;
    });
    
    const labels = Object.keys(serviceTypes);
    const data = Object.values(serviceTypes);
    const colors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(34, 197, 94, 0.8)'
    ];
    
    serviceTypesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// Form submission handler
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showToast(errors.join('، '), 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'در حال ثبت...';
    submitBtn.disabled = true;
    form.classList.add('form-loading');
    
    // Format data
    const formattedData = formatFormData(formData);
    const receiptNumber = generateReceiptNumber();
    
    // Create or update admission record
    const admissionRecord = {
        receiptNumber: receiptNumber,
        date: new Date().toISOString(),
        ...formattedData,
        status: formattedData.status || 'ثبت شده'
    };
    
    try {
        // If editing, update existing; else create new
        if (window.currentEditingAdmissionId) {
            await updateAdmissionInFirebase(window.currentEditingAdmissionId, admissionRecord);
            admissionsData = admissionsData.map(a => a.id === window.currentEditingAdmissionId ? { id: a.id, ...admissionRecord } : a);
            showToast('پذیرش با موفقیت ویرایش شد.', 'success');
        } else {
            const docId = await saveAdmissionToFirebase(admissionRecord);
            admissionsData.unshift({ id: docId, ...admissionRecord });
            showToast(`پذیرش خودرو با شماره ${receiptNumber} ثبت شد.`, 'success');
        }
        
        // Reset form and editing state
        form.reset();
        setMinimumDate();
        window.currentEditingAdmissionId = null;
        window.currentAdmissionParts = [];
        window.currentAdmissionTotals = null;
        
        // Update statistics
        updateStatistics();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showToast('خطا در ثبت پذیرش. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.classList.remove('form-loading');
    }
}

// Multi-step form navigation
function nextStep(step) {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
        return;
    }
    
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    
    // Show next step
    document.getElementById(`step-${step}`).classList.remove('hidden');
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.classList.remove('active', 'completed');
    });
    
    // Mark previous steps as completed
    for (let i = 1; i < step; i++) {
        const indicator = document.querySelector(`[data-step="${i}"]`);
        if (indicator) {
            indicator.classList.add('completed');
        }
    }
    
    // Mark current step as active
    const currentIndicator = document.querySelector(`[data-step="${step}"]`);
    if (currentIndicator) {
        currentIndicator.classList.add('active');
    }
    
    currentStep = step;
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    
    // Show previous step
    document.getElementById(`step-${step}`).classList.remove('hidden');
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.classList.remove('active', 'completed');
    });
    
    // Mark previous steps as completed
    for (let i = 1; i < step; i++) {
        const indicator = document.querySelector(`[data-step="${i}"]`);
        if (indicator) {
            indicator.classList.add('completed');
        }
    }
    
    // Mark current step as active
    const currentIndicator = document.querySelector(`[data-step="${step}"]`);
    if (currentIndicator) {
        currentIndicator.classList.add('active');
    }
    
    currentStep = step;
}

function validateCurrentStep() {
    const step = document.getElementById(`step-${currentStep}`);
    const requiredFields = step.querySelectorAll('input[required], select[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            showToast('لطفاً تمام فیلدهای الزامی را پر کنید', 'error');
            field.focus();
            return false;
        }
    }
    
    return true;
}

// Save as draft
async function saveAsDraft() {
    const form = document.getElementById('car-admission-form');
    const formData = new FormData(form);
    const formattedData = formatFormData(formData);
    
    // Create draft record
    const draftRecord = {
        receiptNumber: 'DRAFT_' + Date.now(),
        date: new Date().toISOString(),
        ...formattedData,
        status: 'پیش‌نویس'
    };
    
    try {
        const docId = await saveAdmissionToFirebase(draftRecord);
        admissionsData.unshift({ id: docId, ...draftRecord });
        
        showToast('پیش‌نویس با موفقیت ذخیره شد', 'success');
    updateStatistics();
    } catch (error) {
        showToast('خطا در ذخیره پیش‌نویس', 'error');
    }
}

// Admissions management
async function showAllAdmissions() {
    hideAllSections();
    document.getElementById('all-admissions-section').classList.remove('hidden');
    
    // Load data from Firebase
    await loadAdmissionsFromFirebase();
    updateAllAdmissionsList();
}

function hideAllAdmissions() {
    document.getElementById('all-admissions-section').classList.add('hidden');
    showDashboard();
}

function updateAllAdmissionsList() {
    const listContainer = document.getElementById('all-admissions-list');
    
    if (admissionsData.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-8">هیچ پذیرشی ثبت نشده است</div>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedAdmissions = [...admissionsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const listHTML = sortedAdmissions.map(admission => `
        <div class="bg-white p-6 rounded-xl border border-gray-200 mb-4">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-medium text-black">${admission.customer?.name || 'نامشخص'}</h3>
                    <p class="text-gray-600">${admission.customer?.phone || 'تلفن ثبت نشده'}</p>
                </div>
                <div class="text-left">
                    <p class="text-sm text-gray-500">شماره: ${admission.id}</p>
                    <p class="text-sm text-gray-500">${new Date(admission.date).toLocaleString('fa-IR')}</p>
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">خودرو:</p>
                    <p class="font-medium">${admission.vehicle?.type || 'نامشخص'} ${admission.vehicle?.model || ''}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">پلاک:</p>
                    <p class="font-medium">${admission.vehicle?.plate || 'ثبت نشده'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">سرویس:</p>
                    <p class="font-medium">${admission.service?.type || 'نامشخص'}</p>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <span class="px-3 py-1 rounded-full text-sm ${
                    admission.status === 'تکمیل شده' ? 'bg-green-100 text-green-800' :
                    admission.status === 'در انتظار' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }">${admission.status}</span>
                <div class="flex gap-2">
                    <button onclick="editAdmission('${admission.id}')" 
                            class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700">
                        ویرایش
                    </button>
                    <button onclick="deleteAdmission('${admission.id}')" 
                            class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                        حذف
                    </button>
                    <button onclick="generateInvoiceForAdmission('${admission.id}')" 
                            class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        فاکتور
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    listContainer.innerHTML = listHTML;
}

// Edit admission
function editAdmission(admissionId) {
    const admission = admissionsData.find(a => a.id === admissionId);
    if (!admission) return;
    
    // Fill form with admission data
    document.getElementById('customer-name').value = admission.customer?.name || '';
    document.getElementById('customer-phone').value = admission.customer?.phone || '';
    document.getElementById('car-type').value = admission.vehicle?.type || '';
    document.getElementById('car-model').value = admission.vehicle?.model || '';
    document.getElementById('car-plate').value = admission.vehicle?.plate || '';
    document.getElementById('service-type').value = admission.service?.type || '';
    document.getElementById('actual-cost').value = admission.service?.actualCost || '';
    document.getElementById('admission-date').value = admission.service?.admissionDate || '';
    document.getElementById('admission-time').value = admission.service?.admissionTime || '';
    document.getElementById('problem-description').value = admission.service?.description || '';
    
    // Load payment status if available
    const paymentStatusSelect = document.getElementById('admission-payment-status');
    if (paymentStatusSelect && admission.status) {
        paymentStatusSelect.value = admission.status;
    }
    
    // Store current admission ID for update
    window.currentEditingAdmissionId = admissionId;
    // Load parts/status into admission form state
    window.currentAdmissionParts = Array.isArray(admission.parts) ? admission.parts : [];
    window.currentAdmissionTotals = admission.totals || null;
    
    // Show form and go to step 3 (where parts table is) to show all information
    hideAllSections();
    document.getElementById('form-section').classList.remove('hidden');
    
    // Show all steps so user can see complete information
    currentStep = 3;
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    
    // Update step indicators - mark all as completed, step 3 as active
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.classList.remove('active', 'completed');
    });
    document.querySelector('[data-step="1"]').classList.add('completed');
    document.querySelector('[data-step="2"]').classList.add('completed');
    document.querySelector('[data-step="3"]').classList.add('active');
    
    // Clear existing parts rows and initialize parts UI after a short delay to ensure DOM is ready
    setTimeout(() => {
        const rowsEl = document.getElementById('admission-parts-rows');
        if (rowsEl) {
            rowsEl.innerHTML = ''; // Clear existing rows
        }
        initializeAdmissionPartsUI();
    }, 100);
    
    showToast('اطلاعات پذیرش در فرم بارگذاری شد. ویرایش کنید و ثبت کنید.', 'success');
}

// Delete admission
async function deleteAdmission(admissionId) {
    const confirmed = await showConfirm(
        'حذف پذیرش',
        'آیا مطمئن هستید که می‌خواهید این پذیرش را حذف کنید؟',
        'بله، حذف کن',
        'خیر، انصراف'
    );
    
    if (confirmed) {
        try {
            // Remove from Firebase
            await deleteAdmissionFromFirebase(admissionId);
            
            // Remove from local array
            admissionsData = admissionsData.filter(a => a.id !== admissionId);
        
            // Update lists
            updateAllAdmissionsList();
            updateStatistics();
        
            showToast('پذیرش با موفقیت حذف شد', 'success');
        } catch (error) {
            showToast('خطا در حذف پذیرش', 'error');
        }
    }
}

// Daily report functions
function showDailyReport() {
    hideAllSections();
    document.getElementById('daily-report-section').classList.remove('hidden');
    updateDailyReport();
}

function hideDailyReport() {
    document.getElementById('daily-report-section').classList.add('hidden');
    showDashboard();
}

function updateDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const todayAdmissions = admissionsData.filter(admission => 
        new Date(admission.date).toISOString().split('T')[0] === today
    );
    
    updateAdmissionsList(todayAdmissions);
}

function updateAdmissionsList(admissions) {
    const listContainer = document.getElementById('admissions-list');
    
    if (admissions.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-8">هیچ پذیرشی برای امروز ثبت نشده است</div>';
        return;
    }
    
    const listHTML = admissions.map(admission => `
        <div class="bg-white p-6 rounded-xl border border-gray-200 mb-4">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-medium text-black">${admission.customer?.name || 'نامشخص'}</h3>
                    <p class="text-gray-600">${admission.customer?.phone || 'تلفن ثبت نشده'}</p>
                </div>
                <div class="text-left">
                    <p class="text-sm text-gray-500">شماره: ${admission.id}</p>
                    <p class="text-sm text-gray-500">${new Date(admission.date).toLocaleString('fa-IR')}</p>
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">خودرو:</p>
                    <p class="font-medium">${admission.vehicle?.type || 'نامشخص'} ${admission.vehicle?.model || ''}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">پلاک:</p>
                    <p class="font-medium">${admission.vehicle?.plate || 'ثبت نشده'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">سرویس:</p>
                    <p class="font-medium">${admission.service?.type || 'نامشخص'}</p>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <span class="px-3 py-1 rounded-full text-sm ${
                    admission.status === 'تکمیل شده' ? 'bg-green-100 text-green-800' :
                    admission.status === 'در انتظار' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }">${admission.status}</span>
                <div class="flex gap-2">
                    <button onclick="generateInvoiceForAdmission('${admission.id}')" 
                            class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        فاکتور
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    listContainer.innerHTML = listHTML;
}

// Invoice management
async function showInvoices() {
    hideAllSections();
    document.getElementById('invoices-section').classList.remove('hidden');
    
    // Load data from Firebase
    await loadInvoicesFromFirebase();
    updateInvoicesList();
}

function hideInvoices() {
    document.getElementById('invoices-section').classList.add('hidden');
    showDashboard();
}

function updateInvoicesList() {
    const listContainer = document.getElementById('invoices-list');
    
    if (invoicesData.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-8">هیچ فاکتوری ثبت نشده است</div>';
        return;
    }
    
    // Sort by date (newest first)
    let filtered = [...invoicesData];
    const f = (window.invoiceFilter || 'all');
    if (f === 'open') {
        filtered = filtered.filter(inv => inv.status !== 'پرداخت شده');
    } else if (f === 'completed') {
        filtered = filtered.filter(inv => inv.status === 'پرداخت شده');
    } else if (f === 'cash') {
        filtered = filtered.filter(inv => inv.status === 'پرداخت نقدی' || inv.status === 'پرداخت با کارت');
    } else if (f === 'cheque') {
        filtered = filtered.filter(inv => inv.status === 'پرداخت با چک');
    }
    const sortedInvoices = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const listHTML = sortedInvoices.map(invoice => `
        <div class="bg-white p-6 rounded-xl border border-gray-200 mb-4">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-medium text-black">فاکتور ${invoice.invoiceNumber}</h3>
                    <p class="text-gray-600">${invoice.customer?.name || 'نامشخص'}</p>
                </div>
                <div class="text-left">
                    <p class="text-sm text-gray-500">${new Date(invoice.date).toLocaleDateString('fa-IR')}</p>
                    <p class="text-sm text-gray-500">${(invoice.service?.actualCost || 0).toLocaleString()} تومان</p>
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                    <p class="text-sm text-gray-500">خودرو:</p>
                    <p class="font-medium">${invoice.vehicle?.type || 'نامشخص'} ${invoice.vehicle?.model || ''}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">سرویس:</p>
                    <p class="font-medium">${invoice.service?.type || 'نامشخص'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">مبلغ:</p>
                    <p class="font-medium">${(invoice.service?.actualCost || 0).toLocaleString()} تومان</p>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <span class="px-3 py-1 rounded-full text-sm ${
                    invoice.status === 'پرداخت شده' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'پرداخت نقدی' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                }">${invoice.status}</span>
                <div class="flex gap-2">
                    <button onclick="viewInvoice('${invoice.id}')" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        مشاهده
                    </button>
                    ${INVOICES_READ_ONLY ? '' : `<button onclick="deleteInvoice('${invoice.id}')" 
                            class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">حذف</button>`}
                </div>
            </div>
        </div>
    `).join('');
    
    listContainer.innerHTML = listHTML;
}

// Create new invoice
function createNewInvoice() {
    // This would open a form to create a new invoice
    showToast('این قابلیت در حال توسعه است', 'error');
}

// View invoice
function viewInvoice(invoiceId) {
    const invoice = invoicesData.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    const modal = document.getElementById('invoice-modal');
    const content = document.getElementById('invoice-content');
    
    // Store current invoice for PDF export
    window.currentViewingInvoice = invoice;
    
    // Display invoice content
    content.innerHTML = `
        <div class="bg-gray-50 p-6 rounded-xl">
            <div class="text-center mb-6">
                <h1 class="text-black font-extrabold text-xl mb-1">تعمیرگاه مکانیک لند</h1>
                <h2 class="text-xl font-bold text-black">فاکتور</h2>
                <p class="text-gray-600">شماره: ${invoice.invoiceNumber}</p>
                <p class="text-gray-600">تاریخ: ${new Date(invoice.date).toLocaleDateString('fa-IR')}</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 class="font-medium text-black mb-2">اطلاعات مشتری:</h3>
                    <p class="text-gray-700">نام: ${invoice.customer?.name || 'نامشخص'}</p>
                    <p class="text-gray-700">تلفن: ${invoice.customer?.phone || 'ثبت نشده'}</p>
                </div>
                <div>
                    <h3 class="font-medium text-black mb-2">اطلاعات خودرو:</h3>
                    <p class="text-gray-700">نوع: ${invoice.vehicle?.type || 'نامشخص'}</p>
                    <p class="text-gray-700">مدل: ${invoice.vehicle?.model || 'نامشخص'}</p>
                    <p class="text-gray-700">پلاک: ${invoice.vehicle?.plate || 'ثبت نشده'}</p>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="font-medium text-black mb-2">جزئیات خدمات:</h3>
                <div class="bg-white p-4 rounded-lg">
                    <p class="text-gray-700 mb-2">نوع سرویس: ${invoice.service?.type || 'نامشخص'}</p>
                    <p class="text-gray-700 mb-2">توضیحات: ${invoice.service?.description || 'توضیحی ثبت نشده'}</p>
                    <p class="text-gray-700">تاریخ پذیرش: ${invoice.service?.admissionDate || 'نامشخص'}</p>
                </div>
            </div>

            <div class="mb-6">
                <h3 class="font-medium text-black mb-3">لوازم/قطعات تعویض‌شده:</h3>
                <div class="bg-white p-4 rounded-lg">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="text-gray-600 border-b">
                                    <th class="py-2 text-right pr-2">نام قطعه</th>
                                    <th class="py-2 text-center">تعداد</th>
                                    <th class="py-2 text-center">قیمت واحد (تومان)</th>
                                    <th class="py-2 text-left pl-2">مبلغ خط</th>
                                    <th class="py-2 text-center">حذف</th>
                                </tr>
                            </thead>
                            <tbody id="parts-rows">
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-3 flex justify-between items-center">
                        ${INVOICES_READ_ONLY ? '' : '<button id="add-part-row" class="bg-blue-600 text-white px-3 py-1 rounded">افزودن ردیف</button>'}
                        <div class="text-gray-700">
                            <span>جمع قطعات:</span>
                            <span id="parts-subtotal" class="font-bold">0</span>
                            <span>تومان</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="border-t pt-4">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-medium text-black">دستمزد/خدمت:</span>
                    <span class="text-lg font-bold text-black">${(invoice.service?.actualCost || 0).toLocaleString()} تومان</span>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-lg font-medium text-black">جمع قطعات:</span>
                    <span class="text-lg font-bold text-black"><span id="parts-subtotal-inline">0</span> تومان</span>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-lg font-medium text-black">مبلغ کل:</span>
                    <span class="text-xl font-bold text-black" id="grand-total">${(invoice.service?.actualCost || 0).toLocaleString()} تومان</span>
                </div>
                <div class="flex justify-between items-center mt-3 gap-3">
                    <label class="text-gray-700">وضعیت پرداخت:</label>
                    ${INVOICES_READ_ONLY ? '' : '<select id="payment-status-select" class="border rounded px-3 py-1 text-sm">\
                        <option value="پرداخت نشده">پرداخت نشده</option>\
                        <option value="پرداخت نقدی">پرداخت نقدی</option>\
                        <option value="پرداخت با کارت">پرداخت با کارت</option>\
                        <option value="پرداخت با چک">پرداخت با چک</option>\
                        <option value="پرداخت شده">پرداخت شده</option>\
                    </select>'}
                    <span id="payment-status-badge" class="px-3 py-1 rounded-full text-sm ${
                        invoice.status === 'پرداخت شده' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'پرداخت نقدی' || invoice.status === 'پرداخت با کارت' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'پرداخت با چک' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">${invoice.status}</span>
                    ${INVOICES_READ_ONLY ? '' : '<button id="save-invoice-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm">ذخیره</button>'}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    
    // Show/hide delete button based on INVOICES_READ_ONLY flag
    const deleteBtn = modal.querySelector('button[onclick="deleteInvoiceFromModal()"]');
    if (deleteBtn) {
        if (INVOICES_READ_ONLY) {
            deleteBtn.style.display = 'none';
        } else {
            deleteBtn.style.display = 'inline-block';
        }
    }

    // Parts table logic (editable in modal, stored in-memory on currentViewingInvoice)
    try {
        const partsRowsEl = document.getElementById('parts-rows');
        const addRowBtn = document.getElementById('add-part-row');
        const partsSubtotalEl = document.getElementById('parts-subtotal');
        const partsSubtotalInlineEl = document.getElementById('parts-subtotal-inline');
        const grandTotalEl = document.getElementById('grand-total');

        // Load existing parts if present
        const existingParts = Array.isArray(window.currentViewingInvoice?.parts) ? window.currentViewingInvoice.parts : [];

        function toNumber(value) {
            const n = parseInt((value || '').toString().replace(/[,\s]/g, ''));
            return isNaN(n) ? 0 : n;
        }

        function formatNumber(n) {
            return (n || 0).toLocaleString();
        }

        function createRow(part = { name: '', quantity: 1, unitPrice: 0 }) {
            const tr = document.createElement('tr');
            tr.className = 'border-b';
            tr.innerHTML = `
                <td class="py-2 pr-2"><input type="text" class="w-full border rounded px-2 py-1" value="${part.name || ''}" placeholder="مثلاً فیلتر روغن"></td>
                <td class="py-2 text-center"><input type="number" min="1" class="w-20 border rounded px-2 py-1 text-center" value="${part.quantity || 1}"></td>
                <td class="py-2 text-center"><input type="text" class="w-32 border rounded px-2 py-1 text-center" value="${part.unitPrice ? part.unitPrice.toLocaleString() : ''}" placeholder="0"></td>
                <td class="py-2 pl-2 text-left"><span class="line-total">0</span></td>
                <td class="py-2 text-center"><button class="text-red-600 hover:underline remove-row">حذف</button></td>
            `;
            partsRowsEl.appendChild(tr);
            bindRow(tr);
            updateTotals();
        }

        function parseRow(tr) {
            const [nameInput, qtyInput, priceInput] = tr.querySelectorAll('input');
            const name = nameInput.value.trim();
            const quantity = Math.max(1, toNumber(qtyInput.value));
            const unitPrice = toNumber(priceInput.value);
            return { name, quantity, unitPrice };
        }

        function updateRowTotal(tr) {
            const data = parseRow(tr);
            const lineTotal = data.quantity * data.unitPrice;
            const lineTotalEl = tr.querySelector('.line-total');
            if (lineTotalEl) lineTotalEl.textContent = formatNumber(lineTotal);
            return lineTotal;
        }

        function updateTotals() {
            const rows = Array.from(partsRowsEl.querySelectorAll('tr'));
            const parts = rows.map(parseRow).filter(p => p.name || p.unitPrice);
            const subtotal = parts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
            if (partsSubtotalEl) partsSubtotalEl.textContent = formatNumber(subtotal);
            if (partsSubtotalInlineEl) partsSubtotalInlineEl.textContent = formatNumber(subtotal);
            const labor = toNumber(invoice.service?.actualCost);
            const grand = labor + subtotal;
            if (grandTotalEl) grandTotalEl.textContent = `${formatNumber(grand)} تومان`;
            // Persist into current invoice in-memory
            window.currentViewingInvoice = {
                ...window.currentViewingInvoice,
                parts,
                totals: { partsSubtotal: subtotal, laborCost: labor, grandTotal: grand }
            };
        }

        function bindRow(tr) {
            const inputs = tr.querySelectorAll('input');
            inputs.forEach((inp, idx) => {
                inp.addEventListener('input', () => {
                    if (idx === 2) { // unit price formatting
                        const raw = toNumber(inp.value);
                        inp.value = raw ? raw.toLocaleString() : '';
                    }
                    updateRowTotal(tr);
                    updateTotals();
                });
            });
            const removeBtn = tr.querySelector('.remove-row');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    tr.remove();
                    updateTotals();
                });
            }
            updateRowTotal(tr);
        }

        if (addRowBtn && !INVOICES_READ_ONLY) {
            addRowBtn.addEventListener('click', () => createRow());
        }

        // Initialize with existing parts or one empty row
        if (existingParts.length > 0) {
            existingParts.forEach(p => createRow(p));
        } else {
            createRow();
        }

    } catch (e) {
        console.error('Error initializing parts table:', e);
    }

    // Initialize and bind payment status select
    try {
        const statusSelect = document.getElementById('payment-status-select');
        const statusBadge = document.getElementById('payment-status-badge');
        const current = window.currentViewingInvoice?.status || invoice.status || 'پرداخت نشده';
        if (statusSelect && !INVOICES_READ_ONLY) {
            statusSelect.value = current;
            const applyBadgeClass = (value) => {
                const base = 'px-3 py-1 rounded-full text-sm ';
                let cls = 'bg-red-100 text-red-800';
                if (value === 'پرداخت شده') cls = 'bg-green-100 text-green-800';
                else if (value === 'پرداخت نقدی' || value === 'پرداخت با کارت') cls = 'bg-blue-100 text-blue-800';
                else if (value === 'پرداخت با چک') cls = 'bg-yellow-100 text-yellow-800';
                statusBadge.className = base + cls;
            };
            applyBadgeClass(current);
            if (statusBadge) statusBadge.textContent = current;
            statusSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                // persist in current invoice (in-memory)
                window.currentViewingInvoice = { ...window.currentViewingInvoice, status: value };
                applyBadgeClass(value);
                if (statusBadge) statusBadge.textContent = value;
            });
        }
    } catch (e) {
        console.error('Error initializing payment status control:', e);
    }

    // Save button handler: persist parts, totals, and status to Firebase and local state
    try {
        const saveBtn = document.getElementById('save-invoice-btn');
        if (saveBtn && !INVOICES_READ_ONLY) {
            saveBtn.addEventListener('click', async () => {
                const inv = window.currentViewingInvoice;
                if (!inv || !inv.id) {
                    showToast('خطا: شناسه فاکتور نامعتبر است', 'error');
                    return;
                }
                const updates = {
                    parts: Array.isArray(inv.parts) ? inv.parts : [],
                    totals: inv.totals || null,
                    status: inv.status || invoice.status || 'پرداخت نشده'
                };
                try {
                    await updateInvoiceInFirebase(inv.id, updates);
                    // Update local invoicesData
                    invoicesData = invoicesData.map(i => i.id === inv.id ? { ...i, ...updates } : i);
                    showToast('فاکتور با موفقیت ذخیره شد', 'success');
                    // Refresh list if visible
                    if (document.getElementById('invoices-section') && !document.getElementById('invoices-section').classList.contains('hidden')) {
                        updateInvoicesList();
                    }
                } catch (err) {
                    console.error('Save invoice error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Error binding save button:', e);
    }
}

// Print invoice function
function printInvoice(invoiceData) {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>فاکتور ${invoiceData.invoiceNumber}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Tahoma', 'Arial', sans-serif;
                    direction: rtl;
                    text-align: right;
                    background: #f8f9fa;
                    color: #2c3e50;
                    line-height: 1.6;
                }
                
                .invoice-container {
                    max-width: 800px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                
                .invoice-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    position: relative;
                }
                
                .invoice-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                    opacity: 0.3;
                }
                
                .invoice-header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    position: relative;
                    z-index: 1;
                }
                
                .invoice-number {
                    font-size: 18px;
                    opacity: 0.9;
                    position: relative;
                    z-index: 1;
                }
                
                .invoice-date {
                    font-size: 16px;
                    opacity: 0.8;
                    margin-top: 5px;
                    position: relative;
                    z-index: 1;
                }
                
                .invoice-body {
                    padding: 40px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }
                
                .info-card {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    border-right: 4px solid #667eea;
                    transition: transform 0.2s ease;
                }
                
                .info-card:hover {
                    transform: translateY(-2px);
                }
                
                .info-card h3 {
                    color: #667eea;
                    font-size: 18px;
                    margin-bottom: 15px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                }
                
                .info-card h3::before {
                    content: '●';
                    margin-left: 8px;
                    color: #667eea;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .info-item:last-child {
                    border-bottom: none;
                }
                
                .info-label {
                    font-weight: 600;
                    color: #495057;
                    font-size: 14px;
                }
                
                .info-value {
                    color: #2c3e50;
                    font-weight: 500;
                    font-size: 14px;
                }
                
                .service-details {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 30px;
                    position: relative;
                    overflow: hidden;
                }
                
                .service-details::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    animation: shimmer 3s infinite;
                }
                
                @keyframes shimmer {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .service-details h3 {
                    font-size: 20px;
                    margin-bottom: 15px;
                    position: relative;
                    z-index: 1;
                }
                
                .service-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                    position: relative;
                    z-index: 1;
                }
                
                .service-item:last-child {
                    border-bottom: none;
                }
                
                .service-label {
                    font-weight: 600;
                    opacity: 0.9;
                }
                
                .service-value {
                    font-weight: 500;
                }
                
                .total-section {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border-radius: 12px;
                    padding: 25px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .total-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.2"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
                    opacity: 0.3;
                }
                
                .total-amount {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    position: relative;
                    z-index: 1;
                }
                
                .total-status {
                    font-size: 16px;
                    opacity: 0.9;
                    position: relative;
                    z-index: 1;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                    margin-top: 10px;
                }
                
                .status-paid {
                    background: rgba(40, 167, 69, 0.2);
                    color: #28a745;
                    border: 1px solid rgba(40, 167, 69, 0.3);
                }
                
                .status-unpaid {
                    background: rgba(220, 53, 69, 0.2);
                    color: #dc3545;
                    border: 1px solid rgba(220, 53, 69, 0.3);
                }
                
                .footer {
                    background: #2c3e50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    opacity: 0.8;
                }
                
                .buttons {
                    text-align: center;
                    margin-top: 30px;
                    padding: 20px;
                }
                
                .btn {
                    padding: 12px 30px;
                    font-size: 16px;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    margin: 0 10px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-block;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
                }
                
                .btn-secondary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(108, 117, 125, 0.6);
                }
                
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    body { 
                        background: white !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: 12px !important;
                        line-height: 1.4 !important;
                    }
                    
                    .invoice-container {
                        box-shadow: none !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                        max-width: none !important;
                        width: 100% !important;
                        page-break-inside: avoid !important;
                    }
                    
                    .invoice-header {
                        background: #2c3e50 !important;
                        color: white !important;
                        padding: 15px !important;
                        margin-bottom: 15px !important;
                        page-break-after: avoid !important;
                    }
                    
                    .invoice-header h1 {
                        font-size: 20px !important;
                        margin-bottom: 5px !important;
                    }
                    
                    .invoice-number, .invoice-date {
                        font-size: 12px !important;
                    }
                    
                    .invoice-body {
                        padding: 15px !important;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 15px !important;
                        margin-bottom: 15px !important;
                    }
                    
                    .info-card {
                        background: #f8f9fa !important;
                        border: 1px solid #dee2e6 !important;
                        border-right: 3px solid #2c3e50 !important;
                        padding: 10px !important;
                        page-break-inside: avoid !important;
                    }
                    
                    .info-card h3 {
                        color: #2c3e50 !important;
                        font-size: 14px !important;
                        margin-bottom: 8px !important;
                    }
                    
                    .info-item {
                        padding: 3px 0 !important;
                        font-size: 11px !important;
                    }
                    
                    .info-label {
                        color: #495057 !important;
                        font-weight: 600 !important;
                    }
                    
                    .info-value {
                        color: #2c3e50 !important;
                    }
                    
                    .service-details {
                        background: #2c3e50 !important;
                        color: white !important;
                        padding: 15px !important;
                        margin-bottom: 15px !important;
                        page-break-inside: avoid !important;
                    }
                    
                    .service-details::before {
                        display: none !important;
                    }
                    
                    .service-details h3 {
                        font-size: 16px !important;
                        margin-bottom: 10px !important;
                    }
                    
                    .service-item {
                        padding: 5px 0 !important;
                        font-size: 11px !important;
                        border-bottom: 1px solid rgba(255,255,255,0.2) !important;
                    }
                    
                    .total-section {
                        background: #34495e !important;
                        color: white !important;
                        padding: 15px !important;
                        page-break-inside: avoid !important;
                    }
                    
                    .total-section::before {
                        display: none !important;
                    }
                    
                    .total-amount {
                        font-size: 18px !important;
                        margin-bottom: 5px !important;
                    }
                    
                    .total-status {
                        font-size: 12px !important;
                    }
                    
                    .status-badge {
                        font-size: 10px !important;
                        padding: 3px 8px !important;
                        margin-top: 5px !important;
                    }
                    
                    .status-paid {
                        background: #27ae60 !important;
                        color: white !important;
                        border: 1px solid #27ae60 !important;
                    }
                    
                    .status-unpaid {
                        background: #e74c3c !important;
                        color: white !important;
                        border: 1px solid #e74c3c !important;
                    }
                    
                    .footer {
                        background: #2c3e50 !important;
                        color: white !important;
                        padding: 10px !important;
                        font-size: 10px !important;
                        page-break-before: avoid !important;
                    }
                    
                    .no-print { 
                        display: none !important; 
                    }
                    
                    .info-card:hover { 
                        transform: none !important; 
                    }
                    
                    .btn:hover { 
                        transform: none !important; 
                    }
                    
                    @page {
                        margin: 0.5in !important;
                        size: A4 !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .invoice-body {
                        padding: 20px;
                    }
                    .invoice-header {
                        padding: 20px;
                    }
                    .invoice-header h1 {
                        font-size: 24px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="invoice-header">
                    <h1>تعمیرگاه مکانیک لند</h1>
                    <div style="font-size:14px;opacity:0.9;margin-top:4px;">فاکتور</div>
                    <div class="invoice-number">شماره: ${invoiceData.invoiceNumber}</div>
                    <div class="invoice-date">تاریخ: ${new Date(invoiceData.date).toLocaleDateString('fa-IR')}</div>
                </div>
                
                <div class="invoice-body">
                    <div class="info-grid">
                        <div class="info-card">
                            <h3>اطلاعات مشتری</h3>
                            <div class="info-item">
                                <span class="info-label">نام:</span>
                                <span class="info-value">${invoiceData.customer?.name || 'نامشخص'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">تلفن:</span>
                                <span class="info-value">${invoiceData.customer?.phone || 'ثبت نشده'}</span>
                            </div>
                        </div>
                        
                        <div class="info-card">
                            <h3>اطلاعات خودرو</h3>
                            <div class="info-item">
                                <span class="info-label">نوع:</span>
                                <span class="info-value">${invoiceData.vehicle?.type || 'نامشخص'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">مدل:</span>
                                <span class="info-value">${invoiceData.vehicle?.model || 'نامشخص'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">پلاک:</span>
                                <span class="info-value">${invoiceData.vehicle?.plate || 'ثبت نشده'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="service-details">
                        <h3>جزئیات سرویس</h3>
                        <div class="service-item">
                            <span class="service-label">نوع سرویس:</span>
                            <span class="service-value">${invoiceData.service?.type || 'نامشخص'}</span>
                        </div>
                        <div class="service-item">
                            <span class="service-label">توضیحات:</span>
                            <span class="service-value">${invoiceData.service?.description || 'توضیحی ثبت نشده'}</span>
                        </div>
                        <div class="service-item">
                            <span class="service-label">تاریخ پذیرش:</span>
                            <span class="service-value">${invoiceData.service?.admissionDate || 'نامشخص'}</span>
                        </div>
                        <div class="service-item">
                            <span class="service-label">ساعت پذیرش:</span>
                            <span class="service-value">${invoiceData.service?.admissionTime || 'نامشخص'}</span>
                        </div>
                    </div>
                    
                    <div class="info-card" style="background:#fff;border:1px solid #e9ecef;border-radius:8px;padding:16px;margin-bottom:16px;">
                        <h3 style="color:#2c3e50;font-size:16px;margin-bottom:10px;">لوازم/قطعات تعویض‌شده</h3>
                        <table style="width:100%;border-collapse:collapse;font-size:12px;">
                            <thead>
                                <tr style="border-bottom:1px solid #e9ecef;color:#495057;">
                                    <th style="text-align:right;padding:6px 4px;">نام قطعه</th>
                                    <th style="text-align:center;padding:6px 4px;">تعداد</th>
                                    <th style="text-align:center;padding:6px 4px;">قیمت واحد</th>
                                    <th style="text-align:left;padding:6px 4px;">مبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(() => {
                                    const parts = Array.isArray(invoiceData?.parts) ? invoiceData.parts : [];
                                    if (parts.length === 0) {
                                        return `<tr><td colspan="4" style="text-align:center;color:#6c757d;padding:8px;">موردی ثبت نشده</td></tr>`;
                                    }
                                    return parts.map(p => {
                                        const qty = parseInt(p.quantity) || 0;
                                        const unit = parseInt(p.unitPrice) || 0;
                                        const total = (qty * unit).toLocaleString();
                                        return `<tr style=\"border-bottom:1px solid #f1f3f5;\"><td style=\"padding:6px 4px;\">${p.name || ''}</td><td style=\"text-align:center;\">${qty}</td><td style=\"text-align:center;\">${unit.toLocaleString()}</td><td style=\"text-align:left;\">${total}</td></tr>`;
                                    }).join('');
                                })()}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="text-align:right;padding:6px 4px;color:#495057;">جمع قطعات</td>
                                    <td style="text-align:left;padding:6px 4px;font-weight:700;">${(invoiceData?.totals?.partsSubtotal || 0).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="text-align:right;padding:6px 4px;color:#495057;">دستمزد/خدمت</td>
                                    <td style="text-align:left;padding:6px 4px;font-weight:700;">${(parseInt(invoiceData?.service?.actualCost) || 0).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="total-section">
                        <div class="total-amount">${(() => {
                            const partsSubtotal = invoiceData?.totals?.partsSubtotal || 0;
                            const labor = parseInt(invoiceData?.service?.actualCost) || 0;
                            return (partsSubtotal + labor).toLocaleString();
                        })()} تومان</div>
                        <div class="total-status">مبلغ کل (قطعات + خدمت)</div>
                        <div class="status-badge ${invoiceData.status === 'پرداخت شده' ? 'status-paid' : 'status-unpaid'}">
                            ${invoiceData.status}
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>تعمیرگاه مکانیک لند - سیستم پذیرش خودرو</p>
                    <p>این فاکتور به صورت خودکار تولید شده است</p>
                </div>
            </div>
            
            <div class="buttons no-print">
                <button class="btn btn-primary" onclick="window.print()">🖨️ چاپ فاکتور</button>
                <button class="btn btn-secondary" onclick="window.close()">❌ بستن</button>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    modal.classList.add('hidden');
    window.currentViewingInvoice = null;
}


// Delete invoice
async function deleteInvoice(invoiceId) {
    const confirmed = await showConfirm(
        'حذف فاکتور',
        'آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟',
        'بله، حذف کن',
        'خیر، انصراف'
    );
    
    if (confirmed) {
        try {
            // Remove from Firebase
            await deleteInvoiceFromFirebase(invoiceId);
            
            // Remove from local array
            invoicesData = invoicesData.filter(i => i.id !== invoiceId);
        
            // Update invoices list
            updateInvoicesList();
        
            // Update statistics
            updateStatistics();
        
            showToast('فاکتور با موفقیت حذف شد', 'success');
        } catch (error) {
            showToast('خطا در حذف فاکتور', 'error');
        }
    }
}

// Delete invoice from modal view
async function deleteInvoiceFromModal() {
    if (!window.currentViewingInvoice || !window.currentViewingInvoice.id) {
        showToast('فاکتور یافت نشد', 'error');
        return;
    }
    
    const invoiceId = window.currentViewingInvoice.id;
    const confirmed = await showConfirm(
        'حذف فاکتور',
        'آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟',
        'بله، حذف کن',
        'خیر، انصراف'
    );
    
    if (confirmed) {
        try {
            // Remove from Firebase
            await deleteInvoiceFromFirebase(invoiceId);
            
            // Remove from local array
            invoicesData = invoicesData.filter(i => i.id !== invoiceId);
        
            // Update invoices list
            updateInvoicesList();
            
            // Update statistics
            updateStatistics();
            
            // Close modal
            closeInvoiceModal();
            
            showToast('فاکتور با موفقیت حذف شد', 'success');
        } catch (error) {
            showToast('خطا در حذف فاکتور', 'error');
        }
    }
}

// Generate invoice for admission
async function generateInvoiceForAdmission(admissionId) {
    const admission = admissionsData.find(a => a.id === admissionId);
    if (!admission) return;
    
    const invoiceNumber = generateInvoiceNumber();
    const invoice = {
        invoiceNumber: invoiceNumber,
        date: new Date().toISOString(),
        customer: admission.customer,
        vehicle: admission.vehicle,
        service: admission.service,
        status: admission.status === 'ثبت شده' ? 'پرداخت نشده' : (admission.status || 'پرداخت نشده'),
        parts: Array.isArray(admission.parts) ? admission.parts : [],
        totals: admission.totals || null
    };
    
    try {
        // Save invoice to Firebase
        const docId = await saveInvoiceToFirebase(invoice);
        
        // Add to local array
        invoicesData.unshift({ id: docId, ...invoice });
        
        // Update statistics
        updateStatistics();
        
        showToast(`فاکتور ${invoiceNumber} تولید شد`, 'success');
    } catch (error) {
        showToast('خطا در تولید فاکتور', 'error');
    }
}

// Generate invoice number
function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV${year}${month}${day}${random}`;
}



// Login system with Firebase Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'در حال ورود...';
    submitBtn.disabled = true;
    
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        // Use Firebase authentication
        const { signInWithEmailAndPassword } = window.firebase;
        await signInWithEmailAndPassword(window.firebase.auth, email, password);
        
        // Successful login
        showMainContent();
        showToast('ورود موفقیت‌آمیز', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'خطا در ورود';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'کاربری با این ایمیل یافت نشد';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'رمز عبور اشتباه است';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'ایمیل نامعتبر است';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'تعداد تلاش‌های ناموفق زیاد است. لطفاً بعداً تلاش کنید';
        } else if (error.message === 'Firebase not available') {
            errorMessage = 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید';
        }
        
        showToast(errorMessage, 'error');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showMainContent() {
    // Login section is now on a separate page, so we just need to show the main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.classList.remove('hidden');
    }
    showDashboard();
}

function checkLoginStatus() {
    // Wait for Firebase to be available
    if (!window.firebase) {
        console.log('Waiting for Firebase to initialize...');
        setTimeout(checkLoginStatus, 1000);
        return;
    }
    
    // Use Firebase authentication
    const { onAuthStateChanged } = window.firebase;
    onAuthStateChanged(window.firebase.auth, (user) => {
        if (user) {
            // User is signed in
            showMainContent();
        } else {
            // User is signed out - redirect to login page
            window.location.href = 'login.html';
        }
    });
}

function showLoginForm() {
    // Redirect to login page instead of showing login form
    window.location.href = 'login.html';
}

async function logout() {
    try {
        // Wait for Firebase to be available
        if (!window.firebase) {
            console.log('Waiting for Firebase to initialize...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!window.firebase) {
                throw new Error('Firebase not available');
            }
        }
        
        // Use Firebase authentication
        const { signOut } = window.firebase;
        await signOut(window.firebase.auth);
        showLoginForm();
        showToast('خروج موفقیت‌آمیز', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('خطا در خروج', 'error');
    }
}

// Initialize application
async function initializeApp() {
    // Wait for Firebase to be available
    if (!window.firebase) {
        setTimeout(initializeApp, 100);
        return;
    }
    
    checkLoginStatus();
    
    // Load initial data from Firebase
    try {
        await loadAdmissionsFromFirebase();
        await loadInvoicesFromFirebase();
        updateStatistics();
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
    
    // Set up form event listeners
    const form = document.getElementById('car-admission-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
    
    // Login form is now on a separate page (login.html)
    // No need to set up login form listener here
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
    if (event.error && event.error.message) {
        showToast(`خطا: ${event.error.message}`, 'error');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection:', event.reason);
    if (event.reason && event.reason.message) {
        showToast(`خطا در Promise: ${event.reason.message}`, 'error');
    }
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/paziresh/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
                
                // بررسی به‌روزرسانی Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Service Worker جدید نصب شده است
                            console.log('🔄 New Service Worker available. Please refresh the page.');
                            showToast('نسخه جدید در دسترس است. لطفاً صفحه را رفرش کنید.', 'info');
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
    
    // مدیریت آفلاین/آنلاین
    window.addEventListener('online', () => {
        console.log('✅ Connection restored');
        showToast('اتصال اینترنت برقرار شد', 'success');
    });
    
    window.addEventListener('offline', () => {
        console.log('⚠️ Connection lost');
        showToast('اتصال اینترنت قطع شد. حالت آفلاین فعال است.', 'warning');
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Initializing Paziresh System...');
        
        // Initialize the application
        initializeApp();
        
        // Update statistics on page load
        updateStatistics();
        
        // Set minimum date
        setMinimumDate();
        // Initialize admission parts UI
        initializeAdmissionPartsUI();
        
        // Set up Persian date formatting
        const admissionDateInput = document.getElementById('admission-date');
        if (admissionDateInput) {
            admissionDateInput.addEventListener('input', function() {
                formatPersianDate(this);
            });
        }
        
        // Hide loading screen after a delay
        setTimeout(hideLoadingScreen, 1000);
        
        console.log('✅ Paziresh System initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing Paziresh System:', error);
        showToast('خطا در راه‌اندازی سیستم', 'error');
    }
});