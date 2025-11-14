// Statistics Dashboard JavaScript
// Global variables
let invoicesData = [];
let admissionsData = [];
let currentFilter = 'daily';
let chartInstances = {
    revenueChart: null,
    comparisonChart: null,
    serviceChart: null,
    hourlyChart: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadData();
        await initializeCharts();
    } catch (error) {
        console.error('Error initializing:', error);
    } finally {
        hideLoadingScreen();
    }
});

// Load data from Firebase
async function loadData() {
    try {
        showLoading();
        
        // Wait for Firebase to be available (with multiple retries)
        let retries = 0;
        const maxRetries = 20; // Increased retries
        
        console.log('⏳ Waiting for Firebase to initialize...');
        while (!window.firebase && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
            retries++;
            if (retries % 5 === 0) {
                console.log(`⏳ Still waiting... (${retries}/${maxRetries})`);
            }
        }
        
        if (!window.firebase) {
            console.error('❌ Firebase not available after waiting');
            throw new Error('Firebase not available after waiting');
        }
        
        console.log('✅ Firebase is available');
        
        const { db, collection, getDocs, query, orderBy } = window.firebase;
        
        if (!db || !collection || !getDocs || !query || !orderBy) {
            throw new Error('Firebase functions not available');
        }
        
        console.log('📊 Loading data from Firebase...');
        
        // Load invoices
        try {
            const invoicesRef = collection(db, 'invoices');
            const invoicesQuery = query(invoicesRef, orderBy('date', 'desc'));
            const invoicesSnapshot = await getDocs(invoicesQuery);
            invoicesData = [];
            invoicesSnapshot.forEach((doc) => {
                invoicesData.push({ id: doc.id, ...doc.data() });
            });
            console.log(`✅ Loaded ${invoicesData.length} invoices`);
        } catch (error) {
            console.error('❌ Error loading invoices:', error);
            invoicesData = [];
            // Don't throw, continue with admissions
        }
        
        // Load admissions
        try {
            const admissionsRef = collection(db, 'admissions');
            const admissionsQuery = query(admissionsRef, orderBy('date', 'desc'));
            const admissionsSnapshot = await getDocs(admissionsQuery);
            admissionsData = [];
            admissionsSnapshot.forEach((doc) => {
                admissionsData.push({ id: doc.id, ...doc.data() });
            });
            console.log(`✅ Loaded ${admissionsData.length} admissions`);
        } catch (error) {
            console.error('❌ Error loading admissions:', error);
            admissionsData = [];
            // Don't throw, continue anyway
        }
        
        console.log(`✅ Total: ${invoicesData.length} invoices and ${admissionsData.length} admissions loaded`);
        
        // Update UI even if no data
        updateStatistics();
        updateCharts();
        updateDetailsTable();
        
        if (invoicesData.length === 0 && admissionsData.length === 0) {
            console.log('ℹ️ No data found');
            // Don't show alert, just continue
        }
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        // Show error but don't block the UI
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'خطا',
                text: 'خطا در بارگذاری داده‌ها. لطفاً اتصال اینترنت خود را بررسی کنید.',
                confirmButtonText: 'باشه'
            });
        } else {
            alert('خطا در بارگذاری داده‌ها. لطفاً اتصال اینترنت خود را بررسی کنید.');
        }
    } finally {
        hideLoading();
        console.log('✅ Loading completed');
    }
}

// Refresh data
async function refreshData() {
    await loadData();
    Swal.fire({
        icon: 'success',
        title: 'به‌روزرسانی شد',
        text: 'داده‌ها با موفقیت به‌روزرسانی شدند.',
        timer: 2000,
        showConfirmButton: false
    });
}

// Change time filter
function changeTimeFilter(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Update charts and statistics
    updateStatistics();
    updateCharts();
    updateDetailsTable();
}

// Helper function to get invoice revenue
function getInvoiceRevenue(invoice) {
    // Try to get grandTotal first (includes parts + labor)
    if (invoice.totals?.grandTotal) {
        return parseInt(invoice.totals.grandTotal) || 0;
    }
    // Fallback to actualCost (labor only)
    if (invoice.service?.actualCost) {
        const labor = parseInt(invoice.service.actualCost) || 0;
        // Try to add parts subtotal if available
        const partsSubtotal = invoice.totals?.partsSubtotal ? parseInt(invoice.totals.partsSubtotal) : 0;
        // If parts array exists, calculate from parts
        if (Array.isArray(invoice.parts) && invoice.parts.length > 0) {
            const calculatedParts = invoice.parts.reduce((sum, part) => {
                const qty = parseInt(part.quantity) || 0;
                const price = parseInt(part.unitPrice) || 0;
                return sum + (qty * price);
            }, 0);
            return labor + calculatedParts;
        }
        return labor + partsSubtotal;
    }
    return 0;
}

