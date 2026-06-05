import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Incident, ChatMessage, Employee, SystemStatus, Recommendation } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for incidents with rich realistic EPHI seeder data
let incidents: Incident[] = [
  {
    id: "INC-2026-001",
    date: "2026-06-01",
    userName: "Dr. Almaz Kenenisa",
    department: "Epidemiology & Surveillance",
    location: "Building A, 1st Floor",
    deviceType: "Laptop",
    systemAffected: "EPHI Email",
    priority: "High",
    category: "Email",
    description: "Keep receiving Outlook credential prompt loops and cannot send emails outside @ephi.gov.et. Keeps rejecting password.",
    rootCause: "Active Directory password synchronization delay following a recent password reset policy update.",
    actionsTaken: "Cleared local credentials locker. Forced LDAP credential synchronization on Server 02. Reconfigured Outlook Exchange cached profiles.",
    status: "Resolved",
    supportOfficer: "Yonas Assefa",
    timeSpent: 45,
    notes: "Issue was resolved successfully. Outlook credential loop stopped immediately after forcing LDAP sync."
  },
  {
    id: "INC-2026-002",
    date: "2026-06-02",
    userName: "Mergia Tolossa",
    department: "Finance & Administration",
    location: "Building B, Office 204",
    deviceType: "Printer",
    systemAffected: "Finance Shared Printer",
    priority: "Low",
    category: "Printer",
    description: "Finances HP LaserJet Pro displays Paper Jam in Fuser Unit 3. Checked tray but jam sensor remains active.",
    rootCause: "Worn feed rollers and micro-dust build up on local sensor prism.",
    actionsTaken: "Manually extracted torn sheet from fuser assembly. Alcohol-cleaned the optical sensor and roller pins.",
    status: "Resolved",
    supportOfficer: "Abebe Kebede",
    timeSpent: 25,
    notes: "Recommended changing feed rollers if issue recurs this quarter."
  },
  {
    id: "INC-2026-003",
    date: "2026-06-03",
    userName: "Dr. Aster Taye",
    department: "Vaccine Research Lab",
    location: "Main Lab, Room 10",
    deviceType: "Desktop",
    systemAffected: "Lab Information System (LIS)",
    priority: "Critical",
    category: "Software",
    description: "LIS client software crashes on booting with 'Database Handshake Timeout'. Urgent, analyzing vaccine batch batches.",
    rootCause: "",
    actionsTaken: "Checked database servers. Ping successful. Noticed security quarantine of LIS client port 1433.",
    status: "Partially Resolved",
    supportOfficer: "Unassigned",
    timeSpent: 120,
    notes: "Workaround created by allowing temporary inbound SQL connection. Full database audit needed. Awaiting final vendor approval."
  },
  {
    id: "INC-2026-004",
    date: "2026-06-04",
    userName: "Zelalem Gizaw",
    department: "Public Health Emergency Management",
    location: "PHEOC command center",
    deviceType: "Laptop",
    systemAffected: "Cisco VPN",
    priority: "High",
    category: "VPN",
    description: "Cannot establish secure VPN tunnel from remote field. Displays error: Secure Gateway is Unreachable.",
    rootCause: "",
    actionsTaken: "Verified user token is healthy. Verified remote gateway is active. Confirmed user firewall is blocking UDP port 4500.",
    status: "Escalated",
    supportOfficer: "Selamawit Tekle",
    timeSpent: 40,
    escalationInfo: {
      team: "Network Infrastructure Team",
      requiredInfo: "Field ISP configurations, IP routing logs, local firewall security profiles.",
      priority: "High",
      nextActions: "Review headquarters firewall traffic logs to see if remote IP range is geo-blocked."
    },
    notes: "Escalated to Selamawit due to advanced core routing requirements."
  },
  {
    id: "INC-2026-005",
    date: "2026-06-05",
    userName: "Kabede Daniel",
    department: "Human Resources",
    location: "Building B, Office 102",
    deviceType: "Laptop",
    systemAffected: "HR Portal",
    priority: "Medium",
    category: "Account Management",
    description: "Account locked out automatically after 3 unsuccessful attempts. Needs password reset and investigations of auto-lockouts.",
    rootCause: "Cached credentials on user's active personal mobile phone (accessing EPHI Wi-Fi) triggering lockouts.",
    actionsTaken: "Unlocked account in Active Directory. Assisted user in updating Wi-Fi password on their personal device.",
    status: "Resolved",
    supportOfficer: "Yonas Assefa",
    timeSpent: 15,
    notes: "Explained to user that cached old passwords on mobile phones are the primary cause of modern account loop lockouts."
  },
  {
    id: "INC-2026-006",
    date: "2026-06-05",
    userName: "Tsige Berhe",
    department: "National Laboratory",
    location: "Main Lab, Floor 2",
    deviceType: "Desktop",
    systemAffected: "Infectious Disease DB",
    priority: "Critical",
    category: "Security",
    description: "Received a highly suspicious security alert popup: 'Windows Defender quarantine alert - malware detected in download folder.'",
    rootCause: "Malicious macro contained in an email attachment labeled 'EPHI_Travel_Reimbursement_Form.xlsm'. Flagged as malware.",
    actionsTaken: "Quarantined infected endpoint from local LAN. Purged malicious temp items. Validated full system scan status.",
    status: "Resolved",
    supportOfficer: "Betty Hailu",
    timeSpent: 65,
    notes: "Security incident solved. Email address filtered and blocked network-wide. User instructed on phishing awareness."
  },
  {
    id: "INC-2026-007",
    date: "2026-06-05",
    userName: "Dr. Solomon Gidyelew",
    department: "Infectious Diseases Dept",
    location: "Building C, Office 12",
    deviceType: "Smartphone",
    systemAffected: "EPHI Email on Mobile",
    priority: "Medium",
    category: "Email",
    description: "Outlook client on Android does not sync inbox since Wednesday. Stuck at Loading...",
    rootCause: "",
    actionsTaken: "Cleared application cache on phone. Checked MDM registration.",
    status: "Open",
    supportOfficer: "Yonas Assefa",
    timeSpent: 30,
    notes: "Awaiting user to bring the mobile device physically to the Building B helpdesk."
  }
];

