import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  AlertOctagon, 
  ShieldAlert, 
  CornerDownRight, 
  HelpCircle, 
  RefreshCw, 
  Clock, 
  Link2,
  Lock
} from "lucide-react";
import { ChatMessage, Incident } from "../types";

interface ChatbotViewProps {
  incidents: Incident[];
  onAddMessage: (msg: ChatMessage) => void;
  chatHistory: ChatMessage[];
  selectedIncidentId?: string;
  onLinkIncident: (id: string | undefined) => void;
  onApplyDiagnosticLogs?: (incidentId: string, actions: string, rootCause: string, resolvedStatus: "Resolved" | "Escalated") => void;
}

export default function ChatbotView({
  incidents,
  chatHistory,
  selectedIncidentId,
  onLinkIncident,
  onApplyDiagnosticLogs
}: ChatbotViewProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chip definitions
  const suggestedPrompts = [
    "Outlook password loop troubleshoot steps",
    "How to configure remote Cisco VPN connection",
    "Identify a malware & execute isolation protocol",
    "Draft a network core routing escalation template"
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const activeLinkedIncident = incidents.find(i => i.id === selectedIncidentId);

  // Send message to server api
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    if (!customText) {
      setInputMessage("");
    }

    const userMsgId = `MSG-U-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append to local state list immediately
    chatHistory.push(userMessage);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          incidentId: selectedIncidentId,
          history: chatHistory.slice(-6, -1) // send preceding conversation messages for memory
        })
      });

      if (!response.ok) {
        throw new Error("Chat copilot server response failed.");
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `MSG-A-${Date.now()}`,
        sender: "assistant",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSecurityAlert: data.isSecurityAlert,
        incidentRefId: selectedIncidentId
      };

      chatHistory.push(assistantMessage);

    } catch (err: any) {
      console.error("Chat message delivery failed:", err);
      const errorMessage: ChatMessage = {
        id: `MSG-ERR-${Date.now()}`,
        sender: "assistant",
        text: "⚠️ **EPHI Connection Warning**: I failed to communicate with the central Gemini server check. Please check your network and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      chatHistory.push(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Extract simulated actions and write back to the ticket!
  const handleApplyToTicket = (incidentId: string) => {
    if (!onApplyDiagnosticLogs) return;

    // Simulate diagnostic write back
    const mockActionsTaken = "Executed diagnostic Outlook profile cache clearance and Active Directory group credential push guided by Gemini AI Support Copilot assistant.";
    const mockRootCause = "Authentication password drift in Active Directory following credentials loop.";
    
    onApplyDiagnosticLogs(incidentId, mockActionsTaken, mockRootCause, "Resolved");
    
    // Add success confirmation to history
    chatHistory.push({
      id: `CONF-${Date.now()}`,
      sender: "assistant",
      text: `✅ **Copilot Action Captured**: Standard troubleshooting diagnostic logs have been written back to Incident **${incidentId}** and status set to **Resolved**. You can view this updated in the Incident logs page!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setInputMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] md:h-[650px]" id="copilot-chatbot-container">
      {/* Sidebar: Incident Context Connector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between" id="chat-configuration-sidebar">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 font-display flex items-center gap-2">
              <Link2 className="h-4 w-4 text-brand-teal" />
              <span>Diagnostic Context Link</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Bind this chat workspace to an active logged incident to initiate focused troubleshooting guides.</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 block uppercase">Select Operational Ticket</label>
            <select 
              value={selectedIncidentId || ""}
              onChange={(e) => onLinkIncident(e.target.value || undefined)}
              className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-brand-teal focus:outline-none"
            >
              <option value="">-- No Linked Incident (Generic Chat) --</option>
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} - {inc.systemAffected} ({inc.userName})
                </option>
              ))}
            </select>
          </div>

          {activeLinkedIncident ? (
            <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100 text-xs space-y-2">
              <div className="flex justify-between items-center bg-teal-100 px-2 py-0.5 rounded text-[10px] text-teal-800 font-semibold font-mono">
                <span>ACTIVE WORK CONTEXT</span>
                <span>{activeLinkedIncident.id}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px]">REPORTED PROBLEM</span>
                <p className="font-medium text-slate-700 line-clamp-3">"{activeLinkedIncident.description}"</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-teal-100/50 text-[10px] text-slate-500">
                <div>
                  <span className="text-slate-400 block">PRIORITY</span>
                  <span className={`font-semibold ${activeLinkedIncident.priority === 'Critical' ? 'text-red-600' : 'text-slate-700'}`}>
                    {activeLinkedIncident.priority}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">STATUS</span>
                  <span className="font-semibold text-slate-700">{activeLinkedIncident.status}</span>
                </div>
              </div>

              {/* Apply Troubleshooter Log back Button */}
              {activeLinkedIncident.status !== "Resolved" && onApplyDiagnosticLogs && (
                <button
                  type="button"
                  onClick={() => handleApplyToTicket(activeLinkedIncident.id)}
                  className="w-full mt-2 bg-brand-teal text-white border border-transparent font-medium py-1 px-2 rounded hover:bg-teal-800 text-[10px] transition cursor-pointer text-center block shadow-sm"
                >
                  Write Diagnostics & Resolve
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-150 text-center text-xs text-slate-400 flex flex-col items-center gap-2 justify-center py-6">
              <Bot className="h-6 w-6 text-slate-300" />
              <span>Generic Mode Active</span>
            </div>
          )}
        </div>

        {/* Diagnostic Steps Guidelines Card */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] leading-relaxed text-slate-500 space-y-1.5 self-end w-full">
          <div className="flex items-center gap-1 font-semibold text-slate-700 text-xs text-brand-dark mb-1">
            <Sparkles className="h-3 w-3 text-brand-teal text-emerald-500" />
            <span>Support Checklist Actions</span>
          </div>
          <div className="flex gap-1">
            <span className="text-brand-teal font-semibold">1.</span>
            <span>Scan ticket attributes.</span>
          </div>
          <div className="flex gap-1">
            <span className="text-brand-teal font-semibold">2.</span>
            <span>Deploy EPHI standard diagnostics.</span>
          </div>
          <div className="flex gap-1">
            <span className="text-brand-teal font-semibold">3.</span>
            <span>Perform isolated step troubleshooting.</span>
          </div>
          <div className="flex gap-1">
            <span className="text-brand-teal font-semibold">4.</span>
            <span>Write support activity log report.</span>
          </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="bg-white border border-slate-200 rounded-xl h-full flex flex-col lg:col-span-3 overflow-hidden shadow-sm" id="chat-conversation-panel">
        {/* Chat Banner Info */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-teal/10 text-brand-teal flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-800">EPHI Helpdesk Copilot Brain</h3>
              <p className="text-[10px] text-slate-400">Contextual ICT Solutions Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CONNECTED TO GEMINI</span>
          </div>
        </div>

        {/* Message Feeds Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0 bg-slate-50/30">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-3">
              <div className="h-12 w-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-teal">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-700">How can EPHI Copilot assist you?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your technical issue report or click one of our interactive preset diagnostic helpers below to immediately query recommended troubleshooting solutions.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isAssistant = msg.sender === "assistant";
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAssistant ? 'self-start' : 'ml-auto flex-row-reverse'}`}
                  id={`chat-msg-${msg.id}`}
                >
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                    isAssistant ? 'bg-indigo-50 border border-indigo-100 text-brand-teal' : 'bg-slate-900 text-white'
                  }`}>
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1.5">
                    <div className={`rounded-2xl p-3.5 text-xs shadow-sm shadow-slate-100/30 ${
                      isAssistant 
                        ? 'bg-white border border-slate-150 text-slate-700' 
                        : 'bg-slate-900 text-slate-100 rounded-tr-none'
                    }`}>
                      {/* Markdown rendering simulation (handling lists/headers beautifully) */}
                      <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed space-y-2">
                        {msg.text.split("\n").map((line, ix) => {
                          if (line.startsWith("###")) {
                            return <h4 key={ix} className="text-xs font-bold text-slate-900 mt-2 font-display">{line.replace("###", "")}</h4>;
                          } else if (line.startsWith("##")) {
                            return <h3 key={ix} className="text-sm font-bold text-slate-900 mt-2 font-display">{line.replace("##", "")}</h3>;
                          } else if (line.startsWith("* ") || line.startsWith("- ")) {
                            return (
                              <li key={ix} className="list-disc ml-4 text-slate-700 text-xs">
                                {line.substring(2)}
                              </li>
                            );
                          } else if (/^\d+\./.test(line)) {
                            return (
                              <li key={ix} className="list-decimal ml-4 text-slate-700 text-xs font-medium">
                                {line.replace(/^\d+\.\s*/, "")}
                              </li>
                            );
                          } else if (line.trim() === "") {
                            return <div key={ix} className="h-1" />;
                          } else {
                            // Bold formatting match
                            const parts = line.split(/(\*\*.*?\*\*)/);
                            return (
                              <p key={ix} className="text-xs">
                                {parts.map((part, pidx) => {
                                  if (part.startsWith("**") && part.endsWith("**")) {
                                    return <strong key={pidx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          }
                        })}
                      </div>

                      {/* Security warnings highlighted */}
                      {msg.isSecurityAlert && (
                        <div className="mt-3 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-[11px] space-y-1">
                          <div className="flex items-center gap-1.5 font-bold uppercase text-red-700">
                            <ShieldAlert className="h-4 w-4 text-red-500 animate-bounce" />
                            <span>🔒 EPHI INFECTIOUS SYSTEM ISOLATION CODE RED</span>
                          </div>
                          <p className="font-medium text-red-700">A potential endpoint threat or phishing macro is captured. Execute isolation protocol:</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-red-600 font-semibold">
                            <li>Disconnect physical network/LAN cables on affected hardware.</li>
                            <li>Toggle wireless adapters OFF immediately.</li>
                            <li>Do NOT boot file share or type active passwords.</li>
                            <li>Relay system snapshot to Betty Hailu (Security Incident Lead).</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 block px-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="h-8 w-8 rounded-full bg-slate-150 flex items-center justify-center text-xs animate-pulse text-indigo-700 bg-indigo-50 border border-indigo-150">
                <Bot className="h-4 w-4 text-brand-teal" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs text-slate-500 flex items-center gap-2">
                <div className="flex space-x-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Copilot is diagnosing EPHI directories...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-150 flex gap-2 overflow-x-auto whitespace-nowrap shrink-0 max-w-full">
          {suggestedPrompts.map((p, pIndex) => (
            <button
              key={pIndex}
              onClick={() => handleSendMessage(p)}
              className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1 hover:border-brand-teal hover:bg-teal-50/30 transition cursor-pointer shrink-0 font-medium font-display"
            >
              🚀 {p}
            </button>
          ))}
        </div>

        {/* Input Form Box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="border-t border-slate-200 p-3.5 bg-white flex gap-3 items-center shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder={activeLinkedIncident 
              ? `Ask troubleshooting steps for incident ${activeLinkedIncident.id}...` 
              : "Ask EPHI Copilot anything... (e.g. 'How to reset Outlook pass?')"
            }
            className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-transparent bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="bg-slate-900 border border-transparent shadow hover:bg-brand-teal text-white p-3 rounded-xl disabled:bg-slate-200 disabled:text-slate-400 transition cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
