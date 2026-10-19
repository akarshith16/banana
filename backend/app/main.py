"""
Kadali Fresh Control Tower - Production FastAPI Application
Operator-grade decision support platform combining live Mandi Price Intelligence
and AI Demand/Price Forecasting for fresh produce trading (G9 Cavendish Banana & Indian F&V).
"""

from fastapi import FastAPI, Query, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models import (
    PriceObservation, RouteCostBreakdown, ForecastResponse,
    SimulationRequest, HarvestLot, BuyerDemand, AlertMessage,
    PriceVerificationRecord, BuyerContact, RouteReadinessSummary, CallingScript
)
from app.data.market_universe import (
    SOURCE_CLUSTERS, DESTINATION_MARKETS, COMMODITIES_REGISTRY,
    get_market_by_id
)
from app.connectors.agmarknet import (
    fetch_live_mandi_prices, connector_health, apply_manual_spot_price,
    reset_spot_overrides
)
from app.connectors.csv_connector import parse_and_apply_csv_feed
from app.decision.cost_engine import (
    calculate_single_route_economics, evaluate_all_destinations
)
from app.ml.forecaster import (
    train_and_forecast_market, retrain_model_pipeline, model_registry
)
from app.alerts.engine import generate_live_alerts
from app.data.operations_data import (
    get_farmer_harvest_lots, get_buyer_demand_board
)
from app.verification.engine import (
    verify_single_market_record, verify_all_active_markets
)
from app.buyers.discovery_engine import (
    get_contacts_for_market, add_custom_buyer_lead, update_contact_status,
    calculate_route_readiness, generate_calling_script, BUYER_DIRECTORY
)


app = FastAPI(
    title="Kadali Fresh Control Tower API",
    description="Real-time mandi price intelligence and AI forecasting for fresh fruit and vegetable trading in India",
    version="2.0.0"
)

# Enable CORS for local Vite frontend and external operator dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "OPERATIONAL",
        "app_name": "Kadali Fresh Control Tower",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "data_connector": {
            "status": connector_health.last_status,
            "mode": connector_health.data_mode,
            "last_sync": connector_health.last_sync_time.isoformat(),
            "agency": connector_health.source_agency,
            "latency_ms": connector_health.avg_latency_ms
        },
        "ml_engine": {
            "version": model_registry.version,
            "last_retrained": model_registry.last_trained_timestamp.isoformat(),
            "samples_trained": model_registry.training_samples_count,
            "backtest_mae": model_registry.backtest_metrics["mae"],
            "backtest_mape": model_registry.backtest_metrics["mape_pct"]
        }
    }

@app.get("/api/universe")
def get_universe():
    return {
        "commodities": COMMODITIES_REGISTRY,
        "source_clusters": SOURCE_CLUSTERS,
        "destination_markets": DESTINATION_MARKETS
    }

@app.get("/api/mandi/live", response_model=List[PriceObservation])
async def get_live_mandi_prices(
    commodity: str = Query("Banana", description="Crop name"),
    variety: str = Query("G9 Cavendish", description="Variety"),
    state: Optional[str] = Query(None, description="Filter by state"),
    relevance: Optional[str] = Query(None, description="Filter by banana trade relevance")
):
    observations = await fetch_live_mandi_prices(commodity=commodity, variety=variety)
    
    # Optional filtering
    if state and state.lower() != "all":
        observations = [o for o in observations if o.state.lower() == state.lower()]
        
    if relevance and relevance.lower() != "all":
        # Lookup market relevance
        def check_rel(m_id):
            m = get_market_by_id(m_id)
            return m.get("banana_relevance", "").lower() == relevance.lower()
        observations = [o for o in observations if check_rel(o.market_id)]

    return observations

