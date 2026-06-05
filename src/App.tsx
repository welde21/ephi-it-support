import React, { useState, useEffect } from "react";
import { 
  Bot, 
  HelpCircle, 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  Settings, 
  FileCheck2,
  RefreshCw,
  Bell,
  PlusSquare,
  Activity,
  User,
  ExternalLink,
  ArrowUpRight
} from "lucide-react";

import HomeView from "./components/HomeView";
import ChatbotView from "./components/ChatbotView";
import DashboardView from "./components/DashboardView";
import PerformanceView from "./components/PerformanceView";
import RecommendationsView from "./components/RecommendationsView";
import IncidentsManagerView from "./components/IncidentsManagerView";
import ReportsView from "./components/ReportsView";
import { Incident, ChatMessage, Employee, SystemStatus, Recommendation } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    activeDirectory: "Online",
    ephiEmail: "Online",
    ciscoVpn: "Online",
    dhcpDnsNetwork: "Online",
    lisSystem: "Online",
    internetAccess: "Online",
    lastChecked: new Date().toISOString()
  });

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>(undefined);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Full state fetches
  const fetchAllWorkspaceData = async () => {
    try {
      const [incRes, empRes, recRes, sysRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/employees"),
        fetch("/api/recommendations"),
        fetch("/api/system-status")
      ]);

      if (incRes.ok && empRes.ok && recRes.ok && sysRes.ok) {
        const [incVal, empVal, recVal, sysVal] = await Promise.all([
          incRes.json(),
          empRes.json(),
          recRes.json(),
          sysRes.json()
        ]);
        setIncidents(incVal);
        setEmployees(empVal);
        setRecommendations(recVal);
        setSystemStatus(sysVal);
      }
    } catch (err) {
      console.error("Workspace initial synchronization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWorkspaceData();
  }, []);

  // Sync state triggers
  const handleReloadMetrics = async () => {
    setLoading(true);
    await fetchAllWorkspaceData();
  };

  // CREATE Brand New incident ticket
  const handleAddIncident = async (newInc: Omit<Incident, "id">) => {
    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInc)
      });
      if (response.ok) {
        const created: Incident = await response.json();
        // Prepend locally instantly
        setIncidents(prev => [created, ...prev]);
        // Re-execute employee stats reload
        const empRes = await fetch("/api/employees");
        if (empRes.ok) setEmployees(await empRes.json());
      }
    } catch (err) {
      console.error("Failed to commit new ticket execution:", err);
    }
  };

  // UPDATE Incident Support fields or status (Step 4 & 5)
  const handleUpdateIncident = async (id: string, updatedFields: Partial<Incident>) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        const revised: Incident = await response.json();
        setIncidents(prev => prev.map(item => item.id === id ? revised : item));
        
        // Reload personnel arrays and status matrix
        const [empRes, sysRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/system-status")
        ]);
        if (empRes.ok) setEmployees(await empRes.json());
        if (sysRes.ok) setSystemStatus(await sysRes.json());
      }
    } catch (err) {
      console.error("Failed to update ticket logs:", err);
    }
  };

  // Toggle core service health status manually (Simulates direct system alerts/repairs)
  const handleToggleService = async (service: string, currentStatus: string) => {
    try {
      const response = await fetch("/api/system-status/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, status: currentStatus })
      });
      if (response.ok) {
        setSystemStatus(await response.json());
      }
    } catch (err) {
      console.error("Failed override simulation health:", err);
    }
  };

  // CREATE manual Preventive Recommendation (Recommendations view)
  const handleAddRecommendation = async (newRec: Omit<Recommendation, "id">) => {
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRec)
      });
      if (response.ok) {
        const added: Recommendation = await response.json();
        setRecommendations(prev => [...prev, added]);
      }
    } catch (err) {
      console.error("Failed manual recommendations publish:", err);
    }
  };

  // Shortcut logic: Apply diagnostic guidelines from Chat directly into ticket logs and resolve!
  const handleApplyDiagnosticLogs = async (
    incidentId: string, 
    actions: string, 
    rootCause: string, 
    resolvedStatus: "Resolved" | "Escalated"
  ) => {
    await handleUpdateIncident(incidentId, {
      actionsTaken: actions,
      rootCause,
      status: resolvedStatus,
      timeSpent: 30, // Simulated SLA default
      notes: "Auto-logged resolution diagnostics generated by EPHI AI Copilot Assistant."
    });
  };

  // Routing navigation helper to redirect selected tickets straight to chatbot
  const handleNavigateWithTicketRef = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentTab("chatbot");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 flex-col gap-4">
        <div className="h-10 w-10 border-4 border-slate-300 border-t-brand-teal rounded-full animate-spin"></div>
        <div className="space-y-1 text-center">
          <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-widest">EPHI ICT SYSTEM OVERSEER</h3>
          <p className="text-[11px] text-slate-400 font-medium">Synchronizing organizational registries & helpdesk SLA baselines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-600">
      
      {/* Executive organizational Header Bar */}
      <header className="bg-brand-navy border-b border-brand-navy/30 text-white shrink-0 shadow-lg sticky top-0 z-40" id="executive-control-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Organization logo and Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-emerald-950/25">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-xs md:text-sm text-slate-100 tracking-wide font-display">Ethiopian Public Health Institute</h1>
                <span className="px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded font-mono font-bold text-[8.5px] uppercase border border-teal-500/10">ICT Division</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Automated Support Copilot & Strategic SLA Workspace</p>
            </div>
          </div>

          {/* Core Navigation menu tabs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <button
              onClick={() => setCurrentTab("home")}
              className={`py-2 px-3.5 rounded-md font-medium transition cursor-pointer ${
                currentTab === "home" ? "bg-teal-500/10 text-teal-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Workspace Home
            </button>
            <button
              onClick={() => setCurrentTab("chatbot")}
              className={`py-2 px-3.5 rounded-md font-medium transition cursor-pointer ${
                currentTab === "chatbot" ? "bg-teal-500/10 text-teal-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              AI Helpdesk Assistant
            </button>
            <button
              onClick={() => setCurrentTab("logger")}
              className={`py-2 px-3.5 rounded-md font-medium transition cursor-pointer ${
                currentTab === "logger" ? "bg-teal-500/10 text-teal-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Incident logs
            </button>
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`py-2 px-3.5 rounded-md font-medium transition cursor-pointer ${
                currentTab === "dashboard" ? "bg-teal-500/10 text-teal-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Operations Metrics
            </button>
            <button
              onClick={() => setCurrentTab("performance")}
              className={`py-2 px-3.5 rounded-md font-medium transition cursor-pointer ${
                currentTab === "performance" ? "bg-teal-500/10 text-teal-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Staff Activity
            </button>
            <button
              onClick={() => setCurrentTab("recommendations")}
              className={`py-2 px-3.5 rounded-md font-medium transition cursor-pointer ${
                currentTab === "recommendations" ? "bg-teal-500/10 text-teal-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Strategic Preventive
            </button>
            <button
              onClick={() => setCurrentTab("reports")}
              className={`py-2 px-3.5 rounded-md font-medium transition cursor-pointer ${
                currentTab === "reports" ? "bg-teal-500/10 text-teal-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              Export reports
            </button>
          </nav>

          {/* Right section: checks reload list */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReloadMetrics}
              title="Force Database Sync Refresh"
              className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
            <div className="hidden md:flex flex-col items-end text-right text-[11px] font-mono select-none">
              <span className="text-emerald-400 font-bold leading-none">&#x25CF; SYSTEM RUNNING</span>
              <span className="text-slate-500 leading-none mt-1">EPHI Node 01</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header Mobile tabs (displayed only on mid-sized or tiny viewports) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shadow-sm" id="mobile-control-header">
        <button
          onClick={() => setCurrentTab("home")}
          className={`text-xs font-semibold py-1.5 px-3 rounded-md transition cursor-pointer ${
            currentTab === "home" ? "bg-teal-500 text-white" : "text-slate-400 bg-slate-800/40 hover:bg-slate-800"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentTab("chatbot")}
          className={`text-xs font-semibold py-1.5 px-3 rounded-md transition cursor-pointer ${
            currentTab === "chatbot" ? "bg-teal-500 text-white" : "text-slate-400 bg-slate-800/40 hover:bg-slate-800"
          }`}
        >
          AI Assist
        </button>
        <button
          onClick={() => setCurrentTab("logger")}
          className={`text-xs font-semibold py-1.5 px-3 rounded-md transition cursor-pointer ${
            currentTab === "logger" ? "bg-teal-500 text-white" : "text-slate-400 bg-slate-800/40 hover:bg-slate-800"
          }`}
        >
          Incidents Log
        </button>
        <button
          onClick={() => setCurrentTab("dashboard")}
          className={`text-xs font-semibold py-1.5 px-3 rounded-md transition cursor-pointer ${
            currentTab === "dashboard" ? "bg-teal-500 text-white" : "text-slate-400 bg-slate-800/40 hover:bg-slate-800"
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setCurrentTab("performance")}
          className={`text-xs font-semibold py-1.5 px-3 rounded-md transition cursor-pointer ${
            currentTab === "performance" ? "bg-teal-500 text-white" : "text-slate-400 bg-slate-800/40 hover:bg-slate-800"
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setCurrentTab("recommendations")}
          className={`text-xs font-semibold py-1.5 px-3 rounded-md transition cursor-pointer ${
            currentTab === "recommendations" ? "bg-teal-500 text-white" : "text-slate-400 bg-slate-800/40 hover:bg-slate-800"
          }`}
        >
          Preventive
        </button>
        <button
          onClick={() => setCurrentTab("reports")}
          className={`text-xs font-semibold py-1.5 px-3 rounded-md transition cursor-pointer ${
            currentTab === "reports" ? "bg-teal-500 text-white" : "text-slate-400 bg-slate-800/40 hover:bg-slate-800"
          }`}
        >
          Reports Tab
        </button>
      </div>

      {/* Main workspace view area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 min-h-0 bg-slate-50">
        
        {/* Dynamic warning banner if Cisco VPN degraded */}
        {systemStatus.ciscoVpn === "Degraded" && currentTab !== "chatbot" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fadeIn" id="system-warning-banner">
            <div className="flex gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-800 font-display">SLA INFRASTRUCTURE ALERT</h4>
                <p className="text-xs text-slate-600">The Cisco VPN secure gateway service is displaying degraded latency network wide. Some active remote users cannot establish safe IPsec tunnels.</p>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentTab("chatbot")}
              className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold py-1.5 px-3 rounded-md transition cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <span>Diagnose VPN with AI</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tab Switcher Panel Rendering */}
        <div className="animate-fadeIn">
          {currentTab === "home" && (
            <HomeView 
              incidents={incidents} 
              onNavigate={(tab) => setCurrentTab(tab)}
              systemStatus={systemStatus}
              onToggleService={handleToggleService}
              onRefreshSystem={handleReloadMetrics}
            />
          )}

          {currentTab === "chatbot" && (
            <ChatbotView 
              incidents={incidents}
              chatHistory={chatHistory}
              selectedIncidentId={selectedIncidentId}
              onLinkIncident={(id) => setSelectedIncidentId(id)}
              onAddMessage={(msg) => setChatHistory(prev => [...prev, msg])}
              onApplyDiagnosticLogs={handleApplyDiagnosticLogs}
            />
          )}

          {currentTab === "logger" && (
            <IncidentsManagerView 
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={(id) => setSelectedIncidentId(id)}
              onAddIncident={handleAddIncident}
              onUpdateIncident={handleUpdateIncident}
            />
          )}

          {currentTab === "dashboard" && (
            <DashboardView incidents={incidents} />
          )}

          {currentTab === "performance" && (
            <PerformanceView 
              employees={employees} 
              incidents={incidents}
              onSelectTicket={handleNavigateWithTicketRef}
            />
          )}

          {currentTab === "recommendations" && (
            <RecommendationsView 
              recommendations={recommendations}
              onAddRecommendation={handleAddRecommendation}
            />
          )}

          {currentTab === "reports" && (
            <ReportsView onNavigate={(tab) => setCurrentTab(tab)} />
          )}
        </div>

      </main>

      {/* Footer controls */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 md:py-8 mt-12 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-2">
            <div className="p-1 px-2 rounded font-mono bg-slate-800 text-slate-400 text-[10px]">
              v2.6.5-LTS
            </div>
            <span>EPHI helpdesk platform operated under corporate security policy.</span>
          </div>

          <div className="flex gap-4 items-center">
            <span className="text-[11px] text-slate-500">Addis Ababa, Ethiopia</span>
            <div className="h-3.5 w-px bg-slate-800"></div>
            <a 
              href="https://www.ephi.gov.et" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-white transition cursor-pointer text-[11px]"
            >
              <span>ephi.gov.et</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
