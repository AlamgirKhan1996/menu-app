// Simple bilingual helper — no React context needed
// Usage in any component:
// import { useLang, t } from "@/lib/i18n";
// const { lang, toggleLang } = useLang();
// t("orders.title", lang)

"use client";
import { useState, useEffect } from "react";

export const translations = {
  en: {
    // Sidebar
    "nav.home": "Home",
    "nav.menu": "Menu Manager",
    "nav.orders": "Live Orders",
    "nav.analytics": "Analytics",
    "nav.qr": "QR Code",
    "nav.settings": "Settings",
    "nav.upgrade": "Upgrade Plan",
    "nav.signout": "Sign Out",
    "nav.language": "Language",

    // Orders
    "orders.title": "Live Orders",
    "orders.refresh": "Auto-refreshes every 8 seconds",
    "orders.active": "Active Orders",
    "orders.history": "History",
    "orders.empty": "No active orders",
    "orders.empty_sub": "New orders will appear here automatically",
    "orders.new": "New Orders",
    "orders.in_progress": "In Progress",
    "orders.today": "Today",
    "orders.loading": "Loading orders...",

    // Menu
    "menu.title": "Menu Manager",
    "menu.add": "+ Add Item",
    "menu.no_items": "No items yet",
    "menu.loading": "Loading menu...",

    // Settings
    "settings.title": "Settings",
    "settings.save": "Save Changes",
    "settings.saving": "Saving...",
    "settings.saved": "Saved!",

    // Analytics
    "analytics.title": "Analytics",
    "analytics.subtitle": "Last 30 days performance",

    // General
    "general.loading": "Loading...",
    "general.error": "Something went wrong",
    "general.retry": "Retry",
    "general.cancel": "Cancel",
    "general.save": "Save",
    "general.back": "Back",
  },

  ar: {
    // Sidebar
    "nav.home": "الرئيسية",
    "nav.menu": "إدارة القائمة",
    "nav.orders": "الطلبات المباشرة",
    "nav.analytics": "التحليلات",
    "nav.qr": "رمز QR",
    "nav.settings": "الإعدادات",
    "nav.upgrade": "ترقية الخطة",
    "nav.signout": "تسجيل الخروج",
    "nav.language": "اللغة",

    // Orders
    "orders.title": "الطلبات المباشرة",
    "orders.refresh": "يتحدث تلقائياً كل 8 ثوانٍ",
    "orders.active": "الطلبات النشطة",
    "orders.history": "السجل",
    "orders.empty": "لا توجد طلبات نشطة",
    "orders.empty_sub": "ستظهر الطلبات الجديدة هنا تلقائياً",
    "orders.new": "طلبات جديدة",
    "orders.in_progress": "قيد التنفيذ",
    "orders.today": "اليوم",
    "orders.loading": "جارٍ تحميل الطلبات...",

    // Menu
    "menu.title": "إدارة القائمة",
    "menu.add": "+ إضافة صنف",
    "menu.no_items": "لا توجد أصناف بعد",
    "menu.loading": "جارٍ تحميل القائمة...",

    // Settings
    "settings.title": "الإعدادات",
    "settings.save": "حفظ التغييرات",
    "settings.saving": "جارٍ الحفظ...",
    "settings.saved": "تم الحفظ!",

    // Analytics
    "analytics.title": "التحليلات",
    "analytics.subtitle": "نظرة عامة على آخر 30 يوماً",

    // General
    "general.loading": "جارٍ التحميل...",
    "general.error": "حدث خطأ ما",
    "general.retry": "إعادة المحاولة",
    "general.cancel": "إلغاء",
    "general.save": "حفظ",
    "general.back": "رجوع",
  }
};

// Get translation
export function t(key, lang = "en") {
  return translations[lang]?.[key] || translations["en"]?.[key] || key;
}

// Hook to use in any client component
export function useLang() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("orderflow-lang") || "en";
    setLang(saved);
    document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = saved;
  }, []);

  function toggleLang() {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem("orderflow-lang", next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  }

  return { lang, toggleLang, isAr: lang === "ar" };
}