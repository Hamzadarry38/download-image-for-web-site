This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# مستخرج الصور - Image Extractor 🖼️

> أداة مجانية لاستخراج وتحميل جميع الصور من أي موقع ويب بسهولة وسرعة

## ✨ الميزات

- 🌐 **متعدد اللغات**: يدعم العربية والإنجليزية والفرنسية
- 🚀 **ثلاثة أوضاع استخراج**: أساسي، محسن، ومتقدم
- 📦 **تحميل مجمع**: تحميل جميع الصور في ملف ZIP واحد
- 🔍 **فلترة الصور**: تصفية حسب نوع الصورة
- 👁️ **معاينة الصور**: عرض الصور بحجم كبير
- 📱 **تصميم متجاوب**: يعمل على جميع الأجهزة
- 🎯 **SEO محسن**: صفحات منفصلة لكل لغة

## 🚀 التشغيل السريع

```bash
# تثبيت المتطلبات
npm install

# تشغيل الخادم المحلي
npm run dev

# فتح المتصفح على
http://localhost:3000
```

## 🌍 الصفحات متعددة اللغات

- `/ar` - النسخة العربية
- `/en` - النسخة الإنجليزية  
- `/fr` - النسخة الفرنسية

## 🛠️ التقنيات المستخدمة

- **Next.js 14** - إطار العمل الرئيسي
- **TypeScript** - للأمان والوضوح
- **Tailwind CSS** - للتصميم
- **Lucide React** - للأيقونات
- **JSZip** - لضغط الصور
- **File-saver** - لتحميل الملفات

## 📝 كيفية الاستخدام

1. أدخل رابط الموقع المراد استخراج الصور منه
2. اختر وضع الاستخراج المناسب
3. اضغط على "استخراج الصور"
4. حدد الصور المطلوبة
5. اضغط على "تحميل" للحصول على ملف ZIP

## 🔧 الإعداد للإنتاج

1. انسخ `env.example` إلى `.env.local`
2. أضف معرفات Google Analytics و AdSense
3. استبدل `your-domain.com` بالدومين الحقيقي

## 📊 تحسين محركات البحث

- ✅ Meta tags محسنة لكل لغة
- ✅ Structured Data (JSON-LD)
- ✅ Sitemap ديناميكي
- ✅ Robots.txt محسن
- ✅ Hreflang للغات متعددة
- ✅ توجيه تلقائي حسب لغة المستخدم

## 🚀 النشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel --prod
```

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام المجاني.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى فتح issue أو pull request.

---

**تم تطويره بـ ❤️ لمجتمع المطورين العرب**

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
