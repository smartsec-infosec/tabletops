import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Decision, Role } from '../types';

interface CreateDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (decision: Decision) => void;
  roles: Role[];
}

export function CreateDecisionModal({ isOpen, onClose, onSave, roles }: CreateDecisionModalProps) {
  const [decision, setDecision] = useState<Partial<Decision>>({
    title: '',
    description: '',
    roleId: '',
    options: [
      { id: crypto.randomUUID(), title: '', description: '', consequences: [] }
    ]
  });

  if (!isOpen) return null;

  const handleAddOption = () => {
    setDecision({
      ...decision,
      options: [
        ...(decision.options || []),
        { id: crypto.randomUUID(), title: '', description: '', consequences: [] }
      ]
    });
  };

  const handleRemoveOption = (optionId: string) => {
    setDecision({
      ...decision,
      options: (decision.options || []).filter(opt => opt.id !== optionId)
    });
  };

  const handleSave = () => {
    if (!decision.title || !decision.roleId || !decision.options?.length) return;

    onSave({
      id: crypto.randomUUID(),
      title: decision.title,
      description: decision.description || '',
      roleId: decision.roleId,
      options: decision.options.map(opt => ({
        ...opt,
        consequences: opt.consequences || []
      }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Decision</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision Title
              </label>
              <input
                type="text"
                value={decision.title}
                onChange={(e) => setDecision({ ...decision, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter decision title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={decision.description}
                onChange={(e) => setDecision({ ...decision, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the decision context"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Role
              </label>
              <select
                value={decision.roleId}
                onChange={(e) => setDecision({ ...decision, roleId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Decision Options</h3>
                <button
                  onClick={handleAddOption}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus size={20} />
                  Add Option
                </button>
              </div>

              {decision.options?.map((option, index) => (
                <div key={option.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Option {index + 1}</h4>
                    <button
                      onClick={() => handleRemoveOption(option.id)}
                      className="text-red-500 hover:text-red-600"
                      disabled={decision.options?.length === 1}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option Title
                    </label>
                    <input
                      type="text"
                      value={option.title}
                      onChange={(e) => setDecision({
                        ...decision,
                        options: decision.options?.map(opt =>
                          opt.id === option.id
                            ? { ...opt, title: e.target.value }
                            : opt
                        )
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter option title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={option.description}
                      onChange={(e) => setDecision({
                        ...decision,
                        options: decision.options?.map(opt =>
                          opt.id === option.id
                            ? { ...opt, description: e.target.value }
                            : opt
                        )
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Describe this option"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consequences (one per line)
                    </label>
                    <textarea
                      value={option.consequences?.join('\n')}
                      onChange={(e) => setDecision({
                        ...decision,
                        options: decision.options?.map(opt =>
                          opt.id === option.id
                            ? { ...opt, consequences: e.target.value.split('\n').filter(Boolean) }
                            : opt
                        )
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter consequences, one per line"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              Create Decision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}