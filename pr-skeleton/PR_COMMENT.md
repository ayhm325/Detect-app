PR comment (copy this into the GitHub PR discussion):

مرحبًا فريق المراجعة — لقد أضفت ملفات مُحدثة للاطلاع قبل استبدال الملفات الأصلية:

- `docs/clientKey-plan-updated.md` — خطة محدثة تتضمن مثال Prisma وشرح backfill.
- `pr-skeleton/example-migration-updated.sql` — مثال على partial unique index وخطوات rollback.
- `pr-skeleton/README-updated.md` — أوامر محلية مقترحة لاختبارات dry-run وE2E وتشغيل migration في بيئة dev.

الغرض: ترك هذه النسخ كمقترحات للمراجعة حتى نتحصل على موافقة الفريق. بعد الموافقة، سأستبدل الملفات الأصلية بالمحدثة داخل نفس الفرع وأدفع التغييرات ليتضمّنها الـPR.

يرجى مراجعة النقاط التالية بشكل خاص:
- هل مثال الـPrisma في `docs/clientKey-plan-updated.md` مناسب لصيغة المشروع؟
- هل نهج الـbackfill وشرح الـpartial index في `example-migration-updated.sql` واضح وكافٍ؟
- هل أوامر الاختبار المحلّية في `pr-skeleton/README-updated.md` كافية لتشغيل dry-run وE2E محليًا؟

بعد الموافقة، أقدّم PR بعدة خطوات مقترحة:
1) Phase 2: إضافة العمود nullable (`clientKey String?`) عبر migration في dev
2) Phase 2b: تشغيل سكربت dry-run/backfill وإصدار تقرير
3) Phase 3: تحديث الـserver/socket لتكون idempotent على `chatId+clientKey`
4) Phase 4: تحديث العميل والاختبارات E2E

شكراً — الرجاء الرد إن كانت لديكم ملاحظات أو موافقة لنمضي قدماً.