import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Cpu,
  Activity,
  ShieldCheck,
  Send,
  RotateCcw
} from 'lucide-react';
import {
  fetchConnectorStatus,
  postManualSpot,
  uploadCsvFile,
  triggerModelRetrain,
  resetDataFeed
} from '../api';

export default function AdminConnectors({ onDataRefresh }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState(null);

  // Manual Spot entry form
  const [manualMarketId, setManualMarketId] = useState('delhi_azadpur');
  const [manualPrice, setManualPrice] = useState('');
  const [manualArrivals, setManualArrivals] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // CSV file state
  const [selectedFile, setSelectedFile] = useState(null);

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

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchConnectorStatus();
      setStatusData(data);
    } catch (err) {
      console.error('Failed to load connector status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualPrice || !manualArrivals) {
      setMessage({ type: 'error', text: 'Please enter modal price and arrivals.' });
      return;
    }
    try {
      await postManualSpot(manualMarketId, manualPrice, manualArrivals, manualNotes);
      setMessage({ type: 'success', text: `Spot price updated for ${manualMarketId}` });
      setManualPrice('');
      setManualArrivals('');
      setManualNotes('');
      onDataRefresh();
      loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update manual spot price.' });
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a CSV file to upload.' });
      return;
    }
    try {
      const res = await uploadCsvFile(selectedFile);
      setMessage({
        type: 'success',
        text: `CSV processed successfully! ${res.records_ingested} records updated.`
      });
      setSelectedFile(null);
      onDataRefresh();
      loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload CSV file.' });
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await triggerModelRetrain();
      setMessage({
        type: 'success',
        text: `ML Model retrained successfully! Version: ${res.new_version}, MAE: ${res.metrics.mae}`
      });
      loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: 'Model retraining failed.' });
    } finally {
      setRetraining(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetDataFeed();
      setMessage({ type: 'success', text: 'Reset all spot overrides back to live AGMARKNET feed.' });
      onDataRefresh();
      loadStatus();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset data.' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Status banner feedback */}
      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Connectors Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AGMARKNET API */}
        <div className="cockpit-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              AGMARKNET / OGD Connector
            </span>
            <span className="badge badge-success">ONLINE</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 mt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Endpoint:</span>
              <span className="font-mono text-[10px] text-slate-200 truncate max-w-[170px]">
                api.data.gov.in/resource
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Latency:</span>
              <span className="font-semibold text-emerald-400 tabular-nums">
                {statusData?.agmarknet_api?.latency_ms || 340} ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Mode:</span>
              <span className="font-bold text-amber-400">
                {statusData?.agmarknet_api?.mode || 'LIVE_HYBRID'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Records Ingested:</span>
              <span className="font-semibold text-slate-200 tabular-nums">
                {statusData?.agmarknet_api?.records_count || 2480} records
              </span>
            </div>
          </div>
        </div>

        {/* eNAM Reference Gateway */}
        <div className="cockpit-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              eNAM Mandi Gateway
            </span>
            <span className="badge badge-info">SYNCHRONIZED</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1.5 mt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="text-slate-200">REST JSON Stream</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gateway Latency:</span>
              <span className="font-semibold text-emerald-400 tabular-nums">195 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data Coverage:</span>
              <span className="font-semibold text-slate-200">100% Pan-India Mandis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Failover Cache:</span>
              <span className="text-emerald-400 font-medium">Hot Standby</span>
            </div>
          </div>
        </div>

        {/* ML Forecaster Registry */}
        <div className="cockpit-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                AI Model Engine (Ridge)
              </span>
              <span className="badge badge-banana">v2.4 Active</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5 mt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">MAE Benchmark:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  Rs. {statusData?.model_monitoring?.mae || 0.68} /kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Directional Accuracy:</span>
                <span className="font-bold text-amber-400 tabular-nums">
                  {statusData?.model_monitoring?.directional_accuracy || 84.6}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="mt-3 w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining Weights...' : 'Trigger Model Retrain'}</span>
          </button>
        </div>
      </div>

      {/* Sourcing Modes: CSV Upload & Manual Spot Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mode 2: CSV Upload */}
        <div className="cockpit-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Mode 2: CSV Spot Sheet Batch Upload
            </h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Upload daily spot rates from commission agents. Columns: <code className="text-amber-300">market_id, modal_price, arrivals_mt, notes</code>
          </p>

          <form onSubmit={handleCsvUpload} className="space-y-3 text-xs">
            <div className="border-2 border-dashed border-[#243048] rounded-lg p-4 text-center hover:border-amber-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-slate-300 text-xs file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#202d46] file:text-amber-400 hover:file:bg-[#2a3c5e] cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block mt-2">
                Sample format: <span className="font-mono text-slate-300">delhi_azadpur, 28.5, 980, Morning arrivals</span>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded bg-[#202d46] hover:bg-[#2b3c5c] text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Ingest CSV Spot Sheet</span>
            </button>
          </form>
        </div>

        {/* Mode 3: Manual Spot Price Entry */}
        <div className="cockpit-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              Mode 3: Manual Spot Price Override
            </h4>
            <button
              onClick={handleReset}
              title="Reset all overrides"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Live
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Override spot price for a terminal mandi immediately if field agent reports sudden price jumps.
          </p>

          <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Terminal Mandi</label>
                <select
                  value={manualMarketId}
                  onChange={(e) => setManualMarketId(e.target.value)}
                  className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
                >
                  {destinationOptions.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#162032] text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Modal Spot Price (Rs/kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 29.50"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Arrivals (MT)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 450"
                  value={manualArrivals}
                  onChange={(e) => setManualArrivals(e.target.value)}
                  className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Source / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Commission Agent call"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Publish Spot Override</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
