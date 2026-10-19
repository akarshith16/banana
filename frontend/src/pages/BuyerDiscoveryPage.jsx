import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Phone,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Download,
  Plus,
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import {
  discoverBuyers,
  fetchRouteReadiness,
  fetchCallingScript,
  addCustomBuyer,
  updateBuyerCallStatus
} from '../api';
import PriceVerificationDrawer from '../components/PriceVerificationDrawer';

export default function BuyerDiscoveryPage({
  sourceClusterName = 'Pulivendula (Kadapa)',
  sourceClusterId = 'ap_pulivendula',
  defaultTargetMarket = 'bengaluru_binny'
}) {
  const [targetMarket, setTargetMarket] = useState(defaultTargetMarket);
  const [contacts, setContacts] = useState([]);
  const [routeReadiness, setRouteReadiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Script Modal state
  const [activeScript, setActiveScript] = useState(null);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Add Buyer Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBuyerData, setNewBuyerData] = useState({
    business_name: '',
    contact_person: '',
    phone_number: '',
    buyer_type: 'Commission Agent',
    address: '',
    notes: ''
  });

  // Price verification drawer state
  const [verifyDrawerOpen, setVerifyDrawerOpen] = useState(false);

  const priorityMarkets = [
    { id: 'mumbai_vashi', name: 'Mumbai (Vashi APMC)', priority: 'Top Earning Route' },
    { id: 'delhi_azadpur', name: 'Delhi (Azadpur Mandi)', priority: 'Major Volume Hub' },
    { id: 'srinagar_parimpora', name: 'Srinagar (Parimpora Mandi)', priority: 'Highest Realization (J&K)' },
    { id: 'kolkata_posta', name: 'Kolkata (Mechua Fruit Market)', priority: 'East India Gateway' },
    { id: 'bengaluru_binny', name: 'Bengaluru (Binny Mill)', priority: 'Primary Operational Hub' }
  ];

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [buyerList, readiness] = await Promise.all([
        discoverBuyers(targetMarket),
        fetchRouteReadiness(sourceClusterId, targetMarket)
      ]);
      setContacts(buyerList);
      setRouteReadiness(readiness);
    } catch (err) {
      console.error('Failed to load buyer discovery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [targetMarket, sourceClusterId]);

  const handleOpenScript = async (contact) => {
    try {
      const script = await fetchCallingScript(contact.id, sourceClusterName);
      setActiveScript(script);
      setScriptModalOpen(true);
      setScriptCopied(false);
    } catch (err) {
      console.error('Failed to generate calling script:', err);
    }
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await updateBuyerCallStatus(contactId, newStatus);
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, call_status: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newBuyerData.business_name || !newBuyerData.phone_number) return;
    try {
      const res = await addCustomBuyer({
        market: targetMarket,
        ...newBuyerData
      });
      setContacts((prev) => [res, ...prev]);
      setAddModalOpen(false);
      setNewBuyerData({
        business_name: '',
        contact_person: '',
        phone_number: '',
        buyer_type: 'Commission Agent',
        address: '',
        notes: ''
      });
    } catch (err) {
      console.error('Failed to add custom buyer:', err);
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contact_person && c.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.phone_number.includes(searchTerm) ||
        c.market_locality.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority =
        priorityFilter === 'ALL' || c.call_priority.toString() === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [contacts, searchTerm, priorityFilter]);

  const exportCSV = () => {
    const headers = [
      'Market',
      'Business Name',
      'Contact Person',
      'Phone Number',
      'Buyer Type',
      'Verification Level',
      'Address',
      'Banana Relevance Score',
      'Call Priority',
      'Source URL',
      'Call Status'
    ];
    const rows = filteredContacts.map((c) => [
      `"${c.market_locality}"`,
      `"${c.business_name}"`,
      `"${c.contact_person || ''}"`,
      `"${c.phone_number}"`,
      `"${c.buyer_type}"`,
      `"${c.verification_level}"`,
      `"${c.address}"`,
      c.banana_relevance_score,
      c.call_priority,
      `"${c.source_url}"`,
      `"${c.call_status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kadali_buyer_contacts_${targetMarket}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Target Market Selector Tabs */}
      <div className="cockpit-panel p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            Target Destination Market:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {priorityMarkets.map((m) => (
              <button
                key={m.id}
                onClick={() => setTargetMarket(m.id)}
                className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                  targetMarket === m.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-[#162032] text-slate-300 hover:text-white hover:bg-[#202d46]'
                }`}
              >
                <span>{m.name}</span>
                <span className={`text-[10px] px-1 py-0 rounded ${
                  targetMarket === m.id ? 'bg-slate-950/20 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {m.priority}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVerifyDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Verify Market Price</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add My Own Buyer</span>
          </button>
        </div>
      </div>

      {/* "Sell This Load" Operational Readiness Card */}
      {routeReadiness && (
        <div className="cockpit-panel p-4 bg-gradient-to-r from-[#141e30] via-[#101826] to-[#141e30] border-amber-500/30">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚛</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    "Sell This Load" Corridor Readiness
                  </h3>
                  <span
                    className={`badge ${
                      routeReadiness.readiness_classification === 'Ready to Test'
                        ? 'badge-success'
                        : routeReadiness.readiness_classification.includes('Weak')
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                  >
                    {routeReadiness.readiness_classification}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Origin: <span className="font-semibold text-white">{sourceClusterName}</span> ➡️ Destination: <span className="font-semibold text-amber-300">{routeReadiness.destination_name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Expected Net Margin</span>
                <span className="text-base font-bold text-emerald-400 tabular-nums">
                  +Rs. {routeReadiness.net_margin.toFixed(2)} /kg
                </span>
                <span className="text-[11px] font-bold text-amber-300 block tabular-nums">
                  +Rs. {(routeReadiness.net_margin * 15).toFixed(1)} / 15kg crate
                </span>
              </div>
              <div className="p-2 rounded bg-[#162032] border border-[#243048] text-right">
                <span className="text-[10px] text-slate-400 block">Total Truck Net Profit</span>
                <span className="text-base font-bold text-white tabular-nums">
                  Rs. {Math.round(routeReadiness.net_margin * 16000).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">16 MT Normal Truck (~1,067 cr)</span>
              </div>
            </div>
          </div>

          {/* Readiness Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-xs pt-2 border-t border-[#243048]">
            <div className="p-2 rounded bg-[#162032] flex justify-between items-center">
              <span className="text-slate-400">Verified Price Score:</span>
              <span className="font-bold text-emerald-400">{routeReadiness.verified_price_score}/25</span>
            </div>
            <div className="p-2 rounded bg-[#162032] flex justify-between items-center">
              <span className="text-slate-400">Verified Contacts Found:</span>
              <span className="font-bold text-white">{routeReadiness.total_verified_contacts} Contacts</span>
            </div>
            <div className="p-2 rounded bg-[#162032] flex justify-between items-center">
              <span className="text-slate-400">Commission Agents:</span>
              <span className="font-bold text-amber-400">{routeReadiness.top_commission_agents_count} Top Gala Agents</span>
            </div>
            <div className="p-2 rounded bg-[#162032] flex justify-between items-center">
              <span className="text-slate-400">Action Plan:</span>
              <span className="font-semibold text-amber-300 truncate text-[11px]">
                {routeReadiness.recommended_action.split(':')[0]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Contacts Workspace */}
      <div className="cockpit-panel p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search trader, gala, contact person, phone..."
                className="w-full bg-[#162032] border border-[#243048] rounded pl-8 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-[#162032] border border-[#243048] rounded px-2.5 py-1.5">
              <span className="text-slate-400 font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#162032]">All Priorities</option>
                <option value="1" className="bg-[#162032]">Priority 1: Top Banana Agents</option>
                <option value="2" className="bg-[#162032]">Priority 2: General Wholesalers</option>
                <option value="3" className="bg-[#162032]">Priority 3: Secondary Leads</option>
              </select>
            </div>

            <div className="text-slate-400 text-xs">
              Showing <span className="font-bold text-white">{filteredContacts.length}</span> verified contacts
            </div>
          </div>

          {/* Export Actions */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#162032] hover:bg-[#202d46] border border-[#243048] text-slate-200 font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Call Sheet (CSV)</span>
          </button>
        </div>

        {/* Contacts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#131b2b] text-slate-400 border-b border-[#243048]">
              <tr>
                <th className="py-2.5 px-3">Business Name & Person</th>
                <th className="py-2.5 px-2">Phone Number</th>
                <th className="py-2.5 px-2">Market Locality & Gala</th>
                <th className="py-2.5 px-2">Buyer Type</th>
                <th className="py-2.5 px-2">Verification Level</th>
                <th className="py-2.5 px-2 text-center">Banana Score</th>
                <th className="py-2.5 px-2">Truck Capacity</th>
                <th className="py-2.5 px-2">Call Status</th>
                <th className="py-2.5 px-3 text-center">Action / Script</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-[#162032] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0 rounded ${
                        contact.call_priority === 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        P{contact.call_priority}
                      </span>
                      <span>{contact.business_name}</span>
                    </div>
                    {contact.contact_person && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        👤 {contact.contact_person}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 font-mono font-bold text-amber-400">
                    <a
                      href={`tel:${contact.phone_number.replace(/[^0-9+]/g, '')}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{contact.phone_number}</span>
                    </a>
                  </td>
                  <td className="py-2.5 px-2 text-slate-300">
                    <div>{contact.market_locality}</div>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                      {contact.address}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-200">
                    <span className="badge badge-info">{contact.buyer_type}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span
                      className={`badge ${
                        contact.verification_level.includes('Official')
                          ? 'badge-success'
                          : contact.verification_level.includes('Website')
                          ? 'badge-banana'
                          : 'badge-info'
                      }`}
                    >
                      {contact.verification_level}
                    </span>
                    <a
                      href={contact.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-slate-400 hover:text-amber-300 block mt-0.5 truncate max-w-[140px] underline"
                    >
                      Source Link ↗
                    </a>
                  </td>
                  <td className="py-2.5 px-2 text-center tabular-nums font-bold text-emerald-400">
                    {contact.banana_relevance_score}%
                  </td>
                  <td className="py-2.5 px-2 text-[11px] text-slate-300">
                    {contact.truckload_capacity}
                  </td>
                  <td className="py-2.5 px-2">
                    <select
                      value={contact.call_status}
                      onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border focus:outline-none cursor-pointer ${
                        contact.call_status === 'Deal Closed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : contact.call_status.includes('Interested')
                          ? 'bg-amber-950 text-amber-300 border-amber-500'
                          : 'bg-[#162032] text-slate-300 border-[#243048]'
                      }`}
                    >
                      <option value="Not Called">Not Called</option>
                      <option value="Contacted - Interested">Interested (Send Photos)</option>
                      <option value="Contacted - Rate Low">Rate Too Low</option>
                      <option value="Deal Closed">Truck Locked (Deal Closed)</option>
                      <option value="Unreachable">Unreachable / No Answer</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleOpenScript(contact)}
                      className="px-2.5 py-1 rounded bg-[#202d46] hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 mx-auto"
                    >
                      <MessageSquare className="w-3 h-3 text-amber-400" />
                      <span>Script</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calling Script Modal */}
      {scriptModalOpen && activeScript && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="cockpit-panel w-full max-w-2xl bg-[#0d131f] border border-[#243048] p-5 rounded-lg shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#243048]">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  G9 Banana Trader Calling Script: {activeScript.buyer_name}
                </h3>
                <p className="text-xs text-slate-400">
                  Target: {activeScript.market_name} | Direct Line: <span className="font-bold text-amber-400 font-mono">{activeScript.phone_number}</span>
                </p>
              </div>
              <button
                onClick={() => setScriptModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Script Text */}
            <div className="space-y-3 bg-[#131b2b] p-4 rounded border border-[#243048] text-slate-200 font-mono leading-relaxed">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  Step 1: Opening Pitch
                </span>
                <p className="text-[11px] text-slate-200">{activeScript.suggested_intro}</p>
              </div>

              <div className="pt-2 border-t border-[#1e293b]">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  Step 2: Key Trade Discovery Questions
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {activeScript.questions.map((q, idx) => (
                    <li key={idx} className="pl-3 border-l-2 border-amber-500/50">{q}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#1e293b]">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  Step 3: Closing & Delivery Lock
                </span>
                <p className="text-[11px] text-slate-200">{activeScript.closing}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const text = `${activeScript.suggested_intro}\n\n${activeScript.questions.join('\n')}\n\n${activeScript.closing}`;
                  navigator.clipboard.writeText(text);
                  setScriptCopied(true);
                  setTimeout(() => setScriptCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded bg-[#202d46] hover:bg-[#2e4063] text-slate-200 font-semibold flex items-center gap-1.5"
              >
                {scriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{scriptCopied ? 'Copied to Clipboard!' : 'Copy Script Text'}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeScript.phone_number.replace(/[^0-9+]/g, '')}`}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {activeScript.phone_number}</span>
                </a>
                <button
                  onClick={() => setScriptModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Buyer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="cockpit-panel w-full max-w-lg bg-[#0d131f] border border-[#243048] p-5 rounded-lg shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#243048]">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Add My Own Buyer / Commission Agent Lead
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balaji Fruit Commission Agency"
                  value={newBuyerData.business_name}
                  onChange={(e) => setNewBuyerData({ ...newBuyerData, business_name: e.target.value })}
                  className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={newBuyerData.contact_person}
                    onChange={(e) => setNewBuyerData({ ...newBuyerData, contact_person: e.target.value })}
                    className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mobile / Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98..."
                    value={newBuyerData.phone_number}
                    onChange={(e) => setNewBuyerData({ ...newBuyerData, phone_number: e.target.value })}
                    className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Buyer Type</label>
                  <select
                    value={newBuyerData.buyer_type}
                    onChange={(e) => setNewBuyerData({ ...newBuyerData, buyer_type: e.target.value })}
                    className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white font-semibold focus:outline-none"
                  >
                    <option value="Commission Agent">Commission Agent</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Ripening Hub">Ripening Hub</option>
                    <option value="Direct Buyer">Direct Buyer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gala / Address</label>
                  <input
                    type="text"
                    placeholder="Shop C-12, APMC Yard"
                    value={newBuyerData.address}
                    onChange={(e) => setNewBuyerData({ ...newBuyerData, address: e.target.value })}
                    className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Trader Notes / Terms</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Agreed to 5% commission, pays T+2 days"
                  value={newBuyerData.notes}
                  onChange={(e) => setNewBuyerData({ ...newBuyerData, notes: e.target.value })}
                  className="w-full bg-[#162032] border border-[#243048] rounded px-3 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#243048]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Buyer Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Verification Drawer Integration */}
      <PriceVerificationDrawer
        isOpen={verifyDrawerOpen}
        onClose={() => setVerifyDrawerOpen(false)}
        marketId={targetMarket}
      />
    </div>
  );
}
