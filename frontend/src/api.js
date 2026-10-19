/**
 * API Client for Kadali Fresh Control Tower
 * Connects to FastAPI backend (/api/*) with resilient fallback for maximum reliability.
 */

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchUniverse() {
  const res = await fetch(`${BASE_URL}/universe`);
  if (!res.ok) throw new Error('Failed to fetch market universe');
  return res.json();
}

export async function fetchLiveMandi(commodity = 'Banana', state = 'all', relevance = 'all') {
  const params = new URLSearchParams({ commodity });
  if (state && state !== 'all') params.append('state', state);
  if (relevance && relevance !== 'all') params.append('relevance', relevance);
  const res = await fetch(`${BASE_URL}/mandi/live?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch live mandi prices');
  return res.json();
}

export async function fetchRouteEconomics(sourceId = 'ap_pulivendula', commodity = 'Banana', sourcePrice = null) {
  const params = new URLSearchParams({ source_id: sourceId, commodity });
  if (sourcePrice) params.append('source_price', sourcePrice);
  const res = await fetch(`${BASE_URL}/routes/economics?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch route economics');
  return res.json();
}

export async function fetchMarketCompare(sourceId, destId) {
  const params = new URLSearchParams({ source_id: sourceId, dest_id: destId });
  const res = await fetch(`${BASE_URL}/compare?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch market comparison');
  return res.json();
}

export async function fetchForecast(marketId = 'delhi_azadpur', horizonDays = 14, commodity = 'Banana') {
  const params = new URLSearchParams({
    market_id: marketId,
    horizon_days: horizonDays,
    commodity
  });
  const res = await fetch(`${BASE_URL}/forecast?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
}

export async function simulateTradeLot(requestBody) {
  const res = await fetch(`${BASE_URL}/trade-calculator/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  if (!res.ok) throw new Error('Trade simulation failed');
  return res.json();
}

export async function fetchProcurementSchedule() {
  const res = await fetch(`${BASE_URL}/procurement/schedule`);
  if (!res.ok) throw new Error('Failed to fetch procurement schedule');
  return res.json();
}

export async function fetchBuyers() {
  const res = await fetch(`${BASE_URL}/buyers`);
  if (!res.ok) throw new Error('Failed to fetch buyer demand');
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${BASE_URL}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchConnectorStatus() {
  const res = await fetch(`${BASE_URL}/admin/connectors`);
  if (!res.ok) throw new Error('Failed to fetch connector status');
  return res.json();
}

export async function postManualSpot(marketId, modalPrice, arrivalsMt, notes = '') {
  const res = await fetch(`${BASE_URL}/admin/manual-spot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      market_id: marketId,
      modal_price: parseFloat(modalPrice),
      arrivals_mt: parseFloat(arrivalsMt),
      notes
    })
  });
  if (!res.ok) throw new Error('Failed to submit spot price');
  return res.json();
}

export async function uploadCsvFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/admin/upload-csv`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('CSV upload failed');
  return res.json();
}

export async function triggerModelRetrain() {
  const res = await fetch(`${BASE_URL}/admin/retrain`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Retrain trigger failed');
  return res.json();
}

export async function resetDataFeed() {
  const res = await fetch(`${BASE_URL}/admin/reset-data`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Reset failed');
  return res.json();
}

// ================= NEW MODULE: MARKET VERIFICATION & BUYER DISCOVERY =================

export async function fetchVerificationAll(commodity = 'Banana') {
  const params = new URLSearchParams({ commodity });
  const res = await fetch(`${BASE_URL}/verification/all?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch market verifications');
  return res.json();
}

export async function verifyMandiPrice(marketId, modalPrice, arrivalsMt, variety = 'G9 Cavendish') {
  const params = new URLSearchParams({ market_id: marketId, variety });
  if (modalPrice) params.append('modal_price', modalPrice);
  if (arrivalsMt) params.append('arrivals_mt', arrivalsMt);
  const res = await fetch(`${BASE_URL}/verification/verify-mandi?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to verify mandi price');
  return res.json();
}

export async function discoverBuyers(marketId = 'bengaluru_binny') {
  const params = new URLSearchParams({ market_id: marketId });
  const res = await fetch(`${BASE_URL}/buyers/discover?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to discover buyers');
  return res.json();
}

export async function fetchRouteReadiness(sourceId = 'ap_pulivendula', destId = 'bengaluru_binny') {
  const params = new URLSearchParams({ source_id: sourceId, dest_id: destId });
  const res = await fetch(`${BASE_URL}/buyers/route-readiness?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch route readiness');
  return res.json();
}

export async function fetchCallingScript(contactId, sourceName = 'Pulivendula (Kadapa)') {
  const params = new URLSearchParams({ contact_id: contactId, source_name: sourceName });
  const res = await fetch(`${BASE_URL}/buyers/calling-script?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to generate calling script');
  return res.json();
}

export async function addCustomBuyer(payload) {
  const res = await fetch(`${BASE_URL}/buyers/add-custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add custom buyer');
  return res.json();
}

export async function updateBuyerCallStatus(contactId, newStatus) {
  const res = await fetch(`${BASE_URL}/buyers/update-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact_id: contactId, new_status: newStatus })
  });
  if (!res.ok) throw new Error('Failed to update buyer status');
  return res.json();
}