// In-memory state for initial recommendations
let recommendations: Recommendation[] = [
  {
    id: "REC-001",
    category: "Training Needs",
    issue: "Frequently occurring Outlook credentials lockouts and phishing attempts.",
    remedy: "Conduct mandatory organization-wide digital security & Outlook user training.",
    impact: "High",
    actionableStep: "Deliver a 30-minute interactive training via Teams and publish quick reference cards for Outlook cache cleaning."
  },
  {
    id: "REC-002",
    category: "Infrastructure Weakness",
    issue: "VPN connections failing frequently for remote health researchers.",
    remedy: "Upgrade Cisco VPN core firewall license and increase remote-user capacity.",
    impact: "High",
    actionableStep: "Engage Cisco gold partner to upgrade the gateway engine and deploy secondary pool redundancy."
  },
  {
    id: "REC-003",
    category: "Hardware",
    issue: "Aging office printers suffering from repetitive physical paper jams and toner leakage.",
    remedy: "Replace aging network printers under lease and establish preventive quarterly service contracts.",
    impact: "Medium",
    actionableStep: "Initiate procurement tender to replace 12 legacy printers in Building B and Finance with managed Xerox hubs."
  },
  {
    id: "REC-004",
    category: "Account Management",
    issue: "High volume of helpdesk password reset requests (40% of all incident tickets).",
    remedy: "Implement an Automated Self-Service Password Reset (SSPR) portal integrated with Azure AD.",
    impact: "High",
    actionableStep: "Configure Microsoft Entra ID SSPR with multi-factor authentication (MFA) prompts for all @ephi.gov.et employees."
  },
  {
    id: "REC-005",
    category: "Security Concerns",
    issue: "Endpoint malware detections and suspicious billing/phishing emails bypassing security blocks.",
    remedy: "Strengthen endpoint security monitoring and implement strict anti-spoofing policies.",
    impact: "High",
    actionableStep: "Enable Microsoft Defender for Endpoint automated remediation and deploy SPF, DKIM, and DMARC enforcement records on EPHI domains."
  }
];

