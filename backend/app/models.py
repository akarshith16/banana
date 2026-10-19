from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class MarketNode(BaseModel):
    id: str
    name: str
    district: str
    state: str
    type: str # 'source_cluster' | 'primary_wholesale' | 'transit_ripening' | 'secondary_demand' | 'export_node'
    banana_relevance: str # 'High' | 'Medium' | 'Low' | 'Emerging'
    distance_from_ap_km: float = 0.0
    lat: float
    lng: float
    avg_daily_volume_mt: float
    active_buyers_count: int = 10
    ripening_facility_available: bool = False

class PriceObservation(BaseModel):
    market_id: str
    market_name: str
    state: str
    commodity: str
    variety: str
    date: str
    min_price: float # Rs/kg
    max_price: float # Rs/kg
    modal_price: float # Rs/kg
    arrivals_qtl: float # Quintals
    arrivals_mt: float # MT
    source_agency: str # AGMARKNET | eNAM | Field_Agent | Spot_Upload
    data_freshness: str
    timestamp: str

class RouteCostBreakdown(BaseModel):
    source_cluster: str
    destination_market: str
    distance_km: float
    transit_hours: float
    source_purchase_price: float # Rs/kg
    dest_modal_price: float # Rs/kg
    gross_spread: float # Rs/kg
    
    # Cost elements
    freight_cost: float # Rs/kg
    labour_harvest_wash: float # Rs/kg
    crate_packaging: float # Rs/kg
    loading_unloading_hamali: float # Rs/kg
    mandi_commission_cess: float # Rs/kg
    transit_shrinkage_pct: float # %
    transit_shrinkage_cost: float # Rs/kg
    ripening_cost: float # Rs/kg
    payment_cycle_finance_cost: float # Rs/kg
    
    # Crate & Normal Truck Economics
    truck_type: str = "Normal Open / Tarpaulin Truck (16 MT)"
    crate_weight_kg: float = 15.0 # Standard Mandi Crate (15kg) or Box (13kg)
    total_crates_in_lot: int = 1067 # 16 MT = ~1067 crates of 15kg
    source_price_per_crate: float = 0.0 # Rs/crate
    dest_price_per_crate: float = 0.0 # Rs/crate
    gross_spread_per_crate: float = 0.0 # Rs/crate
    freight_cost_per_crate: float = 0.0 # Rs/crate
    crate_packaging_per_crate: float = 0.0 # Rs/crate
    labour_harvest_wash_per_crate: float = 0.0 # Rs/crate
    hamali_per_crate: float = 0.0 # Rs/crate
    mandi_cess_per_crate: float = 0.0 # Rs/crate
    transit_shrinkage_per_crate: float = 0.0 # Rs/crate
    total_cost_per_crate: float = 0.0 # Rs/crate
    net_margin_per_crate: float = 0.0 # Rs/crate
    break_even_price_per_crate: float = 0.0 # Rs/crate

    total_logistics_cost: float # Rs/kg
    net_margin: float # Rs/kg
    lot_size_mt: float = 16.0
    total_lot_profit: float # Rs
    break_even_price: float # Rs/kg
    trade_viability_score: int # 0 - 100
    recommended_action: str # 'EXECUTE DISPATCH' | 'MONITOR SPREAD' | 'HOLD LOCAL' | 'AVOID ROUTE'
    risk_level: str # 'LOW' | 'MEDIUM' | 'HIGH'
    grade_a_margin: float
    grade_b_margin: float
    arbitrage_window_hours: int

class ForecastPoint(BaseModel):
    date: str
    predicted_modal: float
    lower_bound: float
    upper_bound: float
    predicted_arrivals_mt: float

class ForecastDriver(BaseModel):
    feature: str
    impact_rs: float
    direction: str # 'positive' | 'negative'
    description: str

