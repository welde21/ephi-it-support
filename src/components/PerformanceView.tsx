import React, { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Mail, 
  HelpCircle, 
  ShieldAlert, 
  ChevronRight, 
  Award,
  Clock
} from "lucide-react";
import { Employee, Incident } from "../types";

interface PerformanceViewProps {
  employees: Employee[];
  incidents: Incident[];
  onSelectTicket?: (id: string) => void;
}

export default function PerformanceView({ employees, incidents, onSelectTicket }: PerformanceViewProps) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(employees[0]?.name || null);

  // Custom formula to calculate Productivity Score out of 100
  // Formula weights: Resolution Rate: 60%, Average Resolution Time: 40% (faster is better)
  const calculateProductivityScore = (emp: Employee) => {
    if (emp.assigned === 0) return 0;
    const resRate = emp.resolved / emp.assigned; // 0 to 1
    
    // speed factor: 1 to 0 (cap speed at 120mins)
    const speedFactor = Math.max(0, 1 - (emp.avgResolutionTime / 120));
    
    const score = Math.round((resRate * 60) + (speedFactor * 40));
    return Math.min(100, Math.max(10, score));
  };

  const getProductivityTier = (score: number) => {
    if (score >= 85) return { label: "Elite Support", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (score >= 65) return { label: "High Performing", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
    if (score >= 40) return { label: "Standard Operations", color: "bg-amber-100 text-amber-800 border-amber-200" };
    return { label: "Under Review", color: "bg-rose-100 text-rose-800 border-rose-200" };
  };

  const selectedStaffTickets = incidents.filter(i => i.supportOfficer === selectedStaff);

  return (
    <div className="space-y-6" id="staff-performance-dashboard">
      <div>
        <h1 className="text-xl font-bold text-slate-800 font-display">Employee Activity Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Personnel metrics tracking, incident closure ratios, and speed benchmarks.</p>
      </div>

      {/* Grid: Main Performance Metrics Table & Sub Ticket Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table/List of Employees */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-brand-teal" />
            <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">ICT Division Performance</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium">
                  <th className="py-3 px-2">Support Officer</th>
                  <th className="py-3 px-2 text-center">Assigned</th>
                  <th className="py-3 px-2 text-center">Resolved</th>
                  <th className="py-3 px-2 text-center">Pending</th>
                  <th className="py-3 px-2 text-center">Resolution %</th>
                  <th className="py-3 px-2 text-center">Avg Time</th>
                  <th className="py-3 px-2 text-right">Productivity</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const isSelected = selectedStaff === emp.name;
                  const resRate = emp.assigned > 0 ? Math.round((emp.resolved / emp.assigned) * 100) : 100;
                  const score = calculateProductivityScore(emp);
                  const tier = getProductivityTier(score);

                  return (
                    <tr 
                      key={emp.name}
                      onClick={() => setSelectedStaff(emp.name)}
                      className={`border-b border-slate-100 hover:bg-slate-50/70 transition cursor-pointer ${
                        isSelected ? "bg-slate-50 font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-semibold">
                            {emp.avatar}
                          </div>
                          <div>
                            <span className="text-slate-800 text-xs block font-semibold">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{emp.role}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3.5 px-2 text-center font-mono font-semibold">{emp.assigned}</td>
                      <td className="py-3.5 px-2 text-center text-emerald-600 font-mono font-semibold">{emp.resolved}</td>
                      <td className="py-3.5 px-2 text-center text-amber-600 font-mono">{emp.pending}</td>
                      
                      <td className="py-3.5 px-2 text-center font-mono text-slate-700">
                        {resRate}%
                      </td>
                      
                      <td className="py-3.5 px-2 text-center text-slate-500 font-mono">
                        {emp.avgResolutionTime}m
                      </td>

                      <td className="py-3.5 px-2 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono font-bold text-slate-950 text-xs">{score}/100</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold border ${tier.color}`}>
                            {tier.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 inline-flex items-center gap-2 text-[11px] text-slate-500">
            <Award className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Productivity scale is weighted actively: Incident closure counts (60%) vs average service latency (40%).</span>
          </div>
        </div>

        {/* Selected Support Officer portfolio inspector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="staff-portfolio-inspector">
          {selectedStaff ? (
            <div className="space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Interactive Inspector</span>
                  <h3 className="font-bold text-slate-800 text-sm font-display">{selectedStaff}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Assigned Ticket Queue ({selectedStaffTickets.length} items)</p>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedStaffTickets.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-6">
                      No tickets actively assigned.
                    </div>
                  ) : (
                    selectedStaffTickets.map(ticket => {
                      const isCritical = ticket.priority === "Critical";
                      const isOpen = ticket.status === "Open" || ticket.status === "Partially Resolved";

                      return (
                        <div 
                          key={ticket.id}
                          className="p-3 rounded-lg border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-slate-900 font-mono">{ticket.id}</span>
                            <span className={`px-1.5 py-0.2 rounded font-semibold ${
                              isCritical ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>

                          <span className="font-medium text-slate-800 block leading-tight">{ticket.systemAffected}</span>
                          <p className="text-[11px] text-slate-400 line-clamp-1">"{ticket.description}"</p>

                          <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-100 mt-1 text-slate-400">
                            <span>Status: <strong className="text-slate-600 font-semibold">{ticket.status}</strong></span>
                            {onSelectTicket && (
                              <button 
                                onClick={() => onSelectTicket(ticket.id)}
                                className="flex items-center gap-0.5 text-brand-teal hover:underline cursor-pointer"
                              >
                                <span>Inspect</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Extra Summary Metric Card */}
              <div className="p-3.5 bg-gradient-to-br from-brand-navy to-slate-900 text-white rounded-lg text-xs space-y-2 mt-auto">
                <span className="text-[10px] text-teal-300 font-mono font-semibold block">TACTICAL DISPATCH OVERVIEW</span>
                <div className="flex justify-between items-center text-slate-100">
                  <span>Assigned Workload</span>
                  <span className="font-bold font-mono">{selectedStaffTickets.length}</span>
                </div>
                <div className="flex justify-between items-center text-slate-100">
                  <span>SLA Closure Rate</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {selectedStaffTickets.length > 0 
                      ? `${Math.round((selectedStaffTickets.filter(i => i.status === "Resolved").length / selectedStaffTickets.length) * 100)}%`
                      : "100%"
                    }
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 py-12">
              Select an employee from the table to inspect detailed queues.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
