import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpDown,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { fetchVerificationAll } from '../api';
import PriceVerificationDrawer from '../components/PriceVerificationDrawer';

export default function PriceVerificationConsole({ onSelectMarketForCompare }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mismatchFilter, setMismatchFilter] = useState('ALL');
  const [activeDrawerMarketId, setActiveDrawerMarketId] = useState(null);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchVerificationAll();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.displayed_market_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.official_market_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.state.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.verification_status === statusFilter;

      let matchesMismatch = true;
      if (mismatchFilter === 'SYNTHETIC_NAME') {
        matchesMismatch = r.warnings.some((w) => w.includes('COMPOSITE') || w.includes('LABEL'));
      } else if (mismatchFilter === 'VARIETY_INFERRED') {
        matchesMismatch = r.variety_confidence !== 'Exact Match';
      } else if (mismatchFilter === 'NON_APMC') {
        matchesMismatch = r.market_type !== 'Official Mandi';
      } else if (mismatchFilter === 'CONFLICT') {
        matchesMismatch = r.verification_status === 'Source Conflict';
      }

      return matchesSearch && matchesStatus && matchesMismatch;
    });
  }, [records, searchTerm, statusFilter, mismatchFilter]);

  const verifiedCount = records.filter((r) => r.verification_status === 'Verified').length;
  const partialCount = records.filter((r) => r.verification_status === 'Partially Verified').length;
  const conflictCount = records.filter((r) => r.verification_status === 'Source Conflict').length;

  return (
    <div className="space-y-4">
      {/* Top Console Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Total Mandis Audited
          </span>
          <div className="text-xl font-bold text-white tabular-nums">
            {records.length} Markets
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            AGMARKNET & eNAM Live Cross-Audit
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Fully Verified Mandis
          </span>
          <div className="text-xl font-bold text-emerald-400 tabular-nums">
            {verifiedCount} Verified
          </div>
          <span className="text-[11px] text-emerald-400 block mt-0.5">
            100% Exact Name & Variety Match
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Partially Verified (G9 Inferred)
          </span>
          <div className="text-xl font-bold text-amber-400 tabular-nums">
            {partialCount} Flagged
          </div>
          <span className="text-[11px] text-amber-300 block mt-0.5">
            Generic 'Banana' In Raw Source
          </span>
        </div>

        <div className="cockpit-panel p-3">
          <span className="text-[11px] uppercase text-slate-400 font-semibold block mb-1">
            Source Conflicts / Non-APMC
          </span>
          <div className="text-xl font-bold text-rose-400 tabular-nums">
            {conflictCount} Critical
          </div>
          <span className="text-[11px] text-rose-300 block mt-0.5">
            Export Packhouse / Local Variety
          </span>
        </div>
      </div>

      {/* Filter and Audit Controls Toolbar */}
      <div className="cockpit-panel p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mandi, official name, state..."
              className="w-full bg-[#162032] border border-[#243048] rounded pl-8 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>

          {/* Verification Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#162032] border border-[#243048] rounded px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#162032]">All Statuses</option>
              <option value="Verified" className="bg-[#162032]">Verified Only</option>
              <option value="Partially Verified" className="bg-[#162032]">Partially Verified</option>
              <option value="Source Conflict" className="bg-[#162032]">Source Conflict</option>
            </select>
          </div>

          {/* Mismatch Type Filter */}
          <div className="flex items-center gap-1.5 bg-[#162032] border border-[#243048] rounded px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Mismatch Flag:</span>
            <select
              value={mismatchFilter}
              onChange={(e) => setMismatchFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#162032]">All Flags</option>
              <option value="SYNTHETIC_NAME" className="bg-[#162032]">Composite / Invented Name</option>
              <option value="VARIETY_INFERRED" className="bg-[#162032]">Inferred G9 Variety</option>
              <option value="NON_APMC" className="bg-[#162032]">Non-APMC / Packhouse</option>
              <option value="CONFLICT" className="bg-[#162032]">Source Conflict</option>
            </select>
          </div>
        </div>

        {/* Bulk Re-Verify Action */}
        <button
          onClick={loadRecords}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Auditing Sources...' : 'Run Bulk Verify Job'}</span>
        </button>
      </div>

      {/* Verification Audit Table */}
      <div className="cockpit-panel overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-250px)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#131b2b] text-slate-400 sticky top-0 z-10 border-b border-[#243048]">
              <tr>
                <th className="py-2.5 px-3">Displayed Market Name</th>
                <th className="py-2.5 px-2">Official APMC Name</th>
                <th className="py-2.5 px-2">State & District</th>
                <th className="py-2.5 px-2">Market Classification</th>
                <th className="py-2.5 px-2">Raw Variety in Source</th>
                <th className="py-2.5 px-2 text-right">Modal Rate</th>
                <th className="py-2.5 px-2 text-center">Confidence</th>
                <th className="py-2.5 px-3">Verification Status</th>
                <th className="py-2.5 px-2 text-center">Safety</th>
                <th className="py-2.5 px-2 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filtered.map((item) => {
                const isSafe = item.is_safe_for_trading;
                return (
                  <tr key={item.market_id} className="hover:bg-[#162032] transition-colors group">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div>{item.displayed_market_name}</div>
                      {item.warnings.length > 0 && (
                        <span className="text-[10px] text-amber-400 block line-clamp-1">
                          ⚠️ {item.warnings[0]}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 font-mono text-slate-300">
                      {item.official_market_name}
                    </td>
                    <td className="py-2.5 px-2 text-slate-300">
                      <div>{item.state}</div>
                      <span className="text-[10px] text-slate-400">{item.district}</span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-300">
                      <span
                        className={`badge ${
                          item.market_type === 'Official Mandi'
                            ? 'badge-info'
                            : 'badge-warning'
                        }`}
                      >
                        {item.market_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="font-mono text-slate-200">{item.raw_variety}</span>
                      <span className="text-[10px] text-slate-400 block">
                        ({item.variety_confidence})
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-amber-400 tabular-nums">
                      Rs. {item.displayed_modal_price.toFixed(2)}/kg
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">
                      <span
                        className={
                          item.source_confidence_score >= 85
                            ? 'text-emerald-400'
                            : item.source_confidence_score >= 65
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {item.source_confidence_score}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`badge ${
                          item.verification_status === 'Verified'
                            ? 'badge-success'
                            : item.verification_status === 'Partially Verified'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {item.verification_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSafe
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isSafe ? 'Route Safe' : 'Caution'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => setActiveDrawerMarketId(item.market_id)}
                        className="px-2.5 py-1 rounded bg-[#202d46] hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Verification Drawer */}
      {activeDrawerMarketId && (
        <PriceVerificationDrawer
          isOpen={Boolean(activeDrawerMarketId)}
          onClose={() => setActiveDrawerMarketId(null)}
          marketId={activeDrawerMarketId}
        />
      )}
    </div>
  );
}
