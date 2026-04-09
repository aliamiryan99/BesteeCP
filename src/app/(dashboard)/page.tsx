"use client";

import { useEffect } from "react";
import { FiBarChart2, FiMail, FiUsers } from "react-icons/fi";
import { IncomeChart } from "@/components/dashboard/IncomeChart";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TenantTable } from "@/components/dashboard/TenantTable";
import { useQuery } from "convex/react";
import { api } from "@backend/api";
import { Doc } from "@backend/dataModel";
import Link from "next/link";

export default function Home() {
  const tenants = useQuery(api.tenants.tenants.listAll);
  const loadingMetrics = tenants === undefined;

  const announcements = useQuery(api.announcements.list) ?? [];
  const topAnnouncements = announcements.slice(0, 3);

  const totalTenants = tenants?.length ?? 0;
  const aliveTenants = tenants?.filter((t: any) => t.status === "alive").length ?? 0;
  const monthlyIncome = 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fa-IR").format(value);

  // Helper for formatting relative time
  const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " روز پیش";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ساعت پیش";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " دقیقه پیش";
    return "همین الان";
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-panel flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-950 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">اطلاعیه‌ها</h2>
          <Link
            href="/announcements"
            className="text-sm text-orange-200/80 hover:text-orange-300 transition-colors"
          >
            مشاهده همه اطلاعیه‌ها
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {topAnnouncements.length === 0 ? (
            <p className="text-sm text-muted-soft pt-2">هیچ اطلاعیه‌ای وجود ندارد.</p>
          ) : (
            topAnnouncements.map((announcement: Doc<"announcements">) => (
              <div key={announcement._id} className="group relative z-10 hover:z-50 flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors">
                <p className="text-sm font-semibold text-white">{announcement.title}</p>
                <p className="text-xs text-muted-soft leading-relaxed line-clamp-2">
                  {announcement.content}
                </p>
                <span className="mt-auto text-[10px] text-muted-soft pt-2">{timeSince(announcement._creationTime)}</span>

                {/* Popup Tooltip */}
                <div className="absolute -bottom-2 right-0 translate-y-full w-full sm:w-[120%] min-w-[250px] z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none">
                  <div className="rounded-2xl border border-white/10 bg-slate-800/95 p-5 shadow-2xl backdrop-blur-xl">
                    <h4 className="text-sm font-bold text-white mb-2">{announcement.title}</h4>
                    <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard
          title="کل شعب"
          value={totalTenants}
          icon={<FiUsers />}
          subtitle="مجموع ثبت شده در سیستم"
          loading={loadingMetrics}
        />
        <KpiCard
          title="شعب فعال"
          value={aliveTenants}
          icon={<FiMail />}
          subtitle="دارای وضعیت alive"
          accent="from-green-500 to-emerald-500"
          loading={loadingMetrics}
        />
        <KpiCard
          title="درآمد ماه جاری"
          value={`${formatCurrency(monthlyIncome)} تومان`}
          icon={<FiBarChart2 />}
          subtitle="بر اساس endpoint درآمد"
          accent="from-amber-400 to-orange-500"
          loading={loadingMetrics}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TenantTable />
        </div>
        <div className="lg:col-span-1">
          <IncomeChart />
        </div>
      </section>
    </div>
  );
}
