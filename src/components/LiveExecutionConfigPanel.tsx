import React from 'react';
import { AlertTriangle, Play, Shield, BarChart2, Settings2, Mail, Users, Database, Cloud, Activity } from 'lucide-react';
import { LiveExecutionConfig, LiveAttackType } from '../types';

interface LiveExecutionConfigPanelProps {
  config: LiveExecutionConfig;
  onConfigChange: (config: LiveExecutionConfig) => void;
  isEnabled: boolean;
  onToggle: () => void;
}

const attackTypes: { type: LiveAttackType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'phishing',
    title: 'Phishing Campaign',
    description: 'Simulated phishing attacks with trackable emails & payloads',
    icon: <Mail className="h-5 w-5" />
  },
  {
    type: 'insider_threat',
    title: 'Insider Threat Simulation',
    description: 'Simulates unauthorized access and data exfiltration attempts',
    icon: <Users className="h-5 w-5" />
  },
  {
    type: 'ransomware_sim',
    title: 'Ransomware Simulation',
    description: 'Safe simulation of encryption behavior in sandbox environment',
    icon: <Database className="h-5 w-5" />
  },
  {
    type: 'cloud_misconfig',
    title: 'Cloud Misconfiguration',
    description: 'Tests for common cloud security misconfigurations',
    icon: <Cloud className="h-5 w-5" />
  }
];

