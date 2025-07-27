import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "كيفية استخدام مستخرج الصور - دليل شامل | How to Use Image Extractor",
  description: "تعلم كيفية استخدام مستخرج الصور لتحميل جميع الصور من أي موقع ويب بسهولة. دليل شامل بالصور والخطوات التفصيلية.",
  keywords: [
    "كيفية استخدام مستخرج الصور", "شرح استخراج الصور", "دليل تحميل الصور", "طريقة تحميل الصور من المواقع",
    "how to use image extractor", "image extraction guide", "download images tutorial", "website image downloader guide"
  ],
  alternates: {
    canonical: 'https://your-domain.com/how-to-use',
  }
};

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            كيفية استخدام مستخرج الصور
          </h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">الخطوة 1: إدخال رابط الموقع</h2>
              <p className="text-gray-600 mb-4">
                قم بنسخ رابط الموقع الذي تريد استخراج الصور منه ولصقه في حقل "رابط الموقع".
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  <strong>مثال:</strong> https://example.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">الخطوة 2: اختيار وضع الاستخراج</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">أساسي</h3>
                  <p className="text-green-700 text-sm">سريع وبسيط للمواقع العادية</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">محسن</h3>
                  <p className="text-yellow-700 text-sm">مع انتظار تحميل الصور</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">متقدم</h3>
                  <p className="text-red-700 text-sm">للمواقع المعقدة</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">الخطوة 3: استخراج الصور</h2>
              <p className="text-gray-600 mb-4">
                اضغط على زر "استخراج الصور" وانتظر حتى يتم العثور على جميع الصور في الموقع.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">الخطوة 4: اختيار وتحميل الصور</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>يمكنك اختيار صور محددة أو تحديد الكل</li>
                <li>استخدم الفلاتر لتصفية الصور حسب النوع</li>
                <li>اضغط على أيقونة العين لعرض الصورة بحجم كبير</li>
                <li>اضغط على "تحميل" لتحميل الصور المحددة كملف ZIP</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">نصائح مهمة</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>تأكد من أن الرابط صحيح ويبدأ بـ http:// أو https://</li>
                <li>بعض المواقع قد تحتاج لوضع الاستخراج المتقدم</li>
                <li>الصور الكبيرة قد تستغرق وقتاً أطول للتحميل</li>
                <li>احترم حقوق الطبع والنشر للصور</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/ar" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ابدأ استخراج الصور الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
