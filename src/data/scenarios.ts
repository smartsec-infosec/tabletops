import { Scenario } from '../types';

export const prebuiltScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Ransomware Attack on Critical Infrastructure',
    type: 'ransomware',
    description: 'A sophisticated ransomware attack targeting critical business systems and customer data.',
    mitreTactics: ['Initial Access', 'Execution', 'Impact'],
    roles: [
      {
        id: 'ciso',
        title: 'CISO',
        department: 'Security',
        responsibilities: ['Incident Command', 'Strategic Decision Making']
      },
      {
        id: 'it-lead',
        title: 'IT Lead',
        department: 'IT',
        responsibilities: ['System Recovery', 'Technical Assessment']
      },
      {
        id: 'legal',
        title: 'Legal Counsel',
        department: 'Legal',
        responsibilities: ['Regulatory Compliance', 'Legal Risk Assessment']
      }
    ],
    injects: [
      {
        id: 'inject-1',
        title: 'Ransom Demand',
        description: 'Received ransom demand for 50 BTC with 48-hour deadline.',
        timing: 'T+2 hours',
        targetRoles: ['ciso', 'legal']
      },
      {
        id: 'inject-2',
        title: 'System Impact Assessment',
        description: 'Initial assessment shows 60% of systems encrypted.',
        timing: 'T+4 hours',
        targetRoles: ['it-lead', 'ciso']
      }
    ],
    decisions: [
      {
        id: 'decision-1',
        title: 'Ransom Payment Decision',
        description: 'Decide whether to pay the ransom demand',
        roleId: 'ciso',
        options: [
          {
            id: 'pay',
            title: 'Pay Ransom',
            description: 'Pay the demanded amount to receive decryption keys',
            consequences: ['High immediate cost', 'Faster recovery possible', 'May encourage future attacks'],
            complianceImpact: [
              {
                framework: 'NIST',
                control: 'IR-4',
                impact: 'negative',
                description: 'May violate incident handling procedures'
              }
            ]
          },
          {
            id: 'no-pay',
            title: 'Refuse Payment',
            description: 'Recover systems from backups and rebuild if necessary',
            consequences: ['Longer recovery time', 'Lower direct cost', 'Demonstrates strong security stance'],
            complianceImpact: [
              {
                framework: 'NIST',
                control: 'IR-4',
                impact: 'positive',
                description: 'Follows recommended incident response procedures'
              }
            ]
          }
        ]
      }
    ],
    workflows: [
      {
        id: 'workflow-1',
        title: 'Initial Incident Response',
        status: 'in_progress',
        steps: [
          {
            id: 'step-1',
            title: 'System Isolation',
            description: 'Isolate affected systems from the network',
            assignedRoles: ['it-lead'],
            status: 'completed',
            startedAt: '2025-02-25T10:00:00Z',
            completedAt: '2025-02-25T10:30:00Z',
            notes: ['Isolated 45 affected endpoints', 'Network segmentation in place']
          },
          {
            id: 'step-2',
            title: 'Impact Assessment',
            description: 'Assess the scope and impact of the attack',
            assignedRoles: ['it-lead', 'ciso'],
            status: 'in_progress',
            startedAt: '2025-02-25T10:35:00Z'
          }
        ]
      }
    ],
    analytics: {
      responseMetrics: {
        averageResponseTime: 45,
        decisionAccuracy: 85,
        teamCollaboration: 92,
        timeToDetection: 15,
        timeToResponse: 30,
        timeToResolution: 240
      },
      securityGaps: [
        {
          id: 'gap-1',
          area: 'Endpoint Protection',
          severity: 'high',
          description: 'Outdated antivirus signatures on affected systems',
          recommendations: [
            'Implement automated signature updates',
            'Deploy EDR solution',
            'Enable real-time protection'
          ],
          detectedAt: '2025-02-25T11:00:00Z'
        }
      ],
      complianceScore: [
        {
          framework: 'NIST',
          score: 78,
          gaps: ['IR-4', 'IR-5'],
          lastUpdated: '2025-02-25T12:00:00Z'
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
        events: [],
        criticalPath: ['detection', 'isolation', 'assessment'],
        bottlenecks: ['manual approval processes']
      }
    },
    timeline: [
      {
        id: 'event-1',
        type: 'inject',
        title: 'Ransomware Detection',
        description: 'Initial ransomware activity detected on network',
        timestamp: '2025-02-25T09:45:00Z',
        roleId: 'it-lead',
        roleName: 'IT Lead',
        severity: 'high'
      },
      {
        id: 'event-2',
        type: 'workflow',
        title: 'System Isolation Complete',
        description: 'Affected systems successfully isolated from network',
        timestamp: '2025-02-25T10:30:00Z',
        roleId: 'it-lead',
        roleName: 'IT Lead',
        relatedId: 'step-1',
        metadata: {
          'Systems Affected': '45',
          'Isolation Method': 'Network Segmentation',
          'Verification Status': 'Confirmed'
        }
      }
    ]
  }
];