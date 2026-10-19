import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Percent,
  Truck,
  Box,
  Layers,
  ArrowRight,
  Printer,
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { simulateTradeLot } from '../api';

export default function TradeCalculator({
  sourceClusterName = 'Pulivendula (Kadapa)',
  defaultDestId = 'delhi_azadpur'
}) {
  const [lotSizeMt, setLotSizeMt] = useState(16.0);
  const [crateWeightKg, setCrateWeightKg] = useState(15.0); // 15kg Mandi Crate default
  const [unitMode, setUnitMode] = useState('both'); // 'both' | 'crate' | 'kg'
  const [purchasePrice, setPurchasePrice] = useState(14.50);
  const [destId, setDestId] = useState(defaultDestId);
  const [freightRate, setFreightRate] = useState(4.10); // Normal truck freight for Delhi
  const [labourCost, setLabourCost] = useState(0.85);
  const [crateCost, setCrateCost] = useState(2.50); // Crate rental / washing / liner charge
  const [hamali, setHamali] = useState(0.40); // Rs. 6 per 15kg crate
  const [mandiCessPct, setMandiCessPct] = useState(1.5);
  const [includeRipening, setIncludeRipening] = useState(false);
  const [ripeningCost, setRipeningCost] = useState(1.60);
  const [creditDays, setCreditDays] = useState(14);
  const [capitalRate, setCapitalRate] = useState(14.0);
  const [salePriceOverride, setSalePriceOverride] = useState(28.50);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Standard domestic normal truck (open body / tarpaulin) freight rates
  const destinations = [
    { id: 'srinagar_parimpora', name: 'Parimpora Fruit Mandi (Srinagar, J&K)', defaultFreight: 5.60 },
    { id: 'mumbai_vashi', name: 'Vashi APMC Fruit Market (Mumbai)', defaultFreight: 2.30 },
    { id: 'delhi_azadpur', name: 'Azadpur APMC Mandi (Delhi)', defaultFreight: 4.10 },
    { id: 'kolkata_posta', name: 'Mechua Fruit Market (Kolkata)', defaultFreight: 3.80 },
    { id: 'bengaluru_binny', name: 'Binny Mill & Singena Agrahara (Bengaluru)', defaultFreight: 1.00 },
    { id: 'hyderabad_batasingaram', name: 'Batasingaram & Bowenpally (Hyderabad)', defaultFreight: 1.10 },
    { id: 'ahmedabad_naroda', name: 'Naroda APMC Mandi (Ahmedabad)', defaultFreight: 3.20 },
    { id: 'jaipur_muhana', name: 'Muhana Mandi Terminal (Jaipur)', defaultFreight: 3.70 },
    { id: 'jnpt_export_packhouse', name: 'JNPT Port Agro-Packhouse (Export Transit)', defaultFreight: 2.50 }
  ];

  const handleDestChange = (newDestId) => {
    setDestId(newDestId);
    const dest = destinations.find((d) => d.id === newDestId);
    if (dest) {
      setFreightRate(dest.defaultFreight);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        source_cluster: sourceClusterName,
        destination_id: destId,
        commodity: 'Banana',
        variety: 'G9 Cavendish',
        lot_size_mt: lotSizeMt,
        crate_weight_kg: crateWeightKg,
        truck_type: 'normal',
        purchase_price_rs_kg: purchasePrice,
        custom_freight_rs_kg: freightRate,
        labour_cost_rs_kg: labourCost,
        crate_box_cost_rs_kg: crateCost,
        hamali_rs_kg: hamali,
        mandi_cess_pct: mandiCessPct,
        include_ripening: includeRipening,
        ripening_cost_rs_kg: ripeningCost,
        credit_days: creditDays,
        capital_cost_pct_annual: capitalRate,
        target_sale_price_override: salePriceOverride
      };
      const res = await simulateTradeLot(payload);
      setSimResult(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [
    lotSizeMt,
    crateWeightKg,
    purchasePrice,
    destId,
    freightRate,
    labourCost,
    crateCost,
    hamali,
    mandiCessPct,
    includeRipening,
    ripeningCost,
    creditDays,
    capitalRate,
    salePriceOverride
  ]);

  const econ = simResult?.economics;
  const sensMatrix = simResult?.sensitivity_matrix || [];

  const totalCrates = Math.round((lotSizeMt * 1000) / (crateWeightKg || 15));
  const purchasePricePerCrate = purchasePrice * crateWeightKg;
  const salePricePerCrate = salePriceOverride * crateWeightKg;
  const freightPerCrate = freightRate * crateWeightKg;
  const hamaliPerCrate = hamali * crateWeightKg;
  const crateCostPerCrate = crateCost * crateWeightKg;

  return (
    <div className="space-y-4">
      {/* Simulation Controls & Output Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Input Parameters Form (2 Cols) */}
        <div className="lg:col-span-2 cockpit-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Normal Truck & Crate-Wise Trade P&L Calculator
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard 16 MT open/tarpaulin truck logistics • Real-time mandi crate pricing
              </p>
            </div>

            {/* Unit Mode Toggle & Print */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#131b2b] border border-[#243048] rounded p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setUnitMode('both')}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    unitMode === 'both' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dual View (Kg & Crate)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('crate')}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    unitMode === 'crate' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Per Crate Only
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('kg')}
                  className={`px-2 py-1 rounded font-semibold transition-colors ${
                    unitMode === 'kg' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Per Kg Only
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#162032] hover:bg-[#202d46] border border-[#243048] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Crate Weight & Vehicle Presets Banner */}
          <div className="bg-[#131b2b] border border-[#243048] rounded p-2.5 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold">Crate / Box Standard:</span>
              <div className="flex gap-1.5">
                {[
                  { label: '15 kg Mandi Crate', val: 15.0 },
                  { label: '13 kg CFB Box', val: 13.0 },
                  { label: '20 kg Heavy Crate', val: 20.0 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setCrateWeightKg(preset.val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      crateWeightKg === preset.val
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-[#162032] border-[#243048] text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-slate-300 text-[11px]">
              <span className="text-slate-400">Normal 16 MT Truck: </span>
              <strong className="text-amber-400 tabular-nums">{totalCrates} crates</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Lot size */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Lot Size (MT)</label>
              <input
                type="number"
                step="1"
                value={lotSizeMt}
                onChange={(e) => setLotSizeMt(parseFloat(e.target.value) || 16)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard 10-wheeler: 16 MT (~{totalCrates} crates)
              </span>
            </div>

            {/* Farmgate purchase price */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-semibold">Farmgate Purchase</label>
                <span className="text-[10px] text-amber-300 font-bold">
                  Rs. {purchasePricePerCrate.toFixed(1)} / crate
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 14)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                Source: {sourceClusterName}
              </span>
            </div>

            {/* Destination Mandi */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Destination Mandi</label>
              <select
                value={destId}
                onChange={(e) => handleDestChange(e.target.value)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400 truncate"
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#162032] text-white">
                    {d.name}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">
                Normal Truck Route Active
              </span>
            </div>

            {/* Target Selling Price */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-semibold">Expected Sale Price</label>
                <span className="text-[10px] text-emerald-300 font-bold">
                  Rs. {salePricePerCrate.toFixed(1)} / crate
                </span>
              </div>
              <input
                type="number"
                step="0.25"
                value={salePriceOverride}
                onChange={(e) => setSalePriceOverride(parseFloat(e.target.value) || 28)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Target clearing auction rate
              </span>
            </div>

            {/* Freight rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-semibold">Normal Truck Freight</label>
                <span className="text-[10px] text-slate-300 font-bold">
                  Rs. {freightPerCrate.toFixed(1)} / crate
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                value={freightRate}
                onChange={(e) => setFreightRate(parseFloat(e.target.value) || 4)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Open/Tarpaulin truck (₹{freightRate}/kg)
              </span>
            </div>

            {/* Crate cost */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-semibold">Crate / Box Cost</label>
                <span className="text-[10px] text-slate-300 font-bold">
                  Rs. {crateCostPerCrate.toFixed(1)} / crate
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                value={crateCost}
                onChange={(e) => setCrateCost(parseFloat(e.target.value) || 2.5)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Crate amortization / liner / paper
              </span>
            </div>

            {/* Labour cost */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Harvest Labour & Wash (Rs/kg)
              </label>
              <input
                type="number"
                step="0.05"
                value={labourCost}
                onChange={(e) => setLabourCost(parseFloat(e.target.value) || 0.85)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Rs. {(labourCost * crateWeightKg).toFixed(1)} / crate
              </span>
            </div>

            {/* Loading/Unloading Hamali */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 font-semibold">Hamali (Loading+Unload)</label>
                <span className="text-[10px] text-amber-300 font-bold">
                  Rs. {hamaliPerCrate.toFixed(1)} / crate
                </span>
              </div>
              <input
                type="number"
                step="0.05"
                value={hamali}
                onChange={(e) => setHamali(parseFloat(e.target.value) || 0.4)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Mandi unloading typically ₹6 - ₹8/crate
              </span>
            </div>

            {/* Mandi cess */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Mandi Cess & Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={mandiCessPct}
                onChange={(e) => setMandiCessPct(parseFloat(e.target.value) || 1.5)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Destination APMC statutory charge
              </span>
            </div>

            {/* Credit days */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Payment Credit Cycle (Days)
              </label>
              <input
                type="number"
                step="1"
                value={creditDays}
                onChange={(e) => setCreditDays(parseInt(e.target.value) || 14)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Cost of capital */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Working Capital Interest (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={capitalRate}
                onChange={(e) => setCapitalRate(parseFloat(e.target.value) || 14)}
                className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Ripening Toggle */}
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="ripening_check"
                checked={includeRipening}
                onChange={(e) => setIncludeRipening(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-[#162032] border-[#243048] cursor-pointer"
              />
              <label htmlFor="ripening_check" className="text-slate-300 font-semibold cursor-pointer">
                Include Chamber Ripening (+Rs. 1.60/kg)
              </label>
            </div>
          </div>
        </div>

        {/* Live Simulation Results Card (1 Col) */}
        {econ && (
          <div className="cockpit-panel p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  Simulation Outcome
                </span>
                <span className="badge badge-banana text-[10px]">
                  {crateWeightKg}kg Crate Basis
                </span>
              </div>

              {/* Main Margin Display: Kg & Crate */}
              <div className="mt-2">
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  +Rs. {econ.net_margin.toFixed(2)} /kg
                </div>
                <div className="text-lg font-bold text-amber-300 tabular-nums">
                  +Rs. {(econ.net_margin_per_crate || econ.net_margin * crateWeightKg).toFixed(2)} / crate
                </div>
                <span className="text-xs text-slate-300 block mt-0.5">
                  Normal Truck Risk-Adjusted Net Profit
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#243048] space-y-2 text-xs">
                <div className="flex justify-between items-center bg-[#131b2b] p-2 rounded border border-[#243048]">
                  <span className="text-slate-300 font-semibold">Total Truck Net Profit:</span>
                  <span className="font-bold text-emerald-400 tabular-nums text-base">
                    Rs. {econ.total_lot_profit?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Total Crates in Truck:</span>
                  <span className="font-bold text-white tabular-nums">
                    {totalCrates} crates (16 MT Normal Truck)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Break-even Mandi Price:</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    Rs. {econ.break_even_price.toFixed(2)}/kg (Rs. {(econ.break_even_price * crateWeightKg).toFixed(1)}/cr)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Total Landed Logistics Cost:</span>
                  <span className="font-semibold text-rose-300 tabular-nums">
                    Rs. {econ.total_logistics_cost.toFixed(2)}/kg (Rs. {(econ.total_logistics_cost * crateWeightKg).toFixed(1)}/cr)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Normal Truck Freight:</span>
                  <span className="font-medium text-slate-300 tabular-nums">
                    Rs. {econ.freight_cost.toFixed(2)}/kg (Rs. {(econ.freight_cost * crateWeightKg).toFixed(1)}/cr)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Hamali (Loading+Unload):</span>
                  <span className="font-medium text-slate-300 tabular-nums">
                    Rs. {hamaliPerCrate.toFixed(1)} / crate
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Transit Shrinkage:</span>
                  <span className="font-medium text-slate-300 tabular-nums">
                    {econ.transit_shrinkage_pct}% (Rs. {econ.transit_shrinkage_cost.toFixed(2)}/kg)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#243048]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Viability Score:</span>
                <span className="font-bold text-amber-400">{econ.trade_viability_score}/100</span>
              </div>
              <div className="w-full bg-[#162032] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full"
                  style={{ width: `${econ.trade_viability_score}%` }}
                ></div>
              </div>
              <span className="badge badge-success mt-2 block text-center">
                {econ.recommended_action}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5x5 Sensitivity Matrix: Selling Price vs Normal Truck Freight Variance */}
      {sensMatrix.length > 0 && (
        <div className="cockpit-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              5x5 Sensitivity Matrix (Mandi Sale Price vs Normal Truck Freight Variance)
            </h4>
            <span className="text-[11px] text-amber-300 font-semibold">
              Showing Net Margin per Crate ({crateWeightKg}kg) & Total Truck Profit
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Simulates dynamic mandi auction rates and transport freight shifts across India
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#131b2b] text-slate-400">
                <tr>
                  <th className="py-2 px-3 text-left">Truck Freight \ Sale Rate</th>
                  {sensMatrix[0].columns.map((col, i) => (
                    <th key={i} className="py-2 px-3 text-slate-200">
                      <div>Rs. {col.sale_price.toFixed(2)}/kg</div>
                      <div className="text-[10px] text-emerald-400 font-normal">
                        Rs. {(col.sale_price_crate || col.sale_price * crateWeightKg).toFixed(0)}/crate
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {sensMatrix.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#162032]">
                    <td className="py-2 px-3 font-semibold text-slate-300 text-left">
                      <div>Rs. {row.freight_per_kg.toFixed(2)}/kg</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Rs. {(row.freight_per_crate || row.freight_per_kg * crateWeightKg).toFixed(1)}/cr
                      </div>
                    </td>
                    {row.columns.map((cell, cIdx) => {
                      const isPos = cell.net_margin_kg > 0;
                      const crateMargin = cell.net_margin_crate || cell.net_margin_kg * crateWeightKg;
                      return (
                        <td
                          key={cIdx}
                          className={`py-2 px-3 tabular-nums font-semibold ${
                            cell.net_margin_kg >= 3.0
                              ? 'bg-emerald-950/40 text-emerald-300'
                              : isPos
                              ? 'text-slate-200'
                              : 'bg-rose-950/40 text-rose-400'
                          }`}
                        >
                          <div>
                            {cell.net_margin_kg >= 0
                              ? `+Rs. ${cell.net_margin_kg.toFixed(2)}/kg`
                              : `-Rs. ${Math.abs(cell.net_margin_kg).toFixed(2)}/kg`}
                          </div>
                          <div className="text-[11px] font-bold text-amber-300">
                            {crateMargin >= 0
                              ? `+Rs. ${crateMargin.toFixed(0)}/cr`
                              : `-Rs. ${Math.abs(crateMargin).toFixed(0)}/cr`}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                            Total: Rs. {Math.round(cell.total_profit / 1000)}k
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
