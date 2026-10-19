import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { fetchBuyers } from '../api';

export default function BuyerDemandBoard() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const data = await fetchBuyers();
      setBuyers(data);
    } catch (err) {
      console.error('Failed to load buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, []);

  const totalWeeklyOfftake = buyers.reduce((acc, b) => acc + b.weekly_offtake_mt, 0);
  const totalRfqTonnage = buyers.reduce((acc, b) => acc + b.active_rfq_tonnage, 0);

  return (
    <div className="space-y-4">
      {/* Buyer Board Metrics Top Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Total Committed Buyer Offtake
          </span>
          <div className="text-xl font-bold text-white tabular-nums">
            {totalWeeklyOfftake.toFixed(1)} MT / week
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            6 Key Enterprise Accounts
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Active Spot RFQs Tonnage
          </span>
          <div className="text-xl font-bold text-amber-400 tabular-nums">
            {totalRfqTonnage.toFixed(1)} MT
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Requires AP Allocation Today
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Average Payment Cycle
          </span>
          <div className="text-xl font-bold text-emerald-400 tabular-nums">
            7.6 Days
          </div>
          <span className="text-[11px] text-emerald-400 block mt-0.5">
            Very Low Working Capital Drag
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Average Repeat Order Likelihood
          </span>
          <div className="text-xl font-bold text-blue-400 tabular-nums">
            91.2%
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            High Demand Stickiness
          </span>
        </div>
      </div>

      {/* Buyer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            className="cockpit-panel p-4 flex flex-col justify-between hover:border-[#38bdf8] transition-colors"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-sm text-white">{buyer.buyer_name}</h4>
                  <span className="text-[11px] text-amber-400 font-medium">{buyer.segment}</span>
                </div>
                <span
                  className={`badge ${
                    buyer.reliability_rating.includes('AAA')
                      ? 'badge-success'
                      : buyer.reliability_rating.includes('AA')
                      ? 'badge-info'
                      : 'badge-warning'
                  }`}
                >
                  Rating: {buyer.reliability_rating}
                </span>
              </div>

              {/* Destination Drop Point */}
              <div className="text-xs text-slate-300 mb-3 p-2 rounded bg-[#162032] border border-[#243048]">
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                  Delivery Drop Point:
                </span>
                <span className="font-medium text-white">{buyer.destination_market}</span>
              </div>

              {/* Specifications & Offtake */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Weekly Offtake:</span>
                  <span className="font-bold text-white tabular-nums">
                    {buyer.weekly_offtake_mt} MT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Spot RFQ:</span>
                  <span className="font-bold text-amber-400 tabular-nums">
                    {buyer.active_rfq_tonnage} MT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivered Price Ceiling:</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">
                    Rs. {buyer.max_delivered_price_rs_kg.toFixed(2)} /kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Credit Terms:</span>
                  <span className="font-medium text-slate-200 tabular-nums">
                    {buyer.payment_terms_days} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Repeat Order Probability:</span>
                  <span className="font-bold text-blue-300 tabular-nums">
                    {buyer.repeat_order_probability_pct}%
                  </span>
                </div>
              </div>

              {/* Preferred Grade Spec */}
              <div className="mt-3 pt-2.5 border-t border-[#243048] text-xs">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-0.5">
                  Quality & Grade Specs:
                </span>
                <p className="text-[11px] text-slate-300 line-clamp-2">{buyer.preferred_grade}</p>
              </div>
            </div>

            {/* Bottom action */}
            <div className="mt-4 pt-3 border-t border-[#243048] flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-medium">● Contract Active</span>
              <button className="px-2.5 py-1 rounded bg-[#202d46] hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1">
                Allocate Lot <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
