import { Scenario } from '../types';

const STORAGE_KEY = 'ttx_scenarios';

export const storage = {
  getScenarios: (): Scenario[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveScenario: (scenario: Scenario): void => {
    try {
      const scenarios = storage.getScenarios();
      const newScenario = {
        ...scenario,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        isCustom: true // Mark as custom scenario
      };
      scenarios.push(newScenario);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  updateScenario: (scenario: Scenario): void => {
    try {
      const scenarios = storage.getScenarios();
      const index = scenarios.findIndex(s => s.id === scenario.id);
      if (index !== -1) {
        scenarios[index] = {
          ...scenario,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
      }
    } catch (error) {
      console.error('Error updating in localStorage:', error);
    }
  },

  deleteScenario: (id: string): void => {
    try {
      const scenarios = storage.getScenarios();
      const filtered = scenarios.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }
};