"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@backend/api";
import {
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
  FiCreditCard,
  FiShield,
  FiDollarSign,
  FiLayers,
  FiCopy,
  FiCheck,
  FiInfo,
  FiX,
  FiServer,
  FiActivity,
} from "react-icons/fi";
import { useToastStore } from "@/store/toastStore";

export default function FinancialSettlementsTab() {
  const pushToast = useToastStore((state) => state.push);
  const overview = useQuery(api.settlements.settlements.getPlatformSettlementsOverview);
  const settings = useQuery(api.ai.settings.get);
  const updateSettings = useMutation(api.ai.settings.update);
  const runDailySettlement = useAction(api.settlements.settlements.runDailySettlement);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isSavingGatewayMode, setIsSavingGatewayMode] = useState(false);
  const [copiedShaba, setCopiedShaba] = useState<string | null>(null);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  // ── Zibal eBank Connected Accounts State ──
  const getAccountsAction = useAction(api.settlements.settlements.getZibalEBankAccounts);
  const [zibalAccounts, setZibalAccounts] = useState<Array<{
    accountId: string;
    accountName?: string;
    accountNumber?: string;
    accountIban?: string;
    status?: number;
  }>>([]);
  const [activeAccountIdEnv, setActiveAccountIdEnv] = useState<string>("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const fetchZibalAccounts = async () => {
    setIsLoadingAccounts(true);
    setAccountsError(null);
    try {
      const res = await getAccountsAction({});
      if (res.success) {
        setZibalAccounts(res.accounts || []);
        setActiveAccountIdEnv(res.activeAccountIdEnv || "");
      } else {
        setAccountsError(res.error || "خطا در دریافت حساب‌ها");
        if (res.activeAccountIdEnv) setActiveAccountIdEnv(res.activeAccountIdEnv);
      }
    } catch (err: any) {
      setAccountsError(err.message || "خطا در اتصال به سرور");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchZibalAccounts();
  }, []);

  const handleCopyAccountId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedAccountId(id);
    pushToast({
      type: "info",
      title: "کپی شد",
      message: "شناسه حساب (accountId) در حافظه کپی شد.",
    });
    setTimeout(() => setCopiedAccountId(null), 2000);
  };

  const handleCopyShaba = (shaba: string) => {
    navigator.clipboard.writeText(shaba);
    setCopiedShaba(shaba);
    pushToast({
      type: "info",
      title: "کپی شد",
      message: "شماره شبا در حافظه کپی شد.",
    });
    setTimeout(() => setCopiedShaba(null), 2000);
  };

  const handleGatewayModeChange = async (mode: "sandbox" | "real") => {
    setIsSavingGatewayMode(true);
    try {
      await updateSettings({
        localhostGatewayMode: mode,
      });
      pushToast({
        type: "success",
        title: "حالت درگاه لوکال تغییر یافت",
        message:
          mode === "sandbox"
            ? "حالت درگاه روی لوکال‌هاست به «سندباکس تستی» تغییر یافت."
            : "حالت درگاه روی لوکال‌هاست به «درگاه واقعی بانکی» تغییر یافت.",
      });
    } catch (err: any) {
      console.error("Failed to update gateway mode:", err);
      pushToast({
        type: "error",
        title: "خطا در تغییر حالت درگاه",
        message: err.message || "مشکلی در ذخیره تنظیمات رخ داد.",
      });
    } finally {
      setIsSavingGatewayMode(false);
    }
  };

  const handleExecuteBulkSettlement = async () => {
    setIsSettling(true);
    try {
      const result = await runDailySettlement({});
      setIsConfirmModalOpen(false);
      pushToast({
        type: "success",
        title: "تسویه حساب انجام شد",
        message: `تسویه حساب با موفقیت برای ${result.settledCount} سالن با مجموع مبلغ ${result.totalAmount.toLocaleString("fa-IR")} تومان اجرا شد.${
          result.failedCount > 0
            ? ` (${result.failedCount} سالن با خطا مواجه شد)`
            : ""
        }`,
      });
    } catch (err: any) {
      console.error("Failed to run bulk settlement:", err);
      pushToast({
        type: "error",
        title: "خطا در اجرای تسویه حساب",
        message: err.message || "مشکلی در ارسال درخواست تسویه به درگاه پرداخت رخ داد.",
      });
    } finally {
      setIsSettling(false);
    }
  };

  if (overview === undefined || settings === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const currentMode = settings?.localhostGatewayMode || "sandbox";
  const totalUnsettled = overview?.totalUnsettledAmount || 0;
  const totalSettled = overview?.totalSettledAmount || 0;
  const unsettledSalonsCount = overview?.unsettledTenantsCount || 0;
  const unsettledBookingsCount = overview?.unsettledBookingsCount || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── 1. Localhost Gateway Mode Switcher ── */}
      <div className="glass-panel rounded-3xl border border-white/8 p-6 lg:p-8 shadow-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FiServer className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  حالت درگاه پرداخت در محیط لوکال‌هاست (Localhost Mode)
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    currentMode === "sandbox"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  {currentMode === "sandbox" ? "سندباکس شبیه‌ساز" : "درگاه واقعی شاپرک"}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                مشخص کنید که تراکنش‌های ایجادشده روی لوکال‌هاست به شبیه‌ساز سندباکس متصل شوند یا مستقیماً به درگاه واقعی هدایت شوند.
              </p>
            </div>
          </div>
        </div>

        {/* Radio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Sandbox Option */}
          <div
            onClick={() => handleGatewayModeChange("sandbox")}
            className={`cursor-pointer group relative flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200 ${
              currentMode === "sandbox"
                ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    currentMode === "sandbox"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  <FiActivity className="text-lg" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    حالت سندباکس تستی (Sandbox Test Mode)
                  </h4>
                  <span className="text-[11px] text-amber-400/80 font-mono">
                    https://sandbox.zarinpal.com
                  </span>
                </div>
              </div>
              {currentMode === "sandbox" && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black">
                  <FiCheck className="text-sm font-black" />
                </div>
              )}
            </div>
            <p className="text-xs text-white/50 leading-relaxed pr-1">
              در این حالت کارت‌های تست اعتباری بدون کسر واقعی پول پذیرفته می‌شوند و پرداخت‌ها در بستر شبیه‌ساز تایید می‌گردند.
            </p>
          </div>

          {/* Real Gateway Option */}
          <div
            onClick={() => handleGatewayModeChange("real")}
            className={`cursor-pointer group relative flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200 ${
              currentMode === "real"
                ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    currentMode === "real"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  <FiShield className="text-lg" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    درگاه پرداخت واقعی شاپرک (Live Gateway Mode)
                  </h4>
                  <span className="text-[11px] text-emerald-400/80 font-mono">
                    https://payment.zarinpal.com
                  </span>
                </div>
              </div>
              {currentMode === "real" && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black">
                  <FiCheck className="text-sm font-black" />
                </div>
              )}
            </div>
            <p className="text-xs text-white/50 leading-relaxed pr-1">
              تراکنش‌ها حتی هنگام تست روی لوکال‌هاست به درگاه واقعی متصل شده و پرداخت واقعی بانکی انجام خواهد شد.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Debt & Settlement KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unsettled Debt Card */}
        <div className="glass-panel rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-slate-900/80 to-slate-900/90 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400/90 uppercase tracking-wider">
              بدهی‌های معوق تسویه‌نشده
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <FiClock className="text-lg" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {totalUnsettled.toLocaleString("fa-IR")}
            </span>
            <span className="text-xs font-bold text-white/40">تومان</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/50 border-t border-white/5 pt-3">
            <span>تعداد نوبت‌های در انتظار:</span>
            <span className="font-bold text-white">
              {unsettledBookingsCount.toLocaleString("fa-IR")} نوبت
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-white/50">
            <span>تعداد سالن‌های ذینفع:</span>
            <span className="font-bold text-rose-400">
              {unsettledSalonsCount.toLocaleString("fa-IR")} سالن
            </span>
          </div>
        </div>

        {/* Total Settled Card */}
        <div className="glass-panel rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-900/90 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400/90 uppercase tracking-wider">
              مجموع کل تسویه‌شده
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FiCheckCircle className="text-lg" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {totalSettled.toLocaleString("fa-IR")}
            </span>
            <span className="text-xs font-bold text-white/40">تومان</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/50 border-t border-white/5 pt-3">
            <span>نوبت‌های تسویه‌شده:</span>
            <span className="font-bold text-emerald-400">
              {(overview?.settledBookingsCount || 0).toLocaleString("fa-IR")} نوبت
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-white/50">
            <span>تعداد دوره‌های تسویه:</span>
            <span className="font-bold text-white">
              {(overview?.recentSettlements?.length || 0).toLocaleString("fa-IR")} دوره
            </span>
          </div>
        </div>

        {/* Bulk Settlement Trigger Card */}
        <div className="glass-panel rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-slate-900/90 p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                تسویه حساب سراسری دستی
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <FiSend className="text-lg" />
              </div>
            </div>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">
              ارسال آنی دستور تسویه تمام ودیعه‌های معوق به حساب شبای سالن‌ها بدون معطلی تا پایان شب.
            </p>
          </div>

          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={totalUnsettled <= 0 || isSettling}
            className="cursor-pointer mt-4 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            <FiSend className="text-base" />
            <span>تسویه سراسری کلیه سالن‌ها ({totalUnsettled.toLocaleString("fa-IR")} تومان)</span>
          </button>
        </div>
      </div>

      {/* ── 3. Zibal eBank Accounts Section ── */}
      <div className="glass-panel rounded-3xl border border-white/8 p-6 lg:p-8 shadow-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/5">
              <FiCreditCard className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  حساب‌های متصل به بانکداری شرکتی زیبال (Zibal eBank Accounts)
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  {zibalAccounts.length.toLocaleString("fa-IR")} حساب
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                لیست حساب‌های بانکی مبدا تاییدشده جهت کسر وجه و تسویه خودکار با سالن‌ها
              </p>
            </div>
          </div>
          <button
            onClick={fetchZibalAccounts}
            disabled={isLoadingAccounts}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition border border-white/10 disabled:opacity-50"
          >
            <FiRefreshCw className={`text-xs ${isLoadingAccounts ? "animate-spin text-blue-400" : ""}`} />
            بروزرسانی حساب‌ها
          </button>
        </div>

        {/* Accounts Content */}
        <div className="mt-6">
          {isLoadingAccounts && zibalAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <FiRefreshCw className="animate-spin text-2xl text-blue-400 mb-2" />
              <p className="text-xs text-white/40">در حال دریافت حساب‌های متصل از وب‌سرویس زیبال...</p>
            </div>
          ) : accountsError && zibalAccounts.length === 0 ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-base text-rose-400 flex-shrink-0" />
                <span>{accountsError}</span>
              </div>
              <button
                onClick={fetchZibalAccounts}
                className="underline hover:text-white transition font-bold"
              >
                تلاش مجدد
              </button>
            </div>
          ) : zibalAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
              <FiCreditCard className="text-3xl text-white/10 mb-2" />
              <p className="text-xs text-white/30">هیچ حسابی در پنل بانکداری شرکتی زیبال یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zibalAccounts.map((acc, idx) => {
                const isConfigured = activeAccountIdEnv && acc.accountId === activeAccountIdEnv;
                return (
                  <div
                    key={acc.accountId || idx}
                    className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all bg-white/[0.02] ${
                      isConfigured
                        ? "border-blue-500/40 bg-blue-500/[0.05] shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/30"
                        : "border-white/8 hover:border-white/15"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <FiCreditCard size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {acc.accountName || `حساب بانکی ${idx + 1}`}
                            </h4>
                            <span className="text-[11px] text-white/40 font-mono" dir="ltr">
                              {acc.accountNumber || "شماره حساب نامشخص"}
                            </span>
                          </div>
                        </div>
                        {isConfigured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            حساب فعال در .env
                          </span>
                        )}
                      </div>

                      {/* IBAN */}
                      {acc.accountIban && (
                        <div className="mt-3 flex items-center justify-between bg-black/25 rounded-xl p-2.5 border border-white/5">
                          <span className="text-[11px] text-white/40 font-bold">شماره شبا:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-white/80" dir="ltr">
                              {acc.accountIban}
                            </span>
                            <button
                              onClick={() => handleCopyShaba(acc.accountIban!)}
                              className="text-white/40 hover:text-white p-1 transition"
                              title="کپی شماره شبا"
                            >
                              {copiedShaba === acc.accountIban ? (
                                <FiCheck className="text-emerald-400" size={12} />
                              ) : (
                                <FiCopy size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* accountId */}
                      <div className="mt-2 flex items-center justify-between bg-black/25 rounded-xl p-2.5 border border-white/5">
                        <span className="text-[11px] text-white/40 font-bold">شناسه (accountId):</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-amber-300/90" dir="ltr">
                            {acc.accountId}
                          </span>
                          <button
                            onClick={() => handleCopyAccountId(acc.accountId)}
                            className="text-white/40 hover:text-white p-1 transition"
                            title="کپی شناسه حساب برای ZIBAL_ACCOUNT_ID"
                          >
                            {copiedAccountId === acc.accountId ? (
                              <FiCheck className="text-emerald-400" size={12} />
                            ) : (
                              <FiCopy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px]">
                      <span className="text-white/40">وضعیت حساب:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        فعال در بانکداری شرکتی
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Unsettled Salons Table ── */}
      <div className="glass-panel rounded-3xl border border-white/8 p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <FiLayers className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                سالن‌های دارای طلب معوق ({unsettledSalonsCount.toLocaleString("fa-IR")})
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                لیست سالن‌هایی که رزرو دارای ودیعه ثبت کرده‌اند و در صف تسویه بعدی قرار دارند.
              </p>
            </div>
          </div>
        </div>

        {overview?.unsettledTenantsList && overview.unsettledTenantsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-white/40">
                  <th className="pb-3 pr-2">نام سالن</th>
                  <th className="pb-3 px-3">شماره شبا (IBAN)</th>
                  <th className="pb-3 px-3">صاحب حساب</th>
                  <th className="pb-3 px-3 text-center">تعداد نوبت</th>
                  <th className="pb-3 px-3 text-left">مبلغ طلب (تومان)</th>
                  <th className="pb-3 pl-2 text-center">وضعیت حساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {overview.unsettledTenantsList.map((tenant: any) => (
                  <tr key={tenant.tenantId} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 pr-2 font-bold text-white">
                      {tenant.tenantName}
                    </td>
                    <td className="py-4 px-3">
                      {tenant.shabaNumber ? (
                        <div className="flex items-center gap-2 font-mono text-xs text-amber-300">
                          <span dir="ltr">{tenant.shabaNumber}</span>
                          <button
                            onClick={() => handleCopyShaba(tenant.shabaNumber!)}
                            className="text-white/40 hover:text-white transition p-1"
                            title="کپی شماره شبا"
                          >
                            {copiedShaba === tenant.shabaNumber ? (
                              <FiCheck className="text-emerald-400 text-xs" />
                            ) : (
                              <FiCopy className="text-xs" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-400 flex items-center gap-1">
                          <FiAlertCircle />
                          شبا ثبت نشده
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-xs text-white/60">
                      {tenant.accountHolderName || "ثبت نشده"}
                    </td>
                    <td className="py-4 px-3 text-center text-xs font-bold text-white/80">
                      {tenant.bookingCount.toLocaleString("fa-IR")}
                    </td>
                    <td className="py-4 px-3 text-left font-black text-rose-400">
                      {tenant.amount.toLocaleString("fa-IR")}
                    </td>
                    <td className="py-4 pl-2 text-center">
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        در انتظار تسویه
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <FiCheckCircle className="text-2xl" />
            </div>
            <p className="text-sm font-bold text-white">کلیه بدهی‌ها تسویه شده است</p>
            <p className="text-xs text-white/40 mt-1">
              در حال حاضر هیچ بدهی معوقی برای سالن‌ها وجود ندارد.
            </p>
          </div>
        )}
      </div>

      {/* ── 4. Settlements History Table ── */}
      <div className="glass-panel rounded-3xl border border-white/8 p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <FiRefreshCw className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                تاریخچه و سوابق تسویه‌های انجام شده
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                گزارش پیگیری تراکنش‌های پایا و وضعیت تسویه‌های خروجی زرین‌پال.
              </p>
            </div>
          </div>
        </div>

        {overview?.recentSettlements && overview.recentSettlements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-white/40">
                  <th className="pb-3 pr-2">تاریخ و زمان</th>
                  <th className="pb-3 px-3">نام سالن</th>
                  <th className="pb-3 px-3">شماره شبا مقصد</th>
                  <th className="pb-3 px-3 text-center">تعداد نوبت</th>
                  <th className="pb-3 px-3 text-left">مبلغ تسویه (تومان)</th>
                  <th className="pb-3 px-3 text-center">شناسه پیگیری زیبال</th>
                  <th className="pb-3 pl-2 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {overview.recentSettlements.map((s: any) => (
                  <tr key={s._id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 pr-2 text-xs text-white/60 font-mono">
                      {new Date(s.createdAt).toLocaleDateString("fa-IR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-3 font-bold text-white">{s.tenantName}</td>
                    <td className="py-4 px-3 font-mono text-xs text-white/50" dir="ltr">
                      {s.shabaNumber}
                    </td>
                    <td className="py-4 px-3 text-center text-xs font-bold text-white/70">
                      {s.bookingCount.toLocaleString("fa-IR")}
                    </td>
                    <td className="py-4 px-3 text-left font-black text-emerald-400">
                      {s.amount.toLocaleString("fa-IR")}
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-[11px] text-white/40">
                      {s.zibalReceiptUrl ? (
                        <a
                          href={s.zibalReceiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                        >
                          {s.zibalTrackId || s.zibalCheckoutId || "مشاهده رسید"}
                        </a>
                      ) : (
                        s.zibalCheckoutId || s.zibalTrackId || s.zarinpalPayoutId || "-"
                      )}
                    </td>
                    <td className="py-4 pl-2 text-center">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                          s.status === "completed"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : s.status === "processing"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {s.status === "completed"
                          ? "تسویه شد"
                          : s.status === "processing"
                          ? "در حال پردازش"
                          : "ناموفق"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-white/40 text-xs">
            هنوز سابقه‌ای از تسویه ثبت نشده است.
          </div>
        )}
      </div>

      {/* ── 5. Confirmation Modal ── */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 lg:p-8 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute top-6 left-6 text-white/40 hover:text-white transition p-1"
            >
              <FiX className="text-xl" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FiSend className="text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  تایید اجرای تسویه سراسری سالن‌ها
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  ارسال دستور پرداخت پایا به شماره شبای ثبت‌شده سالن‌ها
                </p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">تعداد سالن‌های ذینفع:</span>
                <span className="font-bold text-white">
                  {unsettledSalonsCount.toLocaleString("fa-IR")} سالن
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">تعداد کل نوبت‌های رزرو:</span>
                <span className="font-bold text-white">
                  {unsettledBookingsCount.toLocaleString("fa-IR")} نوبت
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-white/70 font-bold">مجموع مبلغ قابل تسویه:</span>
                <span className="text-lg font-black text-amber-400">
                  {totalUnsettled.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-white/50 bg-amber-500/5 border border-amber-500/15 p-4 rounded-2xl">
              <FiInfo className="text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                با تایید این عملیات، تمامی مبالغ به صورت تفکیک‌شده به حساب شبای مدیران سالن‌ها واریز و در سامانه به وضعیت «تسویه‌شده» تغییر می‌یابند.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSettling}
                className="cursor-pointer px-5 py-3 rounded-2xl border border-white/10 text-xs font-bold text-white/60 hover:bg-white/5 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleExecuteBulkSettlement}
                disabled={isSettling}
                className="cursor-pointer flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition disabled:opacity-50"
              >
                {isSettling ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                ) : (
                  <FiCheckCircle className="text-base" />
                )}
                <span>تایید و ارسال دستور تسویه</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
