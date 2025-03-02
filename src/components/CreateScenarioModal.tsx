import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Shield, Users, Database, Cloud, AlertTriangle, Plus, Check, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { ScenarioType, Role, Inject } from '../types';
import { storage } from '../lib/storage';
import { predefinedStakeholders } from '../data/stakeholders';
import { CreateInjectModal } from './CreateInjectModal';

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // General Details
  title: string;
  industry: string;
  orgSize: string;
  complianceFrameworks: string[];
  
  // Threat Actor
  actorType: string;
  mitreTactics: string[];
  objectives: string[];
  
  // Attack Details
  type: ScenarioType;
  entryPoint: string;
  privilegeLevel: string;
  lateralMovement: string[];
  targetedData: string[];
  
  // Injects
  injects: Inject[];
  
  // Response
  stakeholders: {
    role: string;
    department: string;
    responsibilities: string[];
  }[];
  
  // Security Controls
  securityStack: string[];
  backupStrategy: string;
  containmentProcedures: string[];
  
  // Remediation
  remediationSteps: string[];
  lessonsLearned: string[];
}

const defaultFormData: FormData = {
  title: '',
  industry: '',
  orgSize: '',
  complianceFrameworks: [],
  actorType: '',
  mitreTactics: [],
  objectives: [],
  type: 'ransomware',
  entryPoint: '',
  privilegeLevel: '',
  lateralMovement: [],
  targetedData: [],
  injects: [],
  stakeholders: [],
  securityStack: [],
  backupStrategy: '',
  containmentProcedures: [],
  remediationSteps: [],
  lessonsLearned: []
};

const complianceOptions = ['NIST', 'ISO 27001', 'CIS', 'HIPAA', 'PCI DSS', 'GDPR'];
const actorTypes = [
  'Nation-State Actors (APTs)',
  'Cybercriminal Groups',
  'Hacktivists',
  'Insider Threats',
  'Script Kiddies',
  'Terrorist Groups',
  'Corporate Espionage Actors',
  'Lone Wolf Attackers',
  'State-Sponsored Criminal Groups (Hybrid Actors)',
  'Cyber Mercenaries (Hack-for-Hire)'
];
const mitreTacticsList = [
  'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation',
  'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement',
  'Collection', 'Command and Control', 'Exfiltration', 'Impact'
];

const attackVectorOptions = [
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'insider_threat', label: 'Insider Threat' },
  { value: 'supply_chain', label: 'Supply Chain' },
  { value: 'data_breach', label: 'Data Breach' },
  { value: 'ddos', label: 'DDoS' },
  { value: 'phishing', label: 'Phishing Attacks (Email, SMS, Vishing, Spear Phishing, BEC)' },
  { value: 'malicious_attachments', label: 'Malicious Attachments & Links (PDFs, Office Macros, ZIP Files)' },
  { value: 'credential_theft', label: 'Credential Theft & Reuse (Data Breaches, Brute Force, Password Spraying)' },
  { value: 'social_engineering', label: 'Social Engineering Attacks (Pretexting, Impersonation, Deepfake Calls)' },
  { value: 'remote_access', label: 'Compromised Remote Access (VPN, RDP, Citrix, SSH, Cloud Portals)' },
  { value: 'zero_day', label: 'Zero-Day Exploits (Unpatched Vulnerabilities)' },
  { value: 'rogue_insider', label: 'Rogue Insider Threat (Employee Sabotage, Data Theft)' },
  { value: 'credential_leaks', label: 'Third-Party Credential Leaks (API Keys, Cloud Credentials)' },
  { value: 'removable_media', label: 'Removable Media Attack (USB Drops, Infected Drives)' }
];

