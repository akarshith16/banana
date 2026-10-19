import React from 'react';
import {
  LayoutDashboard,
  Store,
  GitCompare,
  TrendingUp,
  Calculator,
  CalendarCheck,
  Users,
  BellRing,
  ServerCog,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  alertsCount = 3,
  topArbCount = 5,
  verifiedCount = 27,
  leadsCount = 12
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: `${topArbCount} Arb`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'buyer-discovery',
      label: "Buyer Discovery & 'Sell'",
      icon: PhoneCall,
      badge: `${leadsCount} Leads`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'price-verification',
      label: 'Price Verification Console',
      icon: ShieldCheck,
      badge: 'Audit Raw',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'live-markets',
      label: 'Live Markets',
      icon: Store,
      badge: '9 G9 Hubs',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    },
    {
      id: 'market-compare',
      label: 'Market Compare',
      icon: GitCompare,
      badge: 'Waterfall',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    },
    {
      id: 'forecast-studio',
      label: 'Forecast Studio',
      icon: TrendingUp,
      badge: 'ML v2.4',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'trade-calculator',
      label: 'Trade Calculator',
      icon: Calculator,
      badge: 'P&L Sim',
      badgeColor: 'bg-slate-700 text-slate-300 border border-slate-600'
    },
    {
      id: 'procurement-planner',
      label: 'Procurement Planner',
      icon: CalendarCheck,
      badge: '5 Lots',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'buyer-demand',
      label: 'Buyer Demand Board',
      icon: Users,
      badge: '480 MT',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    },
    {
      id: 'alerts-center',
      label: 'Alerts Center',
      icon: BellRing,
      badge: `${alertsCount} Active`,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    },
    {
      id: 'admin-connectors',
      label: 'Admin & Connectors',
      icon: ServerCog,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    }
  ];

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-[#243048] flex flex-col justify-between p-3 select-none shrink-0 min-h-[calc(100vh-53px)]">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 py-2 mb-1">
          OPERATIONAL MODULES
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-[#162032] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sourcing corridor summary footer */}
      <div className="mt-4 p-3 rounded bg-[#131b2b] border border-[#243048] text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider">AP G9 Corridor</span>
          <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Pulivendula to Mumbai, Delhi, Srinagar & Kolkata confirmed G9 trade corridors.
        </p>
      </div>
    </aside>
  );
}
