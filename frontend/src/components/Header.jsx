import React from 'react';
import {
  Activity,
  Layers,
  MapPin,
  ShieldCheck,
  Sun,
  Moon,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function Header({
  sourceCluster,
  setSourceCluster,
  commodity,
  setCommodity,
  role,
  setRole,
  isDark,
  setIsDark,
  healthData,
  onRefresh
}) {
  const sourceClusters = [
    { id: 'ap_pulivendula', name: 'Pulivendula (Kadapa)' },
    { id: 'ap_tadipatri', name: 'Tadipatri (Anantapur)' },
    { id: 'ap_anantapur_rural', name: 'Anantapur Rural' },
    { id: 'ap_kurnool_dhone', name: 'Dhone-Kurnool' },
    { id: 'ap_ravulapalem', name: 'Ravulapalem (E. Godavari)' }
  ];

  const commodities = [
    { id: 'Banana', label: 'G9 Cavendish Banana (Hero)', icon: '🍌' },
    { id: 'Tomato', label: 'Tomato (Hybrid)', icon: '🍅' },
    { id: 'Mango', label: 'Mango (Banganapalli)', icon: '🥭' },
    { id: 'Onion', label: 'Onion (Red)', icon: '🧅' },
    { id: 'Pomegranate', label: 'Pomegranate (Bhagwa)', icon: '🍎' },
    { id: 'Sweet Lime', label: 'Sweet Lime (Mosambi)', icon: '🍋' }
  ];

  const roles = ['Trader', 'Analyst', 'Admin', 'Viewer'];

  return (
    <header className="sticky top-0 z-50 bg-[#0d131f]/95 backdrop-blur border-b border-[#243048] px-4 py-2.5 text-slate-100 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner">
          🍌
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-wide text-white">
              Kadali Fresh Control Tower
            </span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              v2.0 AP G9 Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time mandi intelligence & AI forecasting for fresh produce trading
          </p>
        </div>
      </div>

      {/* Control selectors */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Source Cluster Selector */}
        <div className="flex items-center gap-1.5 bg-[#162032] border border-[#2d3d5c] rounded px-2.5 py-1.5 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 font-medium">Source:</span>
          <select
            value={sourceCluster}
            onChange={(e) => setSourceCluster(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            {sourceClusters.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#162032] text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Commodity Selector */}
        <div className="flex items-center gap-1.5 bg-[#162032] border border-[#2d3d5c] rounded px-2.5 py-1.5 shadow-sm">
          <span className="text-amber-400 font-medium">Crop:</span>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            {commodities.map((item) => (
              <option key={item.id} value={item.id} className="bg-[#162032] text-white">
                {item.icon} {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* AGMARKNET Live Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-[11px]">
            {healthData?.data_connector?.mode === 'MANUAL_ENTRY_ACTIVE'
              ? 'Manual Spot Active'
              : healthData?.data_connector?.mode === 'CSV_OVERRIDE_ACTIVE'
              ? 'CSV Batch Active'
              : 'AGMARKNET Live (18m ago)'}
          </span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-[#162032] border border-[#2d3d5c] rounded p-0.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                role === r
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh live feeds"
          className="p-1.5 bg-[#162032] hover:bg-[#202d46] border border-[#2d3d5c] rounded text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Dark/Light toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          title="Toggle visual theme"
          className="p-1.5 bg-[#162032] hover:bg-[#202d46] border border-[#2d3d5c] rounded text-slate-300 transition-colors"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-300" />}
        </button>
      </div>
    </header>
  );
}
