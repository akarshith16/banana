"""
CSV Ingestion Handler for Spot Mandi Prices and Internal Dispatches
Allows traders to upload daily spot sheets from commission agents, mandis, or field buyers.
"""

import csv
import io
from typing import List, Dict, Any
from app.connectors.agmarknet import apply_manual_spot_price, connector_health

def parse_and_apply_csv_feed(csv_content: str) -> Dict[str, Any]:
    """
    Parses CSV stream containing columns:
    market_id (or mandi_name), modal_price, arrivals_mt, notes
    """
    f = io.StringIO(csv_content.strip())
    reader = csv.DictReader(f)
    
    updated_records = []
    errors = []
    
    row_count = 0
    for row in reader:
        row_count += 1
        # Normalize column keys
        clean_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}
        
        m_id = clean_row.get("market_id") or clean_row.get("mandi_id") or clean_row.get("mandi")
        price_str = clean_row.get("modal_price") or clean_row.get("modal") or clean_row.get("price")
        arr_str = clean_row.get("arrivals_mt") or clean_row.get("arrivals") or clean_row.get("volume")
        notes = clean_row.get("notes", "CSV batch import")
        
        if not m_id or not price_str:
            errors.append(f"Row {row_count}: missing market_id or modal_price")
            continue
            
        try:
            modal_p = float(price_str)
            arr_mt = float(arr_str) if arr_str else 350.0
            apply_manual_spot_price(m_id, modal_p, arr_mt, notes=notes)
            updated_records.append({
                "market_id": m_id,
                "modal_price": modal_p,
                "arrivals_mt": arr_mt
            })
        except Exception as e:
            errors.append(f"Row {row_count} parsing error: {str(e)}")

    connector_health.data_mode = "CSV_OVERRIDE_ACTIVE"
    return {
        "status": "success" if not errors else "partial_success",
        "records_ingested": len(updated_records),
        "errors": errors,
        "updated": updated_records
    }
