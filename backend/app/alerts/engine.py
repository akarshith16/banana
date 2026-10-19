"""
Real-time Alerting & Field Dispatch Broadcast Engine
Monitors spread arbitrage spikes, arrival shortages, stale data, and negative margins.
Generates structured field notifications and ready-to-broadcast WhatsApp messages.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.models import AlertMessage

def generate_live_alerts() -> List[AlertMessage]:
    now = datetime.now()
    
    alerts: List[AlertMessage] = [
        AlertMessage(
            id="ALT-1081",
            severity="OPPORTUNITY",
            category="PRICE_SPREAD",
            title="High Spread Arbitrage: Pulivendula -> Azadpur Delhi",
            description="Landed net margin reached Rs. 4.85/kg (+Rs. 72.75 / 15kg crate) after normal truck freight and cess adjustment. Net profit per 16MT normal truck: Rs. 77,600.",
            source_node="Pulivendula Banana Cluster (Kadapa)",
            dest_node="Azadpur APMC Mandi (Delhi)",
            metric_value="+Rs. 4.85/kg (+Rs. 72.75/crate)",
            timestamp=(now - timedelta(minutes=18)).strftime("%H:%M:%S IST"),
            whatsapp_format=(
                "🚨 *KADALI FRESH ARBITRAGE ALERT* 🚨\n"
                "🍌 *Crop:* G9 Cavendish Banana\n"
                "📍 *Route:* Pulivendula (AP) ➡️ Delhi Azadpur\n"
                "💰 *Farmgate Purchase:* Rs. 14.20/kg (Rs. 213/crate)\n"
                "📈 *Delhi Modal Sale:* Rs. 28.70/kg (Rs. 430/crate)\n"
                "🚚 *Normal Truck Freight & Hamali:* Rs. 4.50/kg (Rs. 67.50/crate)\n"
                "✨ *NET PROFIT:* +Rs. 4.85/kg | +Rs. 72.75/crate (~Rs. 77,600 / 16MT Truck)\n"
                "⏱️ *Recommendation:* Dispatch Normal 16 MT Truck within 4 hours."
            ),
            status="ACTIVE"
        ),
        AlertMessage(
            id="ALT-1082",
            severity="WARNING",
            category="ARRIVALS_DROP",
            title="Supply Squeeze in Vashi Mumbai (Arrivals Down 32%)",
            description="Daily banana arrivals in Vashi APMC dropped from 720 MT to 490 MT due to transit delays from Jalgaon. Modal price jumped +Rs. 1.80/kg.",
            source_node="Anantapur Commercial Belt",
            dest_node="Vashi APMC Fruit Market (Mumbai)",
            metric_value="-32% Arrivals (490 MT)",
            timestamp=(now - timedelta(minutes=42)).strftime("%H:%M:%S IST"),
            whatsapp_format=(
                "⚠️ *MANDI ARRIVAL SQUEEZE ALERT* ⚠️\n"
                "📍 *Mandi:* Vashi Fruit Market (Mumbai)\n"
                "📉 *Arrivals:* 490 MT (Normal: 720 MT, -32%)\n"
                "🔥 *Price Reaction:* Modal jumped to Rs. 26.00/kg (+Rs. 1.80)\n"
                "🎯 *Action:* Prioritize 2 loads from Anantapur for morning auction arrival."
            ),
            status="ACTIVE"
        ),
        AlertMessage(
            id="ALT-1083",
            severity="CRITICAL",
            category="NEGATIVE_MARGIN",
            title="Negative Risk-Adjusted Margin: Tadipatri -> Bhubaneswar",
            description="High freight costs (Rs. 4.20/kg) and transit bruising (3.8%) on NH16 route render current Bhubaneswar bids unviable (-Rs. 0.85/kg loss).",
            source_node="Tadipatri Commercial Belt",
            dest_node="Aiginia Wholesale Terminal (Bhubaneswar)",
            metric_value="-Rs. 0.85/kg Net Loss",
            timestamp=(now - timedelta(hours=1, minutes=15)).strftime("%H:%M:%S IST"),
            whatsapp_format=(
                "⛔ *AVOID ROUTE WARNING* ⛔\n"
                "📍 *Route:* Tadipatri ➡️ Bhubaneswar\n"
                "❌ *Net Margin:* -Rs. 0.85/kg (Loss of Rs. 13,600 per lot)\n"
                "🛑 *Reason:* High NH16 toll/freight + 3.8% shrinkage exceeds spread.\n"
                "🔄 *Action:* Reroute fruit to Kolkata Posta or local Hyderabad market."
            ),
            status="ACTIVE"
        ),
        AlertMessage(
            id="ALT-1084",
            severity="INFO",
            category="STALE_DATA",
            title="AGMARKNET Feed Refresh Latency: Karond Bhopal",
            description="Government mandi portal feed for Bhopal has not updated for 5 hours. Calibrated fallback pricing is currently active with +/-2% confidence band.",
            source_node="Central System Connector",
            dest_node="Karond Fruit Mandi (Bhopal)",
            metric_value="Latency: 310 mins",
            timestamp=(now - timedelta(hours=2, minutes=5)).strftime("%H:%M:%S IST"),
            whatsapp_format=(
                "ℹ️ *DATA REFRESH NOTICE*\n"
                "Bhopal Karond feed delayed on AGMARKNET. Backup statistical model active."
            ),
            status="ACTIVE"
        ),
        AlertMessage(
            id="ALT-1085",
            severity="WARNING",
            category="REJECTION_RISK",
            title="High Temperature Advisory: Transit Protection on Jaipur Corridor",
            description="Ambient daytime temperatures along MP-Rajasthan corridor exceeding 36C. Ensure double straw/banana leaf padding and night driving schedule to prevent sunscald in normal tarpaulin truck.",
            source_node="Pulivendula / Kadapa",
            dest_node="Muhana Mandi Terminal (Jaipur)",
            metric_value="Transit Advisory: Night Driving",
            timestamp=(now - timedelta(hours=3, minutes=10)).strftime("%H:%M:%S IST"),
            whatsapp_format=(
                "☀️ *WEATHER & TRANSIT ADVISORY* ☀️\n"
                "Route to Jaipur experiencing daytime heat.\n"
                "Ensure wet gunny bag / straw padding on tarpaulin truck and schedule departure for 6:00 PM evening."
            ),
            status="ACTIVE"
        )
    ]
    return alerts
