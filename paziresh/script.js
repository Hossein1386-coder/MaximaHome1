// Paziresh System JavaScript with Firebase

// Global variables for data storage
let admissionsData = [];
let invoicesData = [];

// Firebase collections
const ADMISSIONS_COLLECTION = 'admissions';
const INVOICES_COLLECTION = 'invoices';

// Firebase Functions
async function loadAdmissionsFromFirebase() {
    try {
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
        showToast('خطا در بارگذاری پذیرش‌ها', 'error');
        return [];
    }
}

async function loadInvoicesFromFirebase() {
    try {
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
        showToast('خطا در بارگذاری فاکتورها', 'error');
        return [];
    }
}

async function saveAdmissionToFirebase(admissionData) {
    try {
        const { db, collection, addDoc } = window.firebase;
        const docRef = await addDoc(collection(db, ADMISSIONS_COLLECTION), admissionData);
        return docRef.id;
    } catch (error) {
        console.error('Error saving admission:', error);
        showToast('خطا در ذخیره پذیرش', 'error');
        throw error;
    }
}

async function saveInvoiceToFirebase(invoiceData) {
    try {
        const { db, collection, addDoc } = window.firebase;
        const docRef = await addDoc(collection(db, INVOICES_COLLECTION), invoiceData);
        return docRef.id;
    } catch (error) {
        console.error('Error saving invoice:', error);
        showToast('خطا در ذخیره فاکتور', 'error');
        throw error;
    }
}

async function deleteAdmissionFromFirebase(admissionId) {
    try {
        const { db, doc, deleteDoc } = window.firebase;
        await deleteDoc(doc(db, ADMISSIONS_COLLECTION, admissionId));
    } catch (error) {
        console.error('Error deleting admission:', error);
        showToast('خطا در حذف پذیرش', 'error');
        throw error;
    }
}

async function deleteInvoiceFromFirebase(invoiceId) {
    try {
        const { db, doc, deleteDoc } = window.firebase;
        await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceId));
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showToast('خطا در حذف فاکتور', 'error');
        throw error;
    }
}

// Security credentials for Firebase Auth
const ADMIN_EMAIL = 'admin@maximahome.com';
const ADMIN_PASSWORD = 'samad2024';

// Current step for multi-step form
let currentStep = 1;

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.innerHTML = '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
    } else if (type === 'error') {
        toastIcon.innerHTML = '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
    }
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
    }, 3000);
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
        }
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
        // Set today's date in Persian calendar
        const today = moment().format('jYYYY/jMM/jDD');
        admissionDateInput.value = today;
    }
    
    const admissionTimeInput = document.getElementById('admission-time');
    if (admissionTimeInput) {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        admissionTimeInput.value = timeString;
    }
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
    
    // Today's income
    const todayIncome = invoicesData
        .filter(invoice => new Date(invoice.date).toISOString().split('T')[0] === today)
        .reduce((sum, invoice) => sum + (parseInt(invoice.service?.actualCost) || 0), 0);
    const todayIncomeEl = document.getElementById('today-income');
    if (todayIncomeEl) {
        todayIncomeEl.textContent = todayIncome.toLocaleString() + ' تومان';
    }
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
    
    // Create admission record
    const admissionRecord = {
        receiptNumber: receiptNumber,
        date: new Date().toISOString(),
        ...formattedData,
        status: 'ثبت شده'
    };
    
    try {
        // Store in Firebase
        const docId = await saveAdmissionToFirebase(admissionRecord);
        
        // Add to local array for immediate UI update
        admissionsData.unshift({ id: docId, ...admissionRecord });
        
        // Show success message
        showToast(`پذیرش خودرو با شماره ${receiptNumber} ثبت شد.`, 'success');
        
        // Reset form
        form.reset();
        setMinimumDate(); // Reset Persian date
        
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
    
    // Store current admission ID for update
    window.currentEditingAdmissionId = admissionId;
    
    // Show form and go to step 1
    hideAllSections();
    document.getElementById('form-section').classList.remove('hidden');
    
    // Reset to step 1
    currentStep = 1;
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.add('hidden');
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        indicator.classList.remove('active', 'completed');
    });
    document.querySelector('[data-step="1"]').classList.add('active');
    
    showToast('اطلاعات پذیرش در فرم بارگذاری شد. ویرایش کنید و ثبت کنید.', 'success');
}

