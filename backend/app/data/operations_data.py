"""
Procurement Schedules, Farmer Harvest Lots & Buyer Demand Master Data
Models real farm clusters in Anantapur, Kadapa, Pulivendula and buyer accounts
including Reliance Fresh, Ninjacart, WayCool, BigBasket, and terminal commission agents.
"""

from typing import List
from datetime import datetime, timedelta
from app.models import HarvestLot, BuyerDemand

def get_farmer_harvest_lots() -> List[HarvestLot]:
    now = datetime.now().date()
    return [
        HarvestLot(
            id="LOT-AP-701",
            farmer_name="V. Ramana Reddy & Sons",
            cluster="Pulivendula Commercial Belt",
            mandal="Vempalli",
            district="YSR Kadapa",
            acreage=14.5,
            cut_readiness_date=(now + timedelta(days=1)).strftime("%Y-%m-%d"),
            estimated_yield_mt=32.0,
            grade_a_pct=78.0,
            grade_b_pct=22.0,
            committed_status="Available",
            quality_brix_calibration=18.5,
            assigned_destination="Delhi Azadpur (Planned)"
        ),
        HarvestLot(
            id="LOT-AP-702",
            farmer_name="K. Mallikarjuna Naidu",
            cluster="Tadipatri Commercial Belt",
            mandal="Peddapappur",
            district="Anantapur",
            acreage=18.0,
            cut_readiness_date=(now + timedelta(days=2)).strftime("%Y-%m-%d"),
            estimated_yield_mt=42.0,
            grade_a_pct=82.0,
            grade_b_pct=18.0,
            committed_status="Allocated",
            quality_brix_calibration=19.2,
            assigned_destination="Mumbai Vashi"
        ),
        HarvestLot(
            id="LOT-AP-703",
            farmer_name="Chandra Shekar Rao (FPO Cluster)",
            cluster="Anantapur Rural & Raptadu",
            mandal="Raptadu",
            district="Anantapur",
            acreage=22.5,
            cut_readiness_date=(now + timedelta(days=3)).strftime("%Y-%m-%d"),
            estimated_yield_mt=55.0,
            grade_a_pct=72.0,
            grade_b_pct=28.0,
            committed_status="Available",
            quality_brix_calibration=17.8,
            assigned_destination="Unassigned (Surplus)"
        ),
        HarvestLot(
            id="LOT-AP-704",
            farmer_name="S. Narayana Swamy",
            cluster="Dhone-Kurnool Agri Hub",
            mandal="Bethamcherla",
            district="Kurnool",
            acreage=10.0,
            cut_readiness_date=(now + timedelta(days=1)).strftime("%Y-%m-%d"),
            estimated_yield_mt=24.0,
            grade_a_pct=65.0,
            grade_b_pct=35.0,
            committed_status="Available",
            quality_brix_calibration=16.9,
            assigned_destination="Hyderabad Batasingaram"
        ),
        HarvestLot(
            id="LOT-AP-705",
            farmer_name="B. Srinivasulu & Group",
            cluster="Pulivendula Commercial Belt",
            mandal="Simhadripuram",
            district="YSR Kadapa",
            acreage=16.0,
            cut_readiness_date=(now + timedelta(days=4)).strftime("%Y-%m-%d"),
            estimated_yield_mt=38.0,
            grade_a_pct=85.0,
            grade_b_pct=15.0,
            committed_status="Allocated",
            quality_brix_calibration=19.8,
            assigned_destination="JNPT Export Packhouse"
        )
    ]

def get_buyer_demand_board() -> List[BuyerDemand]:
    return [
        BuyerDemand(
            id="BYR-REL-01",
            buyer_name="Reliance Retail Fresh (North Hub)",
            segment="Modern Retail",
            destination_market="Azadpur APMC Mandi / Kundli Warehouse",
            weekly_offtake_mt=85.0,
            preferred_grade="Grade A (Uniform 8-9 inch, unblemished)",
            max_delivered_price_rs_kg=30.50,
            payment_terms_days=7,
            reliability_rating="AAA",
            repeat_order_probability_pct=96,
            active_rfq_tonnage=45.0
        ),
        BuyerDemand(
            id="BYR-BB-02",
            buyer_name="BigBasket (Innovative Retail - Mumbai)",
            segment="Modern Retail",
            destination_market="Vashi APMC Fruit Market / Bhiwandi DC",
            weekly_offtake_mt=60.0,
            preferred_grade="Grade A & B+",
            max_delivered_price_rs_kg=27.20,
            payment_terms_days=10,
            reliability_rating="AAA",
            repeat_order_probability_pct=92,
            active_rfq_tonnage=32.0
        ),
        BuyerDemand(
            id="BYR-NINJA-03",
            buyer_name="Ninjacart B2B Agritech",
            segment="B2B Agritech",
            destination_market="Batasingaram & Bowenpally (Hyderabad)",
            weekly_offtake_mt=95.0,
            preferred_grade="Mixed Grade (High velocity turnover)",
            max_delivered_price_rs_kg=22.50,
            payment_terms_days=3,
            reliability_rating="AA",
            repeat_order_probability_pct=88,
            active_rfq_tonnage=50.0
        ),
        BuyerDemand(
            id="BYR-WAY-04",
            buyer_name="WayCool Foods & Products",
            segment="B2B Agritech",
            destination_market="Binny Mill & Singena Agrahara (Bengaluru)",
            weekly_offtake_mt=50.0,
            preferred_grade="Grade A (Ethylene chamber ready)",
            max_delivered_price_rs_kg=21.80,
            payment_terms_days=7,
            reliability_rating="AA",
            repeat_order_probability_pct=85,
            active_rfq_tonnage=25.0
        ),
        BuyerDemand(
            id="BYR-AZD-05",
            buyer_name="Haji Ghulam Rasool & Co. (Azadpur Commission Agent)",
            segment="Wholesale Commission Agent",
            destination_market="Azadpur APMC Mandi (Delhi)",
            weekly_offtake_mt=120.0,
            preferred_grade="Grade A Heavy bunches",
            max_delivered_price_rs_kg=29.00,
            payment_terms_days=14,
            reliability_rating="A",
            repeat_order_probability_pct=90,
            active_rfq_tonnage=64.0
        ),
        BuyerDemand(
            id="BYR-EXP-06",
            buyer_name="Gulf Agro Exports FZE (Jebel Ali)",
            segment="Export Aggregator",
            destination_market="JNPT Port Agro-Packhouse",
            weekly_offtake_mt=70.0,
            preferred_grade="Export Grade A+ (13kg CFB carton, GlobalGAP)",
            max_delivered_price_rs_kg=33.50,
            payment_terms_days=5,
            reliability_rating="AAA",
            repeat_order_probability_pct=94,
            active_rfq_tonnage=38.0
        )
    ]
