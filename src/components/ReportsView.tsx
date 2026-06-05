import React, { useState, useEffect } from "react";
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download, 
  Printer, 
  Lightbulb, 
  ShieldCheck, 
  Award,
  BookOpen
} from "lucide-react";

interface ReportsViewProps {
  onNavigate?: (tab: string) => void;
}

export default function ReportsView({ onNavigate }: ReportsViewProps) {
  const [reports, setReports] = useState<any>(null);
  const [activeReportTab, setActiveReportTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports/all");
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        }
      } catch (err) {
        console.error("Failed to load reporting metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const triggerDownloadAction = (reportType: string) => {
    setDownloading(reportType);
    setTimeout(() => {
      setDownloading(null);
      // alert or notification simulated
    }, 1500);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Clock className="h-6 w-6 animate-spin text-brand-teal" />
        <span>Compiling enterprise database records...</span>
      </div>
    );
  }

  const { dailyReport, weeklyReport, monthlyReport } = reports || {};

  return (
    <div className="space-y-6" id="reports-suite-canvas">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-display">ICT Reports Generation Suite</h1>
          <p className="text-xs text-slate-500 mt-1">Export formatted daily diagnostics, weekly staff performances, or strategic executive briefings.</p>
        </div>

        {/* Tab Buttons choosing reports layout */}
        <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1 self-start shrink-0 shadow-sm">
          <button
            onClick={() => setActiveReportTab("daily")}
            className={`text-xs font-semibold py-1.5 px-3.5 rounded transition cursor-pointer ${
              activeReportTab === "daily" 
                ? "bg-slate-900 text-white" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Daily Operations
          </button>
          <button
            onClick={() => setActiveReportTab("weekly")}
            className={`text-xs font-semibold py-1.5 px-3.5 rounded transition cursor-pointer ${
              activeReportTab === "weekly" 
                ? "bg-slate-900 text-white" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Weekly Performance
          </button>
          <button
            onClick={() => setActiveReportTab("monthly")}
            className={`text-xs font-semibold py-1.5 px-3.5 rounded transition cursor-pointer ${
              activeReportTab === "monthly" 
                ? "bg-slate-900 text-white" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Monthly Executive
          </button>
        </div>
      </div>

      {/* Daily Support Report */}
      {activeReportTab === "daily" && dailyReport && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm border-t-4 border-t-amber-500 animate-fadeIn" id="daily-it-report">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-600 font-bold font-mono tracking-wider block uppercase">EPHI STANDING ICT DISPATCH REPORT</span>
              <h2 className="text-xl font-bold text-slate-950 font-display">{dailyReport.title}</h2>
              <p className="text-xs text-slate-500">Active Duty Officer: Ssum Support | Reporting Date: {dailyReport.date}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerDownloadAction("daily-pdf")}
                disabled={downloading !== null}
                className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350 text-xs py-2 px-3.5 rounded-lg transition cursor-pointer font-medium"
              >
                <Download className="h-4 w-4" />
                <span>{downloading === "daily-pdf" ? "Downloading..." : "Export PDF"}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 bg-slate-900 text-white hover:bg-brand-teal text-xs py-2 px-3.5 rounded-lg transition cursor-pointer font-medium"
              >
                <Printer className="h-4 w-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Core Daily metrics stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 border border-slate-150 rounded-xl">
            <div className="text-center md:border-r border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Incidents</span>
              <span className="text-2xl font-black text-slate-800 font-mono block mt-1">{dailyReport.metrics.total}</span>
            </div>
            <div className="text-center md:border-r border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Resolved Today</span>
              <span className="text-2xl font-black text-emerald-600 font-mono block mt-1">{dailyReport.metrics.resolved}</span>
            </div>
            <div className="text-center md:border-r border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Open Backlogs</span>
              <span className="text-2xl font-black text-amber-600 font-mono block mt-1">{dailyReport.metrics.open}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Code Red Isolation</span>
              <span className="text-2xl font-black text-rose-700 font-mono block mt-1">{dailyReport.metrics.critical}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Operational Summary</span>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1 bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
                {dailyReport.summary}
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Operational Directives</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyReport.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="p-4 rounded-lg border border-slate-150 bg-amber-50/10 flex gap-3">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">💡</span>
                    <span className="text-xs text-slate-700 leading-relaxed font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Support Performance Report */}
      {activeReportTab === "weekly" && weeklyReport && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm border-t-4 border-t-indigo-500 animate-fadeIn" id="weekly-it-report">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-indigo-600 font-bold font-mono tracking-wider block uppercase">EPHI HELP-DESK SLA AUDIT</span>
              <h2 className="text-xl font-bold text-slate-950 font-display">{weeklyReport.title}</h2>
              <p className="text-xs text-slate-500">Audit Window: {weeklyReport.period}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerDownloadAction("weekly-pdf")}
                disabled={downloading !== null}
                className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350 text-xs py-2 px-3.5 rounded-lg transition cursor-pointer font-medium"
              >
                <Download className="h-4 w-4" />
                <span>{downloading === "weekly-pdf" ? "Downloading..." : "Export PDF"}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 bg-slate-900 text-white hover:bg-brand-teal text-xs py-2 px-3.5 rounded-lg transition cursor-pointer font-medium"
              >
                <Printer className="h-4 w-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Weekly Incident Trends summary */}
            <div className="md:col-span-1 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incident Category Volume</span>
                <div className="space-y-2">
                  {weeklyReport.topCategories.map((c: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs font-sans">
                      <span className="text-slate-600">{c.category}</span>
                      <span className="font-semibold text-slate-800 font-mono">{c.value} tickets</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-indigo-50/30 border border-indigo-150 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-indigo-700 uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Escalation Dispatch</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Total of **{weeklyReport.escalationsCount}** tickets required advanced routing to backend infrastructure engineers.
                </p>
              </div>
            </div>

            {/* Right: trends list + staff list */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Trend Observations</span>
                <ul className="space-y-2">
                  {weeklyReport.trends.map((t: string, index: number) => (
                    <li key={index} className="flex gap-2.5 items-start text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded hover:border-slate-200 transition">
                      <TrendingUp className="h-4 w-4 text-brand-teal shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Support Staff Closure Ratios</span>
                <div className="space-y-2">
                  {weeklyReport.staffMetrics.map((sm: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-150 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-slate-900 text-white font-mono text-[9px] font-semibold flex items-center justify-center">
                          {sm.name.split(" ").map((n:any)=>n[0]).join("")}
                        </div>
                        <span className="font-semibold text-slate-700">{sm.name}</span>
                      </div>
                      <div className="flex gap-4 font-mono font-bold text-slate-500">
                        <span>Resolved/Assigned: <span className="text-slate-800">{sm.completed}/{sm.assigned}</span></span>
                        <span className="text-emerald-600">Rate: {sm.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly ICT Executive Operations Summary */}
      {activeReportTab === "monthly" && monthlyReport && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm border-t-4 border-t-rose-600 animate-fadeIn" id="monthly-it-report">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-rose-600 font-bold font-mono tracking-wider block uppercase">EPHI IT CORPORATE METRICS</span>
              <h2 className="text-xl font-bold text-slate-950 font-display">{monthlyReport.title}</h2>
              <p className="text-xs text-slate-500">SLA Audit Period: {monthlyReport.month}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => triggerDownloadAction("monthly-pdf")}
                disabled={downloading !== null}
                className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350 text-xs py-2 px-3.5 rounded-lg transition cursor-pointer font-medium"
              >
                <Download className="h-4 w-4" />
                <span>{downloading === "monthly-pdf" ? "Downloading..." : "Export PDF"}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 bg-slate-900 text-white hover:bg-brand-teal text-xs py-2 px-3.5 rounded-lg transition cursor-pointer font-medium"
              >
                <Printer className="h-4 w-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Strategic Executive KPI Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Service Availability</span>
              <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">{monthlyReport.strategicDashboard.coreServiceAvailability}</span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Staff Client Sat</span>
              <span className="text-xl font-black text-brand-teal font-mono mt-1 block">{monthlyReport.strategicDashboard.clientSatisfaction}</span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Mean SLA Response</span>
              <span className="text-xl font-black text-slate-800 font-mono mt-1 block">{monthlyReport.strategicDashboard.averageResponseTime}</span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Mean SLA Resolution</span>
              <span className="text-xl font-black text-slate-800 font-mono mt-1 block">{monthlyReport.strategicDashboard.averageResolutionDuration}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Challenges recorded */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700 uppercase">
                <AlertCircle className="h-4 w-4" />
                <span>Major Operational Obstacles</span>
              </div>
              <div className="space-y-2">
                {monthlyReport.challenges.map((c: string, index: number) => (
                  <div key={index} className="p-3.5 bg-rose-50/10 border border-rose-100 rounded-lg text-xs text-slate-600 italic">
                    "{c}"
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic decisions made */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>strategic board directives</span>
              </div>
              <div className="space-y-2">
                {monthlyReport.strategicDecisions.map((s: string, index: number) => (
                  <div key={index} className="p-3 bg-white border border-slate-250 hover:border-brand-teal transition rounded-lg text-xs text-slate-700 flex gap-2">
                    <span className="text-brand-teal font-bold shrink-0">✔</span>
                    <span className="font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
