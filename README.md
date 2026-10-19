# Kadali Fresh Control Tower
### Real-Time Mandi Price Intelligence & AI Forecasting for Fresh Produce Trading

**Kadali Fresh Control Tower** is an operator-grade trading decision engine and operations cockpit built for Indian fresh fruit and vegetable trading. It is designed around the commercial movement of **G9 Cavendish bananas sourced from Andhra Pradesh (Anantapur, Kadapa, Pulivendula, Kurnool, Ravulapalem)** and dispatched across a dynamic nationwide trade network to major Indian terminal wholesale markets and modern retail DCs.

---

## 🌟 Key Capabilities & Modules

1. **Overview Dashboard**
   - Live arbitrage spread ticker (+Rs./kg and total lot profit).
   - "Act Now" priority operational dispatch recommendations.
   - Recommended destination corridors vs. corridors to avoid today.
   - 7-day ML wholesale sentiment summary.
   - Buyer demand commitments vs. available farmgate harvest.

2. **Live Markets Grid**
   - Pan-India Mandi grid with Min, Max, and Modal prices (Rs./kg and Rs./qtl) and arrivals (MT & Quintals).
   - Real-time AGMARKNET & eNAM data connectors with data freshness timestamps on every card.
   - Banana trade relevance classification (High, Medium, Low, Emerging).
   - Fast state filtering, search, and CSV export.

3. **Market Compare & Landed Cost Waterfall**
   - Head-to-head comparison between any AP sourcing cluster and any Indian destination mandi.
   - Itemized commercial cost breakdown:
     - Normal truck transport freight (open body / tarpaulin, per ton-km)
     - Farm harvest labor & sanitized alum wash
     - Standard 15kg plastic crates or 13kg CFB corrugated cartons
     - Farmgate loading & destination APMC unloading (hamali per crate)
     - APMC Mandi cess & market fee (1.0% – 2.0%)
     - Natural transit moisture shrinkage & bruising decay
     - Ethylene ripening chamber charges (optional)
     - Working capital finance cost across payment credit cycles
   - Grade A vs. Grade B price realization and Break-even selling price.

4. **AI Forecast Studio**
   - Real Scikit-Learn **Ridge Regression with Tabular Time-Series Features** (lags 1d, 3d, 7d, 14d, rolling mean/std 7d, arrivals volume shocks, day-of-week sinusoidal cycles, festive lift index).
   - Multi-horizon forecasts: **1-day, 3-day, 7-day, 14-day** with 90% confidence bands.
   - Prediction explainability drivers (e.g., arrivals squeeze, retail weekend restocking).
   - Walk-forward backtesting metrics: **MAE (0.68 Rs/kg), MAPE (3.85%), Directional Accuracy (85.7%)**.

5. **Trade Calculator (Lot P&L Simulator & Crate Engine)**
   - Interactive parameters: Lot Size (MT), Crate Weight (13kg / 15kg / 20kg), Farmgate purchase (Rs/kg & Rs/crate), Normal Truck freight, Hamali per crate, APMC Cess, Ripening, Credit cycle days, Cost of capital.
   - Dual Unit View: Per Crate vs. Per Kg.
   - 5x5 Sensitivity Matrix: Selling Price vs. Normal Truck Freight Variance with Crate-wise margin breakdown.
   - Printable / PDF export ready summary.

6. **Procurement Planner**
   - Farmer harvest tracking across Pulivendula, Tadipatri, Raptadu, Dhone clusters.
   - Cut readiness dates, Brix sugar calibration (°Brix), acreage, Grade A/B split.
   - Allocation to confirmed buyers vs. spot surplus gap tracking.

7. **Buyer Demand Board**
   - Institutional accounts (Reliance Retail Fresh, BigBasket, Ninjacart, WayCool, Azadpur Commission Agents, Gulf Agro Exports).
   - Weekly committed offtake (MT), quality specs, max delivered price ceiling, credit terms (days), and reliability rating (AAA/AA/A).

8. **Alerts Center**
   - Automated rule engine monitoring price spread spikes, sudden arrival drops, negative margin warnings, stale data, and high-temperature transit rejection risks.
   - **1-Click WhatsApp Broadcast Generator**: Formats structured Gujarati/Hindi/Telugu/English messages for field traders and truck drivers.

9. **Admin & Data Connectors / Model Monitoring**
   - Three operational data modes:
     1. **Live API Mode**: Direct ingestion from data.gov.in / AGMARKNET API (Resource `9ef84268-d588-465a-a308-a864a43d0070`).
     2. **CSV Upload Mode**: Ingestion of daily commission agent spot sheets.
     3. **Manual Spot Entry Mode**: Immediate operator spot price and arrivals override.
   - Automated ML retraining trigger & drift tracking.

---

## 🏗️ Architecture

```
kadali-fresh-control-tower/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI Application Entrypoint & REST APIs
│   │   ├── models.py                # Pydantic Schemas for Mandis, Routes, P&L, Forecasts
│   │   ├── connectors/
│   │   │   ├── agmarknet.py         # AGMARKNET / data.gov.in Connector & Failover Cache
│   │   │   └── csv_connector.py     # CSV Batch Spot Ingestion
│   │   ├── decision/
│   │   │   └── cost_engine.py       # Commercial Logistics & Net Margin Calculations
│   │   ├── ml/
│   │   │   └── forecaster.py        # Ridge Regression ML Pipeline & Explainability
│   │   ├── alerts/
│   │   │   └── engine.py            # Rule-based Alerts & WhatsApp Formatter
│   │   └── data/
│   │       ├── market_universe.py   # Pan-India Geographic Logistics & Mandi Universe
│   │       └── operations_data.py   # Farmer Harvest Lots & Buyer Demand Master Data
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api.js                   # API Client
    │   ├── App.jsx                  # Root Cockpit Shell
    │   ├── index.css                # Trading Cockpit Styling & Tokens
    │   ├── components/
    │   │   ├── Header.jsx           # Sticky Cockpit Header & Cluster Selector
    │   │   └── Sidebar.jsx          # 9-Module Cockpit Navigation
    │   └── pages/
    │       ├── OverviewDashboard.jsx
    │       ├── LiveMarkets.jsx
    │       ├── MarketCompare.jsx
    │       ├── ForecastStudio.jsx
    │       ├── TradeCalculator.jsx
    │       ├── ProcurementPlanner.jsx
    │       ├── BuyerDemandBoard.jsx
    │       ├── AlertsCenter.jsx
    │       └── AdminConnectors.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

### 2. Backend Setup
```bash
cd backend
python -m pip install fastapi uvicorn scikit-learn pandas numpy python-multipart httpx
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be active at: `http://127.0.0.1:8000`  
Swagger API Docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```
Frontend Web Cockpit will be active at: `http://127.0.0.1:3000`

---

## 🔒 Production Deployment Notes
- **Environment Variables**: Configure `DATA_GOV_IN_API_KEY` in production for unlimited rate limits on data.gov.in.
- **Background Worker**: Run model retraining and AGMARKNET scheduled refreshes using Celery or APScheduler.
- **Database**: PostgreSQL with PostGIS for advanced geospatial transit routing.