// Update statistics cards
function updateStatistics() {
    try {
        const data = getFilteredData();
    
    // Total revenue - calculate from all invoices
    const totalRevenue = data.invoices.reduce((sum, invoice) => {
        return sum + getInvoiceRevenue(invoice);
    }, 0);
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    
    // Average revenue
    const avgRevenue = data.invoices.length > 0 ? totalRevenue / data.invoices.length : 0;
    document.getElementById('avg-revenue').textContent = formatCurrency(avgRevenue);
    
    // Total admissions
    const totalAdmissions = data.admissions.length;
    document.getElementById('total-admissions').textContent = totalAdmissions.toLocaleString('fa-IR');
    
    // Best day
    const bestDay = getBestDay(data.invoices);
    if (bestDay) {
        document.getElementById('best-day').textContent = bestDay.date;
        document.getElementById('best-day-amount').textContent = formatCurrency(bestDay.revenue);
    } else {
        document.getElementById('best-day').textContent = '-';
        document.getElementById('best-day-amount').textContent = '۰ تومان';
    }
    
    // Calculate percentage change
    const previousData = getPreviousPeriodData();
    const previousRevenue = previousData.invoices.reduce((sum, invoice) => {
        return sum + getInvoiceRevenue(invoice);
    }, 0);
    
    const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
        : 0;
    
    const revenueChangeEl = document.getElementById('revenue-change');
    revenueChangeEl.textContent = `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`;
    revenueChangeEl.className = revenueChange >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
    
    const admissionsChange = previousData.admissions.length > 0
        ? ((data.admissions.length - previousData.admissions.length) / previousData.admissions.length * 100).toFixed(1)
        : 0;
    
    const admissionsChangeEl = document.getElementById('admissions-change');
    admissionsChangeEl.textContent = `${admissionsChange >= 0 ? '+' : ''}${admissionsChange}%`;
    admissionsChangeEl.className = admissionsChange >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
    
    console.log('✅ Statistics updated');
    } catch (error) {
        console.error('❌ Error updating statistics:', error);
    }
}

// Helper function to get admission revenue
function getAdmissionRevenue(admission) {
    // Try to get grandTotal first (includes parts + labor)
    if (admission.totals?.grandTotal) {
        return parseInt(admission.totals.grandTotal) || 0;
    }
    // Fallback to actualCost (labor only)
    if (admission.service?.actualCost) {
        const labor = parseInt(admission.service.actualCost) || 0;
        // Try to add parts subtotal if available
        const partsSubtotal = admission.totals?.partsSubtotal ? parseInt(admission.totals.partsSubtotal) : 0;
        // If parts array exists, calculate from parts
        if (Array.isArray(admission.parts) && admission.parts.length > 0) {
            const calculatedParts = admission.parts.reduce((sum, part) => {
                const qty = parseInt(part.quantity) || 0;
                const price = parseInt(part.unitPrice) || 0;
                return sum + (qty * price);
            }, 0);
            return labor + calculatedParts;
        }
        return labor + partsSubtotal;
    }
    return 0;
}

// Get filtered data based on current filter
function getFilteredData() {
    const now = new Date();
    let startDate, endDate;
    
    switch (currentFilter) {
        case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'weekly':
            const dayOfWeek = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);
            break;
    }
    
    const filteredInvoices = invoicesData.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= startDate && invoiceDate < endDate;
    });
    
    const filteredAdmissions = admissionsData.filter(admission => {
        const admissionDate = new Date(admission.date);
        return admissionDate >= startDate && admissionDate < endDate;
    });
    
    return { invoices: filteredInvoices, admissions: filteredAdmissions, startDate, endDate };
}

// Get previous period data for comparison
function getPreviousPeriodData() {
    const now = new Date();
    let startDate, endDate;
    
    switch (currentFilter) {
        case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'weekly':
            const dayOfWeek = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - dayOfWeek - 7);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            endDate = new Date(now.getFullYear(), 0, 1);
            break;
    }
    
    const filteredInvoices = invoicesData.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= startDate && invoiceDate < endDate;
    });
    
    const filteredAdmissions = admissionsData.filter(admission => {
        const admissionDate = new Date(admission.date);
        return admissionDate >= startDate && admissionDate < endDate;
    });
    
    return { invoices: filteredInvoices, admissions: filteredAdmissions };
}

