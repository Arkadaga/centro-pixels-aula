export type UserRole = 'kirolaria' | 'zuzendaritza' | 'medikua';

export type AthleteType = 'olimpiar' | 'paralinpiar';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  sport?: string;
  athleteType?: AthleteType;
}

export interface Athlete {
  id: string;
  name: string;
  sport: string;
  sportEu: string;
  type: AthleteType;
  photo?: string;
  birthYear?: number;
  hometown?: string;
  achievements?: string[];
  becaYear?: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  athleteId: string;
  athleteName: string;
  type: 'biomedikoa' | 'fisioterapia' | 'psikologia' | 'nutrizioa';
  date: string;
  time: string;
  status: 'zain' | 'berretsi' | 'bukatua' | 'ezeztatua';
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  athleteId: string;
  name: string;
  type: 'erradiografia' | 'txosten' | 'analitika' | 'beste';
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface TestRecord {
  id: string;
  athleteId: string;
  type: 'biomekanika' | 'fisiologia' | 'indarrak' | 'nutrizio';
  title: string;
  date: string;
  results?: string;
  fileUrl?: string;
  videoUrl?: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: 'entrenamendua' | 'lehiaketa' | 'medikua' | 'bilera' | 'ekitaldia';
  description?: string;
  color?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'garrantzitsua' | 'gertaera' | 'medikua';
  recipientType: 'all' | 'olimpiar' | 'paralinpiar';
  read: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'bideo' | 'liburu' | 'artikulu';
  category: 'entrenamendua' | 'nutrizio' | 'psikologia' | 'fisioterapia' | 'biomekanika';
  url?: string;
  description?: string;
  addedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  sector: string;
  description: string;
  website?: string;
  contactEmail?: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  location: string;
  type: 'osoa' | 'partziala' | 'praktikak' | 'urrunekoa';
  requirements?: string[];
  publishedAt: string;
  active: boolean;
}

export interface TrainingDay {
  day: string;
  sessions: {
    time: string;
    activity: string;
    duration: string;
    intensity: 'baxua' | 'ertaina' | 'altua' | 'oso-altua';
  }[];
}

export interface TrainingGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}
