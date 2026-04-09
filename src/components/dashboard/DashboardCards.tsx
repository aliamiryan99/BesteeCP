import { ReactNode } from "react";
import { FiTrendingUp, FiInfo } from "react-icons/fi";

type MetricGroupProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function MetricGroup({ title, icon, children }: MetricGroupProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 self-start rounded-full bg-white/5 border border-white/10 px-4 py-2">
        {icon && <span className="text-indigo-400">{icon}</span>}
        <h3 className="text-sm font-bold text-white/80">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

type MainStatsCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  gradient?: string;
  submetrics?: { label: string; value: string | number; color?: string }[];
  loading?: boolean;
};

export function MainStatsCard({
  title,
  value,
  icon,
  gradient = "from-indigo-500 to-purple-500",
  submetrics,
  loading = false,
}: MainStatsCardProps) {
  return (
    <div className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/60 p-6 shadow-2xl transition-all hover:border-white/10 hover:shadow-indigo-500/10">
      <div className={`absolute top-0 right-0 h-1 w-full bg-gradient-to-l ${gradient} opacity-50`} />
      
      <div className="flex items-start justify-between z-10">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-white/50">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-black text-white tracking-tighter">
              {loading ? "..." : value}
            </h4>
          </div>
        </div>
        {icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl text-white shadow-lg shadow-black/40`}>
            {icon}
          </div>
        )}
      </div>

      {submetrics && submetrics.length > 0 && (
        <div className="mt-6 flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 z-10 flex-wrap">
          {submetrics.map((sub, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{sub.label}</span>
              <span className={`text-sm font-bold ${sub.color || "text-white/80"}`}>
                {loading ? "-" : sub.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AICreditBar({ name, credit, maxCredit = 50000 }: { name: string, credit: number, maxCredit?: number }) {
  const percentage = Math.min(100, Math.max(0, (credit / maxCredit) * 100));
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-white/70">{name}</span>
        <span className="text-indigo-400">{credit.toLocaleString()} <span className="text-white/30 font-normal">اعتبار باقی‌مانده</span></span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800 border border-white/5 overflow-hidden">
        <div 
          className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-cyan-400 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