// Get best day
function getBestDay(invoices) {
    const dailyRevenue = {};
    
    invoices.forEach(invoice => {
        const date = new Date(invoice.date).toISOString().split('T')[0];
        const revenue = getInvoiceRevenue(invoice);
        dailyRevenue[date] = (dailyRevenue[date] || 0) + revenue;
    });
    
    let bestDate = null;
    let maxRevenue = 0;
    
    Object.keys(dailyRevenue).forEach(date => {
        if (dailyRevenue[date] > maxRevenue) {
            maxRevenue = dailyRevenue[date];
            bestDate = date;
        }
    });
    
    if (bestDate) {
        return {
            date: new Date(bestDate).toLocaleDateString('fa-IR'),
            revenue: maxRevenue
        };
    }
    
    return null;
}

// Initialize charts
async function initializeCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js not loaded, retrying...');
        setTimeout(initializeCharts, 1000);
        return;
    }
    
    console.log('📊 Initializing charts...');
    try {
        updateCharts();
        console.log('✅ Charts initialized');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
    }
}

// Update all charts
function updateCharts() {
    try {
        const data = getFilteredData();
        
        console.log('📊 Updating charts with data:', {
            invoices: data.invoices.length,
            admissions: data.admissions.length
        });
        
        createRevenueChart(data);
        createComparisonChart(data);
        createServiceChart(data);
        createHourlyChart(data);
        
        console.log('✅ All charts updated');
    } catch (error) {
        console.error('❌ Error updating charts:', error);
    }
}

