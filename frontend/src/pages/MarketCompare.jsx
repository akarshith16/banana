import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Truck,
  Box,
  Layers,
  Percent,
  DollarSign
} from 'lucide-react';
import { fetchMarketCompare } from '../api';

export default function MarketCompare({
  sourceClusterId = 'ap_pulivendula',
  initialDestName = 'Azadpur APMC Mandi',
  destinationsList = []
}) {
  const [selectedSource, setSelectedSource] = useState(sourceClusterId);
  const [selectedDestId, setSelectedDestId] = useState('delhi_azadpur');
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);

  const sources = [
    { id: 'ap_pulivendula', name: 'Pulivendula Banana Cluster (Kadapa)' },
    { id: 'ap_tadipatri', name: 'Tadipatri Commercial Belt (Anantapur)' },
    { id: 'ap_anantapur_rural', name: 'Anantapur Rural & Raptadu' },
    { id: 'ap_kurnool_dhone', name: 'Dhone-Kurnool Agri Hub' },
    { id: 'ap_ravulapalem', name: 'Ravulapalem Banana Market' }
  ];

  const destinationOptions = [
    { id: 'srinagar_parimpora', name: 'Parimpora Fruit Mandi (Srinagar, J&K)' },
    { id: 'mumbai_vashi', name: 'Vashi APMC Fruit Market (Mumbai)' },
    { id: 'delhi_azadpur', name: 'Azadpur APMC Mandi (Delhi)' },
    { id: 'kolkata_posta', name: 'Mechua Fruit Market (Kolkata)' },
    { id: 'bengaluru_binny', name: 'Binny Mill & Singena Agrahara (Bengaluru)' },
    { id: 'hyderabad_batasingaram', name: 'Batasingaram & Bowenpally (Hyderabad)' },
    { id: 'ahmedabad_naroda', name: 'Naroda APMC Mandi (Ahmedabad)' },
    { id: 'jaipur_muhana', name: 'Muhana Mandi Terminal (Jaipur)' },
    { id: 'jnpt_export_packhouse', name: 'JNPT Port Agro-Packhouse (Export Transit)' }
  ];

  const loadComparison = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketCompare(selectedSource, selectedDestId);
      setCompareData(data);
    } catch (err) {
      console.error('Failed to load compare:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [selectedSource, selectedDestId]);

  const econ = compareData?.economics;
  const isProfitable = econ?.net_margin > 0;

  return (
    <div className="space-y-4">
      {/* Selector Header */}
      <div className="cockpit-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Selector */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              AP Sourcing Base
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#162032] text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-amber-400 mt-5">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Destination Selector */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Pan-India Destination Mandi
            </label>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
            >
              {destinationOptions.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#162032] text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trade Recommendation Badge & Action Buttons */}
        {econ && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Decision Verdict</span>
              <span
                className={`text-sm font-bold ${
                  econ.net_margin >= 3.0 ? 'text-emerald-400' : isProfitable ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {econ.recommended_action}
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#162032] border border-[#243048]">
              <span className="text-xs text-slate-400">Score: </span>
              <span className="text-base font-bold text-amber-400">{econ.trade_viability_score}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onOpenVerification) onOpenVerification(selectedDestId);
                }}
                className="px-3 py-1.5 rounded bg-blue-950/60 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Verify Price</span>
              </button>
              <button
                onClick={() => {
                  if (onNavigateToBuyers) onNavigateToBuyers();
                }}
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Sell This Load</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {econ && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Summary Economics & Arbitrage Gauge (1 Col) */}
          <div className="space-y-4">
            <div className="cockpit-panel p-4">
              <h3 className="font-bold text-sm text-white mb-3">Arbitrage Economics Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded bg-[#162032] border border-[#243048] flex justify-between items-center">
                  <span className="text-slate-400">Source Farmgate Price:</span>
                  <span className="font-bold text-white tabular-nums">
                    Rs. {econ.source_purchase_price.toFixed(2)} /kg
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#162032] border border-[#243048] flex justify-between items-center">
                  <span className="text-slate-400">Destination Modal Price:</span>
                  <span className="font-bold text-amber-400 tabular-nums">
                    Rs. {econ.dest_modal_price.toFixed(2)} /kg
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#162032] border border-[#243048] flex justify-between items-center">
                  <span className="text-slate-400">Gross Price Spread:</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    +Rs. {econ.gross_spread.toFixed(2)} /kg
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#162032] border border-[#243048] flex justify-between items-center">
                  <span className="text-slate-400">Total Landed Costs:</span>
                  <span className="font-semibold text-rose-300 tabular-nums">
                    -Rs. {econ.total_logistics_cost.toFixed(2)} /kg
                  </span>
                </div>
                <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/30 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Risk-Adjusted Net Margin:</span>
                  <span className={`font-bold tabular-nums ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {econ.net_margin >= 0 ? `+Rs. ${econ.net_margin.toFixed(2)}` : `-Rs. ${Math.abs(econ.net_margin).toFixed(2)}`} /kg
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#162032] border border-[#243048] flex justify-between items-center">
                  <span className="text-slate-400">Est. Total Lot Profit (16 MT):</span>
                  <span className="font-bold text-white tabular-nums text-sm">
                    Rs. {econ.total_lot_profit?.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#162032] border border-[#243048] flex justify-between items-center">
                  <span className="text-slate-400">Break-even Selling Price:</span>
                  <span className="font-medium text-slate-300 tabular-nums">
                    Rs. {econ.break_even_price.toFixed(2)} /kg
                  </span>
                </div>
              </div>
            </div>

            {/* Grade Realization comparison */}
            <div className="cockpit-panel p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Grade Realization Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-[#162032]">
                  <span className="text-slate-300">Grade A (Premium Retail Spec):</span>
                  <span className="font-bold text-emerald-400 tabular-nums">
                    +Rs. {econ.grade_a_margin.toFixed(2)} /kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-[#162032]">
                  <span className="text-slate-300">Grade B (Standard Wholesale):</span>
                  <span className="font-bold text-slate-200 tabular-nums">
                    +Rs. {econ.grade_b_margin.toFixed(2)} /kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Landed Cost Waterfall Breakdown (2 Cols) */}
          <div className="lg:col-span-2 cockpit-panel p-4">
            <h3 className="font-bold text-sm text-white mb-1">
              Landed Cost Waterfall ({econ.distance_km} km | {econ.transit_hours} hrs transit)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Itemized commercial and logistics cost components per kg of saleable fruit
            </p>

            <div className="space-y-2 text-xs">
              {/* Cost items */}
              {[
                {
                  label: 'Normal Truck Transport (Open/Tarpaulin)',
                  cost: econ.freight_cost,
                  desc: `${econ.distance_km} km distance at standard highway open-truck freight`
                },
                {
                  label: 'Harvest Labour & Sanitized Alum Wash',
                  cost: econ.labour_harvest_wash,
                  desc: 'Farm harvest, de-handing, destemming & dipping'
                },
                {
                  label: '13kg Corrugated CFB Box / Crates',
                  cost: econ.crate_packaging,
                  desc: '5-ply telescopic carton + foam padding'
                },
                {
                  label: 'Loading & Unloading Hamali Charges',
                  cost: econ.loading_unloading_hamali,
                  desc: 'Farm gate loading and destination mandi unloading'
                },
                {
                  label: 'Destination APMC Mandi Cess & Commission',
                  cost: econ.mandi_commission_cess,
                  desc: 'Statutory market committee user charges'
                },
                {
                  label: `Route Transit Loss / Shrinkage (${econ.transit_shrinkage_pct}%)`,
                  cost: econ.transit_shrinkage_cost,
                  desc: 'Natural moisture evaporation & transit damage decay'
                },
                {
                  label: 'Ethylene Ripening Chamber (Optional)',
                  cost: econ.ripening_cost,
                  desc: 'Controlled temperature ripening facility'
                },
                {
                  label: 'Payment Cycle Working Capital Cost',
                  cost: econ.payment_cycle_finance_cost,
                  desc: 'Finance cost over 14-day trade credit period @ 14% p.a.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-[#162032] border border-[#243048] flex items-center justify-between hover:bg-[#1a253a] transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-300 tabular-nums">
                      Rs. {item.cost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">per kg</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Cost Summary Line */}
            <div className="mt-4 p-3 rounded bg-[#131b2b] border border-[#243048] flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Total Landed Operating Expenses:</span>
              <span className="font-bold text-rose-400 text-sm tabular-nums">
                Rs. {econ.total_logistics_cost.toFixed(2)} /kg
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
