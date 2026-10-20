"""
eNAM (National Agriculture Market) Live Data Connector
Fetches live mandi commodity prices from the eNAM portal (enam.gov.in) as a
secondary verification source alongside AGMARKNET / data.gov.in.
"""

import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.data.market_universe import SOURCE_CLUSTERS, DESTINATION_MARKETS, get_market_by_id
from app.models import PriceObservation

logger = logging.getLogger("enam_connector")

# eNAM trade data endpoints (public read-only)
ENAM_BASE = "https://enam.gov.in/web/api"
ENAM_COMMODITY_PRICES_ENDPOINT = f"{ENAM_BASE}/commodity-prices"


class EnamConnectorHealth:
    def __init__(self):
        self.last_status: str = "IDLE"
        self.last_sync_time: Optional[datetime] = None
        self.failed_requests_count: int = 0
        self.source_agency: str = "eNAM / National Agriculture Market (GoI)"


enam_health = EnamConnectorHealth()


async def fetch_enam_prices(
    commodity: str = "Banana",
    state: Optional[str] = None,
    market: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Fetch live commodity prices from eNAM API.
    Returns a list of raw price records (best-effort; eNAM endpoints may require
    session tokens or HTML scraping in production).
    """
    records: List[Dict[str, Any]] = []
    params: Dict[str, Any] = {"commodity": commodity, "format": "json"}
    if state:
        params["state"] = state
    if market:
        params["market"] = market

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = client.get(ENAM_COMMODITY_PRICES_ENDPOINT, params=params)
            if res.status_code == 200:
                payload = res.json()
                records = payload.get("records", payload.get("data", []))
                enam_health.last_status = "CONNECTED"
                enam_health.last_sync_time = datetime.now()
                enam_health.failed_requests_count = 0
            else:
                logger.warning(f"eNAM API returned {res.status_code}")
                enam_health.failed_requests_count += 1
                enam_health.last_status = f"HTTP_{res.status_code}"
    except Exception as e:
        logger.warning(f"eNAM fetch failed: {e}")
        enam_health.failed_requests_count += 1
        enam_health.last_status = "UNREACHABLE"

    return records


def normalize_enam_record(rec: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Normalize an eNAM raw record into a common price-observation shape."""
    try:
        modal = float(rec.get("modal_price", rec.get("Modal Price", 0)) or 0)
        if modal <= 0:
            return None
        return {
            "market": rec.get("market", rec.get("Market", "")),
            "state": rec.get("state", rec.get("State", "")),
            "district": rec.get("district", rec.get("District", "")),
            "commodity": rec.get("commodity", rec.get("Commodity", "Banana")),
            "variety": rec.get("variety", rec.get("Variety", "")),
            "modal_price_rs_qtl": modal,
            "min_price_rs_qtl": float(rec.get("min_price", rec.get("Min Price", modal * 0.93)) or modal * 0.93),
            "max_price_rs_qtl": float(rec.get("max_price", rec.get("Max Price", modal * 1.07)) or modal * 1.07),
            "arrivals_qtl": float(rec.get("arrivals", rec.get("Arrivals", 0)) or 0),
            "arrival_date": rec.get("arrival_date", rec.get("Arrival Date", datetime.now().strftime("%Y-%m-%d"))),
            "source": "eNAM",
        }
    except (ValueError, TypeError):
        return None
