import React, { useState } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  PlusCircle,
  Lightbulb
} from "lucide-react";
import { Recommendation } from "../types";

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  onAddRecommendation: (rec: Omit<Recommendation, "id">) => void;
}

export default function RecommendationsView({ recommendations, onAddRecommendation }: RecommendationsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState("Infrastructure Weakness");
  const [issue, setIssue] = useState("");
  const [remedy, setRemedy] = useState("");
  const [impact, setImpact] = useState<"High" | "Medium" | "Low">("Medium");
  const [actionableStep, setActionableStep] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !remedy || !actionableStep) return;

    onAddRecommendation({
      category,
      issue,
      remedy,
      impact,
      actionableStep
    });

    // Reset Form
    setIssue("");
    setRemedy("");
    setActionableStep("");
    setShowAddForm(false);
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Medium": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  const categoriesList = [
    "Account Management",
    "Training Needs",
    "Infrastructure Weakness",
    "Security Concerns",
    "Hardware",
    "Database Audit"
  ];

  return (
    <div className="space-y-6" id="recommendations-preventive-dashboard">
      <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500 animate-pulse" />
            <span>Preventive Recommendations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Strategic directives compiled to eliminate recurring errors and structural vulnerabilities.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-slate-900 text-white font-medium hover:bg-brand-teal text-xs py-2 px-4 rounded-lg cursor-pointer transition shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Recommendation</span>
        </button>
      </div>

      {/* Add New Recommendation Form slide-out/expand */}
      {showAddForm && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-md space-y-4 animate-fadeIn"
          id="add-recommendation-form"
        >
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-xs">Publish Strategic Preventive Remedy</h3>
            <p className="text-[10px] text-slate-400">Instruct organizational corrections based on helpdesk diagnostics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 block">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-brand-teal focus:outline-none"
              >
                {categoriesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 block">ESTIMATED IMPACT LEVEL</label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as any)}
                className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-brand-teal focus:outline-none"
              >
                <option value="High">🔴 High Impact</option>
                <option value="Medium">🟠 Medium Impact</option>
                <option value="Low">🟢 Low Impact</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-[10px] font-semibold text-slate-400 block">IMMEDIATE ACTIONABLE STEP</label>
              <input
                type="text"
                required
                value={actionableStep}
                onChange={(e) => setActionableStep(e.target.value)}
                placeholder="e.g. Schedule Outlook server cache sync batch scripts..."
                className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-brand-teal focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 block">OCCURRING PROBLEM & IDENTIFIED TRAIL</label>
              <textarea
                required
                value={issue}
                rows={2}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe recurring vulnerabilities, repeated employee faults, or printer locks..."
                className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-brand-teal focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 block">RECOMMENDED REMEDY & MITIGATION PLAN</label>
              <textarea
                required
                value={remedy}
                rows={2}
                onChange={(e) => setRemedy(e.target.value)}
                placeholder="Describe structural investments, training programs, or licensing models..."
                className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-brand-teal focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-teal text-white border border-transparent hover:bg-teal-800 text-xs font-semibold py-1.5 px-4 rounded cursor-pointer"
            >
              Publish Order
            </button>
          </div>
        </form>
      )}

      {/* Grid List of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="recommendations-listing">
        {recommendations.map((rec) => (
          <div 
            key={rec.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-brand-teal/40 transition flex flex-col justify-between"
            id={`rec-item-${rec.id}`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-brand-teal font-mono font-bold block">{rec.id}</span>
                  <span className="font-semibold text-xs text-slate-800 font-display block">{rec.category}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getImpactColor(rec.impact)}`}>
                  {rec.impact} Impact
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Recurring Vulnerability</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{rec.issue}</p>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Strategic Directive Remedy</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/30">
                    💡 {rec.remedy}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Immediate Action Plan</span>
              <div className="flex gap-2.5 items-start">
                <span className="text-amber-500 mt-0.5">🎯</span>
                <span className="font-medium text-slate-600">{rec.actionableStep}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
