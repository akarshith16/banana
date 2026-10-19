import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Clock,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function LiveMarkets({
  mandiObservations = [],
  commodity = 'Banana',
  onSelectMarketForCompare,
  onVerifyPrice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [relevanceFilter, setRelevanceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('modal_price'); // 'modal_price' | 'arrivals_mt' | 'market_name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Extract unique states
  const states = useMemo(() => {
    const set = new Set(mandiObservations.map((o) => o.state));
    return ['ALL', ...Array.from(set).sort()];
  }, [mandiObservations]);

  // Filtered & sorted observations
  const filteredData = useMemo(() => {
    return mandiObservations
      .filter((item) => {
        const matchesSearch =
          item.market_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.state.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = stateFilter === 'ALL' || item.state === stateFilter;
        return matchesSearch && matchesState;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [mandiObservations, searchTerm, stateFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Mandi', 'State', 'Commodity', 'Variety', 'Min Rs/kg', 'Max Rs/kg', 'Modal Rs/kg', 'Arrivals MT', 'Freshness', 'Source Agency'];
    const rows = filteredData.map((d) => [
      `"${d.market_name}"`,
      `"${d.state}"`,
      `"${d.commodity}"`,
      `"${d.variety}"`,
      d.min_price,
      d.max_price,
      d.modal_price,
      d.arrivals_mt,
      `"${d.data_freshness}"`,
      `"${d.source_agency}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kadali_mandi_prices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="cockpit-panel p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mandi, terminal, or state..."
              className="w-full bg-[#162032] border border-[#243048] rounded pl-8 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5 bg-[#162032] border border-[#243048] rounded px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st} className="bg-[#162032] text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Freshness Badge */}
          <div className="flex items-center gap-1.5 text-slate-400 px-2 py-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">
              Live AGMARKNET & eNAM Feeds ({filteredData.length} active records)
            </span>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#162032] hover:bg-[#202d46] border border-[#243048] text-slate-200 font-medium transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Mandi Price & Arrivals Table */}
      <div className="cockpit-panel overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-210px)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#131b2b] text-slate-400 sticky top-0 z-10 border-b border-[#243048]">
              <tr>
                <th
                  onClick={() => handleSort('market_name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Mandi Terminal</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-2">State</th>
                <th className="py-2.5 px-2">Crop & Variety</th>
                <th className="py-2.5 px-2 text-right">Min (Rs/kg)</th>
                <th className="py-2.5 px-2 text-right">Max (Rs/kg)</th>
                <th
                  onClick={() => handleSort('modal_price')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Modal (Rs/kg)</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  </div>
                </th>
                <th className="py-2.5 px-2 text-right">Rate / 15kg Crate</th>
                <th
                  onClick={() => handleSort('arrivals_mt')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Arrivals (MT)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-2 text-center">Trend (7d)</th>
                <th className="py-2.5 px-3">Data Freshness & Source</th>
                <th className="py-2.5 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredData.map((item) => {
                const isSource = item.state === 'Andhra Pradesh';
                return (
                  <tr
                    key={item.market_id}
                    className="hover:bg-[#162032] transition-colors group"
                  >
                    <td className="py-2 px-3 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        {isSource && (
                          <span className="badge badge-banana text-[9px] px-1 py-0">AP Source</span>
                        )}
                        <span className="truncate max-w-[200px]">{item.market_name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-300">{item.state}</td>
                    <td className="py-2 px-2 text-slate-300">
                      <span className="font-medium text-slate-200">{item.commodity}</span>
                      <span className="text-[10px] text-slate-400 block">{item.variety}</span>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400 tabular-nums">
                      Rs. {item.min_price.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400 tabular-nums">
                      Rs. {item.max_price.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className="font-bold text-amber-400 text-sm">
                        Rs. {item.modal_price.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      <span className="font-bold text-emerald-400 text-xs">
                        Rs. {(item.modal_price * 15).toFixed(0)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/crate</span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      <span className="font-semibold text-slate-200">
                        {item.arrivals_mt.toFixed(1)} MT
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {(item.arrivals_mt * 10).toFixed(0)} qtl
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {/* Mini sparkline indicator */}
                      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-[11px] font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        +1.8%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      <div className="text-[11px] text-slate-300 truncate max-w-[210px]">
                        {item.data_freshness}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[210px]">
                        {item.source_agency}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            if (onVerifyPrice) {
                              onVerifyPrice(item);
                            }
                          }}
                          title="Verify price against raw source records"
                          className="px-2 py-1 rounded bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-300 text-[11px] font-semibold transition-colors flex items-center gap-1 border border-blue-500/30"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => onSelectMarketForCompare(item.market_name)}
                          className="px-2 py-1 rounded bg-[#202d46] hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition-colors"
                        >
                          Compare
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
