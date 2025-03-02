export interface Scenario {
  id?: string;
  title: string;
  type: ScenarioType;
  description: string;
  mitreTactics: string[];
  roles: Role[];
  injects: Inject[];
  created_at?: string;
  updated_at?: string;
  isCustom?: boolean;
  status?: 'pending' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  decisions?: Decision[];
  timeline?: TimelineEvent[];
  threatActor?: {
    type: string;
    objectives: string[];
  };
  securityControls?: {
    stack: string[];
    backup: string;
    containment: string[];
  };
  compliance?: string[];
  remediation?: {
    rootCause?: string;
    securityImprovements: string[];
    complianceRequirements: string[];
    lessonsLearned: string[];
    updatedAt?: string;
  };
  analytics?: Analytics;
}

export type ScenarioType = 
  | 'ransomware'
  | 'insider_threat'
  | 'supply_chain'
  | 'data_breach'
  | 'ddos'
  | 'phishing'
  | 'malicious_attachments'
  | 'credential_theft'
  | 'social_engineering'
  | 'remote_access'
  | 'zero_day'
  | 'rogue_insider'
  | 'credential_leaks'
  | 'removable_media';

export interface Role {
  id: string;
  title: string;
  department: string;
  responsibilities: string[];
  decisions?: Decision[];
  actions?: TimelineEvent[];
}

export interface Inject {
  id: string;
  title: string;
  description: string;
  timing: string;
  targetRoles: string[];
  completedBy?: string[];
  completedAt?: string;
  deliveredAt?: string;
  responseStatus?: 'pending' | 'in_progress' | 'completed';
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  roleId: string;
  options: DecisionOption[];
  selectedOption?: string;
  timestamp?: string;
  impact?: string[];
  madeBy?: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  consequences: string[];
  complianceImpact?: ComplianceImpact[];
}

export interface ComplianceImpact {
  framework: 'NIST' | 'ISO27001' | 'CIS';
  control: string;
  impact: 'positive' | 'negative';
  description: string;
}

export interface TimelineEvent {
  id: string;
  type: 'decision' | 'inject' | 'note' | 'artifact' | 'remediation' | 'workflow';
  title: string;
  description: string;
  timestamp: string;
  roleId: string;
  roleName: string;
  relatedId?: string;
  severity?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface ComplianceMapping {
  framework: string;
  control: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant';
}

export interface Analytics {
  responseMetrics: {
    averageResponseTime: number;
    decisionAccuracy: number;
    teamCollaboration: number;
    timeToDetection?: number;
    timeToResponse?: number;
    timeToResolution?: number;
  };
  securityGaps: {
    id: string;
    area: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    detectedAt: string;
  }[];
  complianceScore: {
    framework: string;
    score: number;
    gaps: string[];
    lastUpdated: string;
  }[];
  improvements: {
    category: string;
    metric: string;
    trend: number;
    recommendations: string[];
    period: string;
  }[];
  timeline: {
    events: TimelineEvent[];
    criticalPath: string[];
    bottlenecks: string[];
  };
}

export type LiveAttackType = 'phishing' | 'insider_threat' | 'ransomware_sim' | 'cloud_misconfig';

export interface LiveExecutionConfig {
  type: LiveAttackType;
  settings: {
    intensity: 'low' | 'medium' | 'high';
    duration: number;
    autoRemediate: boolean;
  };
  metrics: {
    collectMetrics: boolean;
    advancedMetrics: {
      mttr: boolean;
      mttd: boolean;
      falsePositives: boolean;
      impactScore: boolean;
      dataExposure: boolean;
    };
  };
  attackConfig: {
    phishing?: PhishingConfig;
    insiderThreat?: InsiderThreatConfig;
    ransomwareSim?: RansomwareSimConfig;
    cloudMisconfig?: CloudMisconfigConfig;
  };
}

export interface PhishingConfig {
  payloadType: 'link' | 'attachment' | 'credential_harvest';
  sophisticationLevel: 'basic' | 'spear' | 'whale';
  targetGroups?: string[];
}

export interface InsiderThreatConfig {
  privilegeLevel: 'user' | 'admin' | 'system';
  activityTypes: ('data_exfil' | 'privilege_escalation' | 'lateral_movement')[];
  targetSystems?: string[];
}

export interface RansomwareSimConfig {
  encryptionType: 'selective' | 'full';
  propagationSpeed: 'slow' | 'moderate' | 'fast';
  targetExtensions?: string[];
}

export interface CloudMisconfigConfig {
  services: ('s3' | 'iam' | 'api_gateway' | 'lambda')[];
  exposureLevel: 'public' | 'semi-private' | 'internal';
  resourceTypes?: string[];
}