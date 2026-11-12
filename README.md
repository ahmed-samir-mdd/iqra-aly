# موقع «اقرأ عليَّ»

صفحة هبوط عربية (RTL) لتطبيق **اقرأ عليَّ**، تعمل كموقع رسمي للتعريف بالتطبيق ومصدر لتحميل ملف APK.

الموقع ثابت بالكامل (HTML + CSS + JavaScript) بلا خطوات بناء أو اعتماد على شبكة خارجية: الخط والأيقونات والصور كلها محلية.

---

## التشغيل محليًا

من داخل مجلد الموقع:

```powershell
python -m http.server 8080
```

ثم افتح `http://localhost:8080`.

يمكن أيضًا فتح `index.html` مباشرة في المتصفح، لكن تشغيل خادم محلي أفضل لاختبار المسارات والخطوط.

---

## التحميل

زر التحميل **مفعّل** حاليًا ويشير إلى `downloads/iqraaly-1.0.0.apk` (الحجم 15.6 MB). عند إصدار نسخة جديدة:

1. ضع ملف APK داخل مجلد `downloads/` بالاسم الجديد.

2. افتح `assets/js/config.js` وحدّث القيم:

   ```js
   window.IQRAALY_CONFIG = {
     version: '1.0.0',
     minAndroid: '8.0',
     apkSize: '15.6 MB',
     downloadEnabled: true,
     apkUrl: 'downloads/iqraaly-1.0.0.apk'
   };
   ```

3. غيّر `version` و`apkUrl` و`apkSize` معًا، وضع الملف الجديد في `downloads/`.

> ملاحظة: `apkSize` نصّي يظهر بجوار رقم الإصدار، وحدّثه يدويًا مع كل نسخة. زر التحميل يبدأ تنزيل الملف مباشرة، فلا تضع `downloadEnabled: true` قبل إضافة ملف APK فعليًا إلى المسار المحدد.

---

## تعديل المحتوى

| ما تريد تعديله | المكان |
|---|---|
| النصوص والأقسام والروابط | `index.html` |
| الألوان والمسافات والتنسيقات | `assets/css/styles.css` |
| رقم الإصدار وحجم الملف وحالة التحميل | `assets/js/config.js` |
| الشعار | `assets/img/logo.svg` و`assets/img/logo.png` |
| لقطات التطبيق | `assets/img/*.jpg` |
| الخط | `assets/fonts/` |

روابط التواصل الحالية:

- البريد: `ahmedsamir202zota@gmail.com`
- مُرتكَز (المطوِّر): <https://www.mortakaz.com/users/6af227ad4dae0e6b0224735f?tab=projects>
- مُرتكَز (المشروع): <https://www.mortakaz.com/projects/6af4cbbdf67f21ddeceb5f0e>
- لينكد إن: <https://www.linkedin.com/in/ahmed-samir-mdd>

---

## النشر

الموقع منشور على **Cloudflare Workers** (ملفات ثابتة) ومرتبط بمستودع GitHub:

- الرابط: <https://iqra-aly.asm-mdd.workers.dev>
- المستودع: <https://github.com/ahmed-samir-mdd/iqra-aly>

كل دفعة إلى الفرع `main` تُطلق نشرًا تلقائيًا، فلا حاجة إلى رفع الملفات يدويًا:

```powershell
git add -A
git commit -m "وصف التعديل"
git push
```

إعدادات النشر على Cloudflare: بلا أمر بناء (build command فارغ)، ومجلد الإخراج هو جذر المستودع. وCloudflare يقدّم ملف APK بنوع `application/vnd.android.package-archive` تلقائيًا.

الموقع يعمل أيضًا على أي استضافة ملفات ثابتة أخرى (GitHub Pages، Netlify، Vercel) دون تعديل، لأن كل المسارات نسبية.

بعد أي تغيير في النطاق:

1. أضف الموقع إلى Google Search Console وأرسل `sitemap.xml`.
2. تحقّق من معاينة المشاركة عبر أي أداة Open Graph.

---

## الدومين والـSEO

النطاق الحالي المضبوط في الموقع هو `https://iqra-aly.asm-mdd.workers.dev`، ويظهر في:

- `canonical` و`og:url` و`og:image` و`twitter:image` داخل `index.html`.
- البيانات المنظّمة `JSON-LD` (نوع `MobileApplication`).
- `sitemap.xml` وسطر `Sitemap` في `robots.txt`.

لتغييره (إلى دومين خاص مثلًا)، من داخل مجلد الموقع:

```powershell
.\set-domain.cmd -BaseUrl "https://your-domain.com"
```

أو مع نطاق فرعي داخل مسار (GitHub Pages):

```powershell
.\set-domain.cmd -BaseUrl "https://username.github.io/iqraaly-website"
```

يقرأ السكربت النطاق الحالي من `canonical` ثم يستبدله في الملفات الثلاثة، لذا يمكن تشغيله أكثر من مرة عند تغيير النطاق. ويمكن استدعاء `set-domain.ps1` مباشرة إذا كانت سياسة التنفيذ تسمح. بعد التغيير ادفع الملفات إلى GitHub لينشرها Cloudflare.

> `robots.txt` يمنع زحف مجلد `downloads/` لتوفير ميزانية الزحف؛ الصفحة نفسها هي التي تُفهرَس، وملف APK يُنزَّل من زر التحميل.

---

## بنية الملفات

```
.
├── index.html
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── set-domain.ps1              # ضبط النطاق النهائي
├── set-domain.cmd              # مشغّل السكربت على ويندوز
├── downloads/
│   └── iqraaly-1.0.0.apk       # ملف التطبيق المنشور
└── assets/
    ├── css/styles.css
    ├── js/config.js
    ├── js/main.js
    ├── img/
    │   ├── logo.svg
    │   ├── logo.png
    │   ├── og-cover.png
    │   ├── reader-dark.jpg
    │   ├── audio-dark.jpg
    │   ├── library-list-dark.jpg
    │   └── details-dark.jpg
    └── fonts/                  # IBM Plex Sans Arabic + OFL.txt
```

---

## ملاحظات

- الموقع يدعم الوضعين الفاتح والداكن، ويحفظ اختيار الزائر في `localStorage`، ويعتمد على تفضيل النظام في أول زيارة.
- التصميم مسطّح (Flat) ويتبع هوية التطبيق مباشرة: اللون البني الدافئ `#AB9172`، والخلفية `#FBFDFF`، والسطح الرمادي `#EDEDED`، والحدود `#D9D9D9`، والنص `#161616`، وخط IBM Plex Sans Arabic — بلا تدرّجات أو ظلال أو توهّج.
- الوضع الداكن يستخدم ألوان التطبيق الداكنة: `#121212` و`#181818` و`#242424` و`#C9AF8D`.
- اللقطات من واجهة التطبيق الداكنة، والشعار مأخوذ من مجلد التصميم الرسمي.
- خط IBM Plex Sans Arabic مستضاف محليًا بموجب رخصة SIL Open Font License؛ نص الرخصة في `assets/fonts/OFL.txt`.
- جميع النصوص والواجهة عربية باتجاه RTL، مع دعم لوحة المفاتيح وقارئات الشاشة وتفضيل تقليل الحركة.
