import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Shield, Users, Database, Cloud, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Scenario, ScenarioType, Role } from '../types';

interface EditScenarioModalProps {
  scenario: Scenario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scenario: Scenario) => void;
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
  
  // Roles
  roles: {
    id: string;
    title: string;
    department: string;
    responsibilities: string[];
  }[];
}

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

export function EditScenarioModal({ scenario, isOpen, onClose, onSave }: EditScenarioModalProps) {
  const [formData, setFormData] = useState<FormData>({
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
    roles: []
  });
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general', 'roles']));

  useEffect(() => {
    // Initialize form data from scenario
    if (scenario) {
      setFormData({
        title: scenario.title,
        industry: scenario.description?.split(' ')[0] || '',
        orgSize: '',
        complianceFrameworks: scenario.compliance || [],
        actorType: scenario.threatActor?.type || '',
        mitreTactics: scenario.mitreTactics || [],
        objectives: scenario.threatActor?.objectives || [],
        type: scenario.type,
        entryPoint: '',
        privilegeLevel: '',
        lateralMovement: [],
        targetedData: [],
        roles: scenario.roles.map(role => ({
          id: role.id,
          title: role.title,
          department: role.department,
          responsibilities: role.responsibilities
        }))
      });
    }
  }, [scenario]);

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

    if (formData.roles.length === 0) {
      toast.error('Please add at least one role');
      return;
    }

    const updatedScenario = {
      ...scenario,
      title: formData.title,
      type: formData.type,
      description: `${formData.industry} organization scenario focusing on ${formData.type} attack`,
      mitreTactics: formData.mitreTactics,
      roles: formData.roles,
      threatActor: {
        type: formData.actorType,
        objectives: formData.objectives
      },
      compliance: formData.complianceFrameworks
    };

    onSave(updatedScenario);
  };

  const handleAddRole = () => {
    setFormData({
      ...formData,
      roles: [
        ...formData.roles,
        {
          id: crypto.randomUUID(),
          title: '',
          department: '',
          responsibilities: []
        }
      ]
    });
  };

  const handleRemoveRole = (roleId: string) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter(role => role.id !== roleId)
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
            <h2 className="text-2xl font-bold text-gray-900">Edit Scenario</h2>
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
                    <option value="ransomware">Ransomware</option>
                    <option value="insider_threat">Insider Threat</option>
                    <option value="supply_chain">Supply Chain</option>
                    <option value="data_breach">Data Breach</option>
                    <option value="ddos">DDoS</option>
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
                    <option value="employee">Employee</option>
                    <option value="vendor">Third-Party Vendor</option>
                    <option value="service">Open Service</option>
                    <option value="credentials">Credential Leak</option>
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

          {/* Roles */}
          {renderSection("Roles & Responsibilities", "roles", (
            <div className="space-y-4">
              {formData.roles.map((role, index) => (
                <div key={role.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Role {index + 1}</h4>
                    <button
                      onClick={() => handleRemoveRole(role.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={formData.roles.length <= 1}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
                      <input
                        type="text"
                        value={role.title}
                        onChange={(e) => {
                          const updatedRoles = [...formData.roles];
                          updatedRoles[index].title = e.target.value;
                          setFormData({ ...formData, roles: updatedRoles });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., CISO, IT Manager"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={role.department}
                        onChange={(e) => {
                          const updatedRoles = [...formData.roles];
                          updatedRoles[index].department = e.target.value;
                          setFormData({ ...formData, roles: updatedRoles });
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., IT, Security, Legal"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsibilities (one per line)
                    </label>
                    <textarea
                      value={role.responsibilities.join('\n')}
                      onChange={(e) => {
                        const updatedRoles = [...formData.roles];
                        updatedRoles[index].responsibilities = e.target.value
                          .split('\n')
                          .filter(line => line.trim() !== '');
                        setFormData({ ...formData, roles: updatedRoles });
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter responsibilities, one per line"
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleAddRole}
                className="w-full p-2 border border-dashed rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-900"
              >
                + Add Role
              </button>
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}