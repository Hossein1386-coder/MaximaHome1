# راهنمای حذف دامنه قبلی از گوگل

## 🎯 راه‌های حذف دامنه/صفحات قدیمی از گوگل

### روش 1: استفاده از Google Search Console (توصیه می‌شود)

#### مرحله 1: ورود به Google Search Console
1. به [Google Search Console](https://search.google.com/search-console) بروید
2. وارد حساب خود شوید
3. دامنه قدیمی را انتخاب کنید (یا اضافه کنید)

#### مرحله 2: حذف صفحات از ایندکس
1. در منوی سمت چپ، روی **"Removals"** کلیک کنید
2. روی **"New Request"** کلیک کنید
3. URL صفحه مورد نظر را وارد کنید
4. دلیل حذف را انتخاب کنید:
   - **"Temporarily hide from Google Search"** - موقت (90 روز)
   - یا از روش‌های دیگر استفاده کنید

#### مرحله 3: حذف کل سایت (اگر دامنه را تغییر داده‌اید)
1. در Google Search Console، به **"Settings"** بروید
2. **"Change of Address"** را انتخاب کنید
3. دامنه جدید را وارد کنید (`mechaniclnd.ir`)
4. گوگل را مطلع کنید که دامنه تغییر کرده است

---

### روش 2: استفاده از robots.txt

#### اگر هنوز به دامنه قدیمی دسترسی دارید:

1. فایل `robots.txt` را ویرایش کنید:
```
User-agent: *
Disallow: /
```

2. این فایل را در root دامنه قدیمی قرار دهید
3. صبر کنید تا Googlebot صفحات را crawl کند (1-2 هفته)

**نکته:** این روش فقط از ایندکس شدن بیشتر جلوگیری می‌کند، صفحات قدیمی را حذف نمی‌کند.

---

### روش 3: استفاده از Meta Tag Noindex

#### اگر به دامنه قدیمی دسترسی دارید:

در `<head>` تمام صفحات دامنه قدیمی اضافه کنید:
```html
<meta name="robots" content="noindex, nofollow">
```

---

### روش 4: انتقال 301 Redirect (بهترین روش)

#### اگر دامنه قبلی را به دامنه جدید تغییر داده‌اید:

1. در سرور دامنه قدیمی، فایل `.htaccess` را ویرایش کنید:
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^old-domain\.ir$ [NC]
RewriteRule ^(.*)$ https://mechaniclnd.ir/$1 [R=301,L]
```

2. یا برای کل دامنه:
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?old-domain\.ir$ [NC]
RewriteRule ^(.*)$ https://mechaniclnd.ir/$1 [R=301,L]
```

**مزایا:**
- لینک‌های قدیمی به دامنه جدید هدایت می‌شوند
- رنک و authority منتقل می‌شود
- SEO بهتر حفظ می‌شود

---

### روش 5: حذف از Google Cache (موقت)

1. به Google Search Console بروید
2. URL را در نوار جستجو وارد کنید
3. روی **"Test Live URL"** کلیک کنید
4. سپس **"Request Removal"** را انتخاب کنید

---

## 📋 چک‌لیست کامل

### اگر دامنه را تغییر داده‌اید:

- [ ] دامنه قدیمی را در Google Search Console اضافه کنید
- [ ] **Change of Address** را در Search Console تنظیم کنید
- [ ] 301 Redirect از دامنه قدیمی به جدید تنظیم کنید
- [ ] Sitemap دامنه جدید را در Search Console ثبت کنید
- [ ] Google Analytics را به دامنه جدید منتقل کنید
- [ ] لینک‌های داخلی را به دامنه جدید به‌روزرسانی کنید

### اگر دامنه قدیمی را حذف می‌کنید:

- [ ] صفحات را از Google Search Console حذف کنید
- [ ] robots.txt را تنظیم کنید (Disallow: /)
- [ ] Meta tag noindex اضافه کنید
- [ ] صبر کنید تا Google صفحات را حذف کند (1-2 ماه)

---

## ⏱️ زمان‌بندی

| روش | زمان حذف | پایداری |
|-----|----------|---------|
| Google Search Console Removal | 1-3 روز | موقت (90 روز) |
| robots.txt + noindex | 1-2 هفته | دائمی |
| 301 Redirect | فوری | دائمی |
| حذف خودکار (بدون اقدام) | 3-6 ماه | دائمی |

---

## 🎯 بهترین روش برای شما

### اگر دامنه را تغییر داده‌اید (مثلاً از old-domain.ir به mechaniclnd.ir):

**✅ استفاده از 301 Redirect + Change of Address**

1. **301 Redirect تنظیم کنید:**
```apache
# در .htaccess دامنه قدیمی
RewriteEngine On
RewriteCond %{HTTP_HOST} ^old-domain\.ir$ [NC,OR]
RewriteCond %{HTTP_HOST} ^www\.old-domain\.ir$ [NC]
RewriteRule ^(.*)$ https://mechaniclnd.ir/$1 [R=301,L]
```

2. **در Google Search Console:**
   - دامنه قدیمی را اضافه کنید
   - به Settings → Change of Address بروید
   - دامنه جدید (`mechaniclnd.ir`) را وارد کنید
   - تایید کنید

3. **Sitemap جدید را ثبت کنید:**
   - در Search Console دامنه جدید
   - Sitemap → Add new sitemap
   - `sitemap.xml` را وارد کنید

### اگر دامنه قدیمی را کاملاً حذف می‌کنید:

**✅ استفاده از Google Search Console Removal + robots.txt**

1. صفحات را از Search Console حذف کنید
2. robots.txt را تنظیم کنید: `Disallow: /`
3. Meta tag noindex اضافه کنید

---

## 📝 مثال عملی

### مثال: حذف دامنه `old-mechanic.ir` و انتقال به `mechaniclnd.ir`

#### مرحله 1: تنظیم 301 Redirect
```apache
# فایل .htaccess در دامنه old-mechanic.ir
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?old-mechanic\.ir$ [NC]
RewriteRule ^(.*)$ https://mechaniclnd.ir/$1 [R=301,L]
```

#### مرحله 2: Google Search Console
1. دامنه قدیمی را اضافه کنید
2. Settings → Change of Address
3. دامنه جدید: `mechaniclnd.ir`
4. Submit

#### مرحله 3: Sitemap
1. در Search Console دامنه جدید
2. Sitemaps → Add new sitemap
3. `sitemap.xml` را اضافه کنید

---

## ⚠️ نکات مهم

1. **صبر کنید:** حذف از گوگل ممکن است 1-3 ماه طول بکشد
2. **301 Redirect:** اگر دامنه را تغییر داده‌اید، حتماً از 301 استفاده کنید
3. **Backlinks:** لینک‌های خارجی به دامنه قدیمی را به‌روزرسانی کنید
4. **Google Analytics:** تنظیمات را به دامنه جدید منتقل کنید
5. **Social Media:** لینک‌های شبکه‌های اجتماعی را به‌روزرسانی کنید

---

## 🔍 بررسی وضعیت

### بررسی حذف صفحات:
1. در Google جستجو کنید: `site:old-domain.ir`
2. اگر صفحات هنوز نمایش داده می‌شوند، منتظر بمانید
3. می‌توانید از Google Search Console → Coverage استفاده کنید

### بررسی 301 Redirect:
1. به دامنه قدیمی بروید
2. باید به دامنه جدید redirect شود
3. از ابزارهای آنلاین مثل [Redirect Checker](https://www.redirect-checker.org/) استفاده کنید

---

## 📞 سوالات متداول

### سوال: چه مدت طول می‌کشد تا صفحات از گوگل حذف شوند؟
**جواب:** 1-3 ماه، بستگی به حجم صفحات دارد.

### سوال: اگر دامنه قدیمی را expire کنم، از گوگل حذف می‌شود؟
**جواب:** بله، اما 3-6 ماه طول می‌کشد. بهتر است قبل از expire، اقدامات بالا را انجام دهید.

### سوال: آیا می‌توانم فقط برخی صفحات را حذف کنم؟
**جواب:** بله، از Google Search Console → Removals می‌توانید صفحات خاص را حذف کنید.

---

## 🎯 خلاصه

- **اگر دامنه تغییر کرده:** 301 Redirect + Change of Address
- **اگر دامنه را حذف می‌کنید:** Google Search Console Removal + robots.txt
- **زمان:** 1-3 ماه برای حذف کامل
- **توصیه:** همیشه از 301 Redirect استفاده کنید تا SEO حفظ شود

---

**تاریخ ایجاد:** دسامبر 2024  
**آخرین به‌روزرسانی:** دسامبر 2024

