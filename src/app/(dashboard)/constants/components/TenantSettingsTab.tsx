"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/api";
import { useToastStore } from "@/store/toastStore";
import {
  FiClock,
  FiSave,
  FiAlertTriangle,
  FiCheckCircle,
  FiSlash,
  FiShield,
  FiInfo,
} from "react-icons/fi";

export default function TenantSettingsTab() {
  const settings = useQuery(api.ai.settings.get);
  const updateSettings = useMutation(api.ai.settings.update);
  const pushToast = useToastStore((state) => state.push);

  const [tenantStalingEnabled, setTenantStalingEnabled] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && settings.tenantStalingEnabled !== undefined) {
      setTenantStalingEnabled(settings.tenantStalingEnabled);
    }
  }, [settings]);

  if (settings === undefined) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        tenantStalingEnabled,
      });
      pushToast({
        type: "success",
        title: "تنظیمات ذخیره شد",
        message: tenantStalingEnabled
          ? "مکانیزم راکدی ۷ روزه شعب فعال گردید."
          : "مکانیزم راکدی شعب غیرفعال شد و تمامی شعب راکد مجدداً فعال شدند.",
      });
    } catch (error: unknown) {
      console.error(error);
      pushToast({
        type: "error",
        title: "خطا در ذخیره تنظیمات",
        message:
          error instanceof Error
            ? error.message
            : "مشکلی در ثبت تغییرات تنظیمات شعب رخ داد.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Policy Card */}
      <div className="glass-panel rounded-3xl border border-white/8 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-800/80 p-6 md:p-8 shadow-xl space-y-8">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/8 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FiClock className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">تنظیمات راکدی شعب (Still/Inactivity)</h2>
              <p className="text-xs text-white/50 mt-1">
                پیکربندی قوانین غیرفعال‌سازی خودکار شعب بر اساس عدم فعالیت و ارسال پیامک هشدار
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="cursor-pointer flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : (
              <FiSave className="text-lg" />
            )}
            <span>ذخیره تغییرات</span>
          </button>
        </div>

        {/* Toggle Switch Control */}
        <div className="rounded-2xl border border-white/8 bg-white/5 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">مکانیزم راکد شدن خودکار شعب</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                    tenantStalingEnabled
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {tenantStalingEnabled ? (
                    <>
                      <FiCheckCircle className="text-xs" />
                      فعال (۷ روز عدم فعالیت)
                    </>
                  ) : (
                    <>
                      <FiSlash className="text-xs" />
                      غیرفعال (بدون راکدی)
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-white/60">
                در صورت فعال بودن، شعبی که به مدت ۷ روز هیچ رزروی ثبت نکنند غیرفعال شده و پیامک هشدار برای مدیر ارسال می‌شود.
              </p>
            </div>

            {/* Custom Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={tenantStalingEnabled}
                onChange={(e) => setTenantStalingEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:right-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Details & Implications Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className={`rounded-xl border p-4 transition ${
              tenantStalingEnabled
                ? "border-amber-500/20 bg-amber-500/5 text-amber-200"
                : "border-white/5 bg-white/5 text-white/40"
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold mb-2 text-amber-400">
                <FiAlertTriangle />
                <span>رفتار سیستم در حالت فعال</span>
              </div>
              <ul className="text-xs space-y-2 text-white/70 list-disc list-inside">
                <li>شعب فاقد رزرو پس از ۷ روز به صورت خودکار راکد (Inactive) می‌شوند.</li>
                <li>پیامک روزانه هشدار راکدی به شماره تلفن مدیران شعب ارسال می‌گردد.</li>
                <li>دسترسی پرسنل و مشتریان شعبه راکد به رزرو مجدد معلق می‌شود.</li>
              </ul>
            </div>

            <div className={`rounded-xl border p-4 transition ${
              !tenantStalingEnabled
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                : "border-white/5 bg-white/5 text-white/40"
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold mb-2 text-emerald-400">
                <FiShield />
                <span>رفتار سیستم در حالت غیرفعال</span>
              </div>
              <ul className="text-xs space-y-2 text-white/70 list-disc list-inside">
                <li>هیچ شعبه‌ای به دلیل عدم رزرو ۷ روزه راکد و غیرفعال نمی‌شود.</li>
                <li>ارسال پیامک‌های هشدار راکدی به مدیران شعب کاملاً متوقف می‌گردد.</li>
                <li>تمام شعبی که قبلاً به دلیل قانون ۷ روز راکد شده بودند، فوراً فعال می‌گردند.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informational Footer */}
        <div className="flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sky-300 text-xs">
          <FiInfo className="text-lg shrink-0 text-sky-400" />
          <p>
            تغییر وضعیت این تنظیم بلافاصله پس از ذخیره روی الگوریتم سویپر (Inactivity Sweeper) پلتفرم اعمال شده و وضعیت فعال/راکد بودن تمام شعب به‌روزرسانی می‌شود.
          </p>
        </div>

      </div>
    </div>
  );
}
