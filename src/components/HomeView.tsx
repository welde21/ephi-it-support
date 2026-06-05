import React, { useState, useEffect } from "react";
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  User, 
  Server, 
  ArrowRight, 
  RefreshCw, 
  Mail, 
  Key, 
  Database, 
  Wifi, 
  AlertTriangle 
} from "lucide-react";
import { Incident, SystemStatus } from "../types";

interface HomeViewProps {
  incidents: Incident[];
  onNavigate: (tab: string) => void;
  systemStatus: SystemStatus;
  onToggleService: (service: string, currentStatus: string) => void;
  onRefreshSystem: () => void;
}

export default function HomeView({ 
  incidents, 
  onNavigate, 
  systemStatus, 
  onToggleService,
  onRefreshSystem 
}: HomeViewProps) {
  const [time, setTime] = useState(new Date("2026-06-05T09:48:19Z"));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate high level metrics
  const totalIncidents = incidents.length;
  const resolved = incidents.filter(i => i.status === "Resolved").length;
  const critical = incidents.filter(i => i.priority === "Critical").length;
  const open = incidents.filter(i => i.status === "Open" || i.status === "Partially Resolved").length;
  const escalated = incidents.filter(i => i.status === "Escalated").length;

  const ServiceStatusColor = {
    Online: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Degraded: "bg-amber-50 text-amber-700 border-amber-200",
    Offline: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case "activeDirectory": return <Key className="h-5 w-5" />;
      case "ephiEmail": return <Mail className="h-5 w-5" />;
      case "ciscoVpn": return <Server className="h-5 w-5" />;
      case "dhcpDnsNetwork": return <Wifi className="h-5 w-5" />;
      case "lisSystem": return <Database className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const formatServiceName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Brand Identity */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl" id="home-hero-banner">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-mono mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            EPHI INTERNAL SERVICES MONITOR
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold font-display tracking-tight text-white mb-2">EPHI ICT Support Copilot</h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Intelligent operations suite built for helpdesk dispatchers, systems managers, and lab support staff at the Ethiopian Public Health Institute. Automatically classify tickets, analyze team performance, and generate strategic IT reports.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Server size={300} />
        </div>
      </div>

      {/* Main Grid: User Info & Digital Clock, Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between" id="user-info-card">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                SS
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Ssum Support</h3>
                <p className="text-xs text-slate-500">ssum45458@gmail.com</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Duty Officer ID</span>
                <span className="font-medium text-slate-700 font-mono">EPHI-ICT-260</span>
              </div>
              <div>
                <span className="text-slate-400 block">Shift Coverage</span>
                <span className="font-medium text-slate-700">Day Operations</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Session Status: Active</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Dynamic Clock & Location */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="workspace-clock-card">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Clock className="h-4 w-4" />
              <span>ORGANIZATION TIME (UTC)</span>
            </div>
            <div className="text-3xl font-semibold font-mono tracking-tight text-slate-800">
              {time.toLocaleTimeString()}
            </div>
            <div className="text-xs text-slate-500">
              {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 text-xs flex justify-between items-center text-slate-500">
            <span>Headquarters</span>
            <span className="font-medium text-slate-700">Addis Ababa, Ethiopia</span>
          </div>
        </div>

        {/* System Overview Note */}
        <div className="bg-gradient-to-br from-emerald-950 to-teal-900 text-emerald-100 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="system-notes-card">
          <div>
            <h3 className="font-medium font-display text-sm text-emerald-200">Helpdesk Intelligence</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed mt-2">
              Our automated ticketing diagnostics is currently synced with Azure AD and Cisco AnyConnect routers. Leverage our AI Copilot for password reset credential diagnostics and phishing containment procedures.
            </p>
          </div>
          <div className="pt-4 border-t border-emerald-800 text-xs flex justify-between items-center text-emerald-300">
            <span>AI Brain: Gemini 3.5 Flash</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200 text-[10px] font-mono">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Critical Operational KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4" id="kpi-counters">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm text-center">
          <span className="text-slate-400 text-xs font-medium block">Total Incidents</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block mt-1">{totalIncidents}</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-rose-700 text-xs font-semibold">Critical Priority</span>
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <span className="text-2xl font-bold text-rose-700 font-mono block mt-1">{critical}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm text-center">
          <span className="text-amber-700 text-xs font-semibold block">Open & Pending</span>
          <span className="text-2xl font-bold text-amber-700 font-mono block mt-1">{open}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm text-center">
          <span className="text-emerald-700 text-xs font-semibold block">Resolved Incidents</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono block mt-1">{resolved}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-slate-600 text-xs font-medium block">Escalated Logs</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block mt-1">{escalated}</span>
        </div>
      </div>

      {/* Grid: EPHI Service Status Indicator & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core System Status Monitor (Requires toggles for admin override!) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4" id="service-status-monitor">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-800 font-display">Organizational Infrastructure Health</h2>
              <p className="text-xs text-slate-500">Live operational status of core internal sub-systems</p>
            </div>
            <button 
              onClick={onRefreshSystem}
              className="flex items-center gap-1.5 text-xs text-brand-teal hover:bg-slate-50 py-1.5 px-3 rounded-md transition border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Scan Network</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(systemStatus)
              .filter(([key]) => key !== "lastChecked")
              .map(([key, value]) => {
                const isOnline = value === "Online";
                const isDegraded = value === "Degraded";
                const statusStr = value as "Online" | "Degraded" | "Offline";

                return (
                  <div 
                    key={key}
                    className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm`}>
                        {getServiceIcon(key)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 text-xs block">{formatServiceName(key)}</span>
                        <span className="text-[10px] text-slate-400">Class: Core Enterprise</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ServiceStatusColor[statusStr]}`}>
                        {statusStr}
                      </span>
                      {/* Interactive Trigger to Simulate Escalation / Repair */}
                      <button 
                        onClick={() => {
                          const next = isOnline ? "Degraded" : isDegraded ? "Offline" : "Online";
                          onToggleService(key, next);
                        }}
                        className="text-[10px] text-slate-500 hover:text-brand-teal underline cursor-pointer"
                        title="Simulate Admin Toggle Override"
                      >
                        Override Status
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-2 text-right">
            <span className="text-[10px] text-slate-400 font-mono">
              Database Sync Checked: {new Date(systemStatus.lastChecked).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Quick Launchpad Router */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between" id="quick-actions-launcher">
          <div>
            <h2 className="text-base font-semibold text-slate-800 font-display">Copilot Navigation Launcher</h2>
            <p className="text-xs text-slate-500">Fast tracking helpdesk actions</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => onNavigate("chatbot")}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-teal hover:bg-slate-50 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-indigo-50 text-indigo-700">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-700 text-xs block">AI Chatbot Assistant</span>
                  <span className="text-[10px] text-slate-400">Troubleshoot password, VPN, email</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
            </button>

            <button 
              onClick={() => onNavigate("logger")}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-teal hover:bg-slate-50 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-emerald-50 text-emerald-700">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-700 text-xs block">Incident Dispatch logs</span>
                  <span className="text-[10px] text-slate-400">View, update, or log brand new tickets</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
            </button>

            <button 
              onClick={() => onNavigate("reports")}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-teal hover:bg-slate-50 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-amber-50 text-amber-700">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-700 text-xs block">Operations Report Suite</span>
                  <span className="text-[10px] text-slate-400">Daily, Weekly, Monthly exports</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition" />
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400 leading-none block">
              EPHI ICT Division — Standing Order Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
