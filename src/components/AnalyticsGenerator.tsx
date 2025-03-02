import React, { useState, useEffect } from 'react';
import { BarChart, Activity, Clock, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { Scenario, TimelineEvent, Analytics } from '../types';
import { storage } from '../lib/storage';
import toast from 'react-hot-toast';

interface AnalyticsGeneratorProps {
  scenario: Scenario;
  onAnalyticsGenerated: (analytics: Analytics) => void;
}

export function AnalyticsGenerator({ scenario, onAnalyticsGenerated }: AnalyticsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [metrics, setMetrics] = useState<{
    mttd: number | null;
    mttr: number | null;
    decisionAccuracy: number;
    teamCollaboration: number;
    securityGaps: string[];
  }>({
    mttd: null,
    mttr: null,
    decisionAccuracy: 0,
    teamCollaboration: 0,
    securityGaps: []
  });

  const generateAnalytics = () => {
    if (!scenario.timeline || scenario.timeline.length === 0) {
      toast.error('Not enough timeline data to generate analytics');
      return;
    }

    setIsGenerating(true);

    // Sort timeline events by timestamp
    const sortedEvents = [...scenario.timeline].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate MTTD (Mean Time to Detect)
    let mttd = null;
    if (scenario.startedAt) {
      const startTime = new Date(scenario.startedAt).getTime();
      const firstDetectionEvent = sortedEvents.find(e => 
        e.type === 'inject' && e.title.toLowerCase().includes('detect')
      );
      
      if (firstDetectionEvent) {
        const detectionTime = new Date(firstDetectionEvent.timestamp).getTime();
        mttd = Math.round((detectionTime - startTime) / (1000 * 60)); // in minutes
      }
    }

    // Calculate MTTR (Mean Time to Respond)
    let mttr = null;
    if (scenario.startedAt) {
      const startTime = new Date(scenario.startedAt).getTime();
      
      // Find all response events (workflow steps completed)
      const responseEvents = sortedEvents.filter(e => 
        e.type === 'workflow' && e.title.toLowerCase().includes('complete')
      );
      
      if (responseEvents.length > 0) {
        // Calculate average response time
        const totalResponseTime = responseEvents.reduce((total, event) => {
          const responseTime = new Date(event.timestamp).getTime() - startTime;
          return total + responseTime;
        }, 0);
        
        mttr = Math.round((totalResponseTime / responseEvents.length) / (1000 * 60)); // in minutes
      }
    }

    // Calculate Decision Accuracy
    let decisionAccuracy = 0;
    const decisionEvents = sortedEvents.filter(e => e.type === 'decision');
    if (decisionEvents.length > 0) {
      // For this demo, we'll simulate decision accuracy based on metadata
      // In a real system, you would compare decisions against best practices
      decisionAccuracy = Math.round(70 + Math.random() * 20); // Random between 70-90%
    }

    // Calculate Team Collaboration
    let teamCollaboration = 0;
    const uniqueRoles = new Set(sortedEvents.map(e => e.roleId));
    const totalRoles = scenario.roles.length;
    
    if (totalRoles > 0) {
      // Calculate percentage of roles that participated
      teamCollaboration = Math.round((uniqueRoles.size / totalRoles) * 100);
    }

    // Identify Security Gaps
    const securityGaps = [];
    
    // Check if there were delayed responses to critical events
    const criticalEvents = sortedEvents.filter(e => e.severity === 'high');
    const delayedResponses = criticalEvents.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      const nextResponseEvent = sortedEvents.find(e => 
        e.type === 'workflow' && 
        new Date(e.timestamp).getTime() > eventTime &&
        e.title.toLowerCase().includes('response')
      );
      
      if (!nextResponseEvent) return true;
      
      const responseTime = new Date(nextResponseEvent.timestamp).getTime();
      const timeDiff = (responseTime - eventTime) / (1000 * 60); // minutes
      
      return timeDiff > 30; // If response took more than 30 minutes
    });
    
    if (delayedResponses.length > 0) {
      securityGaps.push('Delayed Response to Critical Events');
    }
    
    // Check for missing security controls based on timeline events
    const mentionedControls = new Set();
    sortedEvents.forEach(event => {
      const description = event.description.toLowerCase();
      if (description.includes('firewall')) mentionedControls.add('firewall');
      if (description.includes('antivirus') || description.includes('anti-virus')) mentionedControls.add('antivirus');
      if (description.includes('backup')) mentionedControls.add('backup');
      if (description.includes('encryption')) mentionedControls.add('encryption');
      if (description.includes('mfa') || description.includes('multi-factor')) mentionedControls.add('mfa');
    });
    
    const essentialControls = ['firewall', 'antivirus', 'backup', 'encryption', 'mfa'];
    const missingControls = essentialControls.filter(control => !mentionedControls.has(control));
    
    if (missingControls.length > 0) {
      securityGaps.push(`Missing Security Controls: ${missingControls.join(', ')}`);
    }
    
    // Check for communication gaps
    const timeGaps = [];
    for (let i = 1; i < sortedEvents.length; i++) {
      const prevTime = new Date(sortedEvents[i-1].timestamp).getTime();
      const currTime = new Date(sortedEvents[i].timestamp).getTime();
      const gap = (currTime - prevTime) / (1000 * 60 * 60); // hours
      
      if (gap > 2) { // If there's more than 2 hours between events
        timeGaps.push(gap);
      }
    }
    
    if (timeGaps.length > 0) {
      securityGaps.push('Communication Gaps Detected');
    }

    // Update metrics state
    setMetrics({
      mttd,
      mttr,
      decisionAccuracy,
      teamCollaboration,
      securityGaps
    });

    // Generate full analytics object
    const analytics: Analytics = {
      responseMetrics: {
        averageResponseTime: mttr || 0,
        decisionAccuracy,
        teamCollaboration,
        timeToDetection: mttd || 0,
        timeToResponse: mttr || 0,
        timeToResolution: mttr ? mttr * 2 : 0 // Estimate resolution time
      },
      securityGaps: securityGaps.map((gap, index) => ({
        id: `gap-${index + 1}`,
        area: gap,
        severity: index === 0 ? 'high' : 'medium',
        description: getGapDescription(gap),
        recommendations: getRecommendations(gap),
        detectedAt: new Date().toISOString()
      })),
      complianceScore: [
        {
          framework: 'NIST',
          score: Math.round(65 + Math.random() * 20),
          gaps: ['IR-4', 'IR-5'],
          lastUpdated: new Date().toISOString()
        }
      ],
      improvements: [
        {
          category: 'Response Time',
          metric: 'MTTR',
          trend: -15,
          recommendations: ['Implement automated playbooks', 'Enhance team training'],
          period: '30d'
        }
      ],
      timeline: {
        events: scenario.timeline,
        criticalPath: ['detection', 'isolation', 'assessment'],
        bottlenecks: timeGaps.length > 0 ? ['communication delays'] : []
      }
    };

    // Call the callback with the generated analytics
    onAnalyticsGenerated(analytics);
    setIsGenerating(false);
    toast.success('Analytics generated successfully!');
  };

  const getGapDescription = (gap: string): string => {
    switch (true) {
      case gap.includes('Delayed Response'):
        return 'Critical security events were not addressed within the recommended timeframe, potentially increasing the impact of the incident.';
      case gap.includes('Missing Security Controls'):
        return 'Essential security controls were not mentioned or utilized during the incident response, indicating potential gaps in the security architecture.';
      case gap.includes('Communication Gaps'):
        return 'Significant time periods without documented actions or communications were detected, suggesting potential breakdowns in the incident response process.';
      default:
        return 'A security gap was identified that could impact the effectiveness of incident response.';
    }
  };

  const getRecommendations = (gap: string): string[] => {
    switch (true) {
      case gap.includes('Delayed Response'):
        return [
          'Implement automated alerting for critical events',
          'Establish clear escalation procedures with SLAs',
          'Conduct regular tabletop exercises to improve response time'
        ];
      case gap.includes('Missing Security Controls'):
        return [
          'Implement a defense-in-depth strategy with multiple security layers',
          'Conduct a security controls assessment against industry frameworks',
          'Prioritize implementation of missing controls based on risk'
        ];
      case gap.includes('Communication Gaps'):
        return [
          'Establish regular status update intervals during incidents',
          'Implement a dedicated incident communication channel',
          'Assign a communication coordinator role during incidents'
        ];
      default:
        return [
          'Review incident response procedures',
          'Conduct additional training for the security team',
          'Implement regular security assessments'
        ];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Analytics Generator</h3>
        </div>
        <button
          onClick={generateAnalytics}
          disabled={isGenerating || !scenario.timeline || scenario.timeline.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isGenerating || !scenario.timeline || scenario.timeline.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isGenerating ? (
            <>
              <Activity className="h-5 w-5 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Activity className="h-5 w-5" />
              Generate Analytics
            </>
          )}
        </button>
      </div>

      {(metrics.mttd !== null || metrics.mttr !== null) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.mttd !== null && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium text-gray-700">Mean Time to Detect</h4>
                </div>
                <p className="text-2xl font-bold">{metrics.mttd} min</p>
                <p className="text-sm text-gray-500 mt-1">
                  Time from incident start to first detection
                </p>
              </div>
            )}
            
            {metrics.mttr !== null && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium text-gray-700">Mean Time to Respond</h4>
                </div>
                <p className="text-2xl font-bold">{metrics.mttr} min</p>
                <p className="text-sm text-gray-500 mt-1">
                  Average time to respond to incidents
                </p>
              </div>
            )}
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium text-gray-700">Team Collaboration</h4>
              </div>
              <p className="text-2xl font-bold">{metrics.teamCollaboration}%</p>
              <p className="text-sm text-gray-500 mt-1">
                Percentage of roles actively participating
              </p>
            </div>
          </div>

          {metrics.securityGaps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Identified Security Gaps
              </h4>
              <ul className="space-y-2">
                {metrics.securityGaps.map((gap, index) => (
                  <li key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-sm text-gray-500 italic">
            Note: These metrics are calculated based on timeline events. Add more detailed events for more accurate analytics.
          </div>
        </div>
      )}
    </div>
  );
}