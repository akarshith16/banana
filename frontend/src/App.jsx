import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './pages/OverviewDashboard';
import LiveMarkets from './pages/LiveMarkets';
import MarketCompare from './pages/MarketCompare';
import ForecastStudio from './pages/ForecastStudio';
import TradeCalculator from './pages/TradeCalculator';
import ProcurementPlanner from './pages/ProcurementPlanner';
import BuyerDemandBoard from './pages/BuyerDemandBoard';
import AlertsCenter from './pages/AlertsCenter';
import AdminConnectors from './pages/AdminConnectors';
import PriceVerificationConsole from './pages/PriceVerificationConsole';
import BuyerDiscoveryPage from './pages/BuyerDiscoveryPage';
import PriceVerificationDrawer from './components/PriceVerificationDrawer';

import {
  fetchHealth,
  fetchLiveMandi,
  fetchRouteEconomics,
  fetchAlerts
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sourceCluster, setSourceCluster] = useState('ap_pulivendula');
  const [commodity, setCommodity] = useState('Banana');
  const [role, setRole] = useState('Trader');
  const [isDark, setIsDark] = useState(true);

  // Core application data state
  const [healthData, setHealthData] = useState(null);
  const [mandiData, setMandiData] = useState([]);
  const [routeEconomics, setRouteEconomics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedRouteTarget, setSelectedRouteTarget] = useState('Azadpur APMC Mandi (Delhi)');
  const [loading, setLoading] = useState(true);

  // Global Price Verification Drawer state
  const [verifyDrawerState, setVerifyDrawerState] = useState({
    isOpen: false,
    marketId: 'delhi_azadpur',
    modalPrice: 28.5,
    arrivalsMt: 950
  });

  const clusterNames = {
    ap_pulivendula: 'Pulivendula (Kadapa)',
    ap_tadipatri: 'Tadipatri (Anantapur)',
    ap_anantapur_rural: 'Anantapur Rural',
    ap_kurnool_dhone: 'Dhone-Kurnool',
    ap_ravulapalem: 'Ravulapalem (E. Godavari)'
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [h, m, r, a] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchLiveMandi(commodity).catch(() => []),
        fetchRouteEconomics(sourceCluster, commodity).catch(() => []),
        fetchAlerts().catch(() => [])
      ]);
      setHealthData(h);
      setMandiData(m);
      setRouteEconomics(r);
      setAlerts(a);
    } catch (err) {
      console.error('Error loading control tower data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sourceCluster, commodity]);

  // Handle theme class on body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }, [isDark]);

  const handleSelectRouteForCompare = (destName) => {
    setSelectedRouteTarget(destName);
    setActiveTab('market-compare');
  };

  const handleOpenGlobalVerification = (marketId, modalPrice, arrivalsMt) => {
    setVerifyDrawerState({
      isOpen: true,
      marketId: marketId || 'delhi_azadpur',
      modalPrice: modalPrice || 28.5,
      arrivalsMt: arrivalsMt || 900
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0a0e17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sticky Cockpit Header */}
      <Header
        sourceCluster={sourceCluster}
        setSourceCluster={setSourceCluster}
        commodity={commodity}
        setCommodity={setCommodity}
        role={role}
        setRole={setRole}
        isDark={isDark}
        setIsDark={setIsDark}
        healthData={healthData}
        onRefresh={loadData}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Module Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertsCount={alerts.length}
          topArbCount={routeEconomics.filter((r) => r.net_margin > 2.0).length}
          verifiedCount={27}
          leadsCount={12}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-53px)]">
          {activeTab === 'overview' && (
            <OverviewDashboard
              routeData={routeEconomics}
              alerts={alerts}
              onNavigateTab={setActiveTab}
              onSelectRouteForCompare={handleSelectRouteForCompare}
              sourceClusterName={clusterNames[sourceCluster] || 'Pulivendula'}
              onVerifyMandi={handleOpenGlobalVerification}
            />
          )}

          {activeTab === 'buyer-discovery' && (
            <BuyerDiscoveryPage
              sourceClusterName={clusterNames[sourceCluster] || 'Pulivendula (Kadapa)'}
              sourceClusterId={sourceCluster}
              defaultTargetMarket="bengaluru_binny"
            />
          )}

          {activeTab === 'price-verification' && (
            <PriceVerificationConsole
              onSelectMarketForCompare={handleSelectRouteForCompare}
            />
          )}

          {activeTab === 'live-markets' && (
            <LiveMarkets
              mandiObservations={mandiData}
              commodity={commodity}
              onSelectMarketForCompare={handleSelectRouteForCompare}
              onVerifyPrice={(item) => handleOpenGlobalVerification(item.market_id, item.modal_price, item.arrivals_mt)}
            />
          )}

          {activeTab === 'market-compare' && (
            <MarketCompare
              sourceClusterId={sourceCluster}
              initialDestName={selectedRouteTarget}
              destinationsList={mandiData}
              onOpenVerification={(mId) => handleOpenGlobalVerification(mId)}
              onNavigateToBuyers={() => setActiveTab('buyer-discovery')}
            />
          )}

          {activeTab === 'forecast-studio' && (
            <ForecastStudio commodity={commodity} />
          )}

          {activeTab === 'trade-calculator' && (
            <TradeCalculator
              sourceClusterName={clusterNames[sourceCluster] || 'Pulivendula (Kadapa)'}
            />
          )}

          {activeTab === 'procurement-planner' && <ProcurementPlanner />}

          {activeTab === 'buyer-demand' && <BuyerDemandBoard />}

          {activeTab === 'alerts-center' && <AlertsCenter alerts={alerts} />}

          {activeTab === 'admin-connectors' && (
            <AdminConnectors onDataRefresh={loadData} />
          )}
        </main>
      </div>

      {/* Global Price Verification Drawer */}
      <PriceVerificationDrawer
        isOpen={verifyDrawerState.isOpen}
        onClose={() => setVerifyDrawerState((prev) => ({ ...prev, isOpen: false }))}
        marketId={verifyDrawerState.marketId}
        modalPrice={verifyDrawerState.modalPrice}
        arrivalsMt={verifyDrawerState.arrivalsMt}
        onNavigateToConsole={() => setActiveTab('price-verification')}
      />
    </div>
  );
}
