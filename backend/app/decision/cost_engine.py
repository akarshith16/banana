"""
Commercial Decision & Route Arbitrage Engine
Calculates true landed net margins, shrinkage, packing, finance costs,
break-even prices, and multi-factor Trade Viability Scores for pan-India routes.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from app.data.market_universe import SOURCE_CLUSTERS, DESTINATION_MARKETS, get_market_by_id
from app.models import RouteCostBreakdown, SimulationRequest

def calculate_single_route_economics(
    source_market: Dict[str, Any],
    dest_market: Dict[str, Any],
    source_purchase_price: float,
    dest_modal_price: float,
    lot_size_mt: float = 16.0,
    crate_weight_kg: float = 15.0, # Standard mandi crate is 15kg (or 13kg CFB box)
    custom_freight: Optional[float] = None,
    labour_rs_kg: float = 0.85,
    crate_box_rs_kg: float = 2.50, # Mandi crate amortized / washing / liner charge
    hamali_rs_kg: float = 0.40,
    mandi_cess_pct: Optional[float] = None,
    include_ripening: bool = False,
    ripening_cost_rs_kg: float = 1.60,
    credit_days: int = 14,
    capital_cost_annual_pct: float = 14.0,
    truck_type: str = "normal" # Always normal open/tarpaulin truck (10-wheeler / 16 MT)
) -> RouteCostBreakdown:
    """
    Computes exact landed cost breakdown, net margin per kg, and full crate-wise pricing.
    Banana traders exclusively use standard open body / tarpaulin trucks (16 MT).
    """
    dist_km = dest_market.get("distance_km", 1000.0)
    transit_hrs = dest_market.get("transit_hours", 24.0)
    
    # 1. Freight cost per kg - Normal Truck Freight (Open body / Tarpaulin)
    if custom_freight is not None:
        freight_per_kg = custom_freight
    else:
        # Standard domestic normal truck freight rate (open body with tarpaulin & leaf padding)
        freight_per_kg = dest_market.get("freight_open_rs_kg", round(dist_km * 0.0021, 2))

    # 2. Packing & Labour
    # Labour covers farm cutting, destemming, alum wash, and packing table
    # Crate covers standard mandi plastic crates or CFB boxes
    packing_and_labour = labour_rs_kg + crate_box_rs_kg
    
    # 3. Loading & Unloading (Hamali) at source cluster and destination mandi
    loading_unloading = hamali_rs_kg

    # 4. Mandi Cess & Commission at destination APMC
    cess_pct = mandi_cess_pct if mandi_cess_pct is not None else dest_market.get("mandi_cess_pct", 1.5)
    mandi_cess_per_kg = round(dest_modal_price * (cess_pct / 100.0), 2)

    # 5. Route Shrinkage / Transit Loss (weight loss + natural moisture loss in normal truck)
    transit_shrinkage_pct = dest_market.get("transit_loss_pct", 3.0)
    transit_loss_cost = round(source_purchase_price * (transit_shrinkage_pct / 100.0), 2)

    # 6. Ripening cost if applicable (ethylene treatment in chamber for 4 days)
    ripening = ripening_cost_rs_kg if include_ripening else 0.0

    # 7. Payment Cycle & Working Capital Cost
    # Interest on outlay (purchase + freight + packing) over credit cycle days
    cash_outlay_per_kg = source_purchase_price + freight_per_kg + packing_and_labour + loading_unloading
    finance_cost_per_kg = round(cash_outlay_per_kg * (capital_cost_annual_pct / 100.0) * (credit_days / 365.0), 2)

    # Total logistics & handling cost per kg
    total_cost = round(
        freight_per_kg +
        labour_rs_kg +
        crate_box_rs_kg +
        loading_unloading +
        mandi_cess_per_kg +
        transit_loss_cost +
        ripening +
        finance_cost_per_kg,
        2
    )

    # Gross spread & Net Margin per kg
    gross_spread = round(dest_modal_price - source_purchase_price, 2)
    net_margin = round(gross_spread - total_cost, 2)
    
    total_lot_kg = lot_size_mt * 1000.0
    # Factoring in weight shrinkage on saleable tonnage
    saleable_kg = total_lot_kg * (1.0 - (transit_shrinkage_pct / 100.0))
    revenue = saleable_kg * dest_modal_price
    total_expenses = (total_lot_kg * source_purchase_price) + (total_lot_kg * total_cost)
    total_lot_profit = round(revenue - total_expenses, 0)
    
    break_even_price = round(source_purchase_price + total_cost, 2)

    # ================= CRATE-WISE PRICE CALCULATIONS =================
    total_crates_in_lot = int(total_lot_kg / max(1.0, crate_weight_kg))
    source_price_per_crate = round(source_purchase_price * crate_weight_kg, 2)
    dest_price_per_crate = round(dest_modal_price * crate_weight_kg, 2)
    gross_spread_per_crate = round(gross_spread * crate_weight_kg, 2)
    freight_cost_per_crate = round(freight_per_kg * crate_weight_kg, 2)
    crate_packaging_per_crate = round(crate_box_rs_kg * crate_weight_kg, 2)
    labour_harvest_wash_per_crate = round(labour_rs_kg * crate_weight_kg, 2)
    hamali_per_crate = round(loading_unloading * crate_weight_kg, 2)
    mandi_cess_per_crate = round(mandi_cess_per_kg * crate_weight_kg, 2)
    transit_shrinkage_per_crate = round(transit_loss_cost * crate_weight_kg, 2)
    total_cost_per_crate = round(total_cost * crate_weight_kg, 2)
    net_margin_per_crate = round(net_margin * crate_weight_kg, 2)
    break_even_price_per_crate = round(break_even_price * crate_weight_kg, 2)

    # Multi-factor Trade Viability Score (0 - 100)
    # Evaluates: Net Margin magnitude (40%), Liquidity/Volume (25%), Route Distance risk (20%), Buyer depth (15%)
    margin_score = max(0, min(40, int(net_margin * 10))) # Rs. 4/kg net margin = 40 pts
    volume_score = min(25, int(dest_market.get("avg_daily_volume_mt", 300) / 40.0))
    distance_penalty = max(0, int((dist_km - 500) / 100.0))
    distance_score = max(5, 20 - distance_penalty)
    buyer_score = min(15, int(dest_market.get("active_buyers_count", 50) / 8.0))
    
    viability_score = min(100, max(10, margin_score + volume_score + distance_score + buyer_score))

    # Action Recommendation logic
    if net_margin >= 3.50 and viability_score >= 70:
        recommended_action = "EXECUTE DISPATCH (Top Arbitrage)"
        risk_level = "LOW"
    elif net_margin >= 1.50:
        recommended_action = "COMMERCIALLY VIABLE"
        risk_level = "MEDIUM"
    elif net_margin >= 0.0:
        recommended_action = "MONITOR SPREAD (Marginal Buffer)"
        risk_level = "HIGH"
    else:
        recommended_action = "AVOID ROUTE (Negative Net Spread)"
        risk_level = "HIGH"

    # Grade A vs Grade B pricing (Grade A commands +15% premium, Grade B trades at -12% discount)
    grade_a_margin = round(net_margin + (dest_modal_price * 0.12), 2)
    grade_b_margin = round(net_margin - (dest_modal_price * 0.10), 2)

    return RouteCostBreakdown(
        source_cluster=source_market["name"],
        destination_market=dest_market["name"],
        distance_km=dist_km,
        transit_hours=transit_hrs,
        source_purchase_price=source_purchase_price,
        dest_modal_price=dest_modal_price,
        gross_spread=gross_spread,
        freight_cost=freight_per_kg,
        labour_harvest_wash=labour_rs_kg,
        crate_packaging=crate_box_rs_kg,
        loading_unloading_hamali=loading_unloading,
        mandi_commission_cess=mandi_cess_per_kg,
        transit_shrinkage_pct=transit_shrinkage_pct,
        transit_shrinkage_cost=transit_loss_cost,
        ripening_cost=ripening,
        payment_cycle_finance_cost=finance_cost_per_kg,
        total_logistics_cost=total_cost,
        net_margin=net_margin,
        lot_size_mt=lot_size_mt,
        total_lot_profit=total_lot_profit,
        break_even_price=break_even_price,
        trade_viability_score=viability_score,
        recommended_action=recommended_action,
        risk_level=risk_level,
        grade_a_margin=grade_a_margin,
        grade_b_margin=grade_b_margin,
        arbitrage_window_hours=48 if dist_km < 1000 else 72,
        # Crate Economics & Normal Truck
        truck_type="Normal Open / Tarpaulin Truck (16 MT)",
        crate_weight_kg=crate_weight_kg,
        total_crates_in_lot=total_crates_in_lot,
        source_price_per_crate=source_price_per_crate,
        dest_price_per_crate=dest_price_per_crate,
        gross_spread_per_crate=gross_spread_per_crate,
        freight_cost_per_crate=freight_cost_per_crate,
        crate_packaging_per_crate=crate_packaging_per_crate,
        labour_harvest_wash_per_crate=labour_harvest_wash_per_crate,
        hamali_per_crate=hamali_per_crate,
        mandi_cess_per_crate=mandi_cess_per_crate,
        transit_shrinkage_per_crate=transit_shrinkage_per_crate,
        total_cost_per_crate=total_cost_per_crate,
        net_margin_per_crate=net_margin_per_crate,
        break_even_price_per_crate=break_even_price_per_crate
    )

def evaluate_all_destinations(
    source_market_id: str = "ap_pulivendula",
    commodity: str = "Banana",
    source_price_override: Optional[float] = None,
    live_prices: Optional[Dict[str, float]] = None
) -> List[RouteCostBreakdown]:
    """
    Ranks all nationwide destinations from the chosen AP source cluster.
    """
    source_m = get_market_by_id(source_market_id)
    source_price = source_price_override or source_m.get("base_farmgate_price", 14.50)

    results: List[RouteCostBreakdown] = []
    
    for dest in DESTINATION_MARKETS:
        # Determine current destination modal price
        if live_prices and dest["id"] in live_prices:
            dest_price = live_prices[dest["id"]]
        else:
            spread = dest.get("typical_spread_rs_kg", 11.0)
            dest_price = round(source_price + spread, 2)
            
        breakdown = calculate_single_route_economics(
            source_market=source_m,
            dest_market=dest,
            source_purchase_price=source_price,
            dest_modal_price=dest_price
        )
        results.append(breakdown)

    # Sort primarily by Net Margin descending
    results.sort(key=lambda x: x.net_margin, reverse=True)
    return results
