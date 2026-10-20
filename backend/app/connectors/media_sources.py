"""
Media & Aggregator Mandi Price Sources
Secondary verification sources for cross-checking mandi prices against
independent market-reporting platforms (commodityonline, commoditymarketlive,
mandibhavindia, kisandeals, agriplus, etc.).
"""

import httpx
import logging
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

logger = logging.getLogger("media_sources")

# Source configurations: base URL patterns and commodity slug mapping
MEDIA_SOURCES: List[Dict[str, Any]] = [
    {
        "name": "commodityonline",
        "base": "https://www.commodityonline.com/mandiprices/banana",
        "state_path": "/andhra-pradesh",
        "market_path": "/nct-of-delhi/azadpur",
        "price_selector": "₹",
    },
    {
        "name": "commoditymarketlive",
        "base": "https://www.commoditymarketlive.com",
        "market_price_path": "/mandi-price-market/{market}",
    },
    {
        "name": "mandibhavindia",
        "base": "https://mandibhavindia.in/en/commodity/banana",
    },
    {
        "name": "kisandeals",
        "base": "https://www.kisandeals.com/mandiprices/BANANA",
    },
    {
        "name": "agriplus",
        "base": "https://agriplus.in/prices/banana",
    },
]


class MediaSourceResult:
    def __init__(self, source: str, market: str, modal_price_rs_kg: Optional[float],
                 min_price_rs_kg: Optional[float], max_price_rs_kg: Optional[float],
                 date: Optional[str], confidence: str):
        self.source = source
        self.market = market
        self.modal_price_rs_kg = modal_price_rs_kg
        self.min_price_rs_kg = min_price_rs_kg
        self.max_price_rs_kg = max_price_rs_kg
        self.date = date
        self.confidence = confidence


async def fetch_media_price(
    client: httpx.AsyncClient,
    source: Dict[str, Any],
    market_name: str,
    state: Optional[str] = None,
) -> Optional[MediaSourceResult]:
    """Best-effort scrape of a media source for a given market's banana price."""
    name = source["name"]
    try:
        if name == "commodityonline":
            return await _fetch_commodityonline(client, market_name, state)
        if name == "commoditymarketlive":
            return await _fetch_commoditymarketlive(client, market_name)
        if name == "mandibhavindia":
            return await _fetch_mandibhavindia(client, market_name, state)
        if name == "kisandeals":
            return await _fetch_kisandeals(client, market_name, state)
        if name == "agriplus":
            return await _fetch_agriplus(client, market_name, state)
    except Exception as e:
        logger.warning(f"Media source {name} failed for {market_name}: {e}")
    return None


def _parse_rs_per_kg(text: str) -> Optional[float]:
    """Extract a rupees-per-kg figure from text like '₹19/kg' or '₹ 19.00'."""
    if not text:
        return None
    m = re.search(r"₹\s*([\d,.]+)", text.replace(",", ""))
    if not m:
        return None
    try:
        return round(float(m.group(1)), 2)
    except ValueError:
        return None


def _parse_rs_per_qtl(text: str) -> Optional[float]:
    """Extract rupees-per-quintal and convert to per-kg."""
    if not text:
        return None
    m = re.search(r"₹\s*([\d,.]+)", text.replace(",", ""))
    if not m:
        return None
    try:
        return round(float(m.group(1)) / 100.0, 2)
    except ValueError:
        return None


async def _fetch_commodityonline(
    client: httpx.AsyncClient, market_name: str, state: Optional[str]
) -> Optional[MediaSourceResult]:
    state_slug = (state or "andhra-pradesh").lower().replace(" ", "-")
    url = f"https://www.commodityonline.com/mandiprices/banana/{state_slug}"
    try:
        res = client.get(url, timeout=8.0, headers={"User-Agent": "Mozilla/5.0"})
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.text, "html.parser")
        text = soup.get_text(" ", strip=True)
        # Look for market-specific price mention
        for marker in [market_name.lower(), "azadpur", "vashi", "srinagar", "binny", "bowenpally", "mechua"]:
            idx = text.lower().find(marker)
            if idx != -1:
                snippet = text[idx:idx + 200]
                price = _parse_rs_per_kg(snippet)
                if price:
                    return MediaSourceResult("commodityonline", market_name, price, price * 0.93, price * 1.07,
                                             datetime.now().strftime("%Y-%m-%d"), "page_text")
        return None
    except Exception:
        return None


