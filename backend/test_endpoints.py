import urllib.request
import json

sri_buyers = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/buyers/discover?market_id=srinagar_parimpora").read().decode())
kol_buyers = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/buyers/discover?market_id=kolkata_posta").read().decode())
print(f"Srinagar buyers count: {len(sri_buyers)}, names: {[b['business_name'] for b in sri_buyers]}")
print(f"Kolkata buyers count: {len(kol_buyers)}, names: {[b['business_name'] for b in kol_buyers]}")

verif = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/verification/all?commodity=Banana").read().decode())
print(f"\nTotal Markets Verified: {len(verif)}")
for v in verif:
    print(f"- {v['displayed_market_name']} ({v['state']}): {v['variety_confidence']} | Score: {v['source_confidence_score']} | Safe: {v['is_safe_for_trading']}")