export function LiveExecutionConfigPanel({ config, onConfigChange, isEnabled, onToggle }: LiveExecutionConfigPanelProps) {
  const handleIntensityChange = (intensity: 'low' | 'medium' | 'high') => {
    onConfigChange({
      ...config,
      settings: {
        ...config.settings,
        intensity
      }
    });
  };

  const handleTypeChange = (type: LiveAttackType) => {
    onConfigChange({
      ...config,
      type
    });
  };

  const renderAttackSpecificConfig = () => {
    switch (config.type) {
      case 'phishing':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Phishing Campaign Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payload Type</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={(config.attackConfig.phishing?.payloadType || 'link')}
                  onChange={(e) => onConfigChange({
                    ...config,
                    attackConfig: {
                      ...config.attackConfig,
                      phishing: {
                        ...(config.attackConfig.phishing || {}),
                        payloadType: e.target.value as 'link' | 'attachment' | 'credential_harvest'
                      }
                    }
                  })}
                >
                  <option value="link">Malicious Link</option>
                  <option value="attachment">Attachment</option>
                  <option value="credential_harvest">Credential Harvesting</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sophistication Level</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={(config.attackConfig.phishing?.sophisticationLevel || 'basic')}
                  onChange={(e) => onConfigChange({
                    ...config,
                    attackConfig: {
                      ...config.attackConfig,
                      phishing: {
                        ...(config.attackConfig.phishing || {}),
                        sophisticationLevel: e.target.value as 'basic' | 'spear' | 'whale'
                      }
                    }
                  })}
                >
                  <option value="basic">Basic</option>
                  <option value="spear">Spear Phishing</option>
                  <option value="whale">Whale Phishing</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'insider_threat':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Insider Threat Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Privilege Level</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={(config.attackConfig.insiderThreat?.privilegeLevel || 'user')}
                  onChange={(e) => onConfigChange({
                    ...config,
                    attackConfig: {
                      ...config.attackConfig,
                      insiderThreat: {
                        ...(config.attackConfig.insiderThreat || {}),
                        privilegeLevel: e.target.value as 'user' | 'admin' | 'system'
                      }
                    }
                  })}
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                  <option value="system">System Level</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Activity Types</label>
                <div className="space-y-2">
                  {['data_exfil', 'privilege_escalation', 'lateral_movement'].map((activity) => (
                    <label key={activity} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.attackConfig.insiderThreat?.activityTypes?.includes(activity as any)}
                        onChange={(e) => {
                          const currentTypes = config.attackConfig.insiderThreat?.activityTypes || [];
                          const newTypes = e.target.checked
                            ? [...currentTypes, activity]
                            : currentTypes.filter(t => t !== activity);
                          onConfigChange({
                            ...config,
                            attackConfig: {
                              ...config.attackConfig,
                              insiderThreat: {
                                ...(config.attackConfig.insiderThreat || {}),
                                activityTypes: newTypes as any[]
                              }
                            }
                          });
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{activity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'ransomware_sim':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Ransomware Simulation Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Encryption Type</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={(config.attackConfig.ransomwareSim?.encryptionType || 'selective')}
                  onChange={(e) => onConfigChange({
                    ...config,
                    attackConfig: {
                      ...config.attackConfig,
                      ransomwareSim: {
                        ...(config.attackConfig.ransomwareSim || {}),
                        encryptionType: e.target.value as 'selective' | 'full'
                      }
                    }
                  })}
                >
                  <option value="selective">Selective Files</option>
                  <option value="full">Full System</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Propagation Speed</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={(config.attackConfig.ransomwareSim?.propagationSpeed || 'slow')}
                  onChange={(e) => onConfigChange({
                    ...config,
                    attackConfig: {
                      ...config.attackConfig,
                      ransomwareSim: {
                        ...(config.attackConfig.ransomwareSim || {}),
                        propagationSpeed: e.target.value as 'slow' | 'moderate' | 'fast'
                      }
                    }
                  })}
                >
                  <option value="slow">Slow</option>
                  <option value="moderate">Moderate</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'cloud_misconfig':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Cloud Misconfiguration Tests</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Target Services</label>
                <div className="space-y-2">
                  {['s3', 'iam', 'api_gateway', 'lambda'].map((service) => (
                    <label key={service} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.attackConfig.cloudMisconfig?.services?.includes(service as any)}
                        onChange={(e) => {
                          const currentServices = config.attackConfig.cloudMisconfig?.services || [];
                          const newServices = e.target.checked
                            ? [...currentServices, service]
                            : currentServices.filter(s => s !== service);
                          onConfigChange({
                            ...config,
                            attackConfig: {
                              ...config.attackConfig,
                              cloudMisconfig: {
                                ...(config.attackConfig.cloudMisconfig || {}),
                                services: newServices as any[]
                              }
                            }
                          });
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{service.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Exposure Level</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={(config.attackConfig.cloudMisconfig?.exposureLevel || 'internal')}
                  onChange={(e) => onConfigChange({
                    ...config,
                    attackConfig: {
                      ...config.attackConfig,
                      cloudMisconfig: {
                        ...(config.attackConfig.cloudMisconfig || {}),
                        exposureLevel: e.target.value as 'public' | 'semi-private' | 'internal'
                      }
                    }
                  })}
                >
                  <option value="internal">Internal Only</option>
                  <option value="semi-private">Semi-Private</option>
                  <option value="public">Public Exposure</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Play className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Live Attack Execution</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Enable live execution</span>
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-6">
          {/* Attack Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium">Select Attack Type</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attackTypes.map((attack) => (
                <div
                  key={attack.type}
                  onClick={() => handleTypeChange(attack.type)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    config.type === attack.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-${config.type === attack.type ? 'blue' : 'gray'}-600`}>
                      {attack.icon}
                    </span>
                    <h5 className="font-medium">{attack.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600">{attack.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attack-Specific Configuration */}
          {renderAttackSpecificConfig()}

          {/* Intensity Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium">Attack Intensity</h4>
            </div>
            <div className="flex gap-4">
              {(['low', 'medium', 'high'] as const).map((intensity) => (
                <button
                  key={intensity}
                  onClick={() => handleIntensityChange(intensity)}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    config.settings.intensity === intensity
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium">Advanced Metrics</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'mttr', label: 'Mean Time to Respond' },
                { key: 'mttd', label: 'Mean Time to Detect' },
                { key: 'falsePositives', label: 'False Positives' },
                { key: 'impactScore', label: 'Impact Score' },
                { key: 'dataExposure', label: 'Data Exposure' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={config.metrics.advancedMetrics[key as keyof typeof config.metrics.advancedMetrics]}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        metrics: {
                          ...config.metrics,
                          advancedMetrics: {
                            ...config.metrics.advancedMetrics,
                            [key]: e.target.checked
                          }
                        }
                      })
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safeguards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium">Safety Controls</h4>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800">Safety Measures Enabled</h5>
                  <ul className="mt-2 space-y-2 text-sm text-yellow-700">
                    <li>• All attacks run in isolated sandbox environment</li>
                    <li>• Automatic rollback on completion</li>
                    <li>• Real-time monitoring and kill switch</li>
                    <li>• No production data access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}