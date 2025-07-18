// Centralized emergency types/nature config

export type EmergencyType =
  | 'Fainting'
  | 'Cramps'
  | 'Asthma'
  | 'Ulcer'
  | 'Injury'
  | 'Bleeding'
  | 'Fracture'
  | 'Dislocations'
  | 'Allergic Reaction'
  | 'Other';

export const emergencyTypesConfig: {
  name: EmergencyType;
  icon: string;
  color: string;
  bgColor: string;
}[] = [
  {
    name: 'Fainting',
    icon: 'bed',
    color: '#a78bfa',
    bgColor: '#ede9fe',
  },
  {
    name: 'Cramps',
    icon: 'pulse',
    color: '#fbbf24',
    bgColor: '#fef9c3',
  },
  {
    name: 'Asthma',
    icon: 'medkit',
    color: '#38bdf8',
    bgColor: '#e0f2fe',
  },
  {
    name: 'Ulcer',
    icon: 'bandage',
    color: '#f87171',
    bgColor: '#fee2e2',
  },
  {
    name: 'Injury',
    icon: 'body',
    color: '#f472b6',
    bgColor: '#fce7f3',
  },
  {
    name: 'Bleeding',
    icon: 'water', // Ionicons water drop for blood
    color: '#dc2626',
    bgColor: '#fee2e2',
  },
  {
    name: 'Fracture',
    icon: 'walk', // Ionicons walk for broken bone
    color: '#6366f1',
    bgColor: '#e0e7ff',
  },
  {
    name: 'Dislocations',
    icon: 'man', // Ionicons man for joint dislocation
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
  },
  {
    name: 'Allergic Reaction',
    icon: 'alert',
    color: '#f59e42',
    bgColor: '#fef3c7',
  },
  {
    name: 'Other',
    icon: 'help-circle',
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
]; 