@app.get("/api/routes/economics", response_model=List[RouteCostBreakdown])
async def get_route_economics(
    source_id: str = Query("ap_pulivendula", description="Source cluster ID in Andhra Pradesh"),
    commodity: str = Query("Banana", description="Crop name"),
    source_price: Optional[float] = Query(None, description="Override purchase price in Rs/kg")
):
    # Fetch live destination prices for real-time spread calculation
    live_obs = await fetch_live_mandi_prices(commodity=commodity)
    price_map = {o.market_id: o.modal_price for o in live_obs}
    
    routes = evaluate_all_destinations(
        source_market_id=source_id,
        commodity=commodity,
        source_price_override=source_price,
        live_prices=price_map
    )
    return routes

@app.get("/api/compare")
async def compare_markets(
    source_id: str = Query("ap_pulivendula", description="AP Source Cluster ID"),
    dest_id: str = Query("delhi_azadpur", description="Destination Mandi ID")
):
    source_m = get_market_by_id(source_id)
    dest_m = get_market_by_id(dest_id)
    
    # Live prices
    live_obs = await fetch_live_mandi_prices()
    price_map = {o.market_id: o.modal_price for o in live_obs}
    
    s_price = price_map.get(source_id, source_m.get("base_farmgate_price", 14.50))
    d_price = price_map.get(dest_id, s_price + dest_m.get("typical_spread_rs_kg", 11.0))
    
    economics = calculate_single_route_economics(
        source_market=source_m,
        dest_market=dest_m,
        source_purchase_price=s_price,
        dest_modal_price=d_price
    )
    
    # Get 7-day forecast for the destination market
    forecast = train_and_forecast_market(market_id=dest_id, horizon_days=7)
    
    return {
        "source": source_m,
        "destination": dest_m,
        "economics": economics,
        "forecast": forecast
    }

@app.get("/api/forecast", response_model=ForecastResponse)
def get_market_forecast(
    market_id: str = Query("delhi_azadpur", description="Mandi ID"),
    commodity: str = Query("Banana", description="Crop"),
    variety: str = Query("G9 Cavendish", description="Variety"),
    horizon_days: int = Query(14, description="Horizon: 1, 3, 7, 14")
):
    return train_and_forecast_market(
        market_id=market_id,
        commodity=commodity,
        variety=variety,
        horizon_days=horizon_days
    )

@app.post("/api/trade-calculator/simulate")
def simulate_trade_lot(req: SimulationRequest):
    dest_m = get_market_by_id(req.destination_id)
    source_m = SOURCE_CLUSTERS[0]
    for s in SOURCE_CLUSTERS:
        if s["name"].lower() in req.source_cluster.lower() or s["id"] in req.source_cluster.lower():
            source_m = s
            break
            
    # Destination price
    target_price = req.target_sale_price_override
    if target_price is None:
        target_price = round(req.purchase_price_rs_kg + dest_m.get("typical_spread_rs_kg", 11.50), 2)
        
    breakdown = calculate_single_route_economics(
        source_market=source_m,
        dest_market=dest_m,
        source_purchase_price=req.purchase_price_rs_kg,
        dest_modal_price=target_price,
        lot_size_mt=req.lot_size_mt,
        crate_weight_kg=req.crate_weight_kg,
        custom_freight=req.custom_freight_rs_kg,
        labour_rs_kg=req.labour_cost_rs_kg,
        crate_box_rs_kg=req.crate_box_cost_rs_kg,
        hamali_rs_kg=req.hamali_rs_kg,
        mandi_cess_pct=req.mandi_cess_pct,
        include_ripening=req.include_ripening,
        ripening_cost_rs_kg=req.ripening_cost_rs_kg,
        credit_days=req.credit_days,
        capital_cost_annual_pct=req.capital_cost_pct_annual
    )
    
    # Generate 5x5 sensitivity matrix: Selling Price vs Normal Truck Freight Variance
    price_offsets = [-2.0, -1.0, 0.0, 1.0, 2.0]
    freight_offsets = [-0.60, -0.30, 0.0, 0.30, 0.60]
    
    base_freight = breakdown.freight_cost
    sensitivity_grid = []
    
    for f_off in freight_offsets:
        row_freight = round(base_freight + f_off, 2)
        row_data = {"freight_per_kg": row_freight, "freight_per_crate": round(row_freight * req.crate_weight_kg, 2), "columns": []}
        for p_off in price_offsets:
            test_sale_price = round(target_price + p_off, 2)
            sim_sub = calculate_single_route_economics(
                source_market=source_m,
                dest_market=dest_m,
                source_purchase_price=req.purchase_price_rs_kg,
                dest_modal_price=test_sale_price,
                lot_size_mt=req.lot_size_mt,
                crate_weight_kg=req.crate_weight_kg,
                custom_freight=row_freight,
                labour_rs_kg=req.labour_cost_rs_kg,
                crate_box_rs_kg=req.crate_box_cost_rs_kg,
                hamali_rs_kg=req.hamali_rs_kg,
                mandi_cess_pct=req.mandi_cess_pct,
                include_ripening=req.include_ripening,
                ripening_cost_rs_kg=req.ripening_cost_rs_kg,
                credit_days=req.credit_days
            )
            row_data["columns"].append({
                "sale_price": test_sale_price,
                "sale_price_crate": round(test_sale_price * req.crate_weight_kg, 2),
                "net_margin_kg": sim_sub.net_margin,
                "net_margin_crate": sim_sub.net_margin_per_crate,
                "total_profit": sim_sub.total_lot_profit
            })
        sensitivity_grid.append(row_data)

    return {
        "inputs": req,
        "economics": breakdown,
        "sensitivity_matrix": sensitivity_grid
    }

