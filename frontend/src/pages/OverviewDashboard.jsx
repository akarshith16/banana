import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  DollarSign,
  Truck,
  ExternalLink,
  ChevronRight,
  Timer
} from 'lucide-react';

export default function OverviewDashboard({
  routeData = [],
  alerts = [],
  onNavigateTab,
  onSelectRouteForCompare,
  sourceClusterName = 'Pulivendula (Kadapa)'
}) {
  // Sort routes into opportunities & high risk
  const topOpportunities = routeData
    .filter((r) => r.net_margin > 2.0)
    .slice(0, 4);

  const highRiskRoutes = routeData
    .filter((r) => r.risk_level === 'HIGH' || r.net_margin < 0)
    .slice(0, 3);

  const recommendedToday = routeData
    .filter((r) => r.trade_viability_score >= 70)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Top Cockpit Ticker Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="cockpit-panel p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>TOP ARBITRAGE ROUTE</span>
            <span className="text-emerald-400 font-bold">LIVE</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 tabular-nums">
            +Rs. {topOpportunities[0]?.net_margin?.toFixed(2) || '4.85'} /kg
          </div>
          <div className="text-xs text-slate-300 truncate mt-0.5">
            {sourceClusterName} ➡️ {topOpportunities[0]?.destination_market || 'Azadpur Delhi'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Est. Lot Profit: Rs. {topOpportunities[0]?.total_lot_profit?.toLocaleString() || '77,600'}
          </div>
        </div>

        <div className="cockpit-panel p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ACTIVE G9 DESTINATIONS</span>
            <span className="text-blue-400 font-bold">{routeData.length || 9} CONFIRMED</span>
          </div>
          <div className="text-xl font-bold text-white tabular-nums">
            {routeData.filter((r) => r.net_margin > 0).length} / {routeData.length || 9} Profitable
          </div>
          <div className="text-xs text-slate-300 truncate mt-0.5">
            Avg Route Spread: Rs. {(routeData.reduce((acc, r) => acc + r.gross_spread, 0) / (routeData.length || 1)).toFixed(2)} /kg
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Truck Corridor: NH44 North & NH48 West (Normal Open/Tarpaulin)
          </div>
        </div>

        <div className="cockpit-panel p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ML FORECAST SENTIMENT</span>
            <span className="text-amber-400 font-bold">7-DAY</span>
          </div>
          <div className="text-xl font-bold text-amber-400 tabular-nums flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            BULLISH (+Rs. 1.40)
          </div>
          <div className="text-xs text-slate-300 truncate mt-0.5">
            North terminals showing arrival squeeze
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ridge ML Confidence: 86%
          </div>
        </div>

        <div className="cockpit-panel p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>COMMITTED BUYER DEMAND</span>
            <span className="text-purple-400 font-bold">WEEKLY</span>
          </div>
          <div className="text-xl font-bold text-purple-300 tabular-nums">
            480.0 MT
          </div>
          <div className="text-xs text-slate-300 truncate mt-0.5">
            6 Key Buyer Contracts (Reliance, BB, Ninja)
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            94% Payment Reliability Rating
          </div>
        </div>
      </div>

      {/* Act Now Recommendations Header */}
      <div className="cockpit-panel p-4 bg-gradient-to-r from-[#141e30] via-[#101826] to-[#141e30] border-amber-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              "Act Now" Operational Dispatch Recommendations
            </h3>
            <span className="badge badge-banana">Today's Priority</span>
          </div>
          <button
            onClick={() => onNavigateTab('trade-calculator')}
            className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
          >
            Open Trade P&L Simulator <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topOpportunities.slice(0, 3).map((r, i) => (
            <div
              key={r.destination_market}
              className="cockpit-card p-3 border-l-4 border-l-emerald-500 hover:bg-[#1f2b42] transition-colors cursor-pointer"
              onClick={() => onSelectRouteForCompare(r.destination_market)}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white truncate">{r.destination_market}</span>
                <span className="badge badge-success">Score: {r.trade_viability_score}/100</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span className="text-[11px] text-slate-400">Net Margin: </span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    +Rs. {r.net_margin.toFixed(2)}/kg
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 block tabular-nums">
                    +Rs. {(r.net_margin * 15).toFixed(0)} / 15kg crate
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Truck Profit: </span>
                  <span className="text-xs font-semibold text-slate-200 tabular-nums">
                    Rs. {r.total_lot_profit?.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#243048] flex items-center justify-between text-[11px] text-slate-400">
                <span>Dist: {r.distance_km} km ({r.transit_hours} hrs)</span>
                <span className="text-amber-400 font-medium">Normal Truck (16 MT)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Recommended Routes vs Risk Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recommended Routes (2 Cols) */}
        <div className="lg:col-span-2 cockpit-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Recommended Destination Corridors</h3>
              <p className="text-xs text-slate-400">
                Ranked by risk-adjusted net margin from {sourceClusterName}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('live-markets')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            >
              View All Mandis <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#131b2b] text-slate-400 border-b border-[#243048]">
                <tr>
                  <th className="py-2.5 px-3">Destination Mandi</th>
                  <th className="py-2.5 px-2">Dist (km)</th>
                  <th className="py-2.5 px-2">Mandi Price</th>
                  <th className="py-2.5 px-2">Freight & Loss</th>
                  <th className="py-2.5 px-2">Net Margin</th>
                  <th className="py-2.5 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {recommendedToday.map((route) => (
                  <tr
                    key={route.destination_market}
                    className="hover:bg-[#162032] transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div>{route.destination_market}</div>
                      <div className="text-[10px] text-slate-400">
                        Break-even: Rs. {route.break_even_price.toFixed(2)}/kg
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-slate-300 tabular-nums">
                      {route.distance_km}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-slate-200 tabular-nums">
                      Rs. {route.dest_modal_price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-slate-300 tabular-nums">
                      Rs. {(route.freight_cost + route.transit_shrinkage_cost).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 tabular-nums">
                      <span className={`font-bold ${route.net_margin >= 3.0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                        +Rs. {route.net_margin.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`badge ${
                          route.recommended_action.includes('EXECUTE')
                            ? 'badge-success'
                            : 'badge-info'
                        }`}
                      >
                        {route.recommended_action.split(' ')[0]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* High Risk Routes & Live Alert Feed (1 Col) */}
        <div className="space-y-4">
          {/* High-Risk Routes Watchlist */}
          <div className="cockpit-panel p-4">
            <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Corridors to Avoid Today</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Unfavorable freight/spread ratio or high transit loss
            </p>
            <div className="space-y-2">
              {highRiskRoutes.map((r) => (
                <div
                  key={r.destination_market}
                  className="p-2.5 rounded bg-[#162032] border border-[#243048] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{r.destination_market}</div>
                    <div className="text-[10px] text-slate-400">
                      Dist: {r.distance_km}km | Shrinkage: {r.transit_shrinkage_pct}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-400 tabular-nums">
                      {r.net_margin <= 0 ? `-Rs. ${Math.abs(r.net_margin).toFixed(2)}` : `+Rs. ${r.net_margin.toFixed(2)}`}
                    </div>
                    <span className="text-[10px] text-rose-400 font-medium">Negative/Weak</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Alerts Watchlist */}
          <div className="cockpit-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Live Spread & Price Alerts</span>
              </div>
              <button
                onClick={() => onNavigateTab('alerts-center')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                All Alerts
              </button>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-2 rounded bg-[#162032] border border-[#243048] text-xs hover:border-[#38bdf8] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate pr-2">{a.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{a.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