// Create revenue line chart
function createRevenueChart(data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    if (chartInstances.revenueChart) {
        chartInstances.revenueChart.destroy();
    }
    
    // Group invoices by date
    const revenueByDate = {};
    data.invoices.forEach(invoice => {
        const date = new Date(invoice.date).toISOString().split('T')[0];
        const revenue = getInvoiceRevenue(invoice);
        revenueByDate[date] = (revenueByDate[date] || 0) + revenue;
    });
    
    // Sort dates
    const sortedDates = Object.keys(revenueByDate).sort();
    const labels = sortedDates.map(date => new Date(date).toLocaleDateString('fa-IR'));
    const revenues = sortedDates.map(date => revenueByDate[date]);
    
    chartInstances.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'درآمد (تومان)',
                data: revenues,
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(37, 99, 235)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
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

// Create comparison bar chart
function createComparisonChart(data) {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    if (chartInstances.comparisonChart) {
        chartInstances.comparisonChart.destroy();
    }
    
    const currentData = data.invoices;
    const previousData = getPreviousPeriodData().invoices;
    
    const currentRevenue = currentData.reduce((sum, invoice) => {
        return sum + getInvoiceRevenue(invoice);
    }, 0);
    
    const previousRevenue = previousData.reduce((sum, invoice) => {
        return sum + getInvoiceRevenue(invoice);
    }, 0);
    
    chartInstances.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['دوره قبل', 'دوره فعلی'],
            datasets: [{
                label: 'درآمد (تومان)',
                data: [previousRevenue, currentRevenue],
                backgroundColor: [
                    'rgba(156, 163, 175, 0.8)',
                    'rgba(37, 99, 235, 0.8)'
                ],
                borderColor: [
                    'rgb(156, 163, 175)',
                    'rgb(37, 99, 235)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
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

// Create service distribution pie chart
function createServiceChart(data) {
    const ctx = document.getElementById('serviceChart');
    if (!ctx) return;
    
    if (chartInstances.serviceChart) {
        chartInstances.serviceChart.destroy();
    }
    
    // Group by service type
    const serviceRevenue = {};
    data.invoices.forEach(invoice => {
        const serviceType = invoice.service?.type || 'نامشخص';
        const revenue = getInvoiceRevenue(invoice);
        serviceRevenue[serviceType] = (serviceRevenue[serviceType] || 0) + revenue;
    });
    
    const labels = Object.keys(serviceRevenue);
    const revenues = Object.values(serviceRevenue);
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
    
    chartInstances.serviceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: revenues,
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
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create hourly revenue chart
function createHourlyChart(data) {
    const ctx = document.getElementById('hourlyChart');
    if (!ctx) return;
    
    if (chartInstances.hourlyChart) {
        chartInstances.hourlyChart.destroy();
    }
    
    // Group by hour
    const hourlyRevenue = {};
    for (let i = 0; i < 24; i++) {
        hourlyRevenue[i] = 0;
    }
    
    data.invoices.forEach(invoice => {
        const date = new Date(invoice.date);
        const hour = date.getHours();
        const revenue = getInvoiceRevenue(invoice);
        hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + revenue;
    });
    
    const labels = Object.keys(hourlyRevenue).map(h => `${h}:00`);
    const revenues = Object.values(hourlyRevenue);
    
    chartInstances.hourlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'درآمد (تومان)',
                data: revenues,
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
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

// Update details table with full admission details
function updateDetailsTable() {
    const tbody = document.getElementById('details-table-body');
    if (!tbody) return;
    
    const data = getFilteredData();
    
    // Sort admissions by date descending
    const sortedAdmissions = [...data.admissions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    if (sortedAdmissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    داده‌ای برای نمایش وجود ندارد
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = sortedAdmissions.map(admission => {
        const date = new Date(admission.date);
        const customerName = admission.customer?.name || 'نامشخص';
        const customerPhone = admission.customer?.phone || '';
        const vehicleType = admission.vehicle?.type || '';
        const vehicleModel = admission.vehicle?.model || '';
        const vehiclePlate = admission.vehicle?.plate || '';
        const vehicleInfo = vehicleModel ? `${vehicleModel} ${vehiclePlate ? `(${vehiclePlate})` : ''}` : vehicleType || 'نامشخص';
        const serviceType = admission.service?.type || 'نامشخص';
        const laborCost = parseInt(admission.service?.actualCost) || 0;
        
        // Calculate parts details
        let partsDetails = 'ندارد';
        let partsTotal = 0;
        if (Array.isArray(admission.parts) && admission.parts.length > 0) {
            partsTotal = admission.parts.reduce((sum, part) => {
                const qty = parseInt(part.quantity) || 0;
                const price = parseInt(part.unitPrice) || 0;
                return sum + (qty * price);
            }, 0);
            const partsList = admission.parts.map(part => {
                const qty = parseInt(part.quantity) || 0;
                const price = parseInt(part.unitPrice) || 0;
                const total = qty * price;
                return `${part.name || 'نامشخص'} (${qty} × ${formatCurrency(price)} = ${formatCurrency(total)})`;
            }).join('<br>');
            partsDetails = `<div class="text-xs">${partsList}</div><div class="text-xs font-medium mt-1">جمع: ${formatCurrency(partsTotal)}</div>`;
        } else if (admission.totals?.partsSubtotal) {
            partsTotal = parseInt(admission.totals.partsSubtotal) || 0;
            partsDetails = formatCurrency(partsTotal);
        }
        
        const grandTotal = getAdmissionRevenue(admission);
        const status = admission.status || 'ثبت شده';
        
        return `
            <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                <td class="px-4 py-3 text-sm text-gray-900">
                    <div>${date.toLocaleDateString('fa-IR')}</div>
                    <div class="text-xs text-gray-500">${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                    <div class="font-medium">${customerName}</div>
                    <div class="text-xs text-gray-500">${customerPhone}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">${vehicleInfo}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${serviceType}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${formatCurrency(laborCost)}</td>
                <td class="px-4 py-3 text-sm text-gray-700 max-w-xs">${partsDetails}</td>
                <td class="px-4 py-3 text-sm font-bold text-gray-900">${formatCurrency(grandTotal)}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'پرداخت شده' ? 'bg-green-100 text-green-800' :
                        status === 'ثبت شده' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Format currency
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '۰ تومان';
    const formatted = new Intl.NumberFormat('fa-IR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
    return `${formatted} تومان`;
}

// Export to PDF
async function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Add title
        doc.setFontSize(20);
        doc.text('گزارش آمار و درآمد', 105, 20, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')}`, 105, 30, { align: 'center' });
        
        // Add statistics
        doc.setFontSize(14);
        let y = 50;
        doc.text(`کل درآمد: ${document.getElementById('total-revenue').textContent}`, 20, y);
        y += 10;
        doc.text(`میانگین درآمد: ${document.getElementById('avg-revenue').textContent}`, 20, y);
        y += 10;
        doc.text(`تعداد سفارشات: ${document.getElementById('total-orders').textContent}`, 20, y);
        
        // Save PDF
        doc.save(`گزارش-آمار-${new Date().toISOString().split('T')[0]}.pdf`);
        
        Swal.fire({
            icon: 'success',
            title: 'موفق',
            text: 'گزارش با موفقیت دانلود شد.',
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error exporting PDF:', error);
        Swal.fire({
            icon: 'error',
            title: 'خطا',
            text: 'خطا در تولید گزارش PDF.',
            confirmButtonText: 'باشه'
        });
    }
}

// Loading functions
function showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
        loadingScreen.classList.add('hidden');
    }
}

function hideLoadingScreen() {
    hideLoading();
    console.log('✅ Loading screen hidden');
}

// Fallback: Hide loading screen after timeout
setTimeout(() => {
    if (document.getElementById('loading-screen') && !document.getElementById('loading-screen').classList.contains('hidden')) {
        console.warn('⚠️ Loading screen still visible after 10 seconds, forcing hide');
        hideLoadingScreen();
    }
}, 10000);

