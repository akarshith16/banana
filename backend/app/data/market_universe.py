"""
Indian Fresh Produce Market Universe & Geographic Logistics Matrix
Centered on G9 Cavendish Banana flows from Andhra Pradesh (Anantapur, Kadapa, Pulivendula)
to nationwide destination mandis across India.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

# Source Clusters in Andhra Pradesh
SOURCE_CLUSTERS = [
    {
        "id": "ap_pulivendula",
        "name": "Pulivendula Banana Cluster",
        "district": "YSR Kadapa",
        "state": "Andhra Pradesh",
        "type": "source_cluster",
        "banana_relevance": "High",
        "distance_from_ap_km": 0.0,
        "lat": 14.4231,
        "lng": 78.2341,
        "avg_daily_volume_mt": 480.0,
        "active_buyers_count": 38,
        "ripening_facility_available": True,
        "base_farmgate_price": 14.20,
        "variety": "G9 Cavendish",
        "major_fpos": ["Pulivendula Horti Producer Co.", "Rayalaseema Banana Collective"]
    },
    {
        "id": "ap_tadipatri",
        "name": "Tadipatri Commercial Belt",
        "district": "Anantapur",
        "state": "Andhra Pradesh",
        "type": "source_cluster",
        "banana_relevance": "High",
        "distance_from_ap_km": 0.0,
        "lat": 14.9100,
        "lng": 78.0100,
        "avg_daily_volume_mt": 520.0,
        "active_buyers_count": 42,
        "ripening_facility_available": False,
        "base_farmgate_price": 14.40,
        "variety": "G9 Cavendish",
        "major_fpos": ["Anantapur Organic Greens FPO", "Tadipatri Agri Cluster"]
    },
    {
        "id": "ap_anantapur_rural",
        "name": "Anantapur Rural & Raptadu",
        "district": "Anantapur",
        "state": "Andhra Pradesh",
        "type": "source_cluster",
        "banana_relevance": "High",
        "distance_from_ap_km": 0.0,
        "lat": 14.6819,
        "lng": 77.6006,
        "avg_daily_volume_mt": 390.0,
        "active_buyers_count": 29,
        "ripening_facility_available": True,
        "base_farmgate_price": 14.10,
        "variety": "G9 Cavendish",
        "major_fpos": ["Raptadu Banana Growers Federation"]
    },
    {
        "id": "ap_kurnool_dhone",
        "name": "Dhone-Kurnool Agri Hub",
        "district": "Kurnool",
        "state": "Andhra Pradesh",
        "type": "source_cluster",
        "banana_relevance": "High",
        "distance_from_ap_km": 0.0,
        "lat": 15.4200,
        "lng": 77.8700,
        "avg_daily_volume_mt": 310.0,
        "active_buyers_count": 24,
        "ripening_facility_available": False,
        "base_farmgate_price": 14.30,
        "variety": "G9 Cavendish",
        "major_fpos": ["Dhone Agro Produce"]
    },
    {
        "id": "ap_ravulapalem",
        "name": "Ravulapalem Banana Market",
        "district": "East Godavari",
        "state": "Andhra Pradesh",
        "type": "source_cluster",
        "banana_relevance": "Medium",
        "distance_from_ap_km": 540.0,
        "lat": 16.7500,
        "lng": 81.8500,
        "avg_daily_volume_mt": 280.0,
        "active_buyers_count": 20,
        "ripening_facility_available": True,
        "base_farmgate_price": 15.10,
        "variety": "Karpura & G9",
        "major_fpos": ["Godavari Delta Fruit Guild"]
    }
]

# Pan-India Destination Markets & Wholesale Terminals
DESTINATION_MARKETS = [
    {
        "id": "srinagar_parimpora",
        "name": "Parimpora Fruit Mandi",
        "district": "Srinagar",
        "state": "Jammu & Kashmir",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 2750.0,
        "transit_hours": 58.0,
        "lat": 34.0900,
        "lng": 74.7700,
        "avg_daily_volume_mt": 320.0,
        "typical_spread_rs_kg": 21.50, # Highest realization in India: ~Rs. 36.00/kg (Rs. 540/crate)
        "freight_open_rs_kg": 5.60, # 10-wheeler normal truck freight via NH44 Jammu-Srinagar highway
        "mandi_cess_pct": 1.0,
        "transit_loss_pct": 4.5,
        "active_buyers_count": 65,
        "ripening_facility_available": True,
        "grade_preference": "Grade A Green Cavendish (Extended valley shelf life)"
    },
    {
        "id": "mumbai_vashi",
        "name": "Vashi APMC Fruit Market",
        "district": "Navi Mumbai",
        "state": "Maharashtra",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 880.0,
        "transit_hours": 20.0,
        "lat": 19.0760,
        "lng": 73.0070,
        "avg_daily_volume_mt": 720.0,
        "typical_spread_rs_kg": 11.80,
        "freight_open_rs_kg": 2.30,
        "mandi_cess_pct": 1.2,
        "transit_loss_pct": 2.4,
        "active_buyers_count": 115,
        "ripening_facility_available": True,
        "grade_preference": "Grade A & Grade B (High Earning Potential)"
    },
    {
        "id": "delhi_azadpur",
        "name": "Azadpur APMC Mandi",
        "district": "North Delhi",
        "state": "Delhi",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 2040.0,
        "transit_hours": 42.0,
        "lat": 28.7167,
        "lng": 77.1750,
        "avg_daily_volume_mt": 950.0,
        "typical_spread_rs_kg": 14.50,
        "freight_open_rs_kg": 4.10,
        "mandi_cess_pct": 1.0,
        "transit_loss_pct": 4.2,
        "active_buyers_count": 140,
        "ripening_facility_available": True,
        "grade_preference": "Grade A (Long fingers, spotless)"
    },
    {
        "id": "kolkata_posta",
        "name": "Mechua & Posta Fruit Market",
        "district": "Kolkata",
        "state": "West Bengal",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 1680.0,
        "transit_hours": 36.0,
        "lat": 22.5833,
        "lng": 88.3500,
        "avg_daily_volume_mt": 580.0,
        "typical_spread_rs_kg": 14.80,
        "freight_open_rs_kg": 3.80,
        "mandi_cess_pct": 1.5,
        "transit_loss_pct": 3.8,
        "active_buyers_count": 92,
        "ripening_facility_available": False,
        "grade_preference": "Grade A & Medium Cavendish"
    },
    {
        "id": "bengaluru_binny",
        "name": "Binny Mill & Singena Agrahara",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 240.0,
        "transit_hours": 5.0,
        "lat": 12.9716,
        "lng": 77.5946,
        "avg_daily_volume_mt": 540.0,
        "typical_spread_rs_kg": 6.80,
        "freight_open_rs_kg": 1.00,
        "mandi_cess_pct": 1.5,
        "transit_loss_pct": 1.1,
        "active_buyers_count": 88,
        "ripening_facility_available": True,
        "grade_preference": "Grade A & Robusta/G9 (Primary Operational Market)"
    },
    {
        "id": "hyderabad_batasingaram",
        "name": "Batasingaram & Bowenpally",
        "district": "Hyderabad",
        "state": "Telangana",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 360.0,
        "transit_hours": 7.5,
        "lat": 17.3850,
        "lng": 78.4867,
        "avg_daily_volume_mt": 620.0,
        "typical_spread_rs_kg": 7.60,
        "freight_open_rs_kg": 1.10,
        "mandi_cess_pct": 1.0,
        "transit_loss_pct": 1.4,
        "active_buyers_count": 95,
        "ripening_facility_available": True,
        "grade_preference": "Grade A & Grade B (Rapid Turnover)"
    },
    {
        "id": "ahmedabad_naroda",
        "name": "Naroda APMC Mandi",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 1390.0,
        "transit_hours": 28.0,
        "lat": 23.0800,
        "lng": 72.6500,
        "avg_daily_volume_mt": 490.0,
        "typical_spread_rs_kg": 12.60,
        "freight_open_rs_kg": 3.20,
        "mandi_cess_pct": 1.0,
        "transit_loss_pct": 3.1,
        "active_buyers_count": 78,
        "ripening_facility_available": True,
        "grade_preference": "Grade A"
    },
    {
        "id": "jaipur_muhana",
        "name": "Muhana Mandi Terminal",
        "district": "Jaipur",
        "state": "Rajasthan",
        "type": "primary_wholesale",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 1820.0,
        "transit_hours": 38.0,
        "lat": 26.8100,
        "lng": 75.7400,
        "avg_daily_volume_mt": 410.0,
        "typical_spread_rs_kg": 13.20,
        "freight_open_rs_kg": 3.70,
        "mandi_cess_pct": 1.6,
        "transit_loss_pct": 3.6,
        "active_buyers_count": 65,
        "ripening_facility_available": True,
        "grade_preference": "Grade A"
    },
    {
        "id": "jnpt_export_packhouse",
        "name": "JNPT Port Agro-Packhouse",
        "district": "Raigad",
        "state": "Maharashtra",
        "type": "export_node",
        "banana_relevance": "High (Confirmed G9 Destination)",
        "distance_km": 890.0,
        "transit_hours": 20.5,
        "lat": 18.9500,
        "lng": 72.9500,
        "avg_daily_volume_mt": 350.0,
        "typical_spread_rs_kg": 16.50,
        "freight_open_rs_kg": 2.50,
        "mandi_cess_pct": 0.0, # Zero cess on export SEZ
        "transit_loss_pct": 1.5,
        "active_buyers_count": 18,
        "ripening_facility_available": False,
        "grade_preference": "Export Grade A+ (Middle East Spec, 13kg CFB)"
    }
]

COMMODITIES_REGISTRY = [
    {
        "id": "banana_g9",
        "name": "Banana",
        "variety": "G9 Cavendish",
        "unit": "Rs/kg",
        "box_size_kg": 13.0,
        "shelf_life_days": 18,
        "ripening_temp_c": "14-16C",
        "primary_source_state": "Andhra Pradesh",
        "is_primary": True
    },
    {
        "id": "tomato_hybrid",
        "name": "Tomato",
        "variety": "Hybrid (Sahu/Abhinav)",
        "unit": "Rs/kg",
        "box_size_kg": 25.0,
        "shelf_life_days": 8,
        "ripening_temp_c": "12-15C",
        "primary_source_state": "Andhra Pradesh (Madanapalle)",
        "is_primary": False
    },
    {
        "id": "mango_alphonso",
        "name": "Mango",
        "variety": "Banganapalli & Alphonso",
        "unit": "Rs/kg",
        "box_size_kg": 5.0,
        "shelf_life_days": 12,
        "ripening_temp_c": "18-21C",
        "primary_source_state": "Andhra Pradesh (Nuzvid/Chittoor)",
        "is_primary": False
    },
    {
        "id": "onion_red",
        "name": "Onion",
        "variety": "Nashik & Kurnool Red",
        "unit": "Rs/kg",
        "box_size_kg": 50.0,
        "shelf_life_days": 45,
        "ripening_temp_c": "Ambient",
        "primary_source_state": "Andhra Pradesh & Maharashtra",
        "is_primary": False
    },
    {
        "id": "pomegranate_bhagwa",
        "name": "Pomegranate",
        "variety": "Bhagwa / Sindhuri",
        "unit": "Rs/kg",
        "box_size_kg": 10.0,
        "shelf_life_days": 30,
        "ripening_temp_c": "5-7C",
        "primary_source_state": "Andhra Pradesh (Anantapur)",
        "is_primary": False
    },
    {
        "id": "mosambi_sweetlime",
        "name": "Sweet Lime",
        "variety": "Sathgudi / Mosambi",
        "unit": "Rs/kg",
        "box_size_kg": 20.0,
        "shelf_life_days": 20,
        "ripening_temp_c": "8-10C",
        "primary_source_state": "Andhra Pradesh (Kadapa)",
        "is_primary": False
    }
]

def get_market_by_id(market_id: str) -> Dict[str, Any]:
    for m in SOURCE_CLUSTERS + DESTINATION_MARKETS:
        if m["id"] == market_id:
            return m
    return DESTINATION_MARKETS[0]