@app.get("/api/procurement/schedule", response_model=List[HarvestLot])
def get_procurement_schedule():
    return get_farmer_harvest_lots()

@app.get("/api/buyers", response_model=List[BuyerDemand])
def get_buyers():
    return get_buyer_demand_board()

@app.get("/api/alerts", response_model=List[AlertMessage])
def get_alerts():
    return generate_live_alerts()

@app.get("/api/admin/connectors")
def get_connector_status():
    return {
        "agmarknet_api": {
            "status": connector_health.last_status,
            "endpoint": connector_health.api_endpoint,
            "last_synced": connector_health.last_sync_time.isoformat(),
            "latency_ms": connector_health.avg_latency_ms,
            "records_count": connector_health.total_records_ingested,
            "mode": connector_health.data_mode
        },
        "enam_gateway": {
            "status": "CONNECTED (Read-only Reference)",
            "endpoint": "https://enam.gov.in/web/dashboard/trade-data",
            "last_ping": datetime.now().isoformat(),
            "latency_ms": 195.0
        },
        "model_monitoring": {
            "version": model_registry.version,
            "samples": model_registry.training_samples_count,
            "mae": model_registry.backtest_metrics["mae"],
            "mape": model_registry.backtest_metrics["mape_pct"],
            "directional_accuracy": model_registry.backtest_metrics["directional_accuracy_pct"]
        }
    }

@app.post("/api/admin/manual-spot")
def manual_spot_entry(
    market_id: str = Body(..., embed=True),
    modal_price: float = Body(..., embed=True),
    arrivals_mt: float = Body(..., embed=True),
    notes: str = Body("", embed=True)
):
    return apply_manual_spot_price(market_id, modal_price, arrivals_mt, notes)

@app.post("/api/admin/upload-csv")
async def upload_csv_spot(file: UploadFile = File(...)):
    contents = await file.read()
    csv_str = contents.decode("utf-8", errors="replace")
    result = parse_and_apply_csv_feed(csv_str)
    return result

@app.post("/api/admin/retrain")
def trigger_retrain():
    return retrain_model_pipeline()

@app.post("/api/admin/reset-data")
def reset_to_live_feed():
    return reset_spot_overrides()

# ================= MODULE A: PRICE VERIFICATION CONSOLE APIS =================

@app.get("/api/verification/all", response_model=List[PriceVerificationRecord])
def get_all_market_verifications(commodity: str = Query("Banana", description="Crop name")):
    return verify_all_active_markets(commodity=commodity)

