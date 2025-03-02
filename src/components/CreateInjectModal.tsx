import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Inject, Role } from '../types';

interface CreateInjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inject: Inject) => void;
  roles: Role[];
}

export function CreateInjectModal({ isOpen, onClose, onSave, roles }: CreateInjectModalProps) {
  const [inject, setInject] = useState<Partial<Inject>>({
    title: '',
    description: '',
    timing: 'T+0 hours',
    targetRoles: []
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!inject.title || !inject.description) {
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      title: inject.title,
      description: inject.description || '',
      timing: inject.timing || 'T+0 hours',
      targetRoles: inject.targetRoles || [],
      completedBy: []
    });
    onClose();
  };

  const handleRoleToggle = (roleId: string) => {
    const currentTargetRoles = inject.targetRoles || [];
    if (currentTargetRoles.includes(roleId)) {
      setInject({
        ...inject,
        targetRoles: currentTargetRoles.filter(id => id !== roleId)
      });
    } else {
      setInject({
        ...inject,
        targetRoles: [...currentTargetRoles, roleId]
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Inject</h2>
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
                Inject Title
              </label>
              <input
                type="text"
                value={inject.title}
                onChange={(e) => setInject({ ...inject, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter inject title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={inject.description}
                onChange={(e) => setInject({ ...inject, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe the inject details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timing
              </label>
              <select
                value={inject.timing}
                onChange={(e) => setInject({ ...inject, timing: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="T+0 hours">T+0 hours (Immediately)</option>
                <option value="T+1 hour">T+1 hour</option>
                <option value="T+2 hours">T+2 hours</option>
                <option value="T+4 hours">T+4 hours</option>
                <option value="T+8 hours">T+8 hours</option>
                <option value="T+12 hours">T+12 hours</option>
                <option value="T+24 hours">T+24 hours</option>
                <option value="T+48 hours">T+48 hours</option>
                <option value="Manual">Manual (Deliver when needed)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Roles
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Select which roles should receive this inject. Leave empty to target all roles.
              </p>
              {roles.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                  <p>No roles have been defined yet. Add roles to the scenario first, or leave empty to target all roles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={inject.targetRoles?.includes(role.id) || false}
                        onChange={() => handleRoleToggle(role.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium">{role.title}</p>
                        <p className="text-xs text-gray-500">{role.department}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
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
              disabled={!inject.title || !inject.description}
            >
              Create Inject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}