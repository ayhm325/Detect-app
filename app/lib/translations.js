const translations = {
  en: {
    brand: "PneumoDetect",
    home: "Home",
    login: "Login",
    signup: "Sign Up",
    analyze: "Analyze X-Ray",
    heroTitle: "AI-Based Pneumonia Detection From Chest X-Rays",
    heroDesc: "An intelligent system for analyzing chest X-ray images and detecting pneumonia with high accuracy and speed. Suitable for doctors and patients alike.",
    featuresTitle: "System Features",
    features: [
      { icon: "/icons/ai.svg", title: "Instant Image Analysis", desc: "Fast and accurate results as soon as you upload the image." },
      { icon: "/icons/xray.svg", title: "High Accuracy", desc: "Powered by the latest medical AI technologies." },
      { icon: "/icons/result.svg", title: "For Doctors & Patients", desc: "Easy interface for everyone and organized results history." },
    ],
    workflowTitle: "How does it work?",
    workflow: [
      { icon: "/file.svg", title: "Upload X-ray Image" },
      { icon: "/globe.svg", title: "AI Model Processing" },
      { icon: "/window.svg", title: "Instant Result Display" },
    ],
    contact: "Contact Us",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    copyright: year => `© ${year} PneumoDetect. All rights reserved.`,
    langSwitch: "عربي"
  },
  ar: {
    brand: "PneumoDetect",
    home: "الرئيسية",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    analyze: "تحليل الأشعة",
    heroTitle: "نظام ذكاء اصطناعي لاكتشاف الالتهاب الرئوي من أشعة الصدر",
    heroDesc: "نظام ذكي لتحليل صور أشعة الصدر واكتشاف الالتهاب الرئوي بدقة عالية وسرعة فائقة. مناسب للأطباء والمرضى على حد سواء.",
    featuresTitle: "ميزات النظام",
    features: [
      { icon: "/icons/ai.svg", title: "تحليل فوري للصور", desc: "نتائج سريعة ودقيقة بمجرد رفع الصورة." },
      { icon: "/icons/xray.svg", title: "نسبة دقة عالية", desc: "يعتمد على أحدث تقنيات الذكاء الاصطناعي الطبية." },
      { icon: "/icons/result.svg", title: "مناسب للأطباء والمرضى", desc: "واجهة سهلة للجميع وسجل نتائج منظم." },
    ],
    workflowTitle: "كيف يعمل النظام؟",
    workflow: [
      { icon: "/file.svg", title: "تحميل صورة الأشعة" },
      { icon: "/globe.svg", title: "المعالجة عبر النموذج" },
      { icon: "/window.svg", title: "عرض النتيجة بشكل فوري" },
    ],
    contact: "تواصل معنا",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    copyright: year => `© ${year} PneumoDetect. جميع الحقوق محفوظة.`,
    langSwitch: "EN"
  }
};

export default translations;
