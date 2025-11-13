# راهنمای رفع مشکل Cache و Hard Refresh

## ✅ تغییرات انجام شده

### 1. تنظیمات .htaccess
- ✅ HTML files: `no-cache, no-store, must-revalidate` - همیشه از سرور
- ✅ CSS/JS: Cache با revalidation (1 هفته)
- ✅ Expires headers برای HTML: 0 seconds

### 2. Service Worker
- ✅ HTML files از cache حذف شدند
- ✅ Network First برای HTML - همیشه از سرور می‌گیرد
- ✅ Version updated: `booking-v2` برای force refresh

### 3. Versioning برای CSS و JS
- ✅ `style.css?v=2.0`
- ✅ `script.js?v=2.0`

## 🔧 نحوه استفاده از Versioning

هر بار که فایل CSS یا JS را تغییر می‌دهید، version را افزایش دهید:

```html
<!-- قبل -->
<link rel="stylesheet" href="style.css?v=2.0">
<script src="script.js?v=2.0"></script>

<!-- بعد از تغییر -->
<link rel="stylesheet" href="style.css?v=2.1">
<script src="script.js?v=2.1"></script>
```

## 📋 مراحل بعد از Push

### 1. بعد از هر Push:
1. Version CSS/JS را افزایش دهید (اگر تغییر کرده‌اند)
2. Service Worker version را افزایش دهید (اگر تغییر کرده)
3. Cache مرورگر را پاک کنید (اختیاری - برای تست)

### 2. برای کاربران:
- HTML همیشه fresh است (no-cache)
- CSS/JS با version جدید به‌روزرسانی می‌شوند
- نیازی به hard refresh نیست

## 🚨 نکات مهم

### Service Worker
اگر Service Worker تغییر کرد:
1. Version را در `booking-sw.js` افزایش دهید
2. Cache قدیمی خودکار پاک می‌شود

### CDN Files
فایل‌های CDN (Tailwind, etc.) همیشه از CDN می‌آیند و cache نمی‌شوند.

### تصاویر
تصاویر 1 ماه cache می‌شوند (برای عملکرد بهتر)

## 🔍 تست

برای تست:
1. فایل را تغییر دهید
2. Push کنید
3. بدون hard refresh، صفحه را refresh کنید
4. باید تغییرات را ببینید

---

**تاریخ:** دسامبر 2024  
**وضعیت:** مشکل cache برطرف شد

