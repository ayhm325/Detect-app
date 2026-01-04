# نشر المشروع للإنتاج (Deployment)

هذا الدليل يركز على “الإغلاق الاحترافي” قبل النشر: متغيرات البيئة، أوامر البناء، ومتطلبات التشغيل.

## 1) متغيرات البيئة المطلوبة (إنتاج)

ضع هذه المتغيرات في مزوّد الاستضافة (Vercel / Docker / VPS) — لا تضعها في المستودع.

**إلزامي**

- `NODE_ENV=production`
- `DATABASE_URL=...`
- `JWT_SECRET=...` (طوله **>= 32**)

**اختياري (تشدّد إضافي لـ JWT)**

إذا ضبطت هذه القيم، سيتم توقيع/التحقق من التوكن باستخدامها:

- `JWT_ISSUER=...`
- `JWT_AUDIENCE=...`

**اختياري (Revocation)**

- `REDIS_URL=...` (موصى به للإنتاج خصوصًا عند تعدد السيرفرات/الحاويات)

## 2) أوامر البناء والتشغيل

على بيئة البناء/السيرفر:

```bash
npm ci
npm run lint
npm test
npm run build
```

تشغيل الإنتاج:

```bash
npm start
```

ملاحظة: `npm start` يشغّل فحص env (`scripts/check-env.mjs`) قبل `next start` لضمان فشل مبكر وواضح عند أي نقص.

## 3) Vercel (مختصر)

- ضع متغيرات البيئة في Project Settings → Environment Variables.
- اجعل Build Command: `npm run build`
- Start Command (لـ Serverless / Next): عادة لا تحتاج Start Command.

## 4) Docker / VPS (مختصر)

- تأكد أن `DATABASE_URL` يشير لقاعدة بيانات يمكن الوصول لها من الحاوية/السيرفر.
- ابدأ `next start` عبر `npm start` فقط (لأنها تشمل فحص env).

## 5) ملاحظة احترافية حول Revocation

- في وضع الملف: التخزين يكون في `data/revokedTokens.json`.
- في الإنتاج متعدد النسخ (أكثر من instance) يفضّل تفعيل `REDIS_URL` لضمان أن revocation مشترك بين كل النسخ.
