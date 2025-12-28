# إعداد وتشغيل المشروع (تفصيل)

المتطلبات:
- Node.js (يفضل نسخة LTS الحديثة)
- PostgreSQL أو أي قاعدة متوافقة مع `DATABASE_URL` في `.env`

خطوات الإعداد:
1. تثبيت الحزم:

```bash
npm install
```

2. إنشاء ملف `.env` بناءً على `.env.example` (إن وجد):

```bash
cp .env.example .env
# ثم عدّل القيم المناسبة
```

3. تشغيل هجرات Prisma:

```bash
npx prisma migrate dev
```

4. تشغيل الخادم:

```bash
npx next dev
```

تشغيل خادم السوكيت (اختياري إذا تستخدم الدردشة):

```bash
node scripts/socket-server.js
```
