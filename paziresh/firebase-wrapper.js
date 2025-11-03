// Wrapper برای جایگزینی Firebase با LocalStorage
// این فایل قبل از script.js لود می‌شود

// Initialize localStorage DB first
if (typeof window.localDB !== 'undefined') {
    window.localDB.init().then(() => {
        console.log('✅ LocalStorage DB initialized');
        
        // Create Firebase-like API
        window.firebase = {
            db: {
                // Mock database object
            },
            auth: {
                // Mock auth object
            },
            collection: () => {
                return {
                    admissions: () => ({ admissions: true }),
                    invoices: () => ({ invoices: true })
                };
            },
            signInWithEmailAndPassword: async (auth, email, password) => {
                return await window.localDB.authenticateUser(email, password);
            },
            signOut: async (auth) => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
            },
            onAuthStateChanged: (auth, callback) => {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (isLoggedIn) {
                    callback({
                        email: localStorage.getItem('userEmail'),
                        displayName: localStorage.getItem('userName')
                    });
                } else {
                    callback(null);
                }
            }
        };
        
        // Override Firebase functions in script.js scope
        window.loadAdmissionsFromFirebase = async function() {
            try {
                if (!window.localDB) await window.localDB.init();
                admissionsData = await window.localDB.loadAdmissions();
                return admissionsData;
            } catch (error) {
                console.error('Error loading admissions:', error);
                showToast('خطا در بارگذاری پذیرش‌ها', 'error');
                return [];
            }
        };
        
        window.loadInvoicesFromFirebase = async function() {
            try {
                if (!window.localDB) await window.localDB.init();
                invoicesData = await window.localDB.loadInvoices();
                return invoicesData;
            } catch (error) {
                console.error('Error loading invoices:', error);
                showToast('خطا در بارگذاری فاکتورها', 'error');
                return [];
            }
        };
        
        window.saveAdmissionToFirebase = async function(admissionData) {
            try {
                if (!window.localDB) await window.localDB.init();
                const id = await window.localDB.saveAdmission(admissionData);
                return id;
            } catch (error) {
                console.error('Error saving admission:', error);
                showToast('خطا در ذخیره پذیرش', 'error');
                throw error;
            }
        };
        
        window.updateAdmissionInFirebase = async function(admissionId, updates) {
            try {
                if (!window.localDB) await window.localDB.init();
                await window.localDB.updateAdmission(admissionId, updates);
            } catch (error) {
                console.error('Error updating admission:', error);
                showToast('خطا در بروزرسانی پذیرش', 'error');
                throw error;
            }
        };
        
        window.deleteAdmissionFromFirebase = async function(admissionId) {
            try {
                if (!window.localDB) await window.localDB.init();
                await window.localDB.deleteAdmission(admissionId);
            } catch (error) {
                console.error('Error deleting admission:', error);
                showToast('خطا در حذف پذیرش', 'error');
                throw error;
            }
        };
        
        window.saveInvoiceToFirebase = async function(invoiceData) {
            try {
                if (!window.localDB) await window.localDB.init();
                const id = await window.localDB.saveInvoice(invoiceData);
                return id;
            } catch (error) {
                console.error('Error saving invoice:', error);
                showToast('خطا در ذخیره فاکتور', 'error');
                throw error;
            }
        };
        
        window.updateInvoiceInFirebase = async function(invoiceId, updates) {
            try {
                if (!window.localDB) await window.localDB.init();
                await window.localDB.updateInvoice(invoiceId, updates);
            } catch (error) {
                console.error('Error updating invoice:', error);
                showToast('خطا در بروزرسانی فاکتور', 'error');
                throw error;
            }
        };
        
        window.deleteInvoiceFromFirebase = async function(invoiceId) {
            try {
                if (!window.localDB) await window.localDB.init();
                await window.localDB.deleteInvoice(invoiceId);
            } catch (error) {
                console.error('Error deleting invoice:', error);
                showToast('خطا در حذف فاکتور', 'error');
                throw error;
            }
        };
        
        console.log('✅ Firebase wrapper initialized - using LocalStorage');
    }).catch(error => {
        console.error('❌ Failed to initialize LocalStorage DB:', error);
    });
} else {
    console.log('⚠️ LocalStorage DB not available, using Firebase');
}