// Employee lists with calculated baselines
const getEmployeeMetrics = (): Employee[] => {
  const staff = [
    { name: "Abebe Kebede", role: "Hardware & Helpdesk Expert", avatar: "AK" },
    { name: "Selamawit Tekle", role: "Network & VPN Specialist", avatar: "ST" },
    { name: "Yonas Assefa", role: "System & Exchange Administrator", avatar: "YA" },
    { name: "Betty Hailu", role: "Security Operations Analyst", avatar: "BH" }
  ];

  return staff.map(emp => {
    const assignedTickets = incidents.filter(i => i.supportOfficer === emp.name);
    const resolved = assignedTickets.filter(i => i.status === "Resolved").length;
    const pending = assignedTickets.filter(i => i.status === "Open" || i.status === "Partially Resolved").length;
    const escalated = assignedTickets.filter(i => i.status === "Escalated").length;
    
    // Calculate average resolution time for resolved ones
    const resolvedWithTime = assignedTickets.filter(i => i.status === "Resolved" && i.timeSpent > 0);
    const totalTime = resolvedWithTime.reduce((sum, item) => sum + item.timeSpent, 0);
    const avgResolutionTime = resolvedWithTime.length > 0 ? Math.round(totalTime / resolvedWithTime.length) : 15; // default 15

    return {
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar,
      assigned: assignedTickets.length,
      resolved,
      pending,
      escalated,
      avgResolutionTime
    };
  });
};

// System statuses
let systemStatus: SystemStatus = {
  activeDirectory: "Online",
  ephiEmail: "Online",
  ciscoVpn: "Degraded",
  dhcpDnsNetwork: "Online",
  lisSystem: "Online",
  internetAccess: "Online",
  lastChecked: new Date().toISOString()
};

// LAZY initialization of Gemini Client
let aiClient: any = null;