// Delete admission
async function deleteAdmission(admissionId) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این پذیرش را حذف کنید؟')) {
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
    const sortedInvoices = [...invoicesData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const listHTML = sortedInvoices.map(invoice => `
        <div class="bg-white p-6 rounded-xl border border-gray-200 mb-4">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-medium text-black">فاکتور ${invoice.number}</h3>
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
                    <button onclick="viewInvoice('${invoice.number}')" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        مشاهده
                    </button>
                    <button onclick="deleteInvoice('${invoice.number}')" 
                            class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                        حذف
                    </button>
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
function viewInvoice(invoiceNumber) {
    const invoice = invoicesData.find(i => i.number === invoiceNumber);
    if (!invoice) return;
    
    const modal = document.getElementById('invoice-modal');
    const content = document.getElementById('invoice-content');
    
    // Store current invoice for PDF export
    window.currentViewingInvoice = invoice;
    
    // Display invoice content
    content.innerHTML = `
        <div class="bg-gray-50 p-6 rounded-xl">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-black">فاکتور</h2>
                <p class="text-gray-600">شماره: ${invoice.number}</p>
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
            
            <div class="border-t pt-4">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-medium text-black">مبلغ کل:</span>
                    <span class="text-xl font-bold text-black">${(invoice.service?.actualCost || 0).toLocaleString()} تومان</span>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-gray-600">وضعیت پرداخت:</span>
                    <span class="px-3 py-1 rounded-full text-sm ${
                        invoice.status === 'پرداخت شده' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'پرداخت نقدی' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                    }">${invoice.status}</span>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    modal.classList.add('hidden');
    window.currentViewingInvoice = null;
}


// Delete invoice
async function deleteInvoice(invoiceId) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟')) {
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
        status: 'پرداخت نشده'
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



// Login system
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check if account is locked
    if (isLocked) {
        const currentTime = Date.now();
        const lockDuration = 15 * 60 * 1000; // 15 minutes
        
        if (currentTime - lockTime < lockDuration) {
            showToast('حساب کاربری قفل شده است. لطفاً بعداً تلاش کنید.', 'error');
            return;
        } else {
            // Unlock account
            isLocked = false;
            loginAttempts = 0;
            localStorage.removeItem('isLocked');
            localStorage.removeItem('lockTime');
            localStorage.removeItem('loginAttempts');
        }
    }
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Successful login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginTime', Date.now().toString());
        loginAttempts = 0;
        localStorage.removeItem('loginAttempts');
        
        showMainContent();
        showToast('ورود موفقیت‌آمیز', 'success');
    } else {
        // Failed login
        loginAttempts++;
        localStorage.setItem('loginAttempts', loginAttempts.toString());
        
        if (loginAttempts >= 3) {
            // Lock account
            isLocked = true;
            lockTime = Date.now();
            localStorage.setItem('isLocked', 'true');
            localStorage.setItem('lockTime', lockTime.toString());
            
            document.getElementById('login-attempts').classList.add('hidden');
            document.getElementById('locked-message').classList.remove('hidden');
            showToast('حساب کاربری به دلیل تلاش‌های ناموفق قفل شد', 'error');
        } else {
            document.getElementById('login-attempts').classList.remove('hidden');
            document.getElementById('attempts-count').textContent = loginAttempts;
            showToast('نام کاربری یا رمز عبور اشتباه است', 'error');
        }
    }
}

function showMainContent() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    showDashboard();
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    
    if (isLoggedIn && loginTime) {
        const currentTime = Date.now();
        if (currentTime - parseInt(loginTime) < sessionDuration) {
        showMainContent();
            return;
    } else {
            // Session expired
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
    }
    }
    
    showLoginForm();
}

function showLoginForm() {
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('main-content').classList.add('hidden');
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    showLoginForm();
    showToast('خروج موفقیت‌آمیز', 'success');
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
    
    // Set up login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Update statistics on page load
    updateStatistics();
    
    // Set minimum date
    setMinimumDate();
    
    // Set up Persian date formatting
    const admissionDateInput = document.getElementById('admission-date');
    if (admissionDateInput) {
        admissionDateInput.addEventListener('input', function() {
            formatPersianDate(this);
        });
    }
    
    // Hide loading screen after a delay
    setTimeout(hideLoadingScreen, 1000);
});