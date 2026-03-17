export interface ContractorCategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const CONTRACTOR_CATEGORIES: ContractorCategoryInfo[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    icon: 'Zap',
    description: 'Electrical installation, repair, and maintenance services'
  },
  {
    id: 'plumber',
    name: 'Plumber',
    icon: 'Droplet',
    description: 'Plumbing installation, repair, and drainage services'
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    icon: 'Hammer',
    description: 'Woodwork, cabinetry, and custom furniture services'
  },
  {
    id: 'painter',
    name: 'Painter',
    icon: 'Paintbrush',
    description: 'Interior and exterior painting services'
  },
  {
    id: 'mason',
    name: 'Mason',
    icon: 'HardHat',
    description: 'Bricklaying, concrete work, and masonry services'
  },
  {
    id: 'roofer',
    name: 'Roofer',
    icon: 'Home',
    description: 'Roof installation, repair, and maintenance'
  },
  {
    id: 'landscaper',
    name: 'Landscaper',
    icon: 'TreeDeciduous',
    description: 'Landscaping, gardening, and outdoor maintenance'
  },
  {
    id: 'hvac',
    name: 'HVAC Technician',
    icon: 'Wind',
    description: 'Heating, ventilation, and air conditioning services'
  },
  {
    id: 'pool_maintenance',
    name: 'Pool Maintenance',
    icon: 'Waves',
    description: 'Pool cleaning, repair, and chemical balancing'
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    icon: 'Sparkles',
    description: 'Residential and commercial cleaning services'
  },
  {
    id: 'pest_control',
    name: 'Pest Control',
    icon: 'Bug',
    description: 'Pest extermination and prevention services'
  },
  {
    id: 'security',
    name: 'Security Services',
    icon: 'Shield',
    description: 'Security system installation and monitoring'
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: 'Wrench',
    description: 'General repairs and maintenance services'
  },
  {
    id: 'interior_designer',
    name: 'Interior Designer',
    icon: 'Palette',
    description: 'Interior design and space planning services'
  },
  {
    id: 'architect',
    name: 'Architect',
    icon: 'Building',
    description: 'Architectural design and planning services'
  },
  {
    id: 'general_contractor',
    name: 'General Contractor',
    icon: 'Briefcase',
    description: 'Overall construction project management'
  },
  {
    id: 'other',
    name: 'Other Services',
    icon: 'MoreHorizontal',
    description: 'Other specialized contractor services'
  }
];

export const AVERAGE_JOB_SIZES = [
  { value: 'small', label: 'Small (Under TT$5,000)', description: 'Minor repairs and small projects' },
  { value: 'medium', label: 'Medium (TT$5,000 - TT$50,000)', description: 'Moderate renovations and installations' },
  { value: 'large', label: 'Large (Over TT$50,000)', description: 'Major construction and renovation projects' },
  { value: 'varies', label: 'Varies', description: 'Projects of all sizes' }
];

export const RESIDENTIAL_COMMERCIAL_OPTIONS = [
  { value: 'residential', label: 'Residential Only' },
  { value: 'commercial', label: 'Commercial Only' },
  { value: 'both', label: 'Both Residential & Commercial' }
];

export const DAY_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export interface OperatingHours {
  [key: string]: {
    open: boolean;
    start: string;
    end: string;
  };
}

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { open: true, start: '08:00', end: '17:00' },
  tuesday: { open: true, start: '08:00', end: '17:00' },
  wednesday: { open: true, start: '08:00', end: '17:00' },
  thursday: { open: true, start: '08:00', end: '17:00' },
  friday: { open: true, start: '08:00', end: '17:00' },
  saturday: { open: true, start: '08:00', end: '13:00' },
  sunday: { open: false, start: '', end: '' }
};

export function getCategoryById(id: string): ContractorCategoryInfo | undefined {
  return CONTRACTOR_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryName(id: string): string {
  const category = getCategoryById(id);
  return category ? category.name : id;
}

export function formatOperatingHours(hours: OperatingHours | null): string {
  if (!hours) return 'Hours not specified';

  const daysWithHours = Object.entries(hours)
    .filter(([_, info]) => info.open)
    .map(([day, info]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${info.start} - ${info.end}`);

  return daysWithHours.length > 0 ? daysWithHours.join(', ') : 'Closed';
}

export function calculateTrialDaysRemaining(trialStartDate: string): number {
  const startDate = new Date(trialStartDate);
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = 30 - diffDays;
  return Math.max(0, daysRemaining);
}

export function isTrialExpired(trialStartDate: string): boolean {
  return calculateTrialDaysRemaining(trialStartDate) === 0;
}