class ModelAccuracy(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape_pct: float
    directional_accuracy_pct: float
    validation_window_days: int

class ForecastResponse(BaseModel):
    market_id: str
    market_name: str
    commodity: str
    variety: str
    horizon_days: int
    current_price: float
    forecast_points: List[ForecastPoint]
    drivers: List[ForecastDriver]
    accuracy: ModelAccuracy
    recommendation: str
    confidence_score: int

class SimulationRequest(BaseModel):
    source_cluster: str = "Pulivendula (Kadapa)"
    destination_id: str = "delhi_azadpur"
    commodity: str = "Banana"
    variety: str = "G9 Cavendish"
    lot_size_mt: float = 16.0
    crate_weight_kg: float = 15.0 # Standard mandi crate is 15kg (or 13kg CFB box)
    truck_type: str = "normal" # Always normal open/tarpaulin truck (16 MT)
    purchase_price_rs_kg: float = 14.50
    custom_freight_rs_kg: Optional[float] = None
    labour_cost_rs_kg: float = 0.85
    crate_box_cost_rs_kg: float = 2.50
    hamali_rs_kg: float = 0.40
    mandi_cess_pct: float = 1.5
    transit_loss_pct: Optional[float] = None
    include_ripening: bool = False
    ripening_cost_rs_kg: float = 1.60
    credit_days: int = 14
    capital_cost_pct_annual: float = 14.0
    target_sale_price_override: Optional[float] = None

class HarvestLot(BaseModel):
    id: str
    farmer_name: str
    cluster: str
    mandal: str
    district: str
    acreage: float
    cut_readiness_date: str
    estimated_yield_mt: float
    grade_a_pct: float
    grade_b_pct: float
    committed_status: str # 'Available' | 'Allocated' | 'In Transit' | 'Harvested'
    quality_brix_calibration: float
    assigned_destination: Optional[str] = None

class BuyerDemand(BaseModel):
    id: str
    buyer_name: str
    segment: str # 'Modern Retail' | 'B2B Agritech' | 'Wholesale Commission Agent' | 'Ripening Hub' | 'Export Aggregator'
    destination_market: str
    weekly_offtake_mt: float
    preferred_grade: str
    max_delivered_price_rs_kg: float
    payment_terms_days: int
    reliability_rating: str # 'AAA' | 'AA' | 'A' | 'B'
    repeat_order_probability_pct: int
    active_rfq_tonnage: float

class AlertMessage(BaseModel):
    id: str
    severity: str # 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'INFO'
    category: str # 'PRICE_SPREAD' | 'ARRIVALS_DROP' | 'NEGATIVE_MARGIN' | 'STALE_DATA' | 'REJECTION_RISK'
    title: str
    description: str
    source_node: str
    dest_node: str
    metric_value: str
    timestamp: str
    whatsapp_format: str
    status: str = "ACTIVE"

# --- NEW MODULE: Market Verification & Buyer Discovery Schemas ---

class PriceVerificationRecord(BaseModel):
    market_id: str
    displayed_market_name: str
    official_market_name: str
    state: str
    district: str
    displayed_commodity: str
    raw_commodity: str
    displayed_variety: str
    raw_variety: str
    displayed_modal_price: float
    raw_modal_price: float
    displayed_arrivals_mt: float
    raw_arrivals_mt: float
    report_date: str
    app_fetch_timestamp: str
    source_system: str
    raw_source_url: str
    verification_status: str # 'Verified' | 'Partially Verified' | 'Unverified' | 'Source Conflict'
    market_type: str # 'Official Mandi' | 'Private Buyer' | 'Commission Agent Quote' | 'Export Packhouse' | 'Internal Realized Sale' | 'AI Estimate'
    variety_confidence: str # 'Exact Match' | 'Probable Generic Banana' | 'Unverified G9 Mapping'
    data_freshness_type: str # 'Daily Mandi Report' | 'Real-time Stream' | 'Estimated'
    source_confidence_score: int # 0 - 100
    is_safe_for_trading: bool
    warnings: List[str]
    audit_notes: str

class BuyerContact(BaseModel):
    id: str
    market: str
    business_name: str
    contact_person: Optional[str] = None
    phone_number: str
    alternate_phone: Optional[str] = None
    market_locality: str
    address: str
    buyer_type: str # 'Commission Agent' | 'Wholesaler' | 'Ripening Hub' | 'Direct Buyer' | 'Ex-Mundy Merchant'
    verification_level: str # 'Official APMC Directory' | 'Company Website Verified' | 'Multi-Source Cross-Verified' | 'Single-Source Unverified'
    source_url: str
    source_type: str
    banana_relevance_score: int # 0 - 100
    commission_agent_likelihood_score: int # 0 - 100
    truckload_capacity: str
    call_priority: int # 1 | 2 | 3
    notes: str
    call_status: str = "Not Called" # 'Not Called' | 'Contacted - Interested' | 'Contacted - Rate Low' | 'Deal Closed' | 'Unreachable'

class RouteReadinessSummary(BaseModel):
    route_id: str
    source_name: str
    destination_name: str
    net_margin: float
    verified_price_score: int
    contact_availability_score: int
    route_economics_score: int
    buyer_confidence_score: int
    composite_readiness_score: int
    readiness_classification: str # 'Ready to Test' | 'Needs More Buyer Verification' | 'Price Attractive but Buyer Weak' | 'Avoid for Now'
    recommended_action: str
    total_verified_contacts: int
    top_commission_agents_count: int

class CallingScript(BaseModel):
    buyer_name: str
    market_name: str
    phone_number: str
    suggested_intro: str
    questions: List[str]
    negotiation_points: List[str]
    closing: str
