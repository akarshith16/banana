import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  UserCheck,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { fetchProcurementSchedule } from '../api';

export default function ProcurementPlanner() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCluster, setFilterCluster] = useState('ALL');

  const loadLots = async () => {
    setLoading(true);
    try {
      const data = await fetchProcurementSchedule();
      setLots(data);
    } catch (err) {
      console.error('Failed to load lots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLots();
  }, []);

  const totalHarvestTonnage = lots.reduce((acc, l) => acc + l.estimated_yield_mt, 0);
  const committedTonnage = lots
    .filter((l) => l.committed_status === 'Allocated')
    .reduce((acc, l) => acc + l.estimated_yield_mt, 0);
  const availableSurplus = totalHarvestTonnage - committedTonnage;

  const filteredLots = lots.filter(
    (l) => filterCluster === 'ALL' || l.cluster.toLowerCase().includes(filterCluster.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Tonnage & Gap Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Expected 7-Day Harvest
          </span>
          <div className="text-xl font-bold text-white tabular-nums">
            {totalHarvestTonnage.toFixed(1)} MT
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Across 5 Key AP Farm Belts
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Allocated to Confirmed Buyers
          </span>
          <div className="text-xl font-bold text-blue-400 tabular-nums">
            {committedTonnage.toFixed(1)} MT
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Reliance & Vashi Forward Bookings
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Available Surplus / Gap
          </span>
          <div className="text-xl font-bold text-emerald-400 tabular-nums">
            {availableSurplus.toFixed(1)} MT
          </div>
          <span className="text-[11px] text-emerald-400 block mt-0.5">
            Ready for Spot Dispatch
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Average Quality Calibration
          </span>
          <div className="text-xl font-bold text-amber-400 tabular-nums">
            18.4° Brix
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Grade A Average: 76.4%
          </span>
        </div>
      </div>

      {/* Farm Harvest Schedule Table */}
      <div className="cockpit-panel p-4">
        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="font-bold text-sm text-white">
              Andhra Pradesh Farmer Harvest Schedule & Lot Allocation
            </h3>
            <p className="text-xs text-slate-400">
              Track ready-to-cut harvest dates, acreage, Grade A/B split, and designated dispatch market
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter Cluster:</span>
            <select
              value={filterCluster}
              onChange={(e) => setFilterCluster(e.target.value)}
              className="bg-[#162032] border border-[#243048] rounded px-2.5 py-1 text-white font-semibold focus:outline-none"
            >
              <option value="ALL">All AP Clusters</option>
              <option value="Pulivendula">Pulivendula Belt</option>
              <option value="Tadipatri">Tadipatri Belt</option>
              <option value="Anantapur">Anantapur Rural</option>
              <option value="Kurnool">Kurnool / Dhone</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#131b2b] text-slate-400 border-b border-[#243048]">
              <tr>
                <th className="py-2.5 px-3">Lot ID & Farmer Group</th>
                <th className="py-2.5 px-2">Cluster / Mandal</th>
                <th className="py-2.5 px-2">Acreage</th>
                <th className="py-2.5 px-2">Cut Readiness</th>
                <th className="py-2.5 px-2 text-right">Est. Yield (MT)</th>
                <th className="py-2.5 px-2 text-center">Grade A / B</th>
                <th className="py-2.5 px-2 text-center">Brix Sugar</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-3">Assigned Destination Corridor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredLots.map((lot) => (
                <tr key={lot.id} className="hover:bg-[#162032] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <div>{lot.farmer_name}</div>
                    <span className="text-[10px] text-amber-400 font-mono">{lot.id}</span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-300">
                    <div>{lot.cluster}</div>
                    <span className="text-[10px] text-slate-400">
                      {lot.mandal}, {lot.district}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-300 tabular-nums">{lot.acreage} ac</td>
                  <td className="py-2.5 px-2 text-slate-200 tabular-nums font-medium">
                    {lot.cut_readiness_date}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-white tabular-nums">
                    {lot.estimated_yield_mt.toFixed(1)} MT
                  </td>
                  <td className="py-2.5 px-2 text-center tabular-nums">
                    <span className="text-emerald-400 font-semibold">{lot.grade_a_pct}%</span> /{' '}
                    <span className="text-slate-400">{lot.grade_b_pct}%</span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-semibold text-amber-300 tabular-nums">
                    {lot.quality_brix_calibration}°
                  </td>
                  <td className="py-2.5 px-2">
                    <span
                      className={`badge ${
                        lot.committed_status === 'Allocated'
                          ? 'badge-info'
                          : lot.committed_status === 'Available'
                          ? 'badge-success'
                          : 'badge-banana'
                      }`}
                    >
                      {lot.committed_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{lot.assigned_destination}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
