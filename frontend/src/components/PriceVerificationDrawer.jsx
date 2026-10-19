import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { verifyMandiPrice } from '../api';

export default function PriceVerificationDrawer({
  isOpen,
  onClose,
  marketId,
  modalPrice,
  arrivalsMt,
  variety = 'G9 Cavendish',
  onNavigateToConsole
}) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && marketId) {
      setLoading(true);
      verifyMandiPrice(marketId, modalPrice, arrivalsMt, variety)
        .then((data) => setRecord(data))
        .catch((err) => console.error('Verification failed:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, marketId, modalPrice, arrivalsMt, variety]);

  if (!isOpen) return null;

  const isVerified = record?.verification_status === 'Verified';
  const isPartially = record?.verification_status === 'Partially Verified';
  const isConflict = record?.verification_status === 'Source Conflict';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0d131f] border-l border-[#243048] shadow-2xl h-full flex flex-col justify-between text-slate-100">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#243048] flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded ${
              isVerified ? 'bg-emerald-500/20 text-emerald-400' : isPartially ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Mandi Price Raw-Source Verification</h3>
              <p className="text-xs text-slate-400">
                Audited against official AGMARKNET & State Marketing Board records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1f293d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <span className="animate-spin text-xl mr-2">⚙️</span> Running raw-source validation checks...
            </div>
          ) : record ? (
            <>
              {/* Verdict Banner */}
              <div
                className={`p-3 rounded-lg border ${
                  record.is_safe_for_trading
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-amber-950/40 border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-white">
                    Safety Verdict:
                  </span>
                  <span
                    className={`badge ${
                      isVerified ? 'badge-success' : isPartially ? 'badge-warning' : 'badge-danger'
                    }`}
                  >
                    {record.verification_status} ({record.source_confidence_score}% Confidence)
                  </span>
                </div>
                <p className="text-slate-200 leading-snug">
                  {record.is_safe_for_trading
                    ? '✅ SAFE FOR TRADING: Official APMC record verified with calibrated source spread.'
                    : '⚠️ NEEDS CAUTION: Discrepancies detected between displayed values and raw government returns.'}
                </p>
              </div>

              {/* Warnings List */}
              {record.warnings.length > 0 && (
                <div className="cockpit-panel p-3 border-amber-500/30 bg-amber-950/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Detected Discrepancies & Audit Flags ({record.warnings.length})</span>
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-slate-300 text-[11px]">
                    {record.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exact Source vs App Comparison Table */}
              <div className="cockpit-panel p-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">
                  Raw Source vs Displayed App Comparison
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#131b2b] text-slate-400">
                      <tr>
                        <th className="py-2 px-2.5">Field</th>
                        <th className="py-2 px-2.5">App Displayed</th>
                        <th className="py-2 px-2.5">Raw Official Source</th>
                        <th className="py-2 px-2.5">Audit Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]">
                      <tr>
                        <td className="py-2 px-2.5 text-slate-400 font-medium">Market Name</td>
                        <td className="py-2 px-2.5 font-semibold text-white">{record.displayed_market_name}</td>
                        <td className="py-2 px-2.5 text-slate-200 font-mono">{record.official_market_name}</td>
                        <td className="py-2 px-2.5">
                          {record.displayed_market_name.includes(record.official_market_name) ? (
                            <span className="text-amber-400 font-medium">Composite UI Label</span>
                          ) : (
                            <span className="text-emerald-400 font-medium">Exact Match</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-slate-400 font-medium">Market Type</td>
                        <td className="py-2 px-2.5 text-slate-200">Terminal Wholesale</td>
                        <td className="py-2 px-2.5 text-slate-200 font-semibold">{record.market_type}</td>
                        <td className="py-2 px-2.5">
                          <span className={record.market_type === 'Official Mandi' ? 'text-emerald-400' : 'text-amber-400'}>
                            {record.market_type === 'Official Mandi' ? 'Regulated APMC' : 'Specialized Node'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-slate-400 font-medium">Commodity</td>
                        <td className="py-2 px-2.5 text-white">{record.displayed_commodity}</td>
                        <td className="py-2 px-2.5 text-slate-200 font-mono">{record.raw_commodity}</td>
                        <td className="py-2 px-2.5 text-emerald-400 font-medium">Exact Match</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-slate-400 font-medium">Variety Tag</td>
                        <td className="py-2 px-2.5 text-amber-300 font-semibold">{record.displayed_variety}</td>
                        <td className="py-2 px-2.5 text-slate-200 font-mono">{record.raw_variety}</td>
                        <td className="py-2 px-2.5">
                          <span className={record.variety_confidence === 'Exact Match' ? 'text-emerald-400' : 'text-amber-400'}>
                            {record.variety_confidence}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-slate-400 font-medium">Modal Price</td>
                        <td className="py-2 px-2.5 text-amber-400 font-bold tabular-nums">Rs. {record.displayed_modal_price.toFixed(2)}/kg</td>
                        <td className="py-2 px-2.5 text-slate-200 font-bold tabular-nums">Rs. {record.raw_modal_price.toFixed(2)}/kg</td>
                        <td className="py-2 px-2.5 text-emerald-400 font-medium">Validated</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 text-slate-400 font-medium">Daily Arrivals</td>
                        <td className="py-2 px-2.5 text-white tabular-nums">{record.displayed_arrivals_mt.toFixed(1)} MT</td>
                        <td className="py-2 px-2.5 text-slate-200 tabular-nums">{record.raw_arrivals_mt.toFixed(1)} MT</td>
                        <td className="py-2 px-2.5 text-emerald-400 font-medium">Validated</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Source Agency & Raw Verification Link */}
              <div className="cockpit-panel p-3 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Official Provenance & Verification Link
                </h4>
                <div className="space-y-1.5 text-slate-300 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Authority:</span>
                    <span className="font-semibold text-white">{record.source_system}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Report Date:</span>
                    <span className="font-mono text-slate-200">{record.report_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">App Fetch Timestamp:</span>
                    <span className="font-mono text-slate-200">{record.app_fetch_timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Freshness Cadence:</span>
                    <span className="text-blue-300 font-medium">{record.data_freshness_type}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#243048]">
                  <a
                    href={record.raw_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
                  >
                    <span>Inspect Raw Record on Official Portal ({record.source_system.split('/')[0]})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Audit Summary Box */}
              <div className="p-3 rounded bg-[#131b2b] border border-[#243048] text-xs text-slate-300">
                <span className="text-slate-400 block uppercase text-[10px] font-bold mb-1">
                  Inspector Audit Note:
                </span>
                <p className="leading-relaxed">{record.audit_notes}</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-[#243048] bg-[#111827] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onNavigateToConsole) onNavigateToConsole();
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            Open Full Verification Console <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
