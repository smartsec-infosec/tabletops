import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Filter, ExternalLink, X, Shield, AlertTriangle } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { ScenarioCard } from './components/ScenarioCard';
import { CreateScenarioModal } from './components/CreateScenarioModal';
import { ScenarioDetailsModal } from './components/ScenarioDetailsModal';
import { prebuiltScenarios } from './data/scenarios';
import { Scenario } from './types';
import { storage } from './lib/storage';

function App() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'completed'>('all');
  const [showBanner, setShowBanner] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Scenario | null>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = () => {
    const savedScenarios = storage.getScenarios();
    
    // Ensure prebuilt scenarios don't get duplicated if they're already in localStorage
    const prebuiltIds = prebuiltScenarios.map(s => s.id);
    const filteredSaved = savedScenarios.filter(s => !prebuiltIds.includes(s.id));
    
    setScenarios([...prebuiltScenarios, ...filteredSaved]);
    setLoading(false);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    loadScenarios(); // Reload scenarios when modal closes
  };

  const handleScenarioDetailsClose = () => {
    setSelectedScenario(null);
    loadScenarios(); // Reload scenarios when details modal closes to reflect any changes
  };

  const handleDeleteScenario = (scenario: Scenario) => {
    setShowDeleteConfirm(scenario);
  };

  const confirmDeleteScenario = () => {
    if (showDeleteConfirm && showDeleteConfirm.id) {
      storage.deleteScenario(showDeleteConfirm.id);
      loadScenarios();
      setShowDeleteConfirm(null);
    }
  };

  const filteredScenarios = scenarios.filter(scenario => {
    // Apply text search filter
    const matchesSearch = 
      scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'completed' && scenario.status === 'completed') ||
      (statusFilter === 'not_started' && scenario.status !== 'completed');
    
    return matchesSearch && matchesStatus;
  });

  // Group scenarios by status
  const notStartedScenarios = filteredScenarios.filter(s => s.status !== 'completed');
  const completedScenarios = filteredScenarios.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ThreatInsights TTX+</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Professional Services Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-2 md:mb-0">
              <div className="hidden md:block p-2 bg-white bg-opacity-20 rounded-full">
                <Shield className="h-6 w-6" />
              </div>
              <p className="font-medium">
                Need expert guidance? Ask about ThreatInsights professional services for customized tabletop exercises.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="flex items-center gap-1 px-4 py-1.5 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <ExternalLink size={16} />
                Learn More
              </a>
              <button 
                onClick={() => setShowBanner(false)}
                className="text-white hover:text-blue-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Scenario</h3>
                <p className="mt-1 text-gray-600">
                  Are you sure you want to delete "{showDeleteConfirm.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteScenario}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Scenario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Tabletop Scenario Builder</h2>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Custom Scenario
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'not_started' | 'completed')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Scenarios</option>
                <option value="not_started">Not Started</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scenarios...</p>
          </div>
        ) : filteredScenarios.length > 0 ? (
          <div className="space-y-8">
            {/* Not Started Scenarios */}
            {notStartedScenarios.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  Not Started
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStartedScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={setSelectedScenario}
                      onDelete={scenario.isCustom ? handleDeleteScenario : undefined}
                      isCustom={!!scenario.isCustom}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Completed Scenarios */}
            {completedScenarios.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Completed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={setSelectedScenario}
                      onDelete={scenario.isCustom ? handleDeleteScenario : undefined}
                      isCustom={!!scenario.isCustom}
                      isCompleted={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No scenarios found matching your search.</p>
          </div>
        )}

        {/* Modals */}
        <CreateScenarioModal
          isOpen={isCreateModalOpen}
          onClose={handleCreateModalClose}
        />
        {selectedScenario && (
          <ScenarioDetailsModal
            scenario={selectedScenario}
            isOpen={!!selectedScenario}
            onClose={handleScenarioDetailsClose}
          />
        )}
      </main>
    </div>
  );
}

export default App;