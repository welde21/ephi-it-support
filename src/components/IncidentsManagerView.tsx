import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  ShieldAlert, 
  User, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  Building,
  Computer,
  FileEdit,
  ClipboardList,
  Save,
  ArrowUpRight
} from "lucide-react";
import { Incident, PriorityLevel, IssueCategory, ResolutionStatus } from "../types";

interface IncidentsManagerViewProps {
  incidents: Incident[];
  onAddIncident: (data: Omit<Incident, "id">) => void;
  onUpdateIncident: (id: string, updated: Partial<Incident>) => void;
  selectedIncidentId?: string;
  onSelectIncident: (id: string | undefined) => void;
}

export default function IncidentsManagerView({
  incidents,
  onAddIncident,
  onUpdateIncident,
  selectedIncidentId,
  onSelectIncident
}: IncidentsManagerViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Ticket Form State
  const [newUserName, setNewUserName] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDeviceType, setNewDeviceType] = useState("Laptop");
  const [newSystemAffected, setNewSystemAffected] = useState("");
  const [newPriority, setNewPriority] = useState<PriorityLevel>("Medium");
  const [newCategory, setNewCategory] = useState<IssueCategory>("Account Management");
  const [newDescription, setNewDescription] = useState("");

  // Edit State triggers for inspected ticket
  const [editOfficer, setEditOfficer] = useState("");
  const [editStatus, setEditStatus] = useState<ResolutionStatus>("Open");
  const [editRootCause, setEditRootCause] = useState("");
  const [editActionsTaken, setEditActionsTaken] = useState("");
  const [editTimeSpent, setEditTimeSpent] = useState<number>(0);
  const [editNotes, setEditNotes] = useState("");

  // Escalation state additions
  const [escalatedTeam, setEscalatedTeam] = useState("Network Operations");
  const [escalatedRequiredInfo, setEscalatedRequiredInfo] = useState("");
  const [escalatedPriority, setEscalatedPriority] = useState<PriorityLevel>("High");
  const [escalatedNextActions, setEscalatedNextActions] = useState("");

  const activeTicket = incidents.find(i => i.id === selectedIncidentId);

  // Populates editing states when clicking inspect
  const handleInspectTicket = (ticket: Incident) => {
    onSelectIncident(ticket.id);
    setEditOfficer(ticket.supportOfficer);
    setEditStatus(ticket.status);
    setEditRootCause(ticket.rootCause || "");
    setEditActionsTaken(ticket.actionsTaken || "");
    setEditTimeSpent(ticket.timeSpent || 0);
    setEditNotes(ticket.notes || "");

    if (ticket.escalationInfo) {
      setEscalatedTeam(ticket.escalationInfo.team);
      setEscalatedRequiredInfo(ticket.escalationInfo.requiredInfo);
      setEscalatedPriority(ticket.escalationInfo.priority);
      setEscalatedNextActions(ticket.escalationInfo.nextActions);
    } else {
      setEscalatedTeam("Network Infrastructure Team");
      setEscalatedRequiredInfo("");
      setEscalatedPriority("High");
      setEscalatedNextActions("");
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newSystemAffected || !newDescription) return;

    onAddIncident({
      date: new Date().toISOString().split("T")[0],
      userName: newUserName,
      department: newDepartment || "General Dept",
      location: newLocation || "Main HQ Campus",
      deviceType: newDeviceType,
      systemAffected: newSystemAffected,
      priority: newPriority,
      category: newCategory,
      description: newDescription,
      rootCause: "",
      actionsTaken: "",
      status: "Open",
      supportOfficer: "Unassigned",
      timeSpent: 0
    });

    // Reset Creation Fields
    setNewUserName("");
    setNewDepartment("");
    setNewLocation("");
    setNewSystemAffected("");
    setNewDescription("");
    setShowAddForm(false);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    const dataPayload: Partial<Incident> = {
      supportOfficer: editOfficer,
      status: editStatus,
      rootCause: editRootCause,
      actionsTaken: editActionsTaken,
      timeSpent: Number(editTimeSpent) || 0,
      notes: editNotes,
    };

    if (editStatus === "Escalated") {
      dataPayload.escalationInfo = {
        team: escalatedTeam,
        requiredInfo: escalatedRequiredInfo,
        priority: escalatedPriority,
        nextActions: escalatedNextActions
      };
    } else {
      dataPayload.escalationInfo = undefined;
    }

    onUpdateIncident(activeTicket.id, dataPayload);
  };

  // Filter lists
  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = 
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.userName.toLowerCase().includes(search.toLowerCase()) ||
      i.systemAffected.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || i.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || i.priority === priorityFilter;
    const matchesCategory = categoryFilter === "All" || i.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status: ResolutionStatus) => {
    switch (status) {
      case "Resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Partially Resolved": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Escalated": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getPriorityColor = (level: PriorityLevel) => {
    switch (level) {
      case "Critical": return "text-rose-700 bg-rose-50 border-rose-200";
      case "High": return "text-red-700 bg-red-50 border-red-200";
      case "Medium": return "text-amber-700 bg-amber-50 border-amber-200";
      default: return "text-emerald-700 bg-emerald-50 border-emerald-200";
    }
  };

  const departmentsList = [
    "Vaccine Research Lab",
    "Epidemiology & Surveillance",
    "Infectious Diseases Dept",
    "Finance & Administration",
    "Human Resources",
    "Lab Quality Assurance",
    "National Laboratory",
    "Public Health Emergency Management (PHEOC)"
  ];

  const devicesList = ["Laptop", "Desktop", "Printer", "Scanner", "Smartphone", "Network Router/Switch", "Other IP Hardware"];

  const categoriesList: IssueCategory[] = [
    "Account Management",
    "Email",
    "Network",
    "Hardware",
    "Software",
    "Printer",
    "Security",
    "VPN",
    "Operating System",
    "Other"
  ];

  const staffEmployees = [
    "Abebe Kebede",
    "Selamawit Tekle",
    "Yonas Assefa",
    "Betty Hailu",
    "Unassigned"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="tickets-workspace-manager">
      {/* Left Columns (2/5): Filters, Action bar, and Tickets Feed */}
      <div className="lg:col-span-2 space-y-4">
        {/* Top Operational Commands */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-800 font-display">Organizational Ticket Logs</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-slate-900 text-white font-medium hover:bg-brand-teal text-[10.5px] py-1.5 px-3 rounded-lg transition shadow-sm cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Log Incident</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, user, system affected..."
              className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter Rows Expanders */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="text-[9px] font-bold text-slate-450 block uppercase">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-[10px] border border-slate-200 rounded p-1 focus:outline-none mt-0.5 bg-white"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
                <option value="Partially Resolved">Partially Resolved</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-450 block uppercase">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full text-[10px] border border-slate-200 rounded p-1 focus:outline-none mt-0.5 bg-white"
              >
                <option value="All">All priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-450 block uppercase">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-[10px] border border-slate-200 rounded p-1 focus:outline-none mt-0.5 bg-white"
              >
                <option value="All">All categories</option>
                {categoriesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Brand New Incident Form Expand */}
        {showAddForm && (
          <form 
            onSubmit={handleCreateTicket}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-md space-y-3 animate-fadeIn"
          >
            <div className="pb-1 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-xs text-slate-800">Identify EPHI Support Incident (Step 1)</h3>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">User Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Dr. Aster Gidewon"
                  className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Department</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none bg-white"
                >
                  <option value="">-- Choose Dept --</option>
                  {departmentsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Location / Building</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Building B, Office 302"
                  className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Device Type</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none bg-white"
                >
                  {devicesList.map(dev => (
                    <option key={dev} value={dev}>{dev}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Affected System / Tool</label>
                <input
                  type="text"
                  required
                  value={newSystemAffected}
                  onChange={(e) => setNewSystemAffected(e.target.value)}
                  placeholder="e.g. Cisco Remote VPN Gateway"
                  className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">EPHI Issue Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none bg-white"
                >
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-0.5 col-span-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Reported Problem Description</label>
                <textarea
                  required
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide precise brief description details..."
                  className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-0.5 col-span-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Incident Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs border border-slate-100 rounded p-1.5 bg-white font-semibold"
                >
                  <option value="Critical">🔴 Critical Level</option>
                  <option value="High">🟠 High Level</option>
                  <option value="Medium">🟡 Medium Level</option>
                  <option value="Low">🟢 Low Level</option>
                </select>
              </div>
              
              <div className="flex items-end justify-end col-span-1 pb-1">
                <button
                  type="submit"
                  className="bg-brand-teal text-white text-[11.5px] border border-transparent hover:bg-teal-800 font-semibold py-1.5 px-4 rounded cursor-pointer"
                >
                  Commit Dispatch
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tickets Feed Feed */}
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredIncidents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
              No support incident tickets match the filters. Try cleaning searches or choosing another priority layer.
            </div>
          ) : (
            filteredIncidents.map((ticket) => {
              const isSelected = selectedIncidentId === ticket.id;
              return (
                <div 
                  key={ticket.id}
                  onClick={() => handleInspectTicket(ticket)}
                  className={`border rounded-xl p-3.5 text-xs transition cursor-pointer flex justify-between items-start ${
                    isSelected 
                      ? 'bg-indigo-50/50 border-brand-teal shadow-sm shadow-teal-50' 
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                  id={`ticket-feed-card-${ticket.id}`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <div className="flex gap-2 items-center text-[10px]">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">
                        {ticket.id}
                      </span>
                      <span className="text-slate-400 font-medium">{ticket.date}</span>
                    </div>

                    <span className="font-semibold text-slate-800 block line-clamp-1 leading-normal font-display text-[12px]">
                      {ticket.systemAffected}
                    </span>

                    <p className="text-[11px] text-slate-400 list-item list-none py-0.5 leading-tight">
                      By: <strong className="text-slate-600 font-semibold">{ticket.userName}</strong> ({ticket.department})
                    </p>

                    <div className="flex gap-2 pt-1 flex-wrap">
                      <span className="px-2 py-0.2 rounded-full border text-[9px] font-semibold bg-slate-50 text-slate-600 border-slate-200">
                        {ticket.category}
                      </span>
                      <span className="text-[10px] text-slate-505">
                        Officer: <strong className="text-slate-600 font-semibold">{ticket.supportOfficer}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.3 rounded-full text-[9px] font-bold border ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-1.5 py-0.1 border rounded text-[9px] font-semibold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column (3/5): Complete Activity Log detailed Inspector & Update forms */}
      <div className="lg:col-span-3">
        {activeTicket ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="ticket-inspector-viewport">
            {/* Header: Core diagnostics summary */}
            <div className="bg-slate-50 border-b border-slam border-slate-200 px-5 py-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-200 text-slate-800 font-mono font-bold px-1.5 py-0.5 rounded leading-none">
                    INSPECTION
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-semibold">{activeTicket.id} / Published: {activeTicket.date}</span>
                </div>
                <h2 className="text-sm font-semibold text-slate-800 mt-1 font-display leading-tight">{activeTicket.systemAffected}</h2>
              </div>
              
              <div className="text-right">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(activeTicket.status)}`}>
                  {activeTicket.status}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">Assigned: {activeTicket.supportOfficer}</span>
              </div>
            </div>

            {/* Split layout: Details vs Support Form */}
            <div className="p-5 space-y-6">
              {/* Block A: Dynamic Diagnostic Identification (User, Dept, Machine context) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">User Account</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{activeTicket.userName}</span>
                  <span className="text-[10px] text-slate-500">{activeTicket.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location Point</span>
                  <div className="flex items-center gap-1 mt-0.5 text-slate-700">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{activeTicket.location}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Machine Terminal</span>
                  <div className="flex items-center gap-1 mt-0.5 text-slate-700">
                    <Computer className="h-3.5 w-3.5 text-slate-400" />
                    <span>{activeTicket.deviceType}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Work Priority</span>
                  <span className={`inline-block mt-1 font-semibold text-[9px] uppercase px-2 py-0.1 border rounded ${getPriorityColor(activeTicket.priority)}`}>
                    {activeTicket.priority} Priority
                  </span>
                </div>
              </div>

              {/* Block B: Brief Description reported */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reported Ticket Description</span>
                <p className="text-xs text-slate-700 bg-white border border-slate-100 p-3 rounded-lg leading-relaxed shadow-sm font-sans italic">
                  "{activeTicket.description}"
                </p>
              </div>

              {/* Block C: EPHI Activity Documentation form update (Step 3, 4 & 5) */}
              <form onSubmit={handleSaveUpdate} className="space-y-4 pt-4 border-t border-slate-100" id="activity-documentation-form">
                <div>
                  <h3 className="font-bold text-xs text-slate-800 font-display flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-brand-teal" />
                    <span>Support Officer Interventions & Diagnostics (Step 3 & 4)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Record immediate diagnostic procedures and identify root causes.</p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase">Support Dispatcher Assistant</label>
                    <select
                      value={editOfficer}
                      onChange={(e) => setEditOfficer(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none bg-white font-medium"
                    >
                      {staffEmployees.map(se => (
                        <option key={se} value={se}>{se}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase">Update Resolution Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full text-xs border border-slate-250 rounded p-2 focus:outline-none bg-white font-semibold text-slate-800"
                    >
                      <option value="Open">🟡 Open (Awaiting Action)</option>
                      <option value="Resolved">🟢 Resolved (Work Completed)</option>
                      <option value="Partially Resolved">🔵 Partially Resolved</option>
                      <option value="Escalated">🔴 Escalated (Transfer)</option>
                    </select>
                  </div>
                </div>

                {/* If Escalated chosen, show Escalation requirements Form (Step 4 Escalation Details) */}
                {editStatus === "Escalated" && (
                  <div className="p-3 bg-red-50/50 rounded-lg border border-red-150 space-y-3.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-bold text-red-800 text-[11px] uppercase">
                      <ShieldAlert className="h-4 w-4 text-rose-500" />
                      <span>Step 4: Ticket Escalation Requirements</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-450 block uppercase">Recommended Team Target</label>
                        <input
                          type="text"
                          required
                          value={escalatedTeam}
                          onChange={(e) => setEscalatedTeam(e.target.value)}
                          placeholder="e.g. Server & Database Escalations"
                          className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-450 block uppercase">Escalation Priority</label>
                        <select
                          value={escalatedPriority}
                          onChange={(e) => setEscalatedPriority(e.target.value as any)}
                          className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white font-semibold text-slate-800"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-450 block uppercase">Mandatory Required Information</label>
                      <input
                        type="text"
                        required
                        value={escalatedRequiredInfo}
                        onChange={(e) => setEscalatedRequiredInfo(e.target.value)}
                        placeholder="e.g. Cisco vpn terminal logs, user location IP address..."
                        className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-450 block uppercase">Suggested Next Strategic Actions</label>
                      <input
                        type="text"
                        required
                        value={escalatedNextActions}
                        onChange={(e) => setEscalatedNextActions(e.target.value)}
                        placeholder="e.g. Reconfigure LDAP directory endpoints..."
                        className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-0.5 col-span-2">
                    <label className="text-[9px] font-bold text-slate-450 uppercase">Actions Taken & Interventions (Step 3)</label>
                    <textarea
                      rows={2}
                      value={editActionsTaken}
                      onChange={(e) => setEditActionsTaken(e.target.value)}
                      placeholder="e.g. Alcohol wiped thermal printer rollers, forced AD directory synchronization..."
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase">Identified Root Cause (Step 5)</label>
                    <input
                      type="text"
                      value={editRootCause}
                      onChange={(e) => setEditRootCause(e.target.value)}
                      placeholder="e.g. Active directory password loop caching delay..."
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase">Time Spent (minutes)</label>
                    <input
                      type="number"
                      value={editTimeSpent}
                      onChange={(e) => setEditTimeSpent(Number(e.target.value))}
                      placeholder="Minutes"
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-0.5 col-span-2">
                    <label className="text-[9px] font-bold text-slate-450 uppercase">Helpdesk Internal Notes</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Enter any administrative or follow-up notes..."
                      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-400">
                    *Saving writes logs instantly to database.
                  </span>
                  <button
                    type="submit"
                    className="flex justify-center items-center gap-2 bg-slate-900 text-white font-semibold hover:bg-brand-teal text-xs py-2 px-5 rounded-lg cursor-pointer transition shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Support Log</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <ClipboardList size={36} className="text-slate-300 animate-pulse" />
            <span className="font-semibold text-sm text-slate-700 font-display">No Ticket Under Active Inspection</span>
            <span className="text-xs leading-relaxed max-w-sm">Select any ticket from the logged list on the left to review its activity log, troubleshoot, allocate support personnel, or trigger escalations.</span>
          </div>
        )}
      </div>
    </div>
  );
}
