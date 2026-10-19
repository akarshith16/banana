import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BrainCircuit,
  Sliders,
  Calendar,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  CheckCircle,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { fetchForecast } from '../api';

export default function ForecastStudio({
  defaultMarketId = 'delhi_azadpur',
  commodity = 'Banana'
}) {
  const [marketId, setMarketId] = useState(defaultMarketId);
  const [horizonDays, setHorizonDays] = useState(14);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const loadForecast = async () => {
    setLoading(true);
    try {
      const data = await fetchForecast(marketId, horizonDays, commodity);
      setForecastData(data);
    } catch (err) {
      console.error('Failed to load forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [marketId, horizonDays, commodity]);

  const points = forecastData?.forecast_points || [];

  return (
    <div className="space-y-4">
      {/* Forecast Controls Bar */}
      <div className="cockpit-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Terminal Market Target
            </label>
            <select
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
            >
              {destinationOptions.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#162032] text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Forecast Horizon
            </label>
            <div className="flex items-center gap-1 bg-[#162032] border border-[#243048] rounded p-0.5 text-xs">
              {[1, 3, 7, 14].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizonDays(h)}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    horizonDays === h
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h}D
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Confidence & Model Tag */}
        {forecastData && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Model Framework</span>
              <span className="text-xs font-semibold text-amber-400">
                {forecastData.accuracy.model_name}
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#162032] border border-[#243048] text-right">
              <span className="text-[10px] text-slate-400 block">Confidence Score</span>
              <span className="text-sm font-bold text-emerald-400">
                {forecastData.confidence_score}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main AI Forecast Chart */}
      <div className="cockpit-panel p-4">
        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="font-bold text-sm text-white">
              AI Price & Arrival Projection ({forecastData?.market_name || 'Delhi Azadpur'})
            </h3>
            <p className="text-xs text-slate-400">
              Shaded band represents 90% confidence interval with recursive multi-step error expansion
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-0.5 bg-amber-400 inline-block"></span> Predicted Modal (Rs/kg)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-3 h-2 bg-blue-500/20 border border-blue-500 inline-block"></span> Arrivals (MT)
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="price"
                stroke="#f59e0b"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                unit=" ₹"
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                stroke="#38bdf8"
                tick={{ fontSize: 11 }}
                unit=" MT"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              {/* Confidence Band */}
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="upper_bound"
                stroke="transparent"
                fill="#f59e0b"
                fillOpacity={0.15}
                name="Confidence Upper"
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="lower_bound"
                stroke="transparent"
                fill="#f59e0b"
                fillOpacity={0.15}
                name="Confidence Lower"
              />
              {/* Predicted Arrivals Bar */}
              <Bar
                yAxisId="volume"
                dataKey="predicted_arrivals_mt"
                fill="#38bdf8"
                opacity={0.3}
                barSize={20}
                name="Projected Arrivals (MT)"
              />
              {/* Predicted Modal Price Line */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="predicted_modal"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f59e0b' }}
                name="Predicted Modal (Rs/kg)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Explainability & Accuracy Metrics */}
      {forecastData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Feature Drivers Waterfall */}
          <div className="cockpit-panel p-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Top Prediction Drivers & Attributions (Explainability)
            </h4>
            <div className="space-y-2 text-xs">
              {forecastData.drivers.map((d, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded bg-[#162032] border border-[#243048] flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{d.feature}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          d.direction === 'positive'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {d.direction === 'positive' ? '+Rs.' : '-Rs.'} {d.impact_rs.toFixed(2)}/kg
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation banner */}
            <div className="mt-4 p-3 rounded bg-amber-950/30 border border-amber-500/30 text-xs">
              <span className="font-bold text-amber-300 block mb-1">Trading Strategy Signal:</span>
              <p className="text-slate-300 leading-relaxed">{forecastData.recommendation}</p>
            </div>
          </div>

          {/* Model Monitoring & Validation Backtest */}
          <div className="cockpit-panel p-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Model Performance & Walk-Forward Validation
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 rounded bg-[#162032] border border-[#243048]">
                <span className="text-slate-400 block text-[11px]">Mean Absolute Error (MAE)</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  Rs. {forecastData.accuracy.mae.toFixed(2)} /kg
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Top decile accuracy</span>
              </div>

              <div className="p-3 rounded bg-[#162032] border border-[#243048]">
                <span className="text-slate-400 block text-[11px]">Mean Abs. Pct Error (MAPE)</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {forecastData.accuracy.mape_pct.toFixed(2)}%
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">&lt; 5.0% Benchmark</span>
              </div>

              <div className="p-3 rounded bg-[#162032] border border-[#243048]">
                <span className="text-slate-400 block text-[11px]">Directional Accuracy</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">
                  {forecastData.accuracy.directional_accuracy_pct.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Up/Down trend calls</span>
              </div>

              <div className="p-3 rounded bg-[#162032] border border-[#243048]">
                <span className="text-slate-400 block text-[11px]">Validation Window</span>
                <span className="text-lg font-bold text-blue-300 tabular-nums">
                  {forecastData.accuracy.validation_window_days} Days
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Rolling holdout tests</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#131b2b] border border-[#243048] text-xs">
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Automated Retraining Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Ridge model retrained every 6 hours with newly ingested AGMARKNET modal rates, festival calendar shifts, and mandi arrival shocks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