function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      console.warn("GEMINI_API_KEY is not defined. Using rule-based copilot agent.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST endpoints for Incidents
app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

app.post("/api/incidents", (req, res) => {
  const data = req.body;
  const newId = `INC-2026-${String(incidents.length + 1).padStart(3, "0")}`;
  
  const newIncident: Incident = {
    id: newId,
    date: data.date || new Date().toISOString().split("T")[0],
    userName: data.userName || "Unknown User",
    department: data.department || "General",
    location: data.location || "Main Campus",
    deviceType: data.deviceType || "Unknown Device",
    systemAffected: data.systemAffected || "Other Service",
    priority: data.priority || "Medium",
    category: data.category || "Other",
    description: data.description || "",
    rootCause: data.rootCause || "",
    actionsTaken: data.actionsTaken || "",
    status: data.status || "Open",
    supportOfficer: data.supportOfficer || "Unassigned",
    timeSpent: Number(data.timeSpent) || 0,
    notes: data.notes || "",
    escalationInfo: data.escalationInfo || undefined
  };

  incidents.unshift(newIncident); // prepend new tickets
  res.status(201).json(newIncident);
});

app.put("/api/incidents/:id", (req, res) => {
  const { id } = req.params;
  const index = incidents.findIndex(inc => inc.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Incident not found" });
  }

  const existing = incidents[index];
  const updated = {
    ...existing,
    ...req.body,
    // ensure casting for some items
    timeSpent: req.body.timeSpent !== undefined ? Number(req.body.timeSpent) : existing.timeSpent
  };

  incidents[index] = updated;
  res.json(updated);
});

// GET Recommendations list
app.get("/api/recommendations", (req, res) => {
  res.json(recommendations);
});

app.post("/api/recommendations", (req, res) => {
  const newRec: Recommendation = {
    id: `REC-${String(recommendations.length + 1).padStart(3, "0")}`,
    category: req.body.category || "General",
    issue: req.body.issue || "",
    remedy: req.body.remedy || "",
    impact: req.body.impact || "Medium",
    actionableStep: req.body.actionableStep || ""
  };
  recommendations.push(newRec);
  res.status(201).json(newRec);
});

// GET Employee statistics
app.get("/api/employees", (req, res) => {
  res.json(getEmployeeMetrics());
});

// GET System Statuses
app.get("/api/system-status", (req, res) => {
  res.json(systemStatus);
});

app.post("/api/system-status/toggle", (req, res) => {
  const { service, status } = req.body;
  if (service in systemStatus) {
    (systemStatus as any)[service] = status;
    systemStatus.lastChecked = new Date().toISOString();
  }
  res.json(systemStatus);
});

// AI Copilot Assistance endpoint
app.post("/api/chat", async (req, res) => {
  const { message, incidentId, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message content required" });
  }

  // Construct context of the linked incident if passed
  let linkedIncidentText = "";
  if (incidentId) {
    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      linkedIncidentText = `\n[TARGET INCIDENT WORKITEM DETAILS]
      ID: ${inc.id}
      User Name: ${inc.userName}
      Department: ${inc.department}
      Location: ${inc.location}
      Device: ${inc.deviceType}
      Affected Service: ${inc.systemAffected}
      Priority: ${inc.priority}
      Current Category: ${inc.category}
      Current Status: ${inc.status}
      Assigned To: ${inc.supportOfficer}
      Description of Issue: "${inc.description}"
      Current Actions Taken: "${inc.actionsTaken || 'None'}"
      Known Root Cause: "${inc.rootCause || 'None'}"
      Please focus your suggestions or diagnostics precisely on this ticket! Use the EPHI diagnostic questions, troubleshooting guides, or draft a perfect escalation document if the user asks.\n`;
    }
  }

  // Handle local rule-based fallback if Gemini API is not fully configured
  const ai = getAiClient();
  if (!ai) {
    // Highly relevant mock responses based on standard Support procedure keywords
    let text = "";
    const msgLower = message.toLowerCase();

    if (incidentId) {
      const inc = incidents.find(i => i.id === incidentId);
      if (msgLower.includes("troubleshoot") || msgLower.includes("resolve") || msgLower.includes("fix") || msgLower.includes("steps")) {
        text = `### 🩺 EPHI Support Troubleshooter — Incident ${incidentId}

I've reviewed the incident reported by **${inc?.userName}** regarding **${inc?.systemAffected}**. Here is the prioritized action outline:

#### Step 1: Execute Diagnostic Inspection
* **Critical Questions**: Is this happening on other devices in the ${inc?.location} area? Has the user's password expired in active directory?
* **Verification**: Ping local loopback server and telnet target service port.

#### Step 2: Step-by-Step Resolution Procedures
1. **Reset Client Local Cached Credentials**: Open Windows Credential Manager and purge any old \`@ephi.gov.et\` entries.
2. **Synchronize AD Directory Service**: Execute active directory local connection tool or run \`gpupdate /force\` on client terminal.
3. **Verify Gateway Pathing**: Flush DNS caches using \`ipconfig /flushdns\` on terminal.
4. **Outcome expected**: The application should establish a clean certificate handshake without prompting credentials loops.

#### Step 3: Mitigation & Post-Incident Activity Log
* **Root Cause Assessment**: Cache collision inside local credential profiles.
* **Support Log Action Summary**: Cleared cached files and validated local directory bind.

*Would you like me to update the ticket status to Resolved and document these steps?*`;
      } else if (msgLower.includes("escalate") || msgLower.includes("transfer")) {
        text = `### 📢 EPHI Escalation Draft — Incident ${incidentId}

Pursuant to EPHI Helpdesk protocols, here is the suggested escalation dispatch:

| Metric | Escalation Detail |
| :--- | :--- |
| **Recommended Team** | **Network Operations & Enterprise Security Escalations** |
| **Required Information** | Local gateway logs, firewall telemetry on port 4500, user workspace client configuration. |
| **Priority Level** | ${inc?.priority === 'Critical' ? '🔴 Critical' : '🟠 High'} |
| **Strategic Next Actions** | Divert traffic to secondary VPN controller B; audit Active Directory log flags for user ${inc?.userName}. |

Would you like to apply these settings and mark this ticket as **Escalated** now?`;
      } else {
        text = `Hello! I am ready to help you manage and troubleshoot incident **${incidentId}** (${inc?.systemAffected}). 

Based on our EPHI Incident Handling policies:
1. We can write step-by-step troubleshooting articles for **${inc?.category}** issues.
2. We can diagnose whether the issue is restricted to the **${inc?.department}** department.
3. We can automatically generate a beautiful **Security Incident Alert** if is security related.

*Tell me which path you want to choose today!*`;
      }
    } else {
      // General Copilot Questions
      if (msgLower.includes("outlook") || msgLower.includes("email") || msgLower.includes("password")) {
        text = `### 🔑 EPHI Password and Outlook Troubleshooter

Password reset and Outlook credential loops are the most frequent organizational issues (40% of standard EPHI incidents).

#### Recommended 4-Step Self-Help Protocol:
1. **Clean Windows Credentials**: Navigate to \`Control Panel > User Accounts > Credential Manager\` and delete all corporate keys containing \`ephi.gov.et\` or \`Office\`.
2. **Trigger AD Registry Wipe**: Close Outlook, open Run dialer (\`Win + R\`), execute \`outlook.exe /cleanprofile\`.
3. **Execute Entra ID SSPR Verification**: Ensure the user has registered their telephone MFA via EPHI SSPR portal.
4. **Force Group Sync**: Have user run \`gpupdate /force\` in command terminal.

*🔒 **Security Note**: EPHI staff will NEVER ask for user passwords. Avoid resetting passwords inside unverified links.*`;
      } else if (msgLower.includes("vpn") || msgLower.includes("network")) {
        text = `### 🌐 EPHI Cisco VPN Connectivity Guide

Remote access troubleshooting for Epidemiological staff requires validating network path security.

#### Standard Troubleshooting Sequence:
1. **Network Check**: Verify user is connected to local internet and can resolve \`https://vpn.ephi.gov.et\`.
2. **Port Audit**: Confirm remote Router/ISP does not block UDP Port 500 / 4500 (IPsec standard ports).
3. **Reset Tunnel Client**: Wipe client connection profiles inside Cisco AnyConnect and specify the gate primary host as \`vpn.ephi.gov.et\`.
4. **MFA Verification**: Inquire if user accepted the Microsoft Authenticator prompt within 30 seconds.

*If these do not succeed, escalate to **Selamawit Tekle** on the Network Infrastructure Team.*`;
      } else if (msgLower.includes("phish") || msgLower.includes("security") || msgLower.includes("malware")) {
        text = `### 🚨 SEC-ALERT: Suspicious Email & Phishing Protocol

Thank you for reporting. If you detect a suspected malware infection or spoofing email:

#### Active Threat Actions:
1. **Isolate Instantly**: Disconnect the network cable (or toggle Wi-Fi OFF) on the affected desktop immediately to cease lateral movement.
2. **Mark & Flag Outlook**: Click the **Report Message** add-in directly on Outlook or forward to \`incident-reporting@ephi.gov.et\`.
3. **Do NOT interact**: Avoid clicking any billing links, form hyperlinks, or launching macro attachments (\`.xlsm\`, \`.vbs\`, \`.exe\`).
4. **Incident Registry**: Log an incident under the **Security** category with a Critical priority level so Betty Hailu can immediately dispatch containment scripts.`;
      } else {
        text = `Welcome to the **EPHI ICT Support Copilot**! I am an intelligent helpdesk assistant at EPHI.

How can I support EPHI staff today?
- **VPN Support**: Get troubleshooting protocols for VPN & secure gateways.
- **Office / Outlook Sync**: Recover Outlook cached configuration loops.
- **Security Check**: Identify malware, isolate endpoints, or analyze phishing emails.
- **Log an Incident**: Search and troubleshoot open incident tickets.

*Please feel free to ask technical helpdesk questions or instruct me to help with a ticket.*`;
      }
    }

    // Is there a security issue flagged?
    const hasSecKeywords = msgLower.includes("hacked") || msgLower.includes("phish") || msgLower.includes("malware") || msgLower.includes("virus") || msgLower.includes("infected") || msgLower.includes("password shared");
    
    return res.json({
      message: text,
      isSecurityAlert: hasSecKeywords,
      incidentRefId: incidentId || undefined,
      isMock: true
    });
  }

  // GEMINI API FLOW
  try {
    const systemPrompt = `You are the EPHI ICT Support Copilot, an expert AI helpdesk workspace assistant at the Ethiopian Public Health Institute (EPHI).
    Your goal is to assist EPHI helpdesk staff and organizational users with password resets, network setups, VPN tunnels, hardware faults, and formal issue logging.

    CRITICAL PROCEDURE:
    1. Identify the user name, department, category, and priority levels.
    2. Suggest diagnostics (with direct clarifying questions).
    3. Generate clear, numbered, step-by-step troubleshooting solutions in simple language, with expected outcomes and alternatives.
    4. Provide actionable escalation recommendations (Recommended Team, Required Info, Next Actions) if unable to resolve.
    5. Draft formal documentation inputs suitable for logging (Issue ID, Date, Actions, Support Staff).

    SECURITY PROTOCOLS:
    If security-related threats (e.g. phishing, virus warning macro downloads, weak exposed credentials, unauthorized connections) are detected, flag them clearly in a header labeled "🔒 EPHI SECURITY WARNING" and instruct isolation steps.

    Context on current environment: ${linkedIncidentText}
    Current Time: 2026-06-05. Always give practical professional guidance, utilizing clear markdown formatting, bold keywords, and informative summaries.`;

    // format history into contents
    const messagesContents: any[] = history.map((h: any) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Add current user prompt
    messagesContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: messagesContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      }
    });

    const outputText = response.text || "No response received from Gemini API.";
    const hasSecKeywords = message.toLowerCase().includes("hacked") || message.toLowerCase().includes("phish") || message.toLowerCase().includes("malware") || message.toLowerCase().includes("virus") || message.toLowerCase().includes("infected") || message.toLowerCase().includes("password shared") || outputText.includes("SECURITY WARNING") || outputText.includes("SECURITY CONCERN");

    return res.json({
      message: outputText,
      isSecurityAlert: hasSecKeywords,
      incidentRefId: incidentId || undefined
    });

  } catch (error: any) {
    console.error("Gemini runtime error:", error);
    res.status(500).json({ error: "Gemini server communication failed.", details: error.message });
  }
});


