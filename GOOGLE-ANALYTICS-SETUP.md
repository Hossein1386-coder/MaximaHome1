# راهنمای نصب Google Analytics و Search Console

## 📊 مراحل نصب Google Analytics

### 1. ایجاد حساب Google Analytics

1. به [Google Analytics](https://analytics.google.com/) بروید
2. یک حساب جدید ایجاد کنید
3. یک Property جدید برای سایت خود بسازید
4. یک Data Stream برای وب‌سایت ایجاد کنید
5. **Measurement ID** خود را کپی کنید (مثل: `G-XXXXXXXXXX`)

### 2. جایگزینی Measurement ID در فایل‌ها

در فایل‌های زیر، `G-XXXXXXXXXX` را با Measurement ID واقعی خود جایگزین کنید:

- `index.html` (خط 209 و 214)
- `booking.html` (خط 51 و 56)

**مثال:**
```html
<!-- قبل -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
gtag('config', 'G-XXXXXXXXXX', {

<!-- بعد (با ID واقعی شما) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
gtag('config', 'G-ABC123XYZ', {
```

## 🔍 مراحل ثبت در Google Search Console

### 1. ثبت سایت

1. به [Google Search Console](https://search.google.com/search-console) بروید
2. روی "Add Property" کلیک کنید
3. آدرس سایت خود را وارد کنید: `https://mechaniclnd.ir`
4. روش تایید را انتخاب کنید: **HTML tag method**

### 2. دریافت Verification Code

1. کد verification را از Google Search Console کپی کنید
2. در فایل‌های زیر، `YOUR_VERIFICATION_CODE` را با کد واقعی جایگزین کنید:

- `index.html` (خط 222)
- `booking.html` (خط 63)

**مثال:**
```html
<!-- قبل -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />

<!-- بعد (با کد واقعی شما) -->
<meta name="google-site-verification" content="abc123xyz789example" />
```

### 3. تایید مالکیت

1. فایل‌های تغییر یافته را در سرور آپلود کنید
2. به Google Search Console برگردید
3. روی دکمه "Verify" کلیک کنید
4. اگر موفق بود، سایت شما تایید می‌شود

## 📤 ارسال Sitemap

بعد از تایید سایت در Search Console:

1. در منوی سمت چپ، روی "Sitemaps" کلیک کنید
2. آدرس sitemap را وارد کنید: `sitemap.xml`
3. روی "Submit" کلیک کنید

## ✅ چک‌لیست

- [ ] Google Analytics ID را در `index.html` جایگزین کردم
- [ ] Google Analytics ID را در `booking.html` جایگزین کردم
- [ ] Verification Code را در `index.html` جایگزین کردم
- [ ] Verification Code را در `booking.html` جایگزین کردم
- [ ] فایل‌ها را در سرور آپلود کردم
- [ ] سایت را در Google Search Console تایید کردم
- [ ] Sitemap را در Search Console ثبت کردم
- [ ] Google Analytics شروع به کار کرده است (بعد از 24-48 ساعت)

## 🎯 مزایا

### Google Analytics:
- ردیابی بازدیدکنندگان
- تحلیل رفتار کاربران
- گزارش‌های کامل آماری
- ردیابی منبع ترافیک

### Google Search Console:
- بررسی عملکرد در نتایج جستجو
- مشاهده کلمات کلیدی
- بررسی خطاهای crawl
- بهینه‌سازی برای موتورهای جستجو

## 📞 نکات مهم

1. **صبر کنید:** Google Analytics ممکن است 24-48 ساعت طول بکشد تا داده‌ها را نمایش دهد
2. **Real-time:** می‌توانید در بخش Real-time Analytics، بازدیدکنندگان فعلی را ببینید
3. **Privacy:** تنظیمات privacy (anonymize_ip) در کد اضافه شده است

---

**تاریخ ایجاد:** دسامبر 2024  
**آخرین به‌روزرسانی:** دسامبر 2024

