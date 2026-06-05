export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type IssueCategory =
  | 'Account Management'
  | 'Email'
  | 'Network'
  | 'Hardware'
  | 'Software'
  | 'Printer'
  | 'Security'
  | 'VPN'
  | 'Operating System'
  | 'Other';

export type ResolutionStatus = 'Open' | 'Resolved' | 'Partially Resolved' | 'Escalated';

export interface Incident {
  id: string; // INC-XXXX
  date: string; // YYYY-MM-DD
  userName: string;
  department: string;
  location: string;
  deviceType: string;
  systemAffected: string;
  priority: PriorityLevel;
  category: IssueCategory;
  description: string;
  rootCause: string;
  actionsTaken: string;
  status: ResolutionStatus;
  supportOfficer: string; // Employee Name, or 'Unassigned'
  timeSpent: number; // in minutes
  notes?: string;
  escalationInfo?: {
    team: string; // e.g., Network Infrastructure, Security Operations, Vendor Support
    requiredInfo: string;
    priority: PriorityLevel;
    nextActions: string;
  };
}

export interface Employee {
  name: string;
  role: string;
  avatar: string;
  assigned: number;
  resolved: number;
  pending: number;
  escalated: number;
  avgResolutionTime: number; // in mins
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isSecurityAlert?: boolean;
  incidentRefId?: string; // If this chat is about/linked to a specific incident
  troubleshootingSteps?: string[];
}

export interface Recommendation {
  id: string;
  category: string;
  issue: string;
  remedy: string;
  impact: 'High' | 'Medium' | 'Low';
  actionableStep: string;
}

export interface SystemStatus {
  activeDirectory: 'Online' | 'Degraded' | 'Offline';
  ephiEmail: 'Online' | 'Degraded' | 'Offline';
  ciscoVpn: 'Online' | 'Degraded' | 'Offline';
  dhcpDnsNetwork: 'Online' | 'Degraded' | 'Offline';
  lisSystem: 'Online' | 'Degraded' | 'Offline';
  internetAccess: 'Online' | 'Degraded' | 'Offline';
  lastChecked: string;
}
