# تطبيق عالفحم MR — نسخة أندرويد (APK)

الملفات جاهزة. الـ APK بيتبني أوتوماتيك على GitHub (مفيش حاجة تتثبت على جهازك).

## الخطوات
1. **انسخ باقي ملفات الموقع جوه مجلد `www/`** (بجانب index.html): `manifest.json`, `sw.js`, `icon-192-3.png`, `logo-dark.png`, `logo-light.png`.
2. (اختياري) حط أيقونة التطبيق 1024×1024 في `assets/icon.png`.
3. ارفع المشروع كله على ريبو GitHub جديد (فرع `main`).
4. من تبويب **Actions** ← **Build Android APK** ← انتظر دقايق ← نزّل **mr-alfaham-apk** ← جواه `app-debug.apk` ثبّته على الموبايل.

## تفعيل الإشعارات على أندرويد (مرة واحدة) ⚠️
OneSignal عندك متظبط للويب بس، لازم تضيف منصة أندرويد:
1. Firebase Console (نفس مشروعك) ← Project settings ← Service accounts ← **Generate new private key** (ملف JSON).
2. OneSignal ← App Settings ← **Push & In-App** ← **Google Android (FCM)** ← ارفع ملف الـ JSON.
3. افتح التطبيق ← فعّل الإشعارات من الإعدادات ← جرّب "إشعار تجريبي".

الإشعارات بتتبعت بنفس الـ Worker والـ external_id والـ tags الحاليين، فمفيش تعديل في باقي الكود.

## اللي اتعدّل في index.html
سطر واحد بس: سكربت OneSignal للويب بقى بيتحمّل في المتصفح بس، وأُضيف `native-bridge.js` اللي بيربط الإشعارات بالنسخة الأصلية، ويخلّي تصدير Excel/CSV/JSON يتحفظ ويتشارك، وروابط واتساب تفتح. الملف لسه شغال عادي كـ PWA على الويب.

## رابط التحميل
بعد ما الـ workflow يخلص، الرابط الثابت للتطبيق هيكون:
`https://github.com/اسم-حسابك/mr-alfaham-android/releases/latest/download/mr-alfaham.apk`
ابعته للموظفين أو حطه زرار في الموقع. كل تحديث جديد بيستبدل الملف بنفس الرابط.
(أول مرة الموبايل هيطلب تسمح بـ "التثبيت من مصدر غير معروف" — ده طبيعي.)
