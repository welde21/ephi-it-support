import React from "react";
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  BarChart2, 
  Bookmark, 
  Network
} from "lucide-react";
import { Incident } from "../types";

interface DashboardViewProps {
  incidents: Incident[];
}

export default function DashboardView({ incidents }: DashboardViewProps) {
  // Aggregate data for Status distribution
  const statusSummary = incidents.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusSummary).map(([name, value]) => ({
    name,
    value,
    color: name === "Resolved" ? "#10b981" : name === "Open" ? "#f59e0b" : name === "Partially Resolved" ? "#3b82f6" : "#ef4444"
  }));

  // Aggregate Category distribution
  const categorySummary = incidents.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Aggregate priority counts
  const prioritySummary = incidents.reduce((acc, curr) => {
    acc[curr.priority] = (acc[curr.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityData = ["Critical", "High", "Medium", "Low"].map(level => ({
    priority: level,
    tickets: prioritySummary[level as any] || 0,
    color: level === "Critical" ? "#be123c" : level === "High" ? "#e11d48" : level === "Medium" ? "#f59e0b" : "#10b981"
  }));

  // Incident trends by Date (last 5 dates)
  const dateSummary = incidents.reduce((acc, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const datesList = Object.entries(dateSummary)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  const trendData = datesList.map(([date, count]) => {
    // Format Date string e.g. June 01
    const parts = date.split("-");
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : date;
    return {
      date: label,
      "Incident Tickets": count
    };
  });

  // Calculate resolution times context
  const resolvedTickets = incidents.filter(i => i.status === "Resolved");
  const averageResTime = resolvedTickets.length > 0
    ? Math.round(resolvedTickets.reduce((sum, item) => sum + item.timeSpent, 0) / resolvedTickets.length)
    : 35; // Default reference mins

  // Pie chart custom styling
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#a4de6c"];

  return (
    <div className="space-y-6" id="incident-analytics-dashboard">
      <div>
        <h1 className="text-xl font-bold text-slate-800 font-display">ICT Operations Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Live analytics audit of active incident reports, resolution loops, and performance categories.</p>
      </div>

      {/* Numerical KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="dashboard-counters-grid">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase block">Total logged</span>
            <span className="text-2xl font-bold text-slate-800 font-mono block">{incidents.length}</span>
            <span className="text-[10px] text-slate-500">Workspace Tickets</span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 text-brand-teal">
            <BarChart2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase block">Mean resolution duration</span>
            <span className="text-2xl font-bold text-slate-800 font-mono block">{averageResTime}m</span>
            <span className="text-[10px] text-slate-500">Per Resolved Inc</span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase block">Operational efficiency</span>
            <span className="text-2xl font-bold text-emerald-600 font-mono block">
              {Math.round((resolvedTickets.length / (incidents.length || 1)) * 100)}%
            </span>
            <span className="text-[10px] text-slate-500">Resolution Rate</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase block">Active critical escalations</span>
            <span className="text-2xl font-bold text-rose-700 font-mono block">
              {incidents.filter(i => i.status === "Escalated" || (i.priority === "Critical" && i.status !== "Resolved")).length}
            </span>
            <span className="text-[10px] text-slate-500">Needs Intervention</span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Curve Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="incident-trend-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-teal" />
            <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Report Volume Trend</h3>
          </div>
          <div className="h-60 w-full" id="trend-chart-responsive">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d8376" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0d8376" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Incident Tickets" stroke="#0d8376" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncidents)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No data points documented.</div>
            )}
          </div>
        </div>

        {/* Priority Matrix Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="priority-distribution-card">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Incident Severity Vectors</h3>
          </div>
          <div className="h-60 w-full" id="priority-chart-responsive">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="priority" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip wrapperStyle={{ fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="tickets" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Category List and Work Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown (Ranked List is easier and cleaner to consume than small slices) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4" id="category-breakdown-card">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-indigo-500" />
              <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Volume by Incident Category</h3>
            </div>
            <span className="text-[10px] text-slate-400">Ranked highest to lowest</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              {categoryData.slice(0, 4).map((entry, idx) => {
                const percent = Math.round((entry.value / incidents.length) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{entry.name}</span>
                      <span className="text-slate-500">{entry.value} logged ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-teal rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {categoryData.slice(4, 8).map((entry, idx) => {
                const percent = Math.round((entry.value / incidents.length) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{entry.name}</span>
                      <span className="text-slate-500">{entry.value} logged ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="status-distribution-card">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Resolution Status Split</h3>
          </div>
          
          <div className="flex items-center justify-between h-52">
            <div className="h-full w-1/2" id="status-pie-responsive">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Tickets`, "StatusCount"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-2 px-1">
              {statusData.map((entry, sIdx) => (
                <div key={sIdx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800 font-mono">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