// REPORT-GENERATION endpoints based on actual tickets
app.get("/api/reports/all", (req, res) => {
  const total = incidents.length;
  const resolved = incidents.filter(i => i.status === "Resolved").length;
  const open = incidents.filter(i => i.status === "Open" || i.status === "Partially Resolved").length;
  const escalated = incidents.filter(i => i.status === "Escalated").length;
  const critical = incidents.filter(i => i.priority === "Critical").length;

  // Daily support report structured
  const dailyReport = {
    title: "Daily ICT Support Report",
    date: "2026-06-05",
    metrics: { total, resolved, open, critical },
    summary: "Active surveillance on core systems shows EPHI Email and Active Directory services are operating nominally. Cisco VPN is degraded due to remote UDP routing packets blocks at regional ISP. Local security quarantine completed successfully for endpoint on National Lab Floor 2.",
    recommendations: [
      "Incorporate Azure AD Automated Password Reset service to drop basic account tickets volume.",
      "Conduct quick targeted troubleshooting training on mobile email setup for Infectious Disease staff."
    ]
  };

  // Weekly performance report structured
  const categoryCounts = incidents.reduce((acc, current) => {
    acc[current.category] = (acc[current.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weeklyReport = {
    title: "Weekly ICT Support Performance Report",
    period: "May 30, 2026 - June 05, 2026",
    trends: [
      "Account Management tickets climbed by 12% following quarterly credential rotation policy enforcement.",
      "VPN complaints remain elevated due to field operators working remotely.",
      "Printer physical interventions down due to recent scheduled maintenance in Building B."
    ],
    topCategories: Object.entries(categoryCounts).map(([cat, count]) => ({ category: cat, value: count })),
    staffMetrics: getEmployeeMetrics().map(emp => ({
      name: emp.name,
      completed: emp.resolved,
      assigned: emp.assigned,
      rate: emp.assigned > 0 ? Math.round((emp.resolved / emp.assigned) * 100) : 100,
      avgTime: emp.avgResolutionTime
    })),
    escalationsCount: escalated,
    actions: "Initiated service audit on Cisco gateway configurations. Prepared scope document for self-service password gateway."
  };

  // Monthly executive report
  const monthlyReport = {
    title: "Monthly ICT Executive Operations Summary",
    month: "June 2026 (Operational Baseline)",
    strategicDashboard: {
      clientSatisfaction: "94.2%",
      coreServiceAvailability: "99.8%",
      averageResponseTime: "12 minutes",
      averageResolutionDuration: "35 minutes"
    },
    challenges: [
      "Securing endpoint systems in remote branches against high-volume targeted phishing links.",
      "Support workload constraints due to manual credential reset operations."
    ],
    strategicDecisions: [
      "Approve procurement for Entra SSPR Licensing.",
      "Acquire 12 managed service multifunction enterprise printers.",
      "Implement advanced endpoint protection (EDR) agents to block dangerous Excel email macro malware."
    ]
  };

  res.json({
    dailyReport,
    weeklyReport,
    monthlyReport
  });
});


// Serve React app in production, toggle Vite Dev server in dev mode
const triggerProdRouting = () => {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
};

const bootstrap = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    triggerProdRouting();
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EPHI ICT Copilot backend active on ports: http://0.0.0.0:${PORT}`);
  });
};

if (process.env.VERCEL === "1" || process.env.VERCEL) {
  console.log("Vercel serverless function environment detected. Skipping direct listen.");
} else {
  bootstrap();
}

export default app;
