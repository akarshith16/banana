import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Info,
  Copy,
  Check,
  Share2,
  MessageSquare
} from 'lucide-react';

export default function AlertsCenter({ alerts = [] }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === 'ALL' || a.severity === filterSeverity
  );

  const handleCopyWhatsApp = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Alerts Filter Header */}
      <div className="cockpit-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-white">Operational Trading & Spread Alerts Engine</h3>
          <p className="text-xs text-slate-400">
            Automated rule-based alerts evaluating spreads, arrival shocks, temperature decay, and stale data
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#162032] border border-[#243048] rounded p-0.5 text-xs">
          {['ALL', 'OPPORTUNITY', 'WARNING', 'CRITICAL', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                filterSeverity === sev
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCopied = copiedId === alert.id;
          return (
            <div
              key={alert.id}
              className={`cockpit-panel p-4 border-l-4 transition-all ${
                alert.severity === 'OPPORTUNITY'
                  ? 'border-l-emerald-500'
                  : alert.severity === 'WARNING'
                  ? 'border-l-amber-500'
                  : alert.severity === 'CRITICAL'
                  ? 'border-l-rose-500'
                  : 'border-l-blue-500'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`badge ${
                      alert.severity === 'OPPORTUNITY'
                        ? 'badge-success'
                        : alert.severity === 'WARNING'
                        ? 'badge-warning'
                        : alert.severity === 'CRITICAL'
                        ? 'badge-danger'
                        : 'badge-info'
                    }`}
                  >
                    {alert.category}
                  </span>
                  <h4 className="font-bold text-sm text-white">{alert.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">{alert.metric_value}</span>
                  <span className="text-[11px] text-slate-400">| {alert.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">{alert.description}</p>

              {/* Source & Destination Corridor */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#243048] text-xs">
                <div className="text-slate-400 text-[11px]">
                  <span>Origin: </span>
                  <span className="text-slate-200 font-medium">{alert.source_node}</span>
                  <span className="mx-1.5">➡️</span>
                  <span>Target: </span>
                  <span className="text-slate-200 font-medium">{alert.dest_node}</span>
                </div>

                {/* 1-Click WhatsApp Broadcast Button */}
                <button
                  onClick={() => handleCopyWhatsApp(alert.id, alert.whatsapp_format)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isCopied ? 'Copied WhatsApp Msg!' : 'Copy WhatsApp Alert'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
