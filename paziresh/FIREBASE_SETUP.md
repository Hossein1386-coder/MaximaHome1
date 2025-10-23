# راهنمای راه‌اندازی Firebase برای سیستم پذیرش خودرو

## 🔥 مراحل راه‌اندازی Firebase

### 1️⃣ **ایجاد پروژه Firebase**
1. به [Firebase Console](https://console.firebase.google.com/) بروید
2. روی "Add project" کلیک کنید
3. نام پروژه را وارد کنید (مثال: `maximahome-paziresh`)
4. Google Analytics را فعال کنید (اختیاری)
5. پروژه را ایجاد کنید

### 2️⃣ **فعال‌سازی Firestore Database**
1. در کنسول Firebase، روی "Firestore Database" کلیک کنید
2. روی "Create database" کلیک کنید
3. حالت "Start in test mode" را انتخاب کنید
4. موقعیت جغرافیایی را انتخاب کنید (ترجیحاً نزدیک ایران)
5. Database را ایجاد کنید

### 3️⃣ **فعال‌سازی Authentication**
1. در کنسول Firebase، روی "Authentication" کلیک کنید
2. روی "Get started" کلیک کنید
3. در تب "Sign-in method"، "Email/Password" را فعال کنید
4. روی "Save" کلیک کنید

### 4️⃣ **ایجاد کاربر ادمین**
1. در تب "Users" در Authentication
2. روی "Add user" کلیک کنید
3. ایمیل: `admin@maximahome.com`
4. رمز عبور: `samad2024`
5. کاربر را ایجاد کنید

### 5️⃣ **دریافت تنظیمات Firebase**
1. در کنسول Firebase، روی آیکون تنظیمات کلیک کنید
2. "Project settings" را انتخاب کنید
3. در پایین صفحه، "Your apps" را پیدا کنید
4. روی آیکون "</>" کلیک کنید (Web app)
5. نام اپ را وارد کنید (مثال: `paziresh-web`)
6. تنظیمات را کپی کنید

### 6️⃣ **به‌روزرسانی کد**
در فایل `paziresh/index.html`، خطوط 20-27 را با تنظیمات پروژه خود جایگزین کنید:

```javascript
const firebaseConfig = {  
    apiKey: "AIzaSyBO3KMKqhSCE7XlBs9M679U1cAxEFPYYM4",
  authDomain: "maximahome-6beaa.firebaseapp.com",
  projectId: "maximahome-6beaa",
  storageBucket: "maximahome-6beaa.firebasestorage.app",
  messagingSenderId: "995203170989",
  appId: "1:995203170989:web:b3b42e123392cc058e3c24",
  measurementId: "G-WCN6S728JG"
};
```

## 🔒 تنظیمات امنیتی Firestore

### قوانین امنیتی پیشنهادی:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // فقط کاربران وارد شده می‌توانند داده‌ها را بخوانند و بنویسند
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 ساختار دیتابیس

### Collection: `admissions`
```json
{
  "receiptNumber": "MH241201001",
  "date": "2024-12-01T10:30:00.000Z",
  "customer": {
    "name": "احمد محمدی",
    "phone": "09123456789"
  },
  "vehicle": {
    "type": "سدان",
    "model": "پژو 206",
    "plate": "12-345-67"
  },
  "service": {
    "type": "تعمیر موتور",
    "actualCost": 500000,
    "admissionDate": "1403/09/11",
    "admissionTime": "14:00",
    "description": "مشکل در موتور"
  },
  "status": "ثبت شده"
}
```

### Collection: `invoices`
```json
{
  "invoiceNumber": "INV241201001",
  "date": "2024-12-01T10:35:00.000Z",
  "customer": { ... },
  "vehicle": { ... },
  "service": { ... },
  "status": "پرداخت نشده"
}
```

## 🚀 تست سیستم

1. فایل‌ها را در GitHub Pages آپلود کنید
2. وارد سیستم شوید:
   - ایمیل: `admin@maximahome.com`
   - رمز: `samad2024`
3. یک پذیرش جدید ثبت کنید
4. فاکتور تولید کنید
5. داده‌ها را در Firebase Console بررسی کنید

## ⚠️ نکات مهم

- **امنیت**: قوانین Firestore را تنظیم کنید
- **Backup**: Firebase خودکار backup می‌گیرد
- **محدودیت‌ها**: در پلان رایگان محدودیت‌هایی وجود دارد
- **مقیاس‌پذیری**: Firebase به صورت خودکار مقیاس می‌شود

## 🔧 عیب‌یابی

### خطای اتصال:
- تنظیمات Firebase را بررسی کنید
- قوانین امنیتی را چک کنید
- Console مرورگر را بررسی کنید

### خطای Authentication:
- کاربر ادمین را بررسی کنید
- Authentication را فعال کنید
- ایمیل و رمز را چک کنید

## 📞 پشتیبانی

در صورت بروز مشکل، لطفاً:
1. Console مرورگر را بررسی کنید
2. خطاهای Firebase را چک کنید
3. تنظیمات را دوباره بررسی کنید