// Initial Access Point options grouped by category
const initialAccessPointOptions = [
  {
    category: "Employee as the Initial Access Point",
    options: [
      { value: "employee_credentials", label: "Compromised Employee Credentials – Stolen via phishing, dark web leaks, or credential stuffing" },
      { value: "employee_phishing", label: "Phishing Attack on Employee – Social engineering via email, SMS, or fake login pages" },
      { value: "malicious_insider", label: "Malicious Insider – Disgruntled or financially motivated employee selling access" },
      { value: "accidental_insider", label: "Accidental Insider Leak – Employee unknowingly exposing credentials or data" },
      { value: "exploited_device", label: "Exploited Employee Device (BYOD or Corporate) – Malware infection on personal/work devices" },
      { value: "weak_mfa", label: "Weak MFA or No MFA – Employee accounts compromised due to weak authentication" },
      { value: "remote_worker", label: "Remote Worker Targeting – Home network or personal device compromise leading to corporate breach" },
      { value: "social_media", label: "Social Media Recon & Exploitation – Attackers gathering intel from employee LinkedIn, Twitter, GitHub activity" }
    ]
  },
  {
    category: "Third-Party Vendor as the Initial Access Point",
    options: [
      { value: "vendor_account", label: "Compromised Vendor Account – Attackers use vendor credentials to access systems (e.g., MSP breach)" },
      { value: "saas_integration", label: "Exploited SaaS Integration – Weak API security in third-party tools (Salesforce, Slack, etc.)" },
      { value: "supply_chain", label: "Supply Chain Attack – Compromised software updates or dependencies (e.g., SolarWinds-style attack)" },
      { value: "cloud_misconfig", label: "Cloud Service Provider Misconfiguration – Vendor-managed cloud environments left exposed" },
      { value: "shared_credentials", label: "Shared Credentials with Vendor – Attackers reuse passwords across shared business accounts" },
      { value: "vendor_vpn", label: "Vendor VPN/Remote Access Exploited – Attackers breach through vendor-managed remote access" },
      { value: "code_injection", label: "3rd Party Developer Code Injection – Attackers inserting malicious code via outsourced devs" }
    ]
  },
  {
    category: "Open Services & Exposed Infrastructure",
    options: [
      { value: "exposed_rdp_vpn", label: "Exposed RDP/VPN – Weakly protected remote access points open to brute force or credential reuse" },
      { value: "unsecured_storage", label: "Unsecured Cloud Storage (S3 Buckets, GCP Blobs, Azure Containers) – Publicly accessible sensitive files" },
      { value: "misconfig_web", label: "Misconfigured Web Services – Public APIs or admin panels lacking proper authentication" },
      { value: "open_database", label: "Open Database Instances (Elasticsearch, MongoDB, Redis) – Unprotected databases leaking customer data" },
      { value: "unpatched_apps", label: "Unpatched Public-Facing Applications – Web apps vulnerable to SQLi, XSS, SSRF, IDOR, etc." },
      { value: "git_repos", label: "Self-Hosted Git Repositories with Hardcoded Secrets – Exposed developer environments" },
      { value: "iot_ot", label: "Exposed IoT & OT Devices – Weakly secured operational tech used as an entry point" }
    ]
  },
  {
    category: "Credential Leaks & Authentication Weaknesses",
    options: [
      { value: "darkweb_creds", label: "Leaked Corporate Credentials on Dark Web – Attackers use previously breached credentials" },
      { value: "api_keys", label: "API Keys or Private SSH Keys in Public Repos – Developers accidentally exposing secrets" },
      { value: "oauth_hijack", label: "OAuth Token Hijacking – Compromised third-party integrations allowing access to corporate resources" },
      { value: "session_hijack", label: "Session Hijacking & Cookie Theft – Attackers using stolen session cookies for access" },
      { value: "password_spray", label: "Password Spraying on Commonly Used Accounts – Exploiting weak passwords in admin accounts" },
      { value: "brute_force", label: "Brute Force Attacks on Login Portals – Targeting unprotected authentication endpoints" }
    ]
  },
  {
    category: "Physical & Insider Threats",
    options: [
      { value: "badge_rfid", label: "Compromised Corporate Badge or RFID Access – Physical intrusion leading to IT access" },
      { value: "evil_twin", label: "Evil Twin Wi-Fi Attack – Attackers setting up rogue Wi-Fi to capture employee credentials" },
      { value: "usb_drop", label: "USB Drop Attack in Office – Infected USB devices planted in high-traffic areas" },
      { value: "fake_it", label: "Fake IT Support Scam – Attackers posing as internal IT to steal credentials" },
      { value: "insider_selling", label: "Malicious Insider Selling Corporate Access – Employees offering access to attackers" }
    ]
  }
];

