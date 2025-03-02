import React, { useState, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle2, FileText, MessageSquare, Filter, Download, FileDown, PenTool as Tool, Plus } from 'lucide-react';
import { TimelineEvent } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface TimelineViewProps {
  events: TimelineEvent[];
  onAddNote?: (note: Omit<TimelineEvent, 'id'>) => void;
}

export function TimelineView({ events, onAddNote }: TimelineViewProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);

  const filteredEvents = events.filter(event => {
    // Apply type filter
    if (filter !== 'all' && event.type !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.roleName.toLowerCase().includes(searchLower) ||
        (event.metadata && Object.values(event.metadata).some(
          value => typeof value === 'string' && value.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getEventIcon = (type: TimelineEvent['type'], severity?: string) => {
    switch (type) {
      case 'decision':
        return <AlertTriangle className={`h-5 w-5 ${
          severity === 'high' ? 'text-red-500' :
          severity === 'medium' ? 'text-yellow-500' :
          'text-blue-500'
        }`} />;
      case 'workflow':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'inject':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'artifact':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'remediation':
        return <Tool className="h-5 w-5 text-green-500" />;
      case 'note':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const exportTimelineToJSON = () => {
    // Create a formatted timeline for export
    const timelineData = events.map(event => ({
      timestamp: new Date(event.timestamp).toLocaleString(),
      type: event.type,
      title: event.title,
      description: event.description,
      role: event.roleName,
      severity: event.severity || 'normal',
      metadata: event.metadata || {}
    }));
    
    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(timelineData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-timeline-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportTimelineToPDF = () => {
    try {
      // Create new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Scenario Timeline Report', 14, 15);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      
      // Prepare data for table
      const tableData = sortedEvents.map(event => [
        new Date(event.timestamp).toLocaleString(),
        event.type.charAt(0).toUpperCase() + event.type.slice(1).replace('_', ' '),
        event.title,
        event.description.substring(0, 60) + (event.description.length > 60 ? '...' : ''),
        event.roleName
      ]);
      
      // Add table
      (doc as any).autoTable({
        startY: 30,
        head: [['Timestamp', 'Type', 'Title', 'Description', 'Role']],
        body: tableData,
        headStyles: { fillColor: [66, 133, 244], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 30 }
      });
      
      // Save PDF
      doc.save(`scenario-timeline-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  const handleAddNote = () => {
    if (!noteTitle.trim() || !noteText.trim() || !onAddNote) return;
    
    onAddNote({
      type: 'note',
      title: noteTitle,
      description: noteText,
      timestamp: new Date().toISOString(),
      roleId: 'user',
      roleName: 'Exercise Facilitator',
      metadata: {
        addedManually: 'true',
        noteType: 'observation'
      }
    });
    
    // Reset form
    setNoteTitle('');
    setNoteText('');
    setShowNoteForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Exercise Timeline</h3>
        <div className="flex items-center gap-2">
          {onAddNote && (
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Plus size={16} />
              Add Note
            </button>
          )}
          <button
            onClick={exportTimelineToJSON}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            onClick={exportTimelineToPDF}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <FileDown size={16} />
            Export PDF
          </button>
        </div>
      </div>
      
      {showNoteForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-blue-100">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Add Timeline Note
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note Title
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a title for this note"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note Content
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Enter your observations or notes about the exercise"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!noteTitle.trim() || !noteText.trim()}
              >
                Add to Timeline
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search timeline events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="inject">Injects</option>
            <option value="decision">Decisions</option>
            <option value="workflow">Workflow</option>
            <option value="note">Notes</option>
            <option value="remediation">Remediation</option>
          </select>
        </div>
      </div>
      
      <div className="relative" ref={timelineRef}>
        <div className="absolute top-0 bottom-0 left-6 w-px bg-gray-200" />
        <div className="space-y-8">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <div key={event.id} className="relative pl-14">
                <div className="absolute left-4 top-1 -ml-px">
                  <div className={`h-8 w-8 rounded-full bg-white border-2 flex items-center justify-center ${
                    event.type === 'remediation' ? 'border-green-300' :
                    event.type === 'inject' ? 'border-purple-300' :
                    event.type === 'decision' ? 'border-blue-300' :
                    event.type === 'note' ? 'border-gray-300' :
                    event.type === 'workflow' ? 'border-yellow-300' :
                    'border-gray-200'
                  }`}>
                    {getEventIcon(event.type, event.severity)}
                  </div>
                </div>
                <div className={`bg-white rounded-lg border p-4 ${
                  event.type === 'remediation' ? 'border-green-200 bg-green-50' : 
                  event.type === 'note' ? 'border-gray-200 bg-gray-50' : ''
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        event.type === 'inject' ? 'bg-purple-100 text-purple-700' :
                        event.type === 'decision' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'workflow' ? 'bg-yellow-100 text-yellow-700' :
                        event.type === 'note' ? 'bg-gray-100 text-gray-700' :
                        event.type === 'remediation' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.roleName}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{event.description}</p>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium mb-2">Additional Details:</h5>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key}>
                            <dt className="font-medium text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</dt>
                            <dd className="text-gray-700">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No timeline events match your filters.</p>
              <p className="mt-2">Try adjusting your search or filter settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}