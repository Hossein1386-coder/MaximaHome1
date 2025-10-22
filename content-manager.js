// Site Content Management
let siteContent = {};

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
                applySiteContent();
                return;
            }
        } catch (error) {
            console.warn('Firestore load failed, falling back to localStorage', error);
        }
    }
    
    // Fallback: localStorage
    try {
        siteContent = JSON.parse(localStorage.getItem('maxima-site-content') || '{}');
        applySiteContent();
    } catch (error) {
        console.error('Error loading site content:', error);
    }
}

// Apply site content to the page
function applySiteContent() {
    // Apply contact info
    if (siteContent.contact) {
        // Update contact section
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            // Update phone numbers
            const phoneElements = contactSection.querySelectorAll('[data-phone="main"]');
            phoneElements.forEach(el => {
                el.textContent = siteContent.contact.phoneMain || el.textContent;
            });
            
            const mobileElements = contactSection.querySelectorAll('[data-phone="mobile"]');
            mobileElements.forEach(el => {
                el.textContent = siteContent.contact.phoneMobile || el.textContent;
            });
            
            // Update email
            const emailElements = contactSection.querySelectorAll('[data-email]');
            emailElements.forEach(el => {
                el.textContent = siteContent.contact.email || el.textContent;
            });
            
            // Update address
            const addressElements = contactSection.querySelectorAll('[data-address]');
            addressElements.forEach(el => {
                el.textContent = siteContent.contact.address || el.textContent;
            });
        }
        
        // Update footer contact info
        const footerContact = document.querySelector('#footer-contact');
        if (footerContact) {
            footerContact.innerHTML = `
                <li>تلفن: ${siteContent.contact.phoneMain || '۰۲۱-۱۲۳۴۵۶۷۸'}</li>
                <li>موبایل: ${siteContent.contact.phoneMobile || '۰۹۱۲۳۴۵۶۷۸۹'}</li>
                <li>ایمیل: ${siteContent.contact.email || 'info@maximahome.ir'}</li>
            `;
        }

        // Update Emergency section (if exists)
        const emergencyTextEl = document.querySelector('[data-emergency-text]');
        const emergencyPhoneEl = document.querySelector('[data-emergency-phone]');
        const emergencyCallEl = document.querySelector('[data-emergency-call]');
        if (emergencyTextEl && siteContent.contact.emergencyText) {
            emergencyTextEl.textContent = siteContent.contact.emergencyText;
        }
        if (emergencyPhoneEl && siteContent.contact.emergencyPhone) {
            // Show pretty Persian digits if provided already in Persian, else just set
            emergencyPhoneEl.textContent = siteContent.contact.emergencyPhone;
        }
        if (emergencyCallEl && siteContent.contact.emergencyPhone) {
            const phone = siteContent.contact.emergencyPhone.replace(/\D/g, '');
            emergencyCallEl.setAttribute('href', `tel:${phone}`);
            emergencyCallEl.textContent = `تماس اورژانسی: ${siteContent.contact.emergencyPhone}`;
        }
    }
    
    // Apply working hours (contact card text)
    if (siteContent.hours) {
        const workingHoursEl = document.querySelector('[data-working-hours]');
        if (workingHoursEl) {
            workingHoursEl.textContent = siteContent.hours.workingHoursText || workingHoursEl.textContent;
        }
    }
    
    // Apply footer content
    if (siteContent.footer) {
        // Update footer description
        const footerDesc = document.querySelector('#footer-description');
        if (footerDesc) {
            footerDesc.textContent = siteContent.footer.description || footerDesc.textContent;
        }
        
        // Update footer links
        if (siteContent.footer.links) {
            const linksArray = siteContent.footer.links.split('\n').filter(link => link.trim());
            const footerLinks = document.querySelector('#footer-links');
            if (footerLinks) {
                footerLinks.innerHTML = linksArray.map(link => 
                    `<li><a href="#" class="text-white/60 hover:text-white transition-colors">${link.trim()}</a></li>`
                ).join('');
            }
        }
    }
    
        // Apply images
        if (siteContent.images) {
            // Update hero image
            if (siteContent.images.heroImage) {
                const heroImage = document.querySelector('#hero-image');
                if (heroImage) {
                    heroImage.src = siteContent.images.heroImage;
                }
            }

            // Update gallery images - respect admin's choice of mode
            if (siteContent.images.galleryImages && siteContent.images.galleryImages.length > 0) {
                const galleryContainer = document.querySelector('#gallery-images');
                if (galleryContainer) {
                    const galleryMode = siteContent.images.galleryMode || 'replace';
                    
                    if (galleryMode === 'replace') {
                        // Replace gallery with admin images
                        const adminImagesHTML = siteContent.images.galleryImages.map(image => 
                            `<div class=\"relative aspect-[4/3] rounded-2xl overflow-hidden group\">
                                <img src=\"${image.data}\" alt=\"${image.name}\" class=\"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105\" loading=\"lazy\">
                                <div class=\"absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors\"></div>
                            </div>`
                        ).join('');
                        galleryContainer.innerHTML = adminImagesHTML;
                    } else if (galleryMode === 'add') {
                        // Add admin images to existing gallery
                        const existingImages = Array.from(galleryContainer.querySelectorAll('div'));
                        const adminImagesHTML = siteContent.images.galleryImages.map(image => 
                            `<div class=\"relative aspect-[4/3] rounded-2xl overflow-hidden group\">
                                <img src=\"${image.data}\" alt=\"${image.name}\" class=\"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105\" loading=\"lazy\">
                                <div class=\"absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors\"></div>
                            </div>`
                        ).join('');
                        
                        // Add admin images after existing ones
                        galleryContainer.innerHTML = existingImages.map(div => div.outerHTML).join('') + adminImagesHTML;
                    }
                }
            } else {
                // Show default gallery images (either original or admin-modified)
                const galleryContainer = document.querySelector('#gallery-images');
                if (galleryContainer && siteContent.images.defaultGalleryImages) {
                    const defaultImagesHTML = siteContent.images.defaultGalleryImages.map(image => 
                        `<div class=\"relative aspect-[4/3] rounded-2xl overflow-hidden group\">
                            <img src=\"${image.src}\" alt=\"${image.alt}\" class=\"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105\" loading=\"lazy\">
                            <div class=\"absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors\"></div>
                        </div>`
                    ).join('');
                    galleryContainer.innerHTML = defaultImagesHTML;
                }
            }
        }
}

// Initialize content management
document.addEventListener('DOMContentLoaded', function() {
    loadSiteContent();
});

// Export for use in other scripts
window.siteContentManager = {
    loadSiteContent,
    applySiteContent
};