async def _fetch_commoditymarketlive(
    client: httpx.AsyncClient, market_name: str
) -> Optional[MediaSourceResult]:
    market_slug = market_name.lower().replace(" ", "-").replace(",", "")
    url = f"https://www.commoditymarketlive.com/mandi-price-market/{market_slug}"
    try:
        res = client.get(url, timeout=8.0, headers={"User-Agent": "Mozilla/5.0"})
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.text, "html.parser")
        text = soup.get_text(" ", strip=True)
        price = _parse_rs_per_kg(text)
        if price:
            return MediaSourceResult("commoditymarketlive", market_name, price, price * 0.93, price * 1.07,
                                     datetime.now().strftime("%Y-%m-%d"), "page_text")
        return None
    except Exception:
        return None


async def _fetch_mandibhavindia(
    client: httpx.AsyncClient, market_name: str, state: Optional[str]
) -> Optional[MediaSourceResult]:
    state_slug = (state or "delhi").lower().replace(" ", "-")
    market_slug = market_name.lower().replace(" ", "-")
    url = f"https://mandibhavindia.in/en/commodity/banana/{state_slug}/{market_slug}"
    try:
        res = client.get(url, timeout=8.0, headers={"User-Agent": "Mozilla/5.0"})
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.text, "html.parser")
        text = soup.get_text(" ", strip=True)
        price = _parse_rs_per_kg(text)
        if price:
            return MediaSourceResult("mandibhavindia", market_name, price, price * 0.93, price * 1.07,
                                     datetime.now().strftime("%Y-%m-%d"), "page_text")
        return None
    except Exception:
        return None


async def _fetch_kisandeals(
    client: httpx.AsyncClient, market_name: str, state: Optional[str]
) -> Optional[MediaSourceResult]:
    state_slug = (state or "nct-of-delhi").upper().replace(" ", "-")
    url = f"https://www.kisandeals.com/mandiprices/BANANA/{state_slug}/ALL"
    try:
        res = client.get(url, timeout=8.0, headers={"User-Agent": "Mozilla/5.0"})
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.text, "html.parser")
        text = soup.get_text(" ", strip=True)
        price = _parse_rs_per_kg(text)
        if price:
            return MediaSourceResult("kisandeals", market_name, price, price * 0.93, price * 1.07,
                                     datetime.now().strftime("%Y-%m-%d"), "page_text")
        return None
    except Exception:
        return None


async def _fetch_agriplus(
    client: httpx.AsyncClient, market_name: str, state: Optional[str]
) -> Optional[MediaSourceResult]:
    state_slug = (state or "jammu-and-kashmir").lower().replace(" ", "-")
    market_slug = market_name.lower().replace(" ", "-")
    url = f"https://agriplus.in/prices/banana/{state_slug}/{market_slug}"
    try:
        res = client.get(url, timeout=8.0, headers={"User-Agent": "Mozilla/5.0"})
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.text, "html.parser")
        text = soup.get_text(" ", strip=True)
        price = _parse_rs_per_kg(text)
        if price:
            return MediaSourceResult("agriplus", market_name, price, price * 0.93, price * 1.07,
                                     datetime.now().strftime("%Y-%m-%d"), "page_text")
        return None
    except Exception:
        return None


async def fetch_all_media_prices(
    market_name: str, state: Optional[str] = None
) -> List[MediaSourceResult]:
    """Fetch banana price for a market from all configured media sources."""
    results: List[MediaSourceResult] = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        for source in MEDIA_SOURCES:
            result = await fetch_media_price(client, source, market_name, state)
            if result:
                results.append(result)
    return results