export function CreateScenarioModal({ isOpen, onClose }: CreateScenarioModalProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general']));
  const [selectedPredefinedRoles, setSelectedPredefinedRoles] = useState<Set<string>>(new Set());
  const [isCreateInjectModalOpen, setIsCreateInjectModalOpen] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a scenario title');
      return;
    }

    if (formData.mitreTactics.length === 0) {
      toast.error('Please select at least one MITRE ATT&CK tactic');
      return;
    }

    const scenario = {
      title: formData.title,
      type: formData.type,
      description: `${formData.industry} organization scenario focusing on ${formData.type} attack`,
      mitreTactics: formData.mitreTactics,
      roles: formData.stakeholders.map(s => ({
        id: crypto.randomUUID(),
        title: s.role,
        department: s.department,
        responsibilities: s.responsibilities
      })),
      injects: formData.injects,
      threatActor: {
        type: formData.actorType,
        objectives: formData.objectives
      },
      securityControls: {
        stack: formData.securityStack,
        backup: formData.backupStrategy,
        containment: formData.containmentProcedures
      },
      compliance: formData.complianceFrameworks,
      remediation: {
        steps: formData.remediationSteps,
        lessons: formData.lessonsLearned
      }
    };

    try {
      storage.saveScenario(scenario);
      toast.success('Scenario created successfully!');
      setFormData(defaultFormData); // Reset form
      onClose();
    } catch (error) {
      toast.error('Failed to save scenario. Please try again.');
      console.error('Error saving scenario:', error);
    }
  };

  const handleAddPredefinedRole = (roleId: string) => {
    const role = predefinedStakeholders.find(r => r.id === roleId);
    if (!role) return;

    // Check if this role is already added
    if (selectedPredefinedRoles.has(roleId)) {
      // Remove the role
      const newSelectedRoles = new Set(selectedPredefinedRoles);
      newSelectedRoles.delete(roleId);
      setSelectedPredefinedRoles(newSelectedRoles);

      // Remove from stakeholders
      setFormData({
        ...formData,
        stakeholders: formData.stakeholders.filter(s => s.role !== role.title)
      });
    } else {
      // Add the role
      const newSelectedRoles = new Set(selectedPredefinedRoles);
      newSelectedRoles.add(roleId);
      setSelectedPredefinedRoles(newSelectedRoles);

      // Add to stakeholders
      setFormData({
        ...formData,
        stakeholders: [
          ...formData.stakeholders,
          {
            role: role.title,
            department: role.department,
            responsibilities: role.responsibilities
          }
        ]
      });
    }
  };

  const handleCreateInject = (inject: Inject) => {
    setFormData({
      ...formData,
      injects: [...formData.injects, inject]
    });
    toast.success('Inject added to scenario');
  };

  const handleRemoveInject = (injectId: string) => {
    setFormData({
      ...formData,
      injects: formData.injects.filter(inject => inject.id !== injectId)
    });
  };

  const renderSection = (title: string, id: string, content: React.ReactNode) => (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {expandedSections.has(id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expandedSections.has(id) && (
        <div className="p-4 space-y-4">
          {content}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Custom Scenario</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(90vh - 5rem)' }}>
          {/* General Details */}
          {renderSection("General Scenario Details", "general", (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter scenario name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry / Business Sector
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Healthcare, Finance"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Size
                  </label>
                  <select
                    value={formData.orgSize}
                    onChange={(e) => setFormData({ ...formData, orgSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select size</option>
                    <option value="small">Small (&lt;100 employees)</option>
                    <option value="medium">Medium (100-999 employees)</option>
                    <option value="large">Large (1000+ employees)</option>
                    <option value="enterprise">Enterprise (10000+ employees)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compliance Requirements
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {complianceOptions.map((framework) => (
                    <label key={framework} className="flex items-center gap-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={formData.complianceFrameworks.includes(framework)}
                        onChange={(e) => {
                          const newFrameworks = e.target.checked
                            ? [...formData.complianceFrameworks, framework]
                            : formData.complianceFrameworks.filter(f => f !== framework);
                          setFormData({ ...formData, complianceFrameworks: newFrameworks });
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{framework}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ))}

          {/* Threat Actor */}
          {renderSection("Threat Actor Details", "actor", (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threat Actor Type
                </label>
                <select
                  value={formData.actorType}
                  onChange={(e) => setFormData({ ...formData, actorType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select actor type</option>
                  {actorTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MITRE ATT&CK Tactics
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mitreTacticsList.map((tactic) => (
                    <label key={tactic} className="flex items-center gap-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={formData.mitreTactics.includes(tactic)}
                        onChange={(e) => {
                          const newTactics = e.target.checked
                            ? [...formData.mitreTactics, tactic]
                            : formData.mitreTactics.filter(t => t !== tactic);
                          setFormData({ ...formData, mitreTactics: newTactics });
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{tactic}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Objectives
                </label>
                <div className="space-y-2">
                  {[
                    'Data Theft', 
                    'Disruption', 
                    'Financial Gain', 
                    'Espionage', 
                    'Sabotage',
                    'Surveillance & Reconnaissance',
                    'Misinformation & Disinformation',
                    'Political Influence',
                    'Reputation Damage',
                    'Extortion & Ransom',
                    'Intellectual Property Theft',
                    'Access Selling',
                    'Survival & Persistence'
                  ].map((objective) => (
                    <label key={objective} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.objectives.includes(objective)}
                        onChange={(e) => {
                          const newObjectives = e.target.checked
                            ? [...formData.objectives, objective]
                            : formData.objectives.filter(o => o !== objective);
                          setFormData({ ...formData, objectives: newObjectives });
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{objective}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ))}

          {/* Attack Details */}
          {renderSection("Attack Type & Entry Point", "attack", (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attack Vector
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ScenarioType })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {attackVectorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Access Point
                  </label>
                  <select
                    value={formData.entryPoint}
                    onChange={(e) => setFormData({ ...formData, entryPoint: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select entry point</option>
                    {initialAccessPointOptions.map((category) => (
                      <optgroup key={category.category} label={category.category}>
                        {category.options.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Targeted Data
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['PII', 'Financial', 'Intellectual Property', 'R&D', 'Customer Data'].map((dataType) => (
                    <label key={dataType} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.targetedData.includes(dataType)}
                        onChange={(e) => {
                          const newData = e.target.checked
                            ? [...formData.targetedData, dataType]
                            : formData.targetedData.filter(d => d !== dataType);
                          setFormData({ ...formData, targetedData: newData });
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{dataType}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ))}

          {/* Stakeholders */}
          {renderSection("Incident Response Team", "stakeholders", (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Predefined Stakeholders</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Select common incident response roles to quickly add them to your scenario.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predefinedStakeholders.map((role) => (
                    <div 
                      key={role.id}
                      onClick={() => handleAddPredefinedRole(role.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPredefinedRoles.has(role.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium">{role.title}</h5>
                        {selectedPredefinedRoles.has(role.id) && (
                          <Check size={18} className="text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{role.department}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-3">Custom Stakeholders</h4>
                <div className="space-y-4">
                  {formData.stakeholders.map((stakeholder, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input
                            type="text"
                            value={stakeholder.role}
                            onChange={(e) => {
                              const newStakeholders = [...formData.stakeholders];
                              newStakeholders[index].role = e.target.value;
                              setFormData({ ...formData, stakeholders: newStakeholders });
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <input
                            type="text"
                            value={stakeholder.department}
                            onChange={(e) => {
                              const newStakeholders = [...formData.stakeholders];
                              newStakeholders[index].department = e.target.value;
                              setFormData({ ...formData, stakeholders: newStakeholders });
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Responsibilities (one per line)
                        </label>
                        <textarea
                          value={stakeholder.responsibilities.join('\n')}
                          onChange={(e) => {
                            const newStakeholders = [...formData.stakeholders];
                            newStakeholders[index].responsibilities = e.target.value
                              .split('\n')
                              .filter(line => line.trim() !== '');
                            setFormData({ ...formData, stakeholders: newStakeholders });
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                          rows={3}
                          placeholder="Enter responsibilities, one per line"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      stakeholders: [...formData.stakeholders, { role: '', department: '', responsibilities: [] }]
                    })}
                    className="w-full p-2 border border-dashed rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-900"
                  >
                    + Add Custom Stakeholder
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Security Controls */}
          {renderSection("Security Controls & Defenses", "controls", (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Stack Components
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['SIEM', 'EDR', 'SOAR', 'ASM', 'IAM', 'DLP', 'WAF', 'IDS/IPS'].map((tool) => (
                    <label key={tool} className="flex items-center gap-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={formData.securityStack.includes(tool)}
                        onChange={(e) => {
                          const newStack = e.target.checked
                            ? [...formData.securityStack, tool]
                            : formData.securityStack.filter(t => t !== tool);
                          setFormData({ ...formData, securityStack: newStack });
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{tool}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Strategy
                </label>
                <textarea
                  value={formData.backupStrategy}
                  onChange={(e) => setFormData({ ...formData, backupStrategy: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Describe the backup and recovery strategy..."
                />
              </div>
            </>
          ))}

          {/* Injects - Moved to the last section */}
          {renderSection("Scenario Injects", "injects", (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Scenario Injects</h4>
                <button
                  onClick={() => setIsCreateInjectModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus size={16} />
                  Add Inject
                </button>
              </div>
              
              {formData.injects.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No injects have been added yet.</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Injects are scenario events that will be delivered during the exercise.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.injects.map((inject) => (
                    <div key={inject.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{inject.title}</h5>
                        <button
                          onClick={() => handleRemoveInject(inject.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{inject.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Timing: {inject.timing}</span>
                        <span>
                          Target Roles: {inject.targetRoles.length > 0 
                            ? inject.targetRoles.length + ' roles'
                            : 'All roles'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Scenario
            </button>
          </div>
        </div>
      </div>

      <CreateInjectModal
        isOpen={isCreateInjectModalOpen}
        onClose={() => setIsCreateInjectModalOpen(false)}
        onSave={handleCreateInject}
        roles={formData.stakeholders.map((s, index) => ({
          id: `temp-${index}`,
          title: s.role,
          department: s.department,
          responsibilities: s.responsibilities
        }))}
      />
    </div>
  );
}