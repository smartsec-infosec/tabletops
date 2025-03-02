import React, { useState, useEffect } from 'react';
import { X, Edit, Clock, Calendar, Users, Shield, AlertTriangle, Plus, CheckCircle2, Play, FileText, BarChart, ClipboardList, Download, FileDown } from 'lucide-react';
import { Scenario, Decision, Inject, TimelineEvent, Analytics } from '../types';
import { storage } from '../lib/storage';
import { EditScenarioModal } from './EditScenarioModal';
import { CreateDecisionModal } from './CreateDecisionModal';
import { CreateInjectModal } from './CreateInjectModal';
import { TimelineView } from './TimelineView';
import { AnalyticsGenerator } from './AnalyticsGenerator';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ScenarioDetailsModalProps {
  scenario: Scenario;
  isOpen: boolean;
  onClose: () => void;
}

export function ScenarioDetailsModal({ scenario, isOpen, onClose }: ScenarioDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'decisions' | 'injects' | 'timeline' | 'remediation'>('overview');
  const [currentScenario, setCurrentScenario] = useState<Scenario>(scenario);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateDecisionModalOpen, setIsCreateDecisionModalOpen] = useState(false);
  const [isCreateInjectModalOpen, setIsCreateInjectModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [showCompleteWarning, setShowCompleteWarning] = useState(false);
  const [remediationData, setRemediationData] = useState({
    rootCause: currentScenario.remediation?.rootCause || '',
    securityImprovements: currentScenario.remediation?.securityImprovements || [],
    complianceRequirements: currentScenario.remediation?.complianceRequirements || [],
    lessonsLearned: currentScenario.remediation?.lessonsLearned || []
  });

  useEffect(() => {
    setCurrentScenario(scenario);
    setRemediationData({
      rootCause: scenario.remediation?.rootCause || '',
      securityImprovements: scenario.remediation?.securityImprovements || [],
      complianceRequirements: scenario.remediation?.complianceRequirements || [],
      lessonsLearned: scenario.remediation?.lessonsLearned || []
    });
  }, [scenario]);

  const isScenarioStarted = !!currentScenario.startedAt;
  const isScenarioCompleted = !!currentScenario.completedAt;

  const handleScenarioUpdate = (updatedScenario: Scenario) => {
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    setIsEditModalOpen(false);
    toast.success('Scenario updated successfully');
  };

  const handleStartScenario = () => {
    const startedAt = new Date().toISOString();
    const updatedScenario = {
      ...currentScenario,
      startedAt,
      status: 'in_progress' as const
    };
    
    // Add a timeline event for scenario start
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'note',
      title: 'Scenario Started',
      description: `The "${currentScenario.title}" scenario exercise has been started.`,
      timestamp: startedAt,
      roleId: 'system',
      roleName: 'System',
      metadata: {
        scenarioType: currentScenario.type,
        mitreTactics: currentScenario.mitreTactics.join(', ')
      }
    };
    
    updatedScenario.timeline = [
      ...(updatedScenario.timeline || []),
      timelineEvent
    ];
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Scenario started');
  };

  const handleCompleteScenario = () => {
    const completedAt = new Date().toISOString();
    const updatedScenario = {
      ...currentScenario,
      completedAt,
      status: 'completed' as const
    };
    
    // Add a timeline event for scenario completion
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'note',
      title: 'Scenario Completed',
      description: `The "${currentScenario.title}" scenario exercise has been completed.`,
      timestamp: completedAt,
      roleId: 'system',
      roleName: 'System',
      metadata: {
        duration: `${Math.round((new Date(completedAt).getTime() - new Date(currentScenario.startedAt!).getTime()) / (1000 * 60))} minutes`,
        decisionsCount: currentScenario.decisions?.length || 0,
        injectsCount: currentScenario.injects?.length || 0
      }
    };
    
    updatedScenario.timeline = [
      ...(updatedScenario.timeline || []),
      timelineEvent
    ];
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Scenario completed');
    setShowCompleteWarning(false);
  };

  const handleCreateDecision = (decision: Decision) => {
    const updatedScenario = {
      ...currentScenario,
      decisions: [
        ...(currentScenario.decisions || []),
        decision
      ]
    };
    
    // Add a timeline event for decision creation
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'decision',
      title: `Decision Created: ${decision.title}`,
      description: decision.description,
      timestamp: new Date().toISOString(),
      roleId: decision.roleId,
      roleName: currentScenario.roles.find(r => r.id === decision.roleId)?.title || 'Unknown',
      relatedId: decision.id,
      metadata: {
        optionsCount: decision.options.length
      }
    };
    
    updatedScenario.timeline = [
      ...(updatedScenario.timeline || []),
      timelineEvent
    ];
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Decision created');
  };

  const handleSelectDecisionOption = (decisionId: string, optionId: string) => {
    const decision = currentScenario.decisions?.find(d => d.id === decisionId);
    if (!decision) return;
    
    const option = decision.options.find(o => o.id === optionId);
    if (!option) return;
    
    const updatedDecisions = currentScenario.decisions?.map(d => 
      d.id === decisionId 
        ? { ...d, selectedOption: optionId, timestamp: new Date().toISOString() }
        : d
    );
    
    const updatedScenario = {
      ...currentScenario,
      decisions: updatedDecisions
    };
    
    // Add a timeline event for decision selection
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'decision',
      title: `Decision Made: ${decision.title}`,
      description: `Selected option: ${option.title}`,
      timestamp: new Date().toISOString(),
      roleId: decision.roleId,
      roleName: currentScenario.roles.find(r => r.id === decision.roleId)?.title || 'Unknown',
      relatedId: decision.id,
      metadata: {
        selectedOption: option.title,
        consequences: option.consequences.join(', ')
      }
    };
    
    updatedScenario.timeline = [
      ...(updatedScenario.timeline || []),
      timelineEvent
    ];
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Decision recorded');
  };

  const handleCreateInject = (inject: Inject) => {
    const updatedScenario = {
      ...currentScenario,
      injects: [
        ...(currentScenario.injects || []),
        inject
      ]
    };
    
    // Only add a timeline event if the scenario has started
    if (isScenarioStarted) {
      // Add a timeline event for inject creation
      const timelineEvent: TimelineEvent = {
        id: crypto.randomUUID(),
        type: 'inject',
        title: `Inject Created: ${inject.title}`,
        description: inject.description,
        timestamp: new Date().toISOString(),
        roleId: 'system',
        roleName: 'System',
        relatedId: inject.id,
        metadata: {
          timing: inject.timing,
          targetRoles: inject.targetRoles.length > 0 
            ? inject.targetRoles.map(roleId => {
                const role = currentScenario.roles.find(r => r.id === roleId);
                return role?.title;
              }).filter(Boolean).join(', ')
            : 'All Roles'
        }
      };
      
      updatedScenario.timeline = [
        ...(updatedScenario.timeline || []),
        timelineEvent
      ];
    }
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Inject created');
  };

  const handleDeliverInject = (injectId: string) => {
    const inject = currentScenario.injects?.find(i => i.id === injectId);
    if (!inject) return;
    
    const deliveredAt = new Date().toISOString();
    
    const updatedInjects = currentScenario.injects?.map(i => 
      i.id === injectId 
        ? { ...i, deliveredAt }
        : i
    );
    
    const updatedScenario = {
      ...currentScenario,
      injects: updatedInjects
    };
    
    // Add a timeline event for inject delivery
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'inject',
      title: `Inject Delivered: ${inject.title}`,
      description: inject.description,
      timestamp: deliveredAt,
      roleId: 'system',
      roleName: 'System',
      relatedId: inject.id,
      severity: 'medium',
      metadata: {
        timing: inject.timing,
        targetRoles: inject.targetRoles.length > 0 
          ? inject.targetRoles.map(roleId => {
              const role = currentScenario.roles.find(r => r.id === roleId);
              return role?.title;
            }).filter(Boolean).join(', ')
          : 'All Roles'
      }
    };
    
    updatedScenario.timeline = [
      ...(updatedScenario.timeline || []),
      timelineEvent
    ];
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Inject delivered');
  };

  const handleAddTimelineNote = (note: Omit<TimelineEvent, 'id'>) => {
    const timelineEvent: TimelineEvent = {
      ...note,
      id: crypto.randomUUID()
    };
    
    const updatedScenario = {
      ...currentScenario,
      timeline: [
        ...(currentScenario.timeline || []),
        timelineEvent
      ]
    };
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Note added to timeline');
  };

  const handleAnalyticsGenerated = (analytics: Analytics) => {
    const updatedScenario = {
      ...currentScenario,
      analytics
    };
    
    // Add a timeline event for analytics generation
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'artifact',
      title: 'Analytics Generated',
      description: 'Scenario analytics have been generated based on timeline events.',
      timestamp: new Date().toISOString(),
      roleId: 'system',
      roleName: 'System',
      metadata: {
        securityGaps: analytics.securityGaps.length,
        responseTime: `${analytics.responseMetrics.averageResponseTime} minutes`,
        teamCollaboration: `${analytics.responseMetrics.teamCollaboration}%`
      }
    };
    
    updatedScenario.timeline = [
      ...(updatedScenario.timeline || []),
      timelineEvent
    ];
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
  };

  const handleRemediationUpdate = () => {
    const updatedScenario = {
      ...currentScenario,
      remediation: {
        ...remediationData,
        updatedAt: new Date().toISOString()
      }
    };

    // Add a timeline event for remediation update
    const timelineEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      type: 'remediation',
      title: 'Post-Incident Remediation Updated',
      description: 'Post-incident remediation plan has been updated.',
      timestamp: new Date().toISOString(),
      roleId: 'system',
      roleName: 'System',
      metadata: {
        rootCauseUpdated: !!remediationData.rootCause,
        securityImprovementsCount: remediationData.securityImprovements.length,
        lessonsLearnedCount: remediationData.lessonsLearned.length
      }
    };
    
    updatedScenario.timeline = [
      ...(updatedScenario.timeline || []),
      timelineEvent
    ];
    
    storage.updateScenario(updatedScenario);
    setCurrentScenario(updatedScenario);
    toast.success('Remediation plan updated');
  };

  const exportRemediationToPDF = () => {
    try {
      // Create new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Post-Incident Remediation Report', 14, 20);
      
      // Add scenario info
      doc.setFontSize(12);
      doc.text(`Scenario: ${currentScenario.title}`, 14, 30);
      doc.text(`Type: ${currentScenario.type.replace(/_/g, ' ')}`, 14, 37);
      doc.text(`Completed: ${new Date(currentScenario.completedAt!).toLocaleString()}`, 14, 44);
      
      // Add root cause analysis
      doc.setFontSize(14);
      doc.text('Root Cause Analysis', 14, 55);
      doc.setFontSize(10);
      
      const rootCauseLines = doc.splitTextToSize(remediationData.rootCause || 'Not provided', 180);
      doc.text(rootCauseLines, 14, 62);
      
      // Add security improvements
      let yPos = 62 + (rootCauseLines.length * 5);
      doc.setFontSize(14);
      doc.text('Security Posture Improvement Plan', 14, yPos);
      doc.setFontSize(10);
      yPos += 7;
      
      if (remediationData.securityImprovements.length > 0) {
        remediationData.securityImprovements.forEach((improvement, index) => {
          doc.text(`${index + 1}. ${improvement}`, 14, yPos);
          yPos += 6;
        });
      } else {
        doc.text('No security improvements provided', 14, yPos);
        yPos += 6;
      }
      
      // Add compliance requirements
      yPos += 5;
      doc.setFontSize(14);
      doc.text('Compliance & Audit Requirements', 14, yPos);
      doc.setFontSize(10);
      yPos += 7;
      
      if (remediationData.complianceRequirements.length > 0) {
        remediationData.complianceRequirements.forEach((requirement, index) => {
          doc.text(`${index + 1}. ${requirement}`, 14, yPos);
          yPos += 6;
        });
      } else {
        doc.text('No compliance requirements provided', 14, yPos);
        yPos += 6;
      }
      
      // Check if we need a new page for lessons learned
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 5;
      }
      
      // Add lessons learned
      doc.setFontSize(14);
      doc.text('Lessons Learned & Policy Updates', 14, yPos);
      doc.setFontSize(10);
      yPos += 7;
      
      if (remediationData.lessonsLearned.length > 0) {
        remediationData.lessonsLearned.forEach((lesson, index) => {
          doc.text(`${index + 1}. ${lesson}`, 14, yPos);
          yPos += 6;
        });
      } else {
        doc.text('No lessons learned provided', 14, yPos);
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`, 14, 290);
      }
      
      // Save PDF
      doc.save(`${currentScenario.title.replace(/\s+/g, '-').toLowerCase()}-remediation-plan.pdf`);
      toast.success('Remediation plan exported to PDF');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to export remediation plan. Please try again.');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold">{currentScenario.title}</h3>
          <p className="text-gray-600 mt-1">{currentScenario.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isScenarioStarted && (
            <button
              onClick={handleStartScenario}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Play size={18} />
              Start Scenario
            </button>
          )}
          {isScenarioStarted && !isScenarioCompleted && (
            <>
              {showCompleteWarning ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCompleteWarning(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteScenario}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <CheckCircle2 size={18} />
                    Confirm Completion
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCompleteWarning(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <CheckCircle2 size={18} />
                  Complete Scenario
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"
          >
            <Edit size={18} />
          </button>
        </div>
      </div>
      
      {showCompleteWarning && !isScenarioCompleted && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Warning: Completing the Scenario</h4>
            <p className="mt-1 text-red-700">
              This action will mark the scenario as completed and close it down. You won't be able to add more decisions or injects after completion. All data will be preserved in the timeline.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Status</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              isScenarioCompleted ? 'bg-green-500' :
              isScenarioStarted ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}></span>
            <span>{
              isScenarioCompleted ? 'Completed' :
              isScenarioStarted ? 'In Progress' :
              'Not Started'
            }</span>
          </div>
          {isScenarioStarted && (
            <p className="text-xs text-gray-500 mt-2">
              Started: {new Date(currentScenario.startedAt!).toLocaleString()}
            </p>
          )}
          {isScenarioCompleted && (
            <p className="text-xs text-gray-500 mt-1">
              Completed: {new Date(currentScenario.completedAt!).toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Attack Type</h4>
          </div>
          <p className="capitalize">{currentScenario.type.replace(/_/g, ' ')}</p>
          <div className="mt-2">
            <h5 className="text-xs font-medium text-gray-500">MITRE ATT&CK Tactics:</h5>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentScenario.mitreTactics.map((tactic, index) => (
                <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {tactic}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Roles</h4>
          </div>
          <p>{currentScenario.roles.length} roles defined</p>
          <div className="mt-2 space-y-1">
            {currentScenario.roles.slice(0, 3).map((role) => (
              <div key={role.id} className="text-sm">
                <span className="font-medium">{role.title}</span>
                <span className="text-gray-500"> - {role.department}</span>
              </div>
            ))}
            {currentScenario.roles.length > 3 && (
              <p className="text-xs text-gray-500">
                +{currentScenario.roles.length - 3} more roles
              </p>
            )}
          </div>
        </div>
      </div>
      
      {isScenarioStarted && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Exercise Progress</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Decisions</h4>
                <span className="text-sm text-gray-500">
                  {currentScenario.decisions?.filter(d => d.selectedOption)?.length || 0} / {currentScenario.decisions?.length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ 
                    width: `${currentScenario.decisions?.length 
                      ? ((currentScenario.decisions.filter(d => d.selectedOption)?.length || 0) / currentScenario.decisions.length) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Injects</h4>
                <span className="text-sm text-gray-500">
                  {currentScenario.injects?.filter(i => i.deliveredAt)?.length || 0} / {currentScenario.injects?.length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ 
                    width: `${currentScenario.injects?.length 
                      ? ((currentScenario.injects.filter(i => i.deliveredAt)?.length || 0) / currentScenario.injects.length) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          {isScenarioStarted && !isScenarioCompleted && (
            <AnalyticsGenerator 
              scenario={currentScenario}
              onAnalyticsGenerated={handleAnalyticsGenerated}
            />
          )}
        </div>
      )}
    </div>
  );

  const renderDecisions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Decisions</h3>
        {isScenarioStarted && !isScenarioCompleted && (
          <button
            onClick={() => setIsCreateDecisionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Decision
          </button>
        )}
      </div>
      
      {!currentScenario.decisions || currentScenario.decisions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No decisions have been created yet.</p>
          {isScenarioStarted && !isScenarioCompleted && (
            <p className="text-gray-600 mt-2">
              Click the "Create Decision" button to add a decision point to this scenario.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {currentScenario.decisions.map((decision) => (
            <div key={decision.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">{decision.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Assigned to: {currentScenario.roles.find(r => r.id === decision.roleId)?.title}
                  </span>
                  {decision.selectedOption && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      <CheckCircle2 size={14} />
                      Decision Made
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{decision.description}</p>
              
              <div className="space-y-4">
                <h5 className="font-medium">Options:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {decision.options.map((option) => (
                    <div 
                      key={option.id}
                      className={`p-4 border rounded-lg ${
                        decision.selectedOption === option.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium">{option.title}</h6>
                        {decision.selectedOption === option.id && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      
                      {option.consequences.length > 0 && (
                        <div>
                          <h6 className="text-xs font-medium text-gray-500 mb-1">Consequences:</h6>
                          <ul className="text-sm space-y-1">
                            {option.consequences.map((consequence, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>{consequence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {isScenarioStarted && !isScenarioCompleted && !decision.selectedOption && (
                        <button
                          onClick={() => handleSelectDecisionOption(decision.id, option.id)}
                          className="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Select This Option
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {decision.timestamp && (
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  Decision made at: {new Date(decision.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <CreateDecisionModal
        isOpen={isCreateDecisionModalOpen}
        onClose={() => setIsCreateDecisionModalOpen(false)}
        onSave={handleCreateDecision}
        roles={currentScenario.roles}
      />
    </div>
  );

  const renderInjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Injects</h3>
        {!isScenarioCompleted && (
          <button
            onClick={() => setIsCreateInjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Inject
          </button>
        )}
      </div>
      
      {!currentScenario.injects || currentScenario.injects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">No injects have been created yet.</p>
          {!isScenarioCompleted && (
            <p className="text-gray-600 mt-2">
              Click the "Create Inject" button to add an inject to this scenario.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentScenario.injects.map((inject) => (
            <div key={inject.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">{inject.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Timing: {inject.timing}
                  </span>
                  {inject.deliveredAt ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      <CheckCircle2 size={14} />
                      Delivered
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                      <Clock size={14} />
                      Pending
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{inject.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Target Roles: {inject.targetRoles.length > 0 
                      ? inject.targetRoles.map(roleId => {
                          const role = currentScenario.roles.find(r => r.id === roleId);
                          return role?.title;
                        }).filter(Boolean).join(', ')
                      : 'All Roles'}
                  </p>
                  {inject.deliveredAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Delivered at: {new Date(inject.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </div>
                
                {isScenarioStarted && !isScenarioCompleted && !inject.deliveredAt && (
                  <button
                    onClick={() => handleDeliverInject(inject.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Deliver Inject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <CreateInjectModal
        isOpen={isCreateInjectModalOpen}
        onClose={() => setIsCreateInjectModalOpen(false)}
        onSave={handleCreateInject}
        roles={currentScenario.roles}
      />
    </div>
  );

  const renderTimeline = () => (
    <div>
      {currentScenario.timeline && currentScenario.timeline.length > 0 ? (
        <TimelineView 
          events={currentScenario.timeline} 
          onAddNote={isScenarioStarted ? handleAddTimelineNote : undefined}
          scenario={currentScenario}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No timeline events recorded yet.</p>
          <p className="text-gray-500 mt-1">Timeline events will be recorded as you progress through the exercise.</p>
        </div>
      )}
    </div>
  );

  const renderRemediation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Post-Incident Remediation</h3>
        <div className="flex items-center gap-2">
          {isScenarioCompleted && (
            <>
              <button
                onClick={exportRemediationToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FileDown size={18} />
                Export to PDF
              </button>
              <button
                onClick={handleRemediationUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CheckCircle2 size={18} />
                Save Remediation Plan
              </button>
            </>
          )}
        </div>
      </div>
      
      {!isScenarioCompleted ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ClipboardList className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Post-incident remediation is available after scenario completion.</p>
          <p className="text-gray-600 mt-2">
            Complete the scenario to access the remediation planning section.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h4 className="text-lg font-semibold">Root Cause Analysis</h4>
            </div>
            <textarea
              value={remediationData.rootCause}
              onChange={(e) => setRemediationData({...remediationData, rootCause: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Document the root cause analysis findings..."
            />
            <div className="mt-2 text-sm text-gray-500">
              Identify and document the underlying causes that led to the incident.
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-blue-500" />
              <h4 className="text-lg font-semibold">Security Posture Improvement Plan</h4>
            </div>
            <textarea
              value={remediationData.securityImprovements.join('\n')}
              onChange={(e) => setRemediationData({
                ...remediationData, 
                securityImprovements: e.target.value.split('\n').filter(line => line.trim() !== '')
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="List security improvements (one per line)..."
            />
            <div className="mt-2 text-sm text-gray-500">
              Outline specific security controls, technologies, or processes that should be implemented or improved.
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-purple-500" />
              <h4 className="text-lg font-semibold">Compliance & Audit Requirements</h4>
            </div>
            <textarea
              value={remediationData.complianceRequirements.join('\n')}
              onChange={(e) => setRemediationData({
                ...remediationData, 
                complianceRequirements: e.target.value.split('\n').filter(line => line.trim() !== '')
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="List compliance requirements (one per line)..."
            />
            <div className="mt-2 text-sm text-gray-500">
              Document regulatory requirements, reporting obligations, and audit needs following the incident.
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-green-500" />
              <h4 className="text-lg font-semibold">Lessons Learned & Policy Updates</h4>
            </div>
            <textarea
              value={remediationData.lessonsLearned.join('\n')}
              onChange={(e) => setRemediationData({
                ...remediationData, 
                lessonsLearned: e.target.value.split('\n').filter(line => line.trim() !== '')
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="List lessons learned and policy updates (one per line)..."
            />
            <div className="mt-2 text-sm text-gray-500">
              Document key lessons and specific policy or procedure updates needed based on the incident.
            </div>
          </div>
          
          {currentScenario.remediation?.updatedAt && (
            <div className="text-sm text-gray-500 italic">
              Last updated: {new Date(currentScenario.remediation.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold">Scenario Details</h2>
          </div>
        </div>
        
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'decisions' ? 'border-blue-600 text-blue-600' : 'border-transparent'
            }`}
          >
            Decisions
          </button>
          <button
            onClick={() => setActiveTab('injects')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'injects' ? 'border-blue-600 text-blue-600' : 'border-transparent'
            }`}
          >
            Injects
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('remediation')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'remediation' ? 'border-blue-600 text-blue-600' : 'border-transparent'
            } ${isScenarioCompleted ? '' : 'text-gray-400'}`}
          >
            Remediation
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'decisions' && renderDecisions()}
          {activeTab === 'injects' && renderInjects()}
          {activeTab === 'timeline' && renderTimeline()}
          {activeTab === 'remediation' && renderRemediation()}
        </div>
      </div>
      
      <EditScenarioModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        scenario={currentScenario}
        onSave={handleScenarioUpdate}
      />
    </div>
  );
}