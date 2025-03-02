import { Role } from '../types';

export const predefinedStakeholders: Role[] = [
  {
    id: 'incident-commander',
    title: 'Incident Commander',
    department: 'Security',
    responsibilities: [
      'Lead and coordinate the overall response',
      'Ensure structured decision-making process',
      'Act as bridge between teams and leadership',
      'Maintain situational awareness',
      'Delegate tasks and track progress',
      'Facilitate regular status updates'
    ]
  },
  {
    id: 'soc-team',
    title: 'Security Operations (SOC / Blue Team)',
    department: 'Security',
    responsibilities: [
      'Detect, analyze, and mitigate threats',
      'Investigate logs and alerts',
      'Contain the incident',
      'Perform forensic analysis',
      'Monitor for additional suspicious activity',
      'Implement security controls'
    ]
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure Engineers',
    department: 'IT',
    responsibilities: [
      'Restore and secure on-prem IT systems',
      'Implement patches and recovery processes',
      'Manage system backups and restoration',
      'Verify system integrity',
      'Rebuild compromised systems',
      'Document infrastructure changes'
    ]
  },
  {
    id: 'cloud-engineers',
    title: 'Cloud Engineers',
    department: 'IT',
    responsibilities: [
      'Manage security of cloud environments',
      'Analyze cloud misconfigurations',
      'Monitor cloud access logs',
      'Implement cloud security controls',
      'Restore cloud services',
      'Secure cloud infrastructure'
    ]
  },
  {
    id: 'network-engineers',
    title: 'Network Engineers',
    department: 'IT',
    responsibilities: [
      'Secure network infrastructure',
      'Block malicious traffic',
      'Prevent lateral movement',
      'Implement network segmentation',
      'Monitor network traffic',
      'Configure firewalls and IDS/IPS'
    ]
  },
  {
    id: 'service-desk',
    title: 'IT Service Desk',
    department: 'IT',
    responsibilities: [
      'Provide frontline support',
      'Reset compromised accounts',
      'Communicate security instructions to employees',
      'Log and track user-reported issues',
      'Escalate suspicious activities',
      'Support affected users'
    ]
  },
  {
    id: 'legal-compliance',
    title: 'Legal & Compliance',
    department: 'Legal',
    responsibilities: [
      'Ensure regulatory compliance',
      'Manage breach disclosure requirements',
      'Coordinate with law enforcement if needed',
      'Advise on legal implications',
      'Document incident for legal purposes',
      'Review communications for legal accuracy'
    ]
  },
  {
    id: 'communications',
    title: 'Communications & PR',
    department: 'Corporate Communications',
    responsibilities: [
      'Handle internal and external messaging',
      'Protect brand reputation',
      'Align statements with legal requirements',
      'Draft customer and stakeholder communications',
      'Monitor media coverage',
      'Prepare executive talking points'
    ]
  },
  {
     id: 'executive',
    title: 'Executive Leadership',
    department: 'C-Suite',
    responsibilities: [
      'Make high-level business decisions',
      'Allocate resources',
      'Assess financial and operational risks',
      'Approve major response actions',
      'Communicate with board and shareholders',
      'Provide strategic direction'
    ]
  },
  {
    id: 'third-party',
    title: 'Third-Party Expertise',
    department: 'External',
    responsibilities: [
      'Provide specialized forensic support',
      'Offer legal or cyber insurance guidance',
      'Assist when internal capabilities are insufficient',
      'Conduct independent investigation',
      'Provide threat intelligence',
      'Support recovery efforts'
    ]
  }
];