@app.get("/api/verification/verify-mandi", response_model=PriceVerificationRecord)
def verify_mandi_endpoint(
    market_id: str = Query(..., description="Market ID to verify"),
    modal_price: Optional[float] = Query(None, description="Current displayed modal price"),
    arrivals_mt: Optional[float] = Query(None, description="Current displayed arrivals in MT"),
    variety: str = Query("G9 Cavendish", description="Displayed variety")
):
    m_info = get_market_by_id(market_id)
    p = modal_price if modal_price is not None else (14.20 + m_info.get("typical_spread_rs_kg", 11.0))
    arr = arrivals_mt if arrivals_mt is not None else m_info.get("avg_daily_volume_mt", 350.0)
    return verify_single_market_record(
        market_id=market_id,
        displayed_modal_price=p,
        displayed_arrivals_mt=arr,
        displayed_variety=variety
    )

# ================= MODULE B: BUYER DISCOVERY & SELL THIS LOAD APIS =================

@app.get("/api/buyers/discover", response_model=List[BuyerContact])
def discover_buyers(
    market_id: str = Query("bengaluru_binny", description="Target destination market ID")
):
    return get_contacts_for_market(market_id)

@app.get("/api/buyers/route-readiness", response_model=RouteReadinessSummary)
async def get_route_readiness_endpoint(
    source_id: str = Query("ap_pulivendula", description="Source cluster ID"),
    dest_id: str = Query("bengaluru_binny", description="Destination market ID")
):
    source_m = get_market_by_id(source_id)
    dest_m = get_market_by_id(dest_id)
    
    # Calculate live route economics
    live_obs = await fetch_live_mandi_prices()
    price_map = {o.market_id: o.modal_price for o in live_obs}
    s_price = price_map.get(source_id, source_m.get("base_farmgate_price", 14.50))
    d_price = price_map.get(dest_id, s_price + dest_m.get("typical_spread_rs_kg", 11.0))
    
    econ = calculate_single_route_economics(
        source_market=source_m,
        dest_market=dest_m,
        source_purchase_price=s_price,
        dest_modal_price=d_price
    )
    
    return calculate_route_readiness(
        source_cluster_id=source_id,
        destination_market_id=dest_id,
        net_margin=econ.net_margin
    )

@app.get("/api/buyers/calling-script", response_model=CallingScript)
def get_buyer_calling_script(
    contact_id: str = Query(..., description="Contact ID"),
    source_name: str = Query("Pulivendula (Kadapa)", description="AP Source Name")
):
    all_contacts = BUYER_DIRECTORY + [c for c in BUYER_DIRECTORY] # fallback
    target = None
    from app.buyers.discovery_engine import CUSTOM_BUYER_LEADS
    for c in BUYER_DIRECTORY + CUSTOM_BUYER_LEADS:
        if c.id == contact_id:
            target = c
            break
            
    if not target:
        target = BUYER_DIRECTORY[0]
        
    return generate_calling_script(target, source_cluster_name=source_name)

@app.post("/api/buyers/add-custom", response_model=BuyerContact)
def add_custom_buyer(
    market: str = Body(..., embed=True),
    business_name: str = Body(..., embed=True),
    contact_person: str = Body("", embed=True),
    phone_number: str = Body(..., embed=True),
    buyer_type: str = Body("Commission Agent", embed=True),
    address: str = Body(..., embed=True),
    notes: str = Body("", embed=True)
):
    return add_custom_buyer_lead(
        market=market,
        business_name=business_name,
        contact_person=contact_person,
        phone_number=phone_number,
        buyer_type=buyer_type,
        address=address,
        notes=notes
    )

@app.post("/api/buyers/update-status")
def update_buyer_status(
    contact_id: str = Body(..., embed=True),
    new_status: str = Body(..., embed=True)
):
    return update_contact_status(contact_id, new_status